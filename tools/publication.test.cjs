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
