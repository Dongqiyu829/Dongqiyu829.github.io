"""Limited structural transcription, not CSS visibility or semantic verification."""
import json,re
from math_text import Node,walk,render,MARK

def mathml(n):
 if isinstance(n,str):
  if n.strip():raise ValueError('mixed_text')
  return ''
 if any(k not in ('xmlns','display') for k in n.attrs):raise ValueError('math_attributes')
 children=[c for c in n.children if isinstance(c,Node)]
 if n.tag in ('mi','mn','mo','mtext'):
  if children:raise ValueError('token_children')
  value=''.join(n.children).strip()
  if not value:raise ValueError('empty_token')
  return value
 if any(isinstance(c,str) and c.strip() for c in n.children):raise ValueError('mixed_text')
 parts=[mathml(c) for c in children]
 if n.tag in ('math','mrow') and parts:return '('+' '.join(parts)+')'
 if n.tag in ('mfrac','msup','msub') and len(parts)==2:
  a,b=parts;return {'mfrac':f'({a})/({b})','msup':f'({a})^({b})','msub':f'({a})_({b})'}[n.tag]
 if n.tag=='msubsup' and len(parts)==3:return f'({parts[0]})_({parts[1]})^({parts[2]})'
 if n.tag=='msqrt' and parts:return 'sqrt('+' '.join(parts)+')'
 if n.tag=='mtd' and parts:return ' '.join(parts)
 if n.tag=='mtr' and parts and all(c.tag=='mtd' for c in children):return '['+', '.join(parts)+']'
 if n.tag=='mtable' and parts and all(c.tag=='mtr' for c in children) and len({len([x for x in c.children if isinstance(x,Node)]) for c in children})==1:return '['+'; '.join(parts)+']'
 raise ValueError('unsupported_math')

def transcribe(tree):
 audit=[]
 def visit(n,path='root',ancestor_hidden=False):
  if n.tag in ('script','style','nav') or n.attrs.get('id')=='course-feedback':return
  ancestor_hidden=ancestor_hidden or 'hidden' in n.attrs or ('aria-hidden' in n.attrs and n.attrs['aria-hidden']!='false') or bool(re.search(r'(?:display\s*:\s*none|visibility\s*:\s*(?:hidden|collapse)|opacity\s*:\s*0(?:\.0*)?\s*(?:;|$))',n.attrs.get('style') or '',re.I))
  for i,c in enumerate(n.children):
   if not isinstance(c,Node):continue
   location=path+'/'+c.tag+':'+str(i)
   if c.tag not in ('table','math'):visit(c,location,ancestor_hidden);continue
   item={'kind':c.tag,'domPath':location,'status':'omitted','visibility':'not_browser_verified'}
   replacement=Node('section',c.attrs.items())
   replacement.attrs['class']=(replacement.attrs.get('class') or '')+' structure-visibility-unverified'
   try:
    descendants=list(walk(c))
    if ancestor_hidden or any('hidden' in x.attrs or ('aria-hidden' in x.attrs and x.attrs['aria-hidden']!='false') or re.search(r'(?:display\s*:\s*none|visibility\s*:\s*(?:hidden|collapse)|opacity\s*:\s*0(?:\.0*)?\s*(?:;|$))',x.attrs.get('style') or '',re.I) for x in descendants):raise ValueError('hidden_or_unknown')
    # CSS on descendants is not retained by flattening: refuse, rather than leak hidden text.
    if any('class' in x.attrs or 'style' in x.attrs for x in descendants if x is not c and not (set((x.attrs.get('class') or '').split())<= {'matrix','column-vector'} and x.attrs.get('class'))):raise ValueError('descendant_style')
    if c.tag=='math':texts=[mathml(c)];item['expression']=texts[0]
    else:
     rows=[]
     def collect(x):
      for child in x.children:
       if isinstance(child,str):
        if child.strip():raise ValueError('table_text')
       elif child.tag=='tr':rows.append(child)
       elif child.tag in ('thead','tbody','tfoot'):collect(child)
       else:raise ValueError('table_structure')
     collect(c)
     grid=[];tags=[]
     for row in rows:
      cells=[x for x in row.children if isinstance(x,Node)]
      if any(isinstance(x,str) and x.strip() for x in row.children) or not cells or any(x.tag not in ('td','th') for x in cells):raise ValueError('row_structure')
      values=[]
      for cell in cells:
       if any(k in cell.attrs for k in ('rowspan','colspan','headers','scope')):raise ValueError('complex_headers')
       if any(x.tag not in ('td','th','span','strong','em','b','i','code','sup','sub','br','a','small') for x in walk(cell)):raise ValueError('cell_structure')
       value=' '.join(render(cell).split())
       if not value or MARK in value:raise ValueError('cell_omitted')
       values.append(value)
      grid.append(values);tags.append([x.tag for x in cells])
     if len(grid)<2 or len({len(r) for r in grid})!=1 or any(t!='th' for t in tags[0]) or any(t!='td' for row in tags[1:] for t in row):raise ValueError('header_layout')
     item.update(headers=grid[0],rows=grid[1:])
     texts=['[table row '+str(j)+'] '+json.dumps(list(zip(grid[0],row)),ensure_ascii=False) for j,row in enumerate(grid[1:],1)]
    item['status']='transcribed'
   except ValueError as e:
    item['reason']=str(e);texts=[MARK+' [unsupported '+c.tag+' structure; open original source]']
   # New section is a boundary; row/header relationships are repeated, never inferred.
   for text in texts:
    p=Node('p');p.children=[text];replacement.children.append(p)
   n.children[i]=replacement;audit.append(item)
 visit(tree.root)
 return audit
