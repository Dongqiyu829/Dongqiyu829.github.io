"""Deterministic isolated batch ingestion; no network, models or live index writes."""
import hashlib,json,re
from collections import Counter
from pathlib import Path
from urllib.parse import quote
from context_chunks import blocks,contextualize
from math_text import Tree,Node,walk,section_text,MARK
from public_source_scope import source_files,validate_pages

def sha(b):return hashlib.sha256(b).hexdigest()
def encoded(x):return (json.dumps(x,ensure_ascii=False,sort_keys=True,indent=2)+'\n').encode()
def build(source,output,previous=None,allowed=('learn/linear-algebra/lessons',),structures=False,public_pages=None):
 source=Path(source).resolve(strict=True);raw_output=Path(output).absolute()
 for parent in [raw_output,*raw_output.parents]:
  if parent.is_symlink() or getattr(parent,'is_junction',lambda:False)():raise ValueError('Output links refused')
 output=raw_output.resolve(strict=False)
 if output==source or source in output.parents:raise ValueError('Output must be outside source')
 allowed=sorted(set(allowed))
 public_pages=validate_pages({} if public_pages is None else public_pages)
 if (not allowed and not public_pages) or any(not re.fullmatch(r'learn/[a-z0-9-]+/lessons',p) for p in allowed):raise ValueError('Invalid allowlist')
 components={p:sha(Path(__file__).with_name(p).read_bytes()) for p in ['batch_course_ingest.py','context_chunks.py','math_text.py','course_structures.py','public_source_scope.py']}
 version=sha(encoded({'components':components,'allowed':allowed,'publicPages':public_pages,'maxChars':1800,'includePre':True,'structures':structures}))
 old={};old_records=[]
 if previous:
  prev=Path(previous);manifest=json.loads((prev/'manifest.json').read_bytes());data=(prev/'index.json').read_bytes()
  if not (prev/'READY').is_file() or (prev/'READY').read_text().strip()!=sha((prev/'manifest.json').read_bytes()) or sha(data)!=manifest['indexSha256']:raise ValueError('Invalid previous bundle')
  old={p['pageUrl']:p for p in manifest['pages']}
  if manifest['builderFingerprint']==version:old_records=json.loads(data)
 old_by_page={}
 for record in old_records:old_by_page.setdefault(record['pageUrl'],[]).append(record)
 pages=[];records=[];delta={'added':[],'changed':[],'deleted':[],'unchanged':[]};reused=0
 for file in source_files(source,allowed,public_pages):
  url='/'+file.relative_to(source).as_posix();page={'id':url,'pageUrl':url,'title':file.stem,'status':'failed','sourceSha256':None,'chunks':0,'visibility':'not_browser_verified'}
  try:
   raw=file.read_bytes();page['sourceSha256']=sha(raw)
   if len(raw)>2_000_000:raise ValueError('page_size_limit')
   if old.get(url,{}).get('sourceSha256')==page['sourceSha256'] and old[url]['status']=='indexed' and old_records:
    chunks=old_by_page.get(url,[]);page=dict(old[url]);reused+=1
   else:
    tree=Tree();tree.feed(raw.decode('utf-8'));nodes=list(walk(tree.root))
    def sanitize_headings(n,ancestor_hidden=False):
     own_hidden=ancestor_hidden or 'hidden' in n.attrs or (isinstance(n.attrs.get('aria-hidden'),str) and n.attrs['aria-hidden'].lower()=='true') or bool(re.search(r'(?:display\s*:\s*none|visibility\s*:\s*(?:hidden|collapse)|opacity\s*:\s*0(?:\.0*)?\s*(?:;|$))',n.attrs.get('style') or '',re.I))
     descendant_hidden=own_hidden
     for child in n.children:
      if isinstance(child,Node):descendant_hidden=sanitize_headings(child,own_hidden) or descendant_hidden
     if n.tag in ('h1','h2','h3','title','summary') and descendant_hidden:n.children=[MARK]
     return descendant_hidden
    original_ids=Counter(n.attrs.get('id') for n in nodes if n.attrs.get('id'))
    sanitize_headings(tree.root)
    title=next((section_text(n) for n in nodes if n.tag=='h1'),None) or next((section_text(n) for n in nodes if n.tag=='title'),None);page['title']=title or file.stem
    sections=public_pages.get(url[1:],[])
    if sections:
     if any(original_ids[section]!=1 for section in sections):raise ValueError('public_section_missing_or_ambiguous')
     def retain(n):
      if n.attrs.get('id') in sections:return True
      n.children=[child for child in n.children if isinstance(child,Node) and retain(child)]
      return bool(n.children)
     retain(tree.root)
     page['title']='Personal website' if url=='/index.html' else file.stem
    page['originalIdCounts']=dict(sorted((n.attrs['id'],original_ids[n.attrs['id']]) for n in walk(tree.root) if n.attrs.get('id')))
    unsupported={'table':0,'math':0}
    def barriers(n):
     if n.tag in ('script','style','nav') or n.attrs.get('id')=='course-feedback':return
     for i,child in enumerate(n.children):
      if not isinstance(child,Node):continue
      if child.tag in unsupported:
       unsupported[child.tag]+=1;replacement=Node('p');replacement.children=[MARK+' [unsupported '+child.tag+' structure; open original source]'];n.children[i]=replacement
      else:barriers(child)
    if structures:
     from course_structures import transcribe
     page['structureAudit']=transcribe(tree)
     for item in page['structureAudit']:
      if item['status']=='omitted':unsupported[item['kind']]+=1
    else:barriers(tree.root)
    page['unsupportedStructures']=unsupported
    chunks=contextualize(blocks(tree,include_pre=True,original_id_counts=original_ids,
                              guard_heading_visibility=bool(public_pages)),
                         separate_uncertain_layout=bool(public_pages))
    if MARK in page['title']:
     for r in chunks:r['structuralOmitted']=True
    if any(unsupported.values()):
     for r in chunks:r['mathOmitted']=True;r['contextIncomplete']=True;r['pageStructureIncomplete']=True;r['structuralOmitted']=True
    for r in chunks:
     r.update(pageUrl=url,url=url+('#'+quote(r['anchorId'],safe='') if r['anchorId'] else ''),anchorVerified=bool(r['anchorId']),sourceSha256=page['sourceSha256'],title=page['title'],visibility='not_browser_verified',completenessPolicy='static-structure-v2')
     r['id']='batch-'+sha(encoded({'page':url,'container':r['containerPath'],'blocks':r['sourceBlockOrdinals'],'text':r['text']}))[:24]
    page.update(status='indexed',chunks=len(chunks),mathOmitted=sum(r['mathOmitted'] for r in chunks),contextIncomplete=sum(r['contextIncomplete'] for r in chunks))
   records.extend(chunks)
  except UnicodeError:page['failure']='invalid_utf8'
  except Exception:page['failure']='extraction_failed'
  pages.append(page);delta['added' if url not in old else 'unchanged' if old[url].get('sourceSha256')==page['sourceSha256'] and old[url].get('status')==page['status'] else 'changed'].append(url)
 delta['deleted']=sorted(set(old)-{p['pageUrl'] for p in pages})
 index=encoded(records);manifest={'format':'course-batch-v1','builderFingerprint':version,'components':components,'allowedDirectories':allowed,'indexSha256':sha(index),'pages':pages,'generationEnabled':False}
 if public_pages:manifest['allowedPages']=public_pages
 if raw_output.resolve(strict=False)!=output or any(p.is_symlink() or getattr(p,'is_junction',lambda:False)() for p in [raw_output,*raw_output.parents]):raise ValueError('Output changed')
 output.mkdir() # Exclusive; never overwrite any existing/live bundle.
 (output/'index.json').write_bytes(index);(output/'manifest.json').write_bytes(encoded(manifest));(output/'changes.json').write_bytes(encoded(delta));(output/'READY').write_text(sha(encoded(manifest))+'\n',encoding='utf-8')
 return {'pages':len(pages),'indexed':sum(p['status']=='indexed' for p in pages),'failed':[p['pageUrl'] for p in pages if p['status']!='indexed'],'chunks':len(records),'reusedPages':reused,'mathOmitted':sum(r['mathOmitted'] for r in records),'delta':delta}
