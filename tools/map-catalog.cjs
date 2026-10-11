const {json}=require('./model.cjs');
function catalog(articles,mappings){
 const config=json('content/map-catalog.json'),excluded=new Set(config.excludedArticleIds);
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Prague',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const items=articles.filter(a=>!excluded.has(a._slug));
 for(const s of json('content/spisy.json').filter(s=>config.spisIds.includes(s.id)&&s.status==='published'&&s.published<=today)){
  const id='spis-'+s.id;
  if(!/^https:\/\/herohero\.co\//.test(s.url)||!mappings[id])throw Error('Invalid map dossier '+s.id);
  items.push({kind:'spis',_slug:id,_url:s.url,_date:s.published,_image:s.image,_category:'civilizace',title:s.title,teaser:s.description,published:s.published,body:[]});
 }
 return items.sort((a,b)=>b._date.localeCompare(a._date));
}
module.exports={catalog};
