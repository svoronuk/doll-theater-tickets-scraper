import * as cheerio from 'cheerio';
import { config } from '../config/config';
import { sendNotification } from './telegram';
import { fetchLikeBrowser } from '../utils/fetchLikeBrowser';
import { extractShowsOldLayout } from './parsers/oldLayoutParser';
import { extractShowsNewLayout } from './parsers/newLayoutParser';
import { extractShowsFallback } from './parsers/fallbackParser';

export async function checkSelectorsHealth() {
	try {
		// Use the same fetching method as the scraper to ensure consistent results
		const { data, error } = await fetchLikeBrowser({ url: config.targetUrl });
		if (error || !data) {
			await sendNotification({
				text: `❗️Ошибка при загрузке страницы: ${error || 'Нет данных'}`,
				chatId: config.telegramChatId,
				parseMode: 'HTML',
			});
			return;
		}

		const $ = cheerio.load(data);

		// Check months using the same selector as the scraper
		const monthsCount = $('[data-m]').length;

		// Check shows using the same parsers as the scraper
		const oldLayoutShows = extractShowsOldLayout($);
		const newLayoutShows = extractShowsNewLayout($);
		const fallbackShows = extractShowsFallback($);

		const totalShows = Math.max(
			oldLayoutShows.length,
			newLayoutShows.length,
			fallbackShows.length
		);

		// Report results
		if (monthsCount === 0) {
			await sendNotification({
				text: '❗️Ошибка: CSS селектор для месяцев ([data-m]) не найден на странице.',
				chatId: config.telegramChatId,
				parseMode: 'HTML',
			});
		}

		if (totalShows === 0) {
			await sendNotification({
				text: '❗️Ошибка: Ни один парсер спектаклей не нашел результатов на странице.',
				chatId: config.telegramChatId,
				parseMode: 'HTML',
			});
		} else if (monthsCount > 0 && totalShows > 0) {
			// Detailed success notification showing which parsers work
			const parserResults = [];
			if (oldLayoutShows.length > 0) parserResults.push(`старый (${oldLayoutShows.length})`);
			if (newLayoutShows.length > 0) parserResults.push(`новый (${newLayoutShows.length})`);
			if (fallbackShows.length > 0) parserResults.push(`fallback (${fallbackShows.length})`);

			await sendNotification({
				text: `✅ Селекторы работают: ${monthsCount} месяцев, ${totalShows} спектаклей`,
				chatId: config.telegramChatId,
				parseMode: 'HTML',
			});
		}
	} catch (error) {
		await sendNotification({
			text: `❗️Ошибка при проверке селекторов: ${
				error instanceof Error ? error.message : 'Неизвестная ошибка'
			}`,
			chatId: config.telegramChatId,
			parseMode: 'HTML',
		});
	}
}
