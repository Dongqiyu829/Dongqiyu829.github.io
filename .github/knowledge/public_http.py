"""Explicit opt-in, unauthenticated public GETs. No CLI, retries or logging.
Socket timeouts plus elapsed deadline reject late responses; DNS/native blocking
is not a hard process deadline. Injected connections are trusted test code.
"""
import gzip,http.client,io,json,math,re,ssl,time
from urllib.parse import urlsplit
from pathlib import Path

REPO = 'Dongqiyu829/Dongqiyu829.github.io'
API = 'https://api.github.com/repos/' + REPO
SITE = 'https://dongqiyu829.github.io/'
SCOPE = 'learn/linear-algebra/lessons'
LIMIT = 2_000_000



WEBSITE_SCOPE = json.loads(Path(__file__).with_name('website-public-scope.json').read_bytes())

def website_page(name):
    if name in WEBSITE_SCOPE['publicPages']:
        return True
    directory, _, filename = name.rpartition('/')
    return directory in WEBSITE_SCOPE['publicLessonDirectories'] and bool(re.fullmatch(r'[a-zA-Z0-9_-]+\.html', filename))

class TransportFailure(ValueError):pass

def strict_json(text):
 """Syntax only; endpoint schema/provenance remains the adapter's responsibility."""
 def pairs(items):
  result={}
  for key,value in items:
   if key in result:raise ValueError('invalid_json')
   result[key]=value
  return result
 def constant(_):raise ValueError('invalid_json')
 def number(value):
  result=float(value)
  if not math.isfinite(result):raise ValueError('invalid_json')
  return result
 return json.loads(text,object_pairs_hook=pairs,parse_constant=constant,parse_float=number)


def route(url, *, website=False):
 # All supported URLs are printable ASCII. Reject before urlsplit can strip
 # controls/whitespace or erase an empty fragment delimiter.
 if not isinstance(url,str) or len(url)>500 or any(ord(c)<33 or ord(c)>126 or c in '\\%#' for c in url):
  raise TransportFailure('URL_REFUSED')
 try:u=urlsplit(url)
 except ValueError:raise TransportFailure('URL_REFUSED') from None
 if u.scheme!='https' or u.netloc!=u.hostname or u.fragment:raise TransportFailure('URL_REFUSED')
 target=u.path+('?' + u.query if u.query else '')
 repo='/repos/'+REPO
 api=(target==repo+'/deployments?environment=github-pages&per_page=1' or
      re.fullmatch(re.escape(repo)+r'/deployments/[1-9][0-9]*/statuses\?per_page=1',target) or
      re.fullmatch(re.escape(repo+'/contents/'+SCOPE)+r'\?ref=[a-f0-9]{40}',target))
 raw=re.fullmatch(re.escape('/'+REPO)+r'/[a-f0-9]{40}/'+re.escape(SCOPE)+r'/[a-zA-Z0-9_-]+\.html',target)
 page=re.fullmatch('/'+re.escape(SCOPE)+r'/[a-zA-Z0-9_-]+\.html',target)
 if website:
  api=api or re.fullmatch(re.escape(repo)+r'/git/trees/[a-f0-9]{40}\?recursive=1',target)
  raw_path=re.fullmatch(re.escape('/'+REPO)+r'/[a-f0-9]{40}/(.+)',target)
  raw=bool(raw_path and website_page(raw_path[1]))
  page=website_page(target[1:])
 if not ((u.hostname=='api.github.com' and api) or (u.hostname=='raw.githubusercontent.com' and raw) or (u.hostname=='dongqiyu829.github.io' and page)):raise TransportFailure('URL_REFUSED')
 return u.hostname,target,u.hostname=='api.github.com'

class PublicPagesTransport:
 def __init__(self,*,enabled=False,connection_factory=None,clock=time.monotonic,website=False):
  self.website=website is True
  self.enabled=enabled is True;self.factory=connection_factory or http.client.HTTPSConnection;self.clock=clock;self.calls=0
 def __call__(self,url):
  if not self.enabled:raise TransportFailure('DISABLED')
  host,target,is_api=route(url,website=self.website)
  if self.calls>=210:raise TransportFailure('REQUEST_LIMIT')
  self.calls+=1;connection=None;response=None;deadline=self.clock()+10
  def remaining():
   left=deadline-self.clock()
   if left<=0:raise TransportFailure('TIMEOUT')
   return left
  try:
   context=ssl.create_default_context();context.check_hostname=True;context.verify_mode=ssl.CERT_REQUIRED
   connection=self.factory(host,timeout=remaining(),context=context)
   connection.request('GET',target,headers={'User-Agent':'Course-sync-readonly-candidate','Accept':'application/vnd.github+json' if is_api else '*/*','Accept-Encoding':'gzip','Connection':'close'})
   if connection.sock:connection.sock.settimeout(remaining())
   response=connection.getresponse();remaining()
   if response.status in (403,429):raise TransportFailure('RATE_OR_ACCESS_REFUSED')
   if response.status==404:raise TransportFailure('NOT_FOUND')
   if 300<=response.status<400:raise TransportFailure('REDIRECT_REFUSED')
   if response.status!=200:raise TransportFailure('HTTP_FAILURE')
   headers={}
   for k,v in response.getheaders():
    key=k.lower()
    if key in ('content-length','content-encoding','content-type','transfer-encoding'):
     if key in headers:raise TransportFailure('HEADERS_INVALID')
     headers[key]=v
   length=headers.get('content-length');encoding=headers.get('content-encoding','identity').lower()
   if length is not None and (not re.fullmatch('[0-9]+',length) or int(length)>LIMIT):raise TransportFailure('SIZE_LIMIT')
   if 'transfer-encoding' in headers and (length is not None or headers['transfer-encoding'].lower()!='chunked'):raise TransportFailure('HEADERS_INVALID')
   if encoding not in ('identity','gzip'):raise TransportFailure('ENCODING_REFUSED')
   mime=headers.get('content-type','').split(';')[0].strip().lower()
   if mime not in (('application/json',) if is_api else ('text/html','text/plain')):raise TransportFailure('CONTENT_TYPE_REFUSED')
   chunks=[];size=0
   while True:
    remaining()
    if connection.sock:connection.sock.settimeout(remaining())
    chunk=response.read1(min(65536,LIMIT+1-size));remaining()
    if not chunk:break
    size+=len(chunk)
    if size>LIMIT:raise TransportFailure('SIZE_LIMIT')
    chunks.append(chunk)
   if length is not None and size!=int(length):raise TransportFailure('BODY_INCOMPLETE')
   body=b''.join(chunks)
   if encoding=='gzip':
    with gzip.GzipFile(fileobj=io.BytesIO(body)) as f:body=f.read(LIMIT+1)
   if len(body)>LIMIT:raise TransportFailure('SIZE_LIMIT')
   remaining();text=body.decode('utf-8')
   if is_api:strict_json(text)
   remaining()
   return {'status':200,'body':body,'encoding':'identity','redirect':False}
  except TransportFailure:raise
  except TimeoutError:raise TransportFailure('TIMEOUT') from None
  except Exception:raise TransportFailure('TRANSPORT_OR_BODY_FAILURE') from None
  finally:
   # Cleanup errors must not disclose arbitrary transport exception messages.
   for obj in (response,connection):
    if obj:
     try:obj.close()
     except Exception:pass
