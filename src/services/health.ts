import axios from 'axios';
import * as cheerio from 'cheerio';
import { config } from '../config/config';
import { sendNotification } from './telegram';

export async function checkSelectorsHealth() {
	try {
		const response = await axios.get(config.targetUrl);
		const $ = cheerio.load(response.data);
		const monthsCount = $('.button-wrapper button[data-m]').length;
		const showsCount = $('.afisha_item').length;
		if (monthsCount === 0) {
			await sendNotification({
				text: '❗️Ошибка: CSS селектор для месяцев (.button-wrapper button[data-m]) не найден на странице.',
				chatId: config.telegramChatId,
				parseMode: 'HTML',
			});
		}
		if (showsCount === 0) {
			await sendNotification({
				text: '❗️Ошибка: CSS селектор для спектаклей (.afisha_item) не найден на странице.',
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
