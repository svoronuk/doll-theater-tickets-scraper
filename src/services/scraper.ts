import puppeteer from 'puppeteer';
import { config } from '../config/config';
import { ScrapingResult, ScrapeWebsite } from '../types';

// Pure function to check if content matches pattern
const contentMatchesPattern = (content: string, pattern: string): boolean => 
  content.includes(pattern);

// Pure function to create scraping result
const createScrapingResult = (
  found: boolean,
  content?: string,
  error?: string
): ScrapingResult => ({
  found,
  content,
  error,
});

// Side effect function for browser operations
export const scrapeWebsite: ScrapeWebsite = async (): Promise<ScrapingResult> => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto(config.targetUrl, { waitUntil: 'networkidle0' });

    const content = await page.content();
    const found = contentMatchesPattern(content, config.searchPattern);

    return createScrapingResult(found, content);
  } catch (error) {
    console.error('Scraping error:', error);
    return createScrapingResult(
      false,
      undefined,
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}; 