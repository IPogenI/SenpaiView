import puppeteer from 'puppeteer';

export async function fetchEpisodeLinks(animeTitle) {
  const headless = process.env.PUPPETEER_HEADLESS === 'true';
  const browser = await puppeteer.launch({ headless });

  const baseUrl = 'https://storage.kanzaki.ru/ANIME___/';
  const formattedTitle = animeTitle.toLowerCase().replace(/ /g, '_');

  const page = await browser.newPage();
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

  const folders = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a'))
      .map(a => a.getAttribute('href'))
      .filter(href => href.endsWith('/'))
  );

  // Strip the trailing slash from folder names for an exact match
  const matchedFolder = folders.find(folder => folder.slice(0, -1).toLowerCase() === formattedTitle);
  if (!matchedFolder) {
    await browser.close();
    throw new Error('Anime not found');
  }

  await page.goto(baseUrl + matchedFolder, { waitUntil: 'domcontentloaded' });

  const episodeLinks = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a'))
      .map(a => a.getAttribute('href'))
      .filter(href => href.endsWith('.mkv'))
  );

  await browser.close();
  // Return the full URLs
  return episodeLinks.map(link => baseUrl + matchedFolder + link);
}
