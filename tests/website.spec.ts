import { expect, test } from '@playwright/test';
test('desktop: scenario, capabilities, intelligence, industry, FAQ and anchors', async ({page}) => {
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/');
  await expect(page.locator('#home')).toBeVisible();
  await expect(page.getByRole('tab',{name:/Appointment booking/})).toHaveAttribute('aria-selected','true');
  await page.getByRole('tab',{name:/Lead qualification/}).click();
  await expect(page.locator('.rin-outcome h3')).toContainText('Lead details');
  await page.getByRole('button',{name:'Replay conversation'}).click();
  await page.getByRole('button',{name:/Lead qualification/}).last().click();
  await expect(page.locator('.rin-capability-copy h3')).toContainText('opportunity');
  await page.getByRole('tab',{name:/Understanding/}).click();
  await expect(page.locator('.rin-intel-description h3')).toContainText('clarity');
  await page.getByRole('tab',{name:/Real estate/}).click();
  await expect(page.locator('.rin-bubble.caller')).toContainText('viewing');
  const faq=page.getByRole('button',{name:/Can it book appointments/i});
  await faq.click();
  await expect(faq).toHaveAttribute('aria-expanded','true');
  const broken=await page.locator('a[href^="#"]').evaluateAll(links=>links.filter(link=>!document.querySelector(link.getAttribute('href')!)).map(link=>link.getAttribute('href')));
  expect(broken).toEqual([]);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
test('mobile: menu, interactions and no overflow',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await page.getByRole('button',{name:'Toggle menu'}).click();
  await expect(page.getByRole('button',{name:'Get Your AI Agent'}).last()).toBeVisible();
  await page.getByRole('button',{name:'Toggle menu'}).click();
  await page.getByRole('tab',{name:/Customer questions/}).click();
  await expect(page.locator('.rin-outcome h3')).toContainText('Question answered');
  await page.getByRole('tab',{name:/Responding/}).click();
  await expect(page.locator('.rin-intel-description h3')).toContainText('useful answer');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
test('contact form: validation and transparent submission failure',async({page})=>{
  // Deliberately intercept the request: browser tests never create fake customer leads.
  await page.route('**/functions/v1/contact-inquiry',route=>route.fulfill({status:503,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({error:'Test-only service unavailable'})}));
  await page.goto('/');
  const send=page.getByRole('button',{name:/Build My AI Agent/});
  await send.click();
  await expect(page.locator('#contact input:invalid').first()).toBeVisible();
  await page.getByRole('textbox',{name:'Name *',exact:true}).fill('Sample Tester');
  await page.getByRole('textbox',{name:'Business email'}).fill('tester@example.org');
  await page.getByRole('textbox',{name:/What should your AI agent handle/}).fill('Answer incoming customer service requests for our office.');
  await send.click();
  await expect(page.getByRole('alert')).toContainText(/not configured|Test-only service unavailable/);
});
test('visual capture: desktop and mobile',async({page})=>{
  test.setTimeout(90_000);
  for (const [size,w,h] of [['desktop',1440,900],['mobile',390,844]] as const) {
    await page.setViewportSize({width:w,height:h});
    await page.goto('/');
    await page.waitForTimeout(1500);
    const height=await page.evaluate(()=>document.documentElement.scrollHeight);
    for(let y=0;y<height;y+=Math.max(600,h-150)){await page.evaluate(y=>window.scrollTo(0,y),y);await page.waitForTimeout(75)}
    await page.evaluate(()=>window.scrollTo(0,0));
    await page.waitForTimeout(900);
    await page.screenshot({path:`review/heyrin-${size}.png`,fullPage:true,animations:'disabled'});
  }
});
