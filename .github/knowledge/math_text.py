"""Static course HTML only. CSS-specific matrix layout, never inferred values."""
from html.parser import HTMLParser
import re
MARK='[数学结构未转写，请查看原页]'
LINE=' [line break] '
class Node:
 def __init__(self,tag='',attrs=()):self.tag=tag;self.attrs=dict(attrs);self.children=[]
class Tree(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.root=Node();self.stack=[self.root]
 def handle_starttag(self,tag,attrs):
  n=Node(tag,attrs);self.stack[-1].children.append(n)
  if tag not in ('br','img','input','hr','meta','link','source','wbr'):self.stack.append(n)
 def handle_endtag(self,tag):
  for i in range(len(self.stack)-1,0,-1):
   if self.stack[i].tag==tag:self.stack=self.stack[:i];break
 def handle_data(self,data):self.stack[-1].children.append(data)
def walk(n):
 if isinstance(n,Node):
  yield n
  for c in n.children:yield from walk(c)
def render(n,formula_context=False):
 if isinstance(n,str):return n
 cls=set(n.attrs.get('class','').split())
 formula_context=formula_context or 'formula' in cls
 if n.tag in ('script','style','nav'):return ''
 if n.tag in ('svg','canvas','img','math','table','input') or any('katex' in c for c in cls):return MARK
 if n.tag=='br':return ' ; '
 if cls & {'matrix','column-vector'}:
  cells=[c for c in n.children if isinstance(c,Node)]
  if any(isinstance(c,str) and c.strip() for c in n.children) or not cells or any(c.tag!='span' for c in cells):return MARK
  columns=1 if 'column-vector' in cls else 2 # verified course.css rules
  style=n.attrs.get('style','')
  if style:
   match=re.fullmatch(r'\s*grid-template-columns\s*:\s*repeat\((\d+),\s*minmax\(28px,\s*auto\)\)\s*;?\s*',style)
   if not match:return MARK
   columns=int(match[1])
  values=[' '.join(render(c).split()) for c in cells]
  if not columns or len(values)%columns or any(not v or MARK in v for v in values):return MARK
  return '['+'; '.join('['+', '.join(values[i:i+columns])+']' for i in range(0,len(values),columns))+']'
 text=''.join(render(c,formula_context) for c in n.children)
 if n.tag in ('sup','sub'):return ('^(' if n.tag=='sup' else '_(')+text+')'
 if 'formula' in cls and not text.strip():return MARK
 # course.css declares .math-line display:block. Keep an explicit textual
 # boundary because the index normalizes whitespace; a newline alone is lost.
 if 'line' in cls and not formula_context:return MARK
 if 'math-line' in cls or ('line' in cls and formula_context) or n.tag in ('div','p','li','section','h2','h3'):
  style=n.attrs.get('style','')
  if re.search(r'display\s*:',style):return MARK
  return LINE+text+LINE
 return text

def section_text(n):
 return ' '.join(render(n).replace('[line break]',' ').split())
