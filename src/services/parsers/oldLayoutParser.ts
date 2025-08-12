import * as cheerio from 'cheerio';
import { config } from '../../config/config';
import { Show } from '../../types';

export function extractShowsOldLayout($: cheerio.CheerioAPI): Show[] {
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
