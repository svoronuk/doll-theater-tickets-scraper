export interface Config {
	telegramBotToken: string;
	telegramChatId: string;
	targetUrl: string;
	scrapingInterval: number;
	debugMode: boolean;
	debugShowName: string;
}

export interface Show {
	name: string;
	date: string;
	link: string;
}

export interface ScrapingResult {
	shows: Show[];
	error?: string;
	months?: { id: string; name: string }[];
}

export interface NotificationMessage {
	text: string;
	chatId: string;
	parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
	imageUrl?: string;
}

export type ScrapeWebsite = () => Promise<ScrapingResult>;
export type SendNotification = (message: NotificationMessage) => Promise<void>;
