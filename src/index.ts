import cron from 'node-cron';
import { initializeBot } from './services/telegram';
import { checkWebsite, checkSelectorsHealth } from './orchestrator';

// Initialize Telegram bot
initializeBot();

// Schedule the task to run every minute
cron.schedule('* * * * *', checkWebsite);

// Schedule the selector health check to run every hour
cron.schedule('0 * * * *', checkSelectorsHealth);

checkWebsite();
