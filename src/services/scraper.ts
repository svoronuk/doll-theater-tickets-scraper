import axios from 'axios';
import * as cheerio from 'cheerio';
import { config } from '../config/config';
import { ScrapingResult, ScrapeWebsite } from '../types';
import { fetchLikeBrowser } from '../utils/fetchLikeBrowser';

function extractMonths($: cheerio.CheerioAPI): { id: string; name: string }[] {
	const months: { id: string; name: string }[] = [];
	$('a[data-m]').each((_, el) => {
		const id = $(el).attr('data-m');
		const name = $(el).text().replace(/\s+/g, ' ').trim();
		if (id && name) months.push({ id, name });
	});
	return months;
}

function extractShows($: cheerio.CheerioAPI): { name: string; date: string; link: string }[] {
	const shows: { name: string; date: string; link: string }[] = [];
	$('.afisha_listcontainer table.display tbody tr').each((_, el) => {
		const tds = $(el).find('td');
		if (tds.length < 2) return;
		const date = $(tds[0]).text().replace(/\s+/g, ' ').trim();
		const linkEl = $(tds[1]).find('a');
		const name = linkEl.text().trim();
		const href = linkEl.attr('href');
		if (name && date && href) {
			shows.push({ name, date, link: href });
		}
	});
	return shows;
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
