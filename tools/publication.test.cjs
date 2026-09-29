const test=require('node:test'),assert=require('node:assert/strict');
const {publicationStatus,load}=require('./model.cjs');
test('publication date, hidden articles and drafts',()=>{
 const today='2026-09-30';
 assert.equal(publicationStatus({published:'29. 9. 2026'},today),'published');
 assert.equal(publicationStatus({published:'30. 9. 2026'},today),'published');
 assert.equal(publicationStatus({published:'1. 10. 2026'},today),'scheduled');
 assert.equal(publicationStatus({published:'1. 1. 2099'},today),'hidden');
 assert.equal(publicationStatus({published:'29. 9. 2026',status:'draft'},today),'draft');
 assert.equal(publicationStatus({published:'29. 9. 2026',hidden:true},today),'hidden');
});
test('real FEED cannot publish before scheduled date',()=>{
 const past=load({today:'2000-01-01'});
 assert.equal(past.articles.filter(a=>a.status==='published').length,0);
 assert.ok(past.articles.some(a=>a.status==='scheduled'));
});
test('an admin-created article gets a topic and obeys hidden/scheduled dates',()=>{
 const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
 const modelFile=path.join(__dirname,'model.cjs'),root=path.resolve(__dirname,'..');
 const original=fs.readFileSync(path.join(root,'index.html'),'utf8');
 for(const [published,status] of [['30. 9. 2026','published'],['1. 10. 2026','scheduled'],['1. 1. 2099','hidden']]){
  const article={id:'publication-test',title:'Admin publication test',published,topic:'civilizace',tag:'overeno',body:['Test paragraph'],sources:[],image:'img/test.jpg'};
  const input=original.replace(/const FEED\s*=\s*\[/,m=>m+JSON.stringify(article)+',');
  const fakeFS={...fs,readFileSync:(file,...args)=>path.resolve(file)===path.join(root,'index.html')?input:fs.readFileSync(file,...args)};
  const context={require:n=>n==='node:fs'?fakeFS:require(n),module:{exports:{}},__dirname,structuredClone};
  vm.runInNewContext(fs.readFileSync(modelFile,'utf8'),context);
  const a=context.module.exports.load({today:'2026-09-30'}).articles.find(a=>a.id===article.id);
  assert.equal(a.status,status);assert.equal(a._category,'civilizace');
  assert.equal(a._url,'/clanky/publication-test.html');
 }
});
