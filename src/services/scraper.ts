import * as cheerio from 'cheerio';
import { config } from '../config/config';
import { ScrapingResult, ScrapeWebsite, Show } from '../types';
import { fetchLikeBrowser } from '../utils/fetchLikeBrowser';
import { extractShowsOldLayout } from './parsers/oldLayoutParser';
import { extractShowsNewLayout } from './parsers/newLayoutParser';

function extractMonths($: cheerio.CheerioAPI): { id: string; name: string }[] {
	const months: { id: string; name: string }[] = [];

	// Fixed: Use [data-m] selector instead of button[data-m] since the website uses <a> tags, not <button> tags
	$('[data-m]').each((_, el) => {
		const id = $(el).attr('data-m');
		const name = $(el).text().replace(/\s+/g, ' ').trim();
		if (id && name) {
			months.push({ id, name });
		}
	});

	return months;
}

function extractShows($: cheerio.CheerioAPI): Show[] {
	// Try old layout first
	const oldLayoutShows = extractShowsOldLayout($);

	// Try new layout
	const newLayoutShows = extractShowsNewLayout($);

	// Decision logic: if both return results, use old layout (current one)
	if (oldLayoutShows.length > 0 && newLayoutShows.length > 0) {
		return oldLayoutShows;
	} else if (oldLayoutShows.length > 0) {
		return oldLayoutShows;
	} else if (newLayoutShows.length > 0) {
		return newLayoutShows;
	} else {
		return [];
	}
}

// Side effect function for website scraping
export const scrapeWebsite: ScrapeWebsite = async (): Promise<ScrapingResult> => {
	try {
		const { data, error } = await fetchLikeBrowser({ url: config.targetUrl });
		if (error) {
			return {
				shows: [],
				error,
			};
		}
		if (!data) {
			return {
				shows: [],
				error: 'No data received',
			};
		}
		const $ = cheerio.load(data);
		const months = extractMonths($);
		const shows = extractShows($);
		return { shows, months };
	} catch (error) {
		return {
			shows: [],
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		};
	}
};
