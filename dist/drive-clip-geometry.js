import * as T from './vendor/three.module.js';

// The tan interlocking clip (90900), drawn after the supplier's photo and its hint W6
// (https://www.knexusergroup.org.uk/en/knex-hint-W6.html): a U-shaped body that clips onto a rod
// side-on, with one small round peg standing on its back that slots into a hole in a wheel, gear
// or connector. Local frame, as in engine.js: the rod runs along z through the slot, the peg
// stands on the +z face at x = +5 (where the holes are) and the slot opens toward -x.
// The slot is a little wider than the rod's 6.1 mm ribs so the bevel never closes it on the rod.
export const CLIP={thickness:6.4,halfWidth:5.55,seat:3.35,mouth:-5.7,back:7.05,corner:4,bevel:.2,pegX:5,pegRadius:1.35,pegTip:7.3,
 // The two small bumps on the inside of the prongs that snap over the rod (nearest point 3.5 mm from the rod axis).
 lip:{x:-2.9,radius:1.25,offset:.5}};

function outline(){
 const{halfWidth:a,seat:s,mouth:m,back:b,corner:r,lip}=CLIP,shape=new T.Shape(),lc=s+lip.offset,lift=Math.asin(lip.offset/lip.radius),reach=Math.sqrt(lip.radius**2-lip.offset**2);
 shape.moveTo(m,s);shape.lineTo(m,a);shape.lineTo(b-r,a);
 shape.absarc(b-r,a-r,r,Math.PI/2,0,true);shape.lineTo(b,-(a-r));
 shape.absarc(b-r,-(a-r),r,0,-Math.PI/2,true);shape.lineTo(m,-a);
 shape.lineTo(m,-s);shape.lineTo(lip.x-reach,-s);
 shape.absarc(lip.x,-lc,lip.radius,Math.PI-lift,lift,true); // snap bump on the -y prong
 shape.lineTo(0,-s);
 shape.absarc(0,0,s,-Math.PI/2,Math.PI/2,false); // round seat around the rod, behind it
 shape.lineTo(lip.x+reach,s);
 shape.absarc(lip.x,lc,lip.radius,-lift,-(Math.PI-lift),true); // snap bump on the +y prong
 shape.closePath();
 return shape;
}

export function driveClipGeometry(d,mat){
 const g=new T.Group(),{thickness:t,bevel:e,pegX:x,pegRadius:r,pegTip:tip}=CLIP,depth=t-2*e;
 const body=new T.Mesh(new T.ExtrudeGeometry(outline(),{depth,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:e,bevelThickness:e,curveSegments:20}),mat);
 body.geometry.translate(0,0,-depth/2);body.castShadow=body.receiveShadow=true;g.add(body);
 // The peg: a straight round post with a slightly eased tip, sunk a little into the body.
 const root=t/2-.4,shoulder=tip-.3;
 const post=new T.Mesh(new T.CylinderGeometry(r,r,shoulder-root,20),mat),cap=new T.Mesh(new T.CylinderGeometry(r-.25,r,tip-shoulder,20),mat);
 post.position.set(x,0,(root+shoulder)/2);cap.position.set(x,0,(shoulder+tip)/2);
 for(const m of[post,cap]){m.rotation.x=Math.PI/2;m.castShadow=m.receiveShadow=true;g.add(m);}
 return g;
}

// Parts-tray picture: the clip seen from the front and above, mouth toward the viewer.
export function driveClipIcon(d){
 const c=d.color,side='#a68a5f',top='#dcc59d',u='M-20.5 48V10A10 10 0 0 1-10.5 0h21A10 10 0 0 1 20.5 10V48H11.3V26A11.3 11.3 0 0 0-11.3 26V48Z';
 return `<svg viewBox="0 0 120 58" aria-hidden="true"><g transform="translate(60 16) scale(1 .55)"><path d="${u}" fill="${side}" transform="translate(0 15)"/><path d="${u}" fill="${c}" stroke="#0002" stroke-width="1"/></g><path d="M55.2 22V13h9.6v9z" fill="${side}"/><ellipse cx="60" cy="22" rx="4.8" ry="2.7" fill="${side}"/><ellipse cx="60" cy="13" rx="4.8" ry="2.7" fill="${top}" stroke="#0002"/></svg>`;
}
