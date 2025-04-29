export interface Config {
  telegramBotToken: string;
  telegramChatId: string;
  targetUrl: string;
  searchPattern: string;
  scrapingInterval: number;
  debugMode: boolean;
}

export interface ScrapingResult {
  found: boolean;
  content?: string;
  error?: string;
}

export interface NotificationMessage {
  text: string;
  chatId: string;
}

export type ScrapeWebsite = () => Promise<ScrapingResult>;
export type SendNotification = (message: NotificationMessage) => Promise<void>;
export type FormatNotificationMessage = (result: ScrapingResult, url: string) => NotificationMessage;
