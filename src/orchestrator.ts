import { scrapeWebsite } from './services/scraper';
import { sendNotification, createNotificationMessage, getShowList } from './services/telegram';
import { ScrapingResult, Show } from './types';
import { showImages, formatShowMessage, notifyForMonth } from './notifications';
import { loadMonths, saveMonths, getCurrentMonthId } from './months';
import { checkSelectorsHealth } from './services/health';
import { config } from './config/config';

export async function handleScrapingResult(result: ScrapingResult): Promise<void> {
	if (result.error) {
		console.error('Error during scraping:', result.error);
		return;
	}

	let showsToNotify = result.shows;
	if (config.debugMode) {
		showsToNotify = showsToNotify.filter((show) => show.name === config.debugShowName);
	}

	// Filter by show list
	const showList = getShowList();
	showsToNotify = showsToNotify.filter((show) => showList.includes(show.name));

	if (showsToNotify.length === 0) {
		console.log('No matching shows found');
		await sendNotification({
			text: 'No matching shows found for this period.',
			chatId: config.telegramChatId,
			parseMode: 'HTML',
		});
		return;
	}

	for (const show of showsToNotify) {
		const message = formatShowMessage(show);
		const imageUrl = showImages[show.name];
		if (imageUrl) {
			await sendNotification({
				text: message,
				chatId: config.telegramChatId,
				parseMode: 'HTML',
				imageUrl,
			});
		} else {
			const msgObj = createNotificationMessage(message, config.telegramChatId, 'HTML');
			await sendNotification(msgObj);
		}
	}
}

async function handleDebugMode(
	scrapedMonths: { id: string; name: string }[],
	result: ScrapingResult
) {
	const currentMonthId = getCurrentMonthId();
	const currentMonth = scrapedMonths.find((m) => m.id === currentMonthId);
	if (currentMonth) {
		const showsForMonth = (result.shows || []).filter((show) =>
			(show.date || '').includes(currentMonth.name)
		);
		await notifyForMonth(currentMonth, showsForMonth);
		saveMonths([currentMonthId]);
	} else {
		saveMonths([]);
	}
}

async function handleProductionMode(
	scrapedMonths: { id: string; name: string }[],
	storedMonths: string[],
	result: ScrapingResult
) {
	const scrapedMonthIds = scrapedMonths.map((m) => m.id);
	const newMonths = scrapedMonths.filter((m) => !storedMonths.includes(m.id));
	for (const month of newMonths) {
		const showsForMonth = (result.shows || []).filter((show) =>
			(show.date || '').includes(month.name)
		);
		await notifyForMonth(month, showsForMonth);
	}
	saveMonths(scrapedMonthIds);
}

export async function checkWebsite(): Promise<void> {
	const result = await scrapeWebsite();
	const scrapedMonths = result.months || [];
	const storedMonths = loadMonths();

	if (config.debugMode) {
		await handleDebugMode(scrapedMonths, result);
	} else {
		await handleProductionMode(scrapedMonths, storedMonths, result);
	}

	await handleScrapingResult(result);
}

export { checkSelectorsHealth };
