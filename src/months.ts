import fs from 'fs';
import path from 'path';

const MONTHS_PATH = path.resolve(__dirname, '../months.json');

export function loadMonths(): string[] {
	try {
		const data = fs.readFileSync(MONTHS_PATH, 'utf-8');
		return JSON.parse(data);
	} catch (e) {
		return [];
	}
}

export function saveMonths(months: string[]): void {
	fs.writeFileSync(MONTHS_PATH, JSON.stringify(months, null, 2), 'utf-8');
}

export function getCurrentMonthId(): string {
	const now = new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}
