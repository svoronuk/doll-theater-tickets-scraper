import { Show } from './types';
import { sendNotification, createNotificationMessage } from './services/telegram';
import { config } from './config/config';

export const showImages: Record<string, string> = {
	'Услуги мастер - класс': 'https://puppet-minsk.by/images/Afisha/master-klass.jpg',
	МРОIВА: 'https://puppet-minsk.by/images/Afisha/mroiva.jpg',
	Бабочки: 'https://puppet-minsk.by/images/Afisha/babochki.jpg',
	'В стране невыученных уроков': 'https://puppet-minsk.by/images/Afisha/uroki_afisha.jpg',
	'Ноч перад калядамi': 'https://puppet-minsk.by/images/Afisha/noch-perad-kalyadami.jpg',
	'Красная Шапочка': 'https://puppet-minsk.by/images/Afisha/krasnaya-shapochka.jpg',
	'Умная собачка Соня': 'https://puppet-minsk.by/images/Afisha/umnaya-sobachka-sonya.jpg',
	'Записки юного врача': 'https://puppet-minsk.by/images/Afisha/young_doctor_afisha.jpg',
	'Кот в сапогах': 'https://puppet-minsk.by/images/Afisha/kot_v_sapogah.jpg',
	'За снежной королевой': 'https://puppet-minsk.by/images/Afisha/za-snezhnoj-korolevoj.jpg',
	'Волк и семеро козлят': 'https://puppet-minsk.by/images/Afisha/volk_i_semero_kozlyat.jpg',
	'Пансион «Belvedere»': 'https://puppet-minsk.by/images/Afisha/belvedere_afisha_3.jpg',
	'На чёрной-чёрной улице':
		'https://puppet-minsk.by/images/Afisha/na-chjornoj-chjornoj-ulitse.jpg',
	'Проданный смех': 'https://puppet-minsk.by/images/Afisha/prodannyj-smekh.jpg',
	Киви: 'https://puppet-minsk.by/images/Afisha/kivi.jpg',
	Хутор: 'https://puppet-minsk.by/images/Afisha/khutor.jpg',
};

function splitDateTime(dateStr: string): { date: string; time?: string } {
	const match = dateStr.match(/(.+?)\s+(\d{1,2}:\d{2})/);
	if (match) return { date: match[1], time: match[2] };
	return { date: dateStr };
}

export function formatShowMessage(show: Show): string {
	const { date, time } = splitDateTime(show.date);
	let msg = `<b>${show.name}</b>\n${date}${time ? `\n${time}` : ''}`;
	msg += `\n<i>Евгений Корняг</i>`;
	msg += `\n<a href=\"${show.link}\">Перейти к спектаклю</a>`;
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
