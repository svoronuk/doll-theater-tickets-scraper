import TelegramBot from 'node-telegram-bot-api';
import { config } from '../config/config';
import { NotificationMessage, SendNotification } from '../types';

// Pure function to create bot instance
const createBot = (token: string): TelegramBot => 
  new TelegramBot(token, { polling: false });

// Pure function to create notification message
export const createNotificationMessage = (text: string, chatId: string): NotificationMessage => ({
  text,
  chatId,
});

// Side effect function for sending messages
export const sendNotification: SendNotification = async (message: NotificationMessage): Promise<void> => {
  const bot = createBot(config.telegramBotToken);
  
  try {
    await bot.sendMessage(message.chatId, message.text);
    console.log('Notification sent successfully');
  } catch (error) {
    console.error('Failed to send notification:', error);
    throw error;
  }
}; 