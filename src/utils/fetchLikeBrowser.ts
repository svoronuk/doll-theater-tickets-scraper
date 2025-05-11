import axios from 'axios';
import http from 'http';
import https from 'https';

export interface FetchLikeBrowserParams {
	url: string;
	cookies?: string;
	referer?: string;
	origin?: string;
	headers?: Record<string, string>;
}

const defaultHeaders = {
	'User-Agent':
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
	Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
	'Accept-Language': 'en-US,en;q=0.9',
	'Accept-Encoding': 'gzip, deflate, br',
	Connection: 'keep-alive',
	'Upgrade-Insecure-Requests': '1',
};

export async function fetchLikeBrowser({
	url,
	cookies,
	referer,
	origin,
	headers = {},
}: FetchLikeBrowserParams) {
	if (!url) return { error: 'No URL provided' };

	const mergedHeaders = {
		...defaultHeaders,
		...(cookies ? { Cookie: cookies } : {}),
		...(referer ? { Referer: referer } : {}),
		...(origin ? { Origin: origin } : {}),
		...headers,
	};

	const agent = url.startsWith('https')
		? new https.Agent({ keepAlive: true })
		: new http.Agent({ keepAlive: true });

	try {
		const response = await axios.get(url, {
			headers: mergedHeaders,
			decompress: true,
			httpAgent: agent,
			httpsAgent: agent,
			responseType: 'arraybuffer', // for binary data (images)
			validateStatus: () => true,
		});
		return { data: response.data, status: response.status, headers: response.headers };
	} catch (error: any) {
		return { error: error.message || 'Unknown error' };
	}
}
