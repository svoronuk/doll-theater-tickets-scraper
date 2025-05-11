import { Show } from './types';
import { sendNotification, createNotificationMessage } from './services/telegram';
import { config } from './config/config';

export const showImages: Record<string, string> = {
	Щелкунчик: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Bolshoi_Theatre_2011.jpg',
	Гамлет: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Theatre_stage_curtain.jpg',
	'Ромео и Джульетта':
		'https://upload.wikimedia.org/wikipedia/commons/3/3a/Teatro_alla_Scala.jpg',
	// Add more mappings as needed
};

function splitDateTime(dateStr: string): { date: string; time?: string } {
	const match = dateStr.match(/(.+?)\s+(\d{1,2}:\d{2})/);
	if (match) return { date: match[1], time: match[2] };
	return { date: dateStr };
}

export function formatShowMessage(show: Show): string {
	const { date, time } = splitDateTime(show.date);
	let msg = `<b>${show.name}</b>\n`;
	msg += `🗓 ${date}\n`;
	if (time) msg += `⏰ ${time}\n`;
	msg += `<a href=\"${show.link}\">Перейти к спектаклю</a>`;
	return msg;
}

export function formatShowListMessage(shows: Show[]): string {
	if (!shows.length) return 'Нет спектаклей для этого месяца.';
	return shows.map((show, idx) => `${idx + 1}. <b>${show.name}</b> — ${show.date}`).join('\n');
}

export async function notifyForMonth(month: { id: string; name: string }, shows: Show[]) {
	await sendNotification({
		text: `🎉 Новыя спектаклі з'явіліся: ${month.name}`,
		chatId: config.telegramChatId,
		parseMode: 'HTML',
	});
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
