import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
// Run against the Vite development server on port 4174 (DEV-only rig handle).
const browser = await chromium.launch({channel:'chrome'});
try {
 const page = await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://127.0.0.1:4174');
 await page.waitForFunction(()=>window.__spline?.getAllObjects().some(o=>o.name==='forearm'),{timeout:90000});
 await page.locator('.hero-scene.is-ready').waitFor();
 const samples = await page.evaluate(async()=>{
  const rows=[];
  for(let i=0;i<180;i++) {
   await new Promise(requestAnimationFrame);
   rows.push(window.__spline.getAllObjects().filter(o=>['elbow','forearm','arm','Hand LEFT'].includes(o.name)).map(o=>({id:o.uuid,name:o.name,p:[o.position.x,o.position.y,o.position.z],r:[o.rotation.x,o.rotation.y,o.rotation.z]})));
  }
  return rows;
 });
 let maxStep=0;let motion=0;
 for(let i=1;i<samples.length;i++)for(let j=0;j<samples[i].length;j++){
  assert.deepEqual(samples[i][j].p,samples[0][j].p,'joint anchor drift');
  for(let k=0;k<3;k++){
   maxStep=Math.max(maxStep,Math.abs(samples[i][j].r[k]-samples[i-1][j].r[k]));
   motion=Math.max(motion,Math.abs(samples[i][j].r[k]-samples[0][j].r[k]));
  }
 }
 assert(maxStep<0.02,'rotation snap');assert(motion>0.01,'arms must animate');
 console.log(JSON.stringify({frames:samples.length,joints:samples[0].length,maxStepRadians:maxStep,motionRadians:motion,anchors:'fixed'}));
 await page.evaluate(()=>window.scrollTo(0,1500));await page.waitForTimeout(500);
 assert(await page.evaluate(()=>window.__spline.isStopped),'offscreen must pause');
 await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(500);
 assert(!(await page.evaluate(()=>window.__spline.isStopped)),'return must resume');
 await page.mouse.move(1400,100);await page.waitForTimeout(800);
 const head=await page.evaluate(()=>{const h=window.__spline.findObjectByName('Head');return h.rotation.y});assert(Math.abs(head)>0.05,'head pointer response');
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(1800);
 const pose=()=>page.evaluate(()=>window.__spline.getAllObjects().filter(o=>['arm','forearm'].includes(o.name)).map(o=>o.rotation.x));
 const a=await pose();await page.waitForTimeout(500);const b=await pose();assert(a.every((v,i)=>Math.abs(v-b[i])<0.001),'reduced motion must settle');
 await page.screenshot({path:'review/arms/after-desktop.png'});
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(500);
 assert.equal(await page.locator('.hero-spline-character canvas').count(),0,'mobile preserves static hero');
 assert(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=1);
 await page.screenshot({path:'review/arms/after-mobile.png'});
 await page.setViewportSize({width:1440,height:900});await page.locator('.hero-spline-character canvas').waitFor();
 await page.waitForTimeout(2500);assert.equal(errors.length,0,errors.join('\n'));
 console.log('PASS: pointer tracking, offscreen pause/resume, reduced motion, mobile, desktop remount; zero page errors');
 const fallback=await browser.newPage({viewport:{width:1440,height:900}});
 await fallback.route('**/scene.splinecode',route=>route.abort());await fallback.goto('http://127.0.0.1:4174');await fallback.waitForTimeout(2000);
 assert(await fallback.locator('.hero-static-preview:not(.is-hidden)').isVisible());
 console.log('PASS: blocked Spline request preserves static robot and page');
} finally {await browser.close();}
