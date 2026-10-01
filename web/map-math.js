(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.MysteryMath=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rad=Math.PI/180;
 const wrap=v=>((v%360)+360)%360;
 function earth(lon,lat,size,zoom=1,x=0,y=0){return {x:size/2+x+lon/360*size*.92*zoom,y:size/2+y-lat/180*size*.46*zoom};}
 function sky(ra,dec,yaw,pitch,size,zoom=1){const d=(ra-yaw)*rad,p=dec*rad,c=pitch*rad;const vx=-Math.cos(p)*Math.sin(d),vy=Math.sin(p)*Math.cos(c)-Math.cos(p)*Math.cos(d)*Math.sin(c),z=Math.sin(p)*Math.sin(c)+Math.cos(p)*Math.cos(d)*Math.cos(c);if(z<=.04)return null;return {x:size/2+vx/z*size*.63*zoom,y:size/2-vy/z*size*.63*zoom,z};}
 function day(date){return Date.parse(date+'T00:00:00Z')/86400000;}
 function today(now=new Date()){const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Prague',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);return ['year','month','day'].map(k=>p.find(x=>x.type===k).value).join('-');}
 function pulse(date,now=today()){const age=day(now)-day(date);if(!Number.isFinite(age)||age<0||age>=7)return {strength:0,duration:0};return {strength:(7-age)/7,duration:1.7+age*.7};}
 function zoomAt(oldZoom,newZoom,pan,anchor,center){return anchor-center-(anchor-center-pan)*newZoom/oldZoom;}
 function pinch(points){const [a,b]=points;return {x:(a.x+b.x)/2,y:(a.y+b.y)/2,distance:Math.hypot(a.x-b.x,a.y-b.y)};}
 function overlaps(a,b){return a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;}
 // Recomputed in screen pixels after every zoom, pan and resize. Earlier accepted
 // labels have stable editorial priority; smaller countries appear as space opens.
 function placeLabels(candidates,width,height,obstacles=[],padding=5){
  const accepted=[],occupied=[...obstacles];
  for(const c of [...candidates].sort((a,b)=>(a.priority||0)-(b.priority||0)||String(a.id).localeCompare(String(b.id)))){
   const box={left:c.x-c.width/2-padding,right:c.x+c.width/2+padding,top:c.y-c.height/2-padding,bottom:c.y+c.height/2+padding};
   if(box.left<12||box.right>width-12||box.top<12||box.bottom>height-12||occupied.some(b=>overlaps(box,b)))continue;
   accepted.push({...c,box});occupied.push(box);
  }
  return accepted;
 }
 return {clamp,wrap,earth,sky,today,pulse,zoomAt,pinch,overlaps,placeLabels};
});
