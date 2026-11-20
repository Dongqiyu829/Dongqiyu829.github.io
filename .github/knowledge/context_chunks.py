"""Query-independent local candidate builder. Does not replace any active index."""
import re
from collections import Counter
from math_text import Node,walk,render,section_text,MARK

def blocks(tree,include_pre=False,original_id_counts=None,*,guard_heading_visibility=False):
 result=[];serial=0
 ids=original_id_counts if original_id_counts is not None else Counter(n.attrs.get('id') for n in walk(tree.root) if n.attrs.get('id'))
 def valid_id(n):
  value=n.attrs.get('id','')
  return value if value and ids[value]==1 and not any(c.isspace() for c in value) else ''
 def hidden(n):
  return 'hidden' in n.attrs or (isinstance(n.attrs.get('aria-hidden'),str) and n.attrs['aria-hidden'].lower()=='true') or bool(re.search(r'(?:^|;)\s*(?:display\s*:\s*none|visibility\s*:\s*(?:hidden|collapse)|opacity\s*:\s*0(?:\.0*)?)\s*(?:!important)?\s*(?:;|$)',n.attrs.get('style') or '',re.I))
 visibility={}
 def visibility_walk(n,ancestor_hidden=False,ancestor_unknown=False):
  if not isinstance(n,Node):return
  own_hidden=ancestor_hidden or hidden(n)
  unknown=ancestor_unknown or bool(n.attrs.get('class','').strip()) or 'style' in n.attrs or ('aria-hidden' in n.attrs and n.attrs['aria-hidden'] not in ('true','false'))
  visibility[id(n)]=(own_hidden,unknown)
  for child in n.children:visibility_walk(child,own_hidden,unknown)
 visibility_walk(tree.root)
 def fresh():
  nonlocal serial
  serial+=1;return serial
 def visit(n,inherited='',path='root',inherited_anchor='',inherited_heading_unknown=False):
  if not isinstance(n,Node):return
  if n.attrs.get('id')=='course-feedback' or n.tag in ('script','style','nav'):return
  title=inherited;segment=fresh();heading_unknown=inherited_heading_unknown
  scope_anchor=valid_id(n) or inherited_anchor
  anchor=scope_anchor
  summary=next((c for c in n.children if isinstance(c,Node) and c.tag=='summary'),None)
  if n.tag=='details' and summary:
   safe_summary=MARK if any(visibility[id(x)][0] for x in walk(summary)) else section_text(summary)
   title=(inherited+' / '+safe_summary).strip(' /')
   heading_unknown=heading_unknown or any(visibility[id(x)][1] for x in walk(summary))
  for ordinal,c in enumerate(n.children):
   if isinstance(c,str) and c.strip() and n.tag in ('p','li'):
    unknown=visibility[id(n)][1] or guard_heading_visibility and heading_unknown
    result.append(dict(section=title,sectionId=segment,containerPath=path,anchorId=anchor,text=' '.join(c.split()),kind='text',mathOmitted=bool(include_pre and unknown),visibilityUnknown=bool(include_pre and unknown)))
    continue
   if not isinstance(c,Node):continue
   child_path=path+'/'+c.tag+':'+str(ordinal)
   if include_pre:
    descendants=list(walk(c))
    explicit_hidden=visibility[id(c)][0] or (c.tag in ('p','li','pre','code','span') or 'formula' in c.attrs.get('class','').split()) and any(visibility.get(id(x),(False,False))[0] for x in descendants)
    unknown=any(visibility.get(id(x),(False,False))[1] for x in descendants) or guard_heading_visibility and heading_unknown
    if explicit_hidden:
     result.append(dict(section=title,sectionId=segment,containerPath=path,anchorId=anchor,text=MARK,kind='hidden',mathOmitted=True,visibilityUnknown=False))
     segment=fresh();continue
   if c.tag in ('h2','h3'):
    title=MARK if any(visibility[id(x)][0] for x in walk(c)) else section_text(c);anchor=valid_id(c) or scope_anchor;segment=fresh()
    heading_unknown=any(visibility[id(x)][1] for x in walk(c))
    if MARK in title:result.append(dict(section=title,sectionId=segment,containerPath=path,anchorId=anchor,text=MARK,kind='hidden',mathOmitted=True,visibilityUnknown=True))
    continue
   if c.tag=='summary':segment=fresh();continue
   if c.tag in ('svg','canvas','img','object','iframe','video','audio','math','table'):
    result.append(dict(section=title,sectionId=segment,containerPath=path,anchorId=anchor,text=MARK+' [unsupported '+c.tag+'; inspect original]',kind='unknown',mathOmitted=True,visibilityUnknown=bool(include_pre and unknown)))
    continue
   if n.tag in ('p','li') and c.tag in ('strong','span','em','b','i','code','sup','sub','a','small','mark','u','s','abbr','cite','q','time','var','samp','kbd','br'):
    # Preserve inline fragments in mixed-content paragraphs without traversing
    # away their text. Unknown layout overrides cannot be flattened safely.
    uncertain=any(x.tag in ('section','details','h2','h3','div','p','li') or x.attrs.get('style') or 'hidden' in x.attrs for x in walk(c))
    text=MARK if uncertain else ' '.join(render(c).split())
    if text:result.append(dict(section=title,sectionId=segment,containerPath=path,anchorId=anchor,text=text,kind='inline',mathOmitted=MARK in text or (include_pre and unknown),visibilityUnknown=bool(include_pre and unknown)))
    continue
   if include_pre and c.tag=='pre':
    # Only literal pre/code text is supported. Preserve line breaks and indentation.
    uncertain=any(x.tag not in ('pre','code') or x.attrs.get('style') or 'hidden' in x.attrs for x in walk(c))
    def literal(node):
     return node if isinstance(node,str) else ''.join(literal(child) for child in node.children)
    text=MARK if uncertain else literal(c)
    if text.strip():result.append(dict(section=title,sectionId=segment,containerPath=path,anchorId=anchor,text=text,kind='pre',mathOmitted=uncertain or unknown,visibilityUnknown=unknown))
    continue
   formula='formula' in c.attrs.get('class','').split()
   if formula or c.tag in ('p','li'):
    # A block containing nested structural scopes is not a single paragraph.
    if any(x.tag in ('section','details','h2','h3') for x in walk(c) if x is not c):
     visit(c,title,child_path,anchor,heading_unknown);segment=fresh();continue
    text=' '.join(render(c).split())
    while text.startswith('[line break]'):text=text[12:].strip()
    while text.endswith('[line break]'):text=text[:-12].strip()
    if text:result.append(dict(section=title,sectionId=segment,containerPath=path,anchorId=anchor,text=text,kind='formula' if formula else c.tag,mathOmitted=MARK in text or (include_pre and unknown),visibilityUnknown=bool(include_pre and unknown)))
   else:
    # All wrapper boundaries are conservative scope barriers. Local headings
    # never escape their DOM container; even ambiguous wrappers split context.
    if n.tag in ('p','li') and c.tag not in ('section','details','div','article','aside','blockquote','figure','ul','ol','pre'):
     result.append(dict(section=title,sectionId=segment,containerPath=path,anchorId=anchor,text=MARK,kind='unknown',mathOmitted=True))
    else:visit(c,title,child_path,anchor,heading_unknown)
    segment=fresh()
 visit(tree.root)
 for row in result:
  # Legacy mathOmitted mixes extraction loss and CSS uncertainty. Keep it intact,
  # and add explicit mechanical fields rather than silently reinterpreting it.
  row['structuralOmitted']=MARK in row['text'] or MARK in row['section'] or row['kind'] in ('hidden','unknown')
  row['explicitHidden']=row['kind']=='hidden'
  row['detailsVisibilityUnverified']='/details:' in row.get('containerPath','')
 return result

