import TelegramBot from 'node-telegram-bot-api';
import { config } from '../config/config';
import { NotificationMessage, SendNotification } from '../types';
import fs from 'fs';
import path from 'path';
import { checkWebsite, checkSelectorsHealth } from '../orchestrator';

// Create bot instance with polling enabled
const bot = new TelegramBot(config.telegramBotToken, { polling: true });

const SHOW_LIST_PATH = path.resolve(__dirname, '../../showList.json');

function loadShowList(): string[] {
	try {
		const data = fs.readFileSync(SHOW_LIST_PATH, 'utf-8');
		return JSON.parse(data);
	} catch (e) {
		return [];
	}
}

function saveShowList(list: string[]): void {
	fs.writeFileSync(SHOW_LIST_PATH, JSON.stringify(list, null, 2), 'utf-8');
}

let showList = loadShowList();

export function getShowList(): string[] {
	return [...showList];
}

export function addShowToList(name: string): boolean {
	if (showList.includes(name)) return false;
	showList.push(name);
	saveShowList(showList);
	return true;
}

export function removeShowFromList(name: string): boolean {
	const idx = showList.indexOf(name);
	if (idx === -1) return false;
	showList.splice(idx, 1);
	saveShowList(showList);
	return true;
}

// Initialize bot commands
export const initializeBot = (): void => {
	// Command to start the bot
	bot.onText(/\/start/, (msg) => {
		const chatId = msg.chat.id;
		bot.sendMessage(
			chatId,
			'Добро пожаловать! Я буду уведомлять вас о доступности билетов. Используйте /help, чтобы увидеть доступные команды.'
		);
	});

	// Command to get help
	bot.onText(/\/help/, (msg) => {
		const chatId = msg.chat.id;
		bot.sendMessage(
			chatId,
			'Доступные команды:\n' +
				'/start - Запустить бота\n' +
				'/help - Показать это сообщение помощи\n' +
				'/status - Проверить статус мониторинга\n' +
				'/getid - Показать ID этого чата\n' +
				'/add <название спектакля> - Добавить спектакль в отслеживаемые\n' +
				'/remove <название спектакля> - Удалить спектакль из отслеживаемых\n' +
				'/list - Показать все отслеживаемые спектакли\n' +
				'/check - Однократная проверка спектаклей на сайте\n' +
				'/test - Однократная тестовая проверка сайта (для отладки)\n' +
				'/health - Однократная проверка работоспособности скрипта'
		);
	});

	// Command to check status
	bot.onText(/\/status/, (msg) => {
		const chatId = msg.chat.id;
		bot.sendMessage(
			chatId,
			'Мониторинг активен. Я уведомлю вас, когда билеты появятся в продаже.'
		);
	});

	// Handle any other messages
	bot.on('message', (msg) => {
		if (!msg.text?.startsWith('/')) {
			const chatId = msg.chat.id;
			bot.sendMessage(
				chatId,
				'Я отвечаю только на команды. Используйте /help, чтобы увидеть доступные команды.'
			);
		}
	});

	bot.onText(/\/getid/, (msg) => {
		const chatId = msg.chat.id;
		bot.sendMessage(chatId, `ID этого чата: ${chatId}`);
	});

	// Command to add a show
	bot.onText(/\/add (.+)/, (msg, match) => {
		const chatId = msg.chat.id;
		const showName = match && match[1] ? match[1].trim() : '';
		if (!showName) {
			bot.sendMessage(
				chatId,
				'Пожалуйста, укажите название спектакля. Пример: /add <название спектакля>'
			);
			return;
		}
		const added = addShowToList(showName);
		let response = '';
		if (added) response = `Спектакль "${showName}" добавлен в список.`;
		else response = `Спектакль "${showName}" уже есть в списке.`;
		const list = getShowList();
		if (list.length === 0) response += '\nСейчас ни один спектакль не отслеживается.';
		else
			response +=
				'\nОтслеживаемые спектакли:\n' +
				list.map((name, i) => `${i + 1}. ${name}`).join('\n');
		bot.sendMessage(chatId, response);
	});

	// Command to remove a show
	bot.onText(/\/remove (.+)/, (msg, match) => {
		const chatId = msg.chat.id;
		const showName = match && match[1] ? match[1].trim() : '';
		if (!showName) {
			bot.sendMessage(
				chatId,
				'Пожалуйста, укажите название спектакля. Пример: /remove <название спектакля>'
			);
			return;
		}
		const removed = removeShowFromList(showName);
		let response = '';
		if (removed) response = `Спектакль "${showName}" удалён из списка.`;
		else response = `Спектакль "${showName}" не найден в списке.`;
		const list = getShowList();
		if (list.length === 0) response += '\nСейчас ни один спектакль не отслеживается.';
		else
			response +=
				'\nОтслеживаемые спектакли:\n' +
				list.map((name, i) => `${i + 1}. ${name}`).join('\n');
		bot.sendMessage(chatId, response);
	});

	// Command to list all shows
	bot.onText(/\/list/, (msg) => {
		const chatId = msg.chat.id;
		const list = getShowList();
		if (list.length === 0) {
			bot.sendMessage(chatId, 'Сейчас ни один спектакль не отслеживается.');
			return;
		}
		bot.sendMessage(
			chatId,
			'Отслеживаемые спектакли:\n' + list.map((name, i) => `${i + 1}. ${name}`).join('\n')
		);
	});

	// Command to scrape site once in prod mode
	bot.onText(/\/check/, async (msg) => {
		const chatId = msg.chat.id;
		try {
			const prevDebug = config.debugMode;
			config.debugMode = false;
			await checkWebsite();
			config.debugMode = prevDebug;
			bot.sendMessage(chatId, '✅ Однократная проверка спектаклей на сайте выполнена.');
		} catch (e) {
			bot.sendMessage(
				chatId,
				`❗️Ошибка при однократной проверке сайта: ${e instanceof Error ? e.message : e}`
			);
		}
	});

	// Command to scrape site once in debug mode
	bot.onText(/\/test/, async (msg) => {
		const chatId = msg.chat.id;
		try {
			const prevDebug = config.debugMode;
			config.debugMode = true;
			await checkWebsite();
			config.debugMode = prevDebug;
			bot.sendMessage(chatId, '✅ Однократная тестовая проверка сайта выполнена.');
		} catch (e) {
			bot.sendMessage(
				chatId,
				`❗️Ошибка при однократной проверке сайта: ${e instanceof Error ? e.message : e}`
			);
		}
	});

	// Command to run health check once
	bot.onText(/\/health/, async (msg) => {
		const chatId = msg.chat.id;
		try {
			await checkSelectorsHealth();
			bot.sendMessage(chatId, '✅ Однократная проверка работоспособности скрипта.');
		} catch (e) {
			bot.sendMessage(
				chatId,
				`❗️Ошибка при однократной проверке CSS-селекторов: ${
					e instanceof Error ? e.message : e
				}`
			);
		}
	});

	console.log('Telegram bot initialized and listening for commands...');
};

// Pure function to create notification message
export const createNotificationMessage = (
	text: string,
	chatId: string,
	parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2'
): NotificationMessage => ({
	text,
	chatId,
	parseMode,
});

// Side effect function for sending messages
export const sendNotification: SendNotification = async (
	message: NotificationMessage
): Promise<void> => {
	try {
		if (message.imageUrl) {
			await bot.sendPhoto(message.chatId, message.imageUrl, {
				caption: message.text,
				parse_mode: message.parseMode,
			});
		} else {
			await bot.sendMessage(
				message.chatId,
				message.text,
				message.parseMode ? { parse_mode: message.parseMode } : undefined
			);
		}
	} catch (error) {
		console.error('Failed to send notification:', error);
		throw error;
	}
};
