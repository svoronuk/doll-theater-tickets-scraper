import dotenv from 'dotenv';
import { Config } from '../types';

dotenv.config();

export const config: Config = {
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
  targetUrl: process.env.TARGET_URL || '',
  searchPattern: process.env.SEARCH_PATTERN || '',
  scrapingInterval: parseInt(process.env.SCRAPING_INTERVAL || '60000', 10),
};

// Validate required environment variables
const requiredEnvVars = ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID', 'TARGET_URL', 'SEARCH_PATTERN'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
} 