def contextualize(rows,max_chars=1800,*,separate_uncertain_layout=False):
 output=[];seen=set()
 # Structural omissions remain barriers for the whole section. For the public
 # website index, also keep intact plain paragraphs apart from adjacent CSS-
 # uncertain blocks. Never do this across an omitted or unknown formula.
 incomplete_sections={r['sectionId'] for r in rows if r.get('structuralOmitted',True)}
 incomplete_containers={r.get('containerPath') for r in rows if r.get('structuralOmitted',True)}
 layout_sections={r['sectionId'] for r in rows if r.get('visibilityUnknown')}
 def clean_paragraph(row):
  return (row['kind']=='p' and not row['mathOmitted'] and not row.get('visibilityUnknown')
          and not row.get('detailsVisibilityUnverified'))
 for i,row in enumerate(rows):
  # Fixed structural window; no query, target answer or benchmark influences it.
  candidates=[j for j in range(max(0,i-2),min(len(rows),i+3)) if rows[j]['sectionId']==row['sectionId']]
  scope_incomplete=(row['sectionId'] in incomplete_sections or
                    separate_uncertain_layout and row.get('containerPath') in incomplete_containers)
  if (separate_uncertain_layout and clean_paragraph(row)
      and row['sectionId'] in layout_sections and not scope_incomplete):
   # Retain the contiguous plain-text run that contains the paragraph. The
   # styled siblings still have their own windows and risk flags.
   left=i
   while left-1 in candidates and clean_paragraph(rows[left-1]):left-=1
   right=i
   while right+1 in candidates and clean_paragraph(rows[right+1]):right+=1
   candidates=list(range(left,right+1))
  chosen=[i];size=len(row['text']);incomplete=False
  for j in sorted((j for j in candidates if j!=i),key=lambda j:(abs(j-i),j)):
   cost=len(rows[j]['text'])+len('\n[paragraph break]\n')
   if size+cost<=max_chars:chosen.append(j);size+=cost
   else:incomplete=True
  chosen.sort();key=tuple(chosen)
  if key in seen:continue
  seen.add(key)
  # Never silently splice non-adjacent paragraphs into an apparent derivation.
  pieces=[]
  for k,j in enumerate(chosen):
   if k and j!=chosen[k-1]+1:pieces.append('[context omitted]');incomplete=True
   pieces.append(rows[j]['text'])
  if size>max_chars: # oversized source cannot be safely truncated mid-formula
   pieces=['[context exceeds size limit; open original source]'];incomplete=True
  text='\n[paragraph break]\n'.join(pieces)
  anchors={rows[j].get('anchorId','') for j in chosen}
  anchor=next(iter(anchors)) if len(anchors)==1 else ''
  output.append(dict(anchorId=anchor,linkGranularity='dom-anchor' if anchor else 'page',section=row['section'],containerPath=row.get('containerPath',''),text=text,sourceBlockOrdinals=chosen,mathOmitted=any(rows[j]['mathOmitted'] for j in chosen),contextIncomplete=incomplete,structuralOmitted=scope_incomplete,explicitHidden=any(rows[j].get('explicitHidden',True) for j in chosen),visibilityUnknown=any(rows[j].get('visibilityUnknown',False) for j in chosen),detailsVisibilityUnverified=any(rows[j].get('detailsVisibilityUnverified',True) for j in chosen)))
 return output
