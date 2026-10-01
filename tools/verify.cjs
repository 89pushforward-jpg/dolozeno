const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {ROOT,load,json,read,esc}=require('./model.cjs');const model=load(),report={checks:[],articles:model.articles.length};
const check=(label,v)=>{assert.ok(v,label);report.checks.push(label)};
const urls=[...read('content/legacy-sitemap.xml').matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1].replace('https://dolozeno.cz','')).filter(u=>u.startsWith('/clanky/'));
const sitemap=fs.readFileSync(path.join(ROOT,'dist/sitemap.xml'),'utf8');
const originalSnapshot=json('content/original-articles.json');
const historicalFeed=model.original.slice(0,originalSnapshot.length).map((a,i)=>i===91?{...a,id:originalSnapshot[i].id}:a);
check('93 historical entries preserved; approved duplicate ID repaired',JSON.stringify(historicalFeed)===JSON.stringify(originalSnapshot)&&model.original[91].id==='mars-leopardi-skvrny-2');
check('93 existing article URLs preserved',urls.length===93&&urls.every(u=>model.articles.some(a=>a._url===u)));
check('all article URLs unique',new Set(model.articles.map(a=>a._url)).size===model.articles.length);
for(const a of model.articles){const before=model.original[a._index];if(!before)continue;const html=fs.readFileSync(path.join(ROOT,'dist',a._url),'utf8');
for(const field of ['id','title','published','sources','verdikt','image','fact','tag'])check(a._slug+' preserve '+field,JSON.stringify(a[field])===JSON.stringify(before[field]));
const removed=new Set(model.removed.filter(r=>r.index===a._index&&r.field==='body').map(r=>r.paragraph));check(a._slug+' retained body exact',JSON.stringify(a.body)===JSON.stringify(before.body.filter((_,i)=>!removed.has(i))));
check(a._slug+' sitemap exactly once',sitemap.split('<loc>https://dolozeno.cz'+a._url+'</loc>').length===2);
check(a._slug+' noindex',html.includes('content="noindex,nofollow"'));check(a._slug+' title',html.includes('<title>'+esc(a.title)));check(a._slug+' sources rendered',(a.sources||[]).every(z=>html.includes(esc(z.url))));
if(a.verdikt){const oldFile=path.join(ROOT,'clanky',a._slug+'.html');const old=fs.existsSync(oldFile)?fs.readFileSync(oldFile,'utf8'):'';const oldLabel=old.match(/class="v-verd [^"]+">([^<]+)</)?.[1];if(oldLabel)check(a._slug+' rendered verdict unchanged',html.match(/class="verdict-label"[^>]*>([^<]+)</)?.[1].toLocaleUpperCase('cs')===oldLabel.toLocaleUpperCase('cs'));for(const t of [...(a.verdikt.pro||[]),...(a.verdikt.proti||[])])check(a._slug+' verdict argument visible',html.includes(esc(t)));}
if(a._image)check(a._slug+' original image exists or documented missing',fs.existsSync(path.join(ROOT,'dist',a._image))||json('reports/migration.json').missingImages.some(x=>x.url===a._url&&x.image===a._image));
for(const m of html.matchAll(/(?:src|href)="(\/[^"#?]+)(?:[?#][^"]*)?"/g)){let p=m[1];if(p.endsWith('/'))p+='index.html';check(a._slug+' local link '+m[1],fs.existsSync(path.join(ROOT,'dist',p)))}
}
check('no published draft',!sitemap.includes('draft'));check('news disabled',json('content/site.json').newsEnabled===false&&JSON.parse(fs.readFileSync(path.join(ROOT,'dist/news.json'),'utf8')).length===0);
check('old admin still intact',fs.readFileSync(path.join(ROOT,'admin.html'),'utf8').includes('const WAITLIST_ENDPOINT='));
check('no admin in preview',!fs.existsSync(path.join(ROOT,'dist/admin.html')));
check('original root still contains FEED',read('index.html').includes('const FEED = ['));
fs.writeFileSync(path.join(ROOT,'reports/verification.json'),JSON.stringify(report,null,2));console.log(`${report.checks.length} checks passed; ${report.articles} articles.`);
