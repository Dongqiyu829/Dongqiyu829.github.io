const fs=require('fs'),path=require('path'),http=require('http'),os=require('os');
let playwright;
try { playwright=require('playwright'); }
catch { playwright=require(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')); }
const root=path.resolve(__dirname,'..');
async function startServer() {
  const server=http.createServer((req,res)=>{
    const url=new URL(req.url,'http://localhost');
    if(url.pathname==='/favicon.ico'){res.writeHead(204).end();return;}
    const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
    if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
    fs.readFile(file,(error,data)=>{
      if(error){res.writeHead(404).end();return;}
      res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':file.endsWith('.json')?'application/json; charset=utf-8':'text/html; charset=utf-8');res.end(data);
    });
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  return {server,origin:'http://127.0.0.1:'+server.address().port};
}
async function launch() { return playwright.chromium.launch({channel:process.env.COURSE_BROWSER_CHANNEL||'msedge',headless:true}); }
const pages=['index.html',...['lessons','reference','research'].filter(d=>fs.existsSync(path.join(root,d))).flatMap(d=>fs.readdirSync(path.join(root,d)).filter(n=>n.endsWith('.html')).map(n=>d+'/'+n))];
const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/course-manifest.json'),'utf8'));
function save(name,data){fs.mkdirSync(path.join(root,'work/qa'),{recursive:true});fs.writeFileSync(path.join(root,'work/qa',name),JSON.stringify(data,null,2));}
module.exports={fs,path,root,startServer,launch,pages,manifest,save};
