import * as cheerio from 'cheerio';
import { config } from '../../config/config';
import { Show } from '../../types';

export function extractShowsFallback($: cheerio.CheerioAPI): Show[] {
	const shows: Show[] = [];
	const seenNames = new Set<string>();
	const baseUrl = new URL(config.targetUrl).origin;

	// Fallback: Try to parse from any links that look like shows
	$('a').each((_, el) => {
		const $el = $(el);
		const href = $el.attr('href');
		const text = $el.text().trim();

		// If the link seems to be a show (contains certain keywords and has decent length)
		if (
			href &&
			text.length > 5 &&
			text.length < 100 &&
			(text.includes('спектакль') ||
				text.includes('показ') ||
				href.includes('/show') ||
				href.includes('/performance'))
		) {
			const normalizedName = text.toLowerCase();
			if (!seenNames.has(normalizedName)) {
				const absoluteLink = href.startsWith('/') ? baseUrl + href : href;
				shows.push({
					name: text,
					date: 'TBD',
					link: absoluteLink,
				});
				seenNames.add(normalizedName);
			}
		}
	});

	return shows;
}
