import * as cheerio from 'cheerio';
import { config } from '../config/config';
import { ScrapingResult, ScrapeWebsite } from '../types';
import { fetchLikeBrowser } from '../utils/fetchLikeBrowser';

function extractMonths($: cheerio.CheerioAPI): { id: string; name: string }[] {
	const months: { id: string; name: string }[] = [];
	$('.button-wrapper button[data-m]').each((_, el) => {
		const id = $(el).attr('data-m');
		const name = $(el).text().replace(/\s+/g, ' ').trim();
		if (id && name) months.push({ id, name });
	});
	return months;
}

type Show = { name: string; date: string; link: string };
function extractShows($: cheerio.CheerioAPI): Show[] {
	const shows: Show[] = [];
	const seenNames = new Set<string>();
	const baseUrl = new URL(config.targetUrl).origin;
	$('.afisha_item').each((_, el) => {
		const info = $(el).find('.afisha-info');
		const day = info.find('.afisha-day').text().replace(/\s+/g, ' ').trim();
		const time = info.find('.afisha-time').text().replace(/\s+/g, ' ').trim();
		const name = info.find('.afisha-title').text().replace(/\s+/g, ' ').trim();
		const normalizedName = name.toLowerCase();
		if (seenNames.has(normalizedName)) return;
		const link = $(el).find('a.afisha_item-hover').attr('href');
		const absoluteLink = link && link.startsWith('/') ? baseUrl + link : link;
		const date = time ? `${day} ${time}`.trim() : day;
		if (name && date && absoluteLink) {
			shows.push({ name, date, link: absoluteLink });
			seenNames.add(normalizedName);
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
