import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from '../dist/vendor/three.module.js';
import {makePart,iconSVG} from '../dist/geometry.js';
import {BY_ID,keyZ,parseModel} from '../dist/engine.js';
import {createInterferenceGuard} from '../dist/interference.js';

const clip=()=>{const g=makePart('k-tan');g.updateMatrixWorld(true);return g;};
const hit=(g,from,dir)=>new T.Raycaster(new T.Vector3(...from),new T.Vector3(...dir).normalize()).intersectObject(g,true)[0];

test('the tan clip is an open side-on U around the rod, not a closed ring',()=>{
 const g=clip();
 assert.equal(hit(g,[0,0,0],[-1,0,0]),undefined,'the slot opens toward -x so the clip can be pressed on from the side');
 const seat=hit(g,[0,0,0],[1,0,0]);
 assert.ok(seat&&seat.distance>3.1&&seat.distance<3.4,'the round seat clears a 6.1 mm ribbed rod without being loose');
 for(const side of[1,-1]){const wall=hit(g,[0,0,0],[0,side,0]);assert.ok(wall&&wall.distance>3.1&&wall.distance<3.4,'prong walls clear the rod');}
});

test('the peg stands on the +z face at the key position and the body is as thick as the part says',()=>{
 const g=clip(),d=BY_ID['k-tan'];
 const tip=hit(g,[5,0,20],[0,0,-1]);assert.ok(tip&&tip.point.z>6.5&&tip.point.z<7.6,'one round peg 5 mm from the rod axis');
 assert.equal(hit(g,[-5,0,20],[0,0,-1])?.point.z??null,null,'no second peg on the other side');
 const top=hit(g,[5,3.2,20],[0,0,-1]),bottom=hit(g,[5,3.2,-20],[0,0,1]);
 assert.ok(Math.abs(top.point.z-keyZ(d))<.05,'the face the peg stands on is where the key port is');
 assert.ok(Math.abs(bottom.point.z+d.thickness/2)<.05,'the back face is half the catalog thickness behind the centre');
 const box=new T.Box3().setFromObject(g);
 assert.ok(box.min.y>-5.9&&box.max.y<5.9,'no wider than the ring it replaces, so existing builds keep their clearances');
});

test('the parts tray draws the clip as a clip',()=>{
 const svg=iconSVG(BY_ID['k-tan']);
 assert.match(svg,/^<svg viewBox="0 0 120 58"/);assert.ok(!svg.includes('NaN'));assert.ok(svg.includes(BY_ID['k-tan'].color));
});

test('the redrawn clip adds no overlaps to the shipped examples that use it',()=>{
 // These examples already placed a neighbouring connector or spacer ring a fraction of a millimetre too close
 // to a clip; the old ring overlapped in exactly the same places, so these counts must not grow.
 const known={'compound-gearbox':1,'twin-motor-rover':4,'wheeled-vehicle-base':2};
 for(const name of['compound-gearbox','gear-train','powered-windmill','twin-motor-rover','wheeled-vehicle-base']){
  const model=parseModel(fs.readFileSync(new URL(`../dist/examples/${name}.knex.json`,import.meta.url),'utf8')),byId=new Map(model.parts.map(p=>[p.id,p]));
  assert.ok(model.parts.some(p=>p.type==='k-tan'),name+' has a tan clip');
  const clipHits=createInterferenceGuard(model).check({all:true}).filter(h=>[h.a,h.b].some(id=>byId.get(id).type==='k-tan'));
  assert.ok(clipHits.length<=(known[name]||0),`${name}: ${clipHits.length} clip overlaps`);
 }
});
