const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  // Listen to console logs
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  // Listen to page errors
  page.on('pageerror', error => {
    console.error('PAGE ERROR:', error.message);
  });

  // Listen to response errors
  page.on('requestfailed', request => {
    console.error(`REQUEST FAILED: ${request.url()} - ${request.failure()?.errorText}`);
  });

  console.log("Navigating to Home...");
  await page.goto('http://localhost:3000/esteban-echeverria/home', { waitUntil: 'networkidle2' });
  
  console.log("Navigating to Pizzerias...");
  await page.goto('http://localhost:3000/esteban-echeverria/pizzerias', { waitUntil: 'networkidle2' });
  
  console.log("Waiting a bit...");
  await new Promise(r => setTimeout(r, 2000));

  console.log("Navigating to specific shop...");
  await page.goto('http://localhost:3000/esteban-echeverria/pizzerias/mi-shop', { waitUntil: 'networkidle2' });

  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
