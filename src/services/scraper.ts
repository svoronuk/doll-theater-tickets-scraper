import axios from 'axios';
import cheerio from 'cheerio';
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

// Side effect function for website scraping
export const scrapeWebsite: ScrapeWebsite = async (): Promise<ScrapingResult> => {
  try {
    const response = await axios.get(config.targetUrl);
    const $ = cheerio.load(response.data);
    const content = $('body').text();
    const found = contentMatchesPattern(content, config.searchPattern);

    return createScrapingResult(found, content);
  } catch (error) {
    console.error('Scraping error:', error);
    return createScrapingResult(
      false,
      undefined,
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }
};