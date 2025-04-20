import cron from 'node-cron';
import { config } from './config/config';
import { scrapeWebsite } from './services/scraper';
import { sendNotification, createNotificationMessage } from './services/telegram';
import { ScrapingResult, FormatNotificationMessage } from './types';

// Pure function to format notification message
const formatNotificationMessage: FormatNotificationMessage = (result: ScrapingResult, url: string) => {
  const content = result.content?.substring(0, 500) || '';
  return createNotificationMessage(
    `🔔 Found matching content on ${url}!\n\nContent: ${content}...`,
    config.telegramChatId
  );
};

// Pure function to handle scraping result
const handleScrapingResult = async (result: ScrapingResult): Promise<void> => {
  if (result.error) {
    console.error('Error during scraping:', result.error);
    return;
  }

  if (result.found) {
    const message = formatNotificationMessage(result, config.targetUrl);
    await sendNotification(message);
  } else {
    console.log('No matching content found');
  }
};

// Main function to check website
const checkWebsite = async (): Promise<void> => {
  console.log('Checking website...');
  const result = await scrapeWebsite();
  await handleScrapingResult(result);
};

// Schedule the task to run every minute
cron.schedule('* * * * *', checkWebsite);

console.log('Spider started! Checking website every minute...'); 