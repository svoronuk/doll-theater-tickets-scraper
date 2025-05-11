import { scrapeWebsite } from './services/scraper';
import { sendNotification, createNotificationMessage, getShowList } from './services/telegram';
import { ScrapingResult, Show } from './types';
import {
	showImages,
	formatShowMessage,
	notifyForMonth,
	formatShowListMessage,
} from './notifications';
import { loadMonths, saveMonths, getCurrentMonthId } from './months';
import { checkSelectorsHealth } from './services/health';
import { config } from './config/config';
import { addMonths, format, parse, isAfter } from 'date-fns';

async function notifyIndividualShowMessages(month: { id: string; name: string }, shows: Show[]) {
	for (const show of shows) {
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

export async function checkWebsite(): Promise<void> {
	const result = await scrapeWebsite();
	const scrapedMonths = result.months || [];
	const storedMonths = loadMonths();
	const showList = getShowList();

	if (config.debugMode) {
		// Dev mode: simulate next month
		let latestMonthId = storedMonths.length > 0 ? storedMonths[storedMonths.length - 1] : null;
		if (!latestMonthId && scrapedMonths.length > 0)
			latestMonthId = scrapedMonths[scrapedMonths.length - 1].id;
		const { addMonths, format, parse } = await import('date-fns');
		const parseMonth = (monthId: string) => parse(monthId, 'yyyy-MM', new Date());
		const nextMonthDate = latestMonthId ? addMonths(parseMonth(latestMonthId), 1) : new Date();
		const nextMonthId = format(nextMonthDate, 'yyyy-MM');
		const nextMonthObj = scrapedMonths.find((m) => m.id === nextMonthId) || {
			id: nextMonthId,
			name: nextMonthId,
		};
		const allShows = (result.shows || []).filter((show) => showList.includes(show.name));
		//announce new month
		await sendNotification({
			text: `🎉 Новыя спектаклі з'явіліся: ${nextMonthObj.name}`,
			chatId: config.telegramChatId,
			parseMode: 'HTML',
		});
		//list all shows
		await sendNotification({
			text: formatShowListMessage(allShows),
			chatId: config.telegramChatId,
			parseMode: 'HTML',
		});
		//notify individual show messages
		await notifyIndividualShowMessages(nextMonthObj, allShows);
		return;
	}

	// Production mode
	if (storedMonths.length === 0) {
		const allMonthIds = scrapedMonths.map((m) => m.id);
		saveMonths(allMonthIds);
		return;
	}

	const newMonths = scrapedMonths
		.filter((m) => !storedMonths.includes(m.id))
		.sort((a, b) => a.id.localeCompare(b.id));

	let updatedMonths = [...storedMonths];

	for (const month of newMonths) {
		const allShows = (result.shows || []).filter((show) => showList.includes(show.name));
		const filteredShows = allShows.filter((show) => {
			const showMonthId = show.date ? show.date.slice(0, 7) : '';
			return showMonthId === month.id;
		});
		await sendNotification({
			text: `🎉 Новыя спектаклі з'явіліся: ${month.name}`,
			chatId: config.telegramChatId,
			parseMode: 'HTML',
		});
		await sendNotification({
			text: formatShowListMessage(allShows),
			chatId: config.telegramChatId,
			parseMode: 'HTML',
		});
		await notifyIndividualShowMessages(month, filteredShows);
		updatedMonths.push(month.id);
	}

	if (newMonths.length > 0) {
		saveMonths(updatedMonths);
	}
}

export { checkSelectorsHealth };
