import dotenv from 'dotenv';
import { Config } from '../types';

dotenv.config();

export const config: Config = {
	telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
	telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
	targetUrl: process.env.TARGET_URL || '',
	scrapingInterval: parseInt(process.env.SCRAPING_INTERVAL || '60000', 10),
	debugMode: process.env.DEBUG_MODE === 'true',
	debugShowName: 'На чёрной-чёрной улице',
};

// Validate required environment variables
const requiredEnvVars = ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID', 'TARGET_URL'];
for (const envVar of requiredEnvVars) {
	if (!process.env[envVar]) {
		throw new Error(`Missing required environment variable: ${envVar}`);
	}
}
