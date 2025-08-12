import * as cheerio from 'cheerio';
import { config } from '../../config/config';
import { Show } from '../../types';
import { extractShowsFallback } from './fallbackParser';

export function extractShowsNewLayout($: cheerio.CheerioAPI): Show[] {
	const shows: Show[] = [];
	const seenNames = new Set<string>();
	const baseUrl = new URL(config.targetUrl).origin;

	// The new layout uses a table structure in .afisha_listcontainer
	// Let's extract shows from table rows
	$('.afisha_listcontainer tr').each((_, row) => {
		const $row = $(row);
		const cells = $row.find('td');

		if (cells.length >= 2) {
			const dateCell = $(cells[0]).text().trim();
			const nameCell = $(cells[1]);
			const name = nameCell.text().trim();
			const link = nameCell.find('a').attr('href');

			if (name && dateCell && dateCell.match(/\d{2}\.\d{2}\.\d{4}/)) {
				const normalizedName = name.toLowerCase();
				if (!seenNames.has(normalizedName)) {
					const absoluteLink = link && link.startsWith('/') ? baseUrl + link : link;
					shows.push({
						name,
						date: dateCell,
						link: absoluteLink || `${baseUrl}/shows/${encodeURIComponent(name)}`,
					});
					seenNames.add(normalizedName);
				}
			}
		}
	});

	// Use fallback parser if table parsing didn't find any shows
	if (shows.length === 0) {
		return extractShowsFallback($);
	}

	return shows;
}
