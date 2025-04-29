import dotenv from 'dotenv';
import { Config } from '../types';

dotenv.config();

// Function to generate month patterns
const generateMonthPatterns = (debugMode: boolean = false): string => {
  const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const nextMonth = (currentMonth + 1) % 12;

  const currentMonthName = months[currentMonth];
  const nextMonthName = months[nextMonth];

  if (debugMode) {
    // In debug mode, look for current month
    return `//div[contains(@class, 'button-wrapper')]//button[contains(@class, 'btn-month') and contains(text(), '${currentMonthName}')]`;
  } else {
    // In production mode, look for next month
    return `//div[contains(@class, 'button-wrapper')]//button[contains(@class, 'btn-month') and contains(text(), '${nextMonthName}')]`;
  }
};

export const config: Config = {
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
  targetUrl: process.env.TARGET_URL || '',
  searchPattern: process.env.SEARCH_PATTERN || generateMonthPatterns(process.env.DEBUG_MODE === 'true'),
  scrapingInterval: parseInt(process.env.SCRAPING_INTERVAL || '60000', 10),
  debugMode: process.env.DEBUG_MODE === 'true',
};

// Validate required environment variables
const requiredEnvVars = ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID', 'TARGET_URL'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}