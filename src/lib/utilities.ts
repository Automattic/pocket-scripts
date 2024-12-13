import { Cache } from "./cache";
import TurndownService from "turndown";

export async function autocache<T>(
	key: string,
	ttl: number,
	fn: () => Promise<T>,
): Promise<T> {
	const cache = new Cache();
	const cached = cache.get(key);
	if (cached) {
		return JSON.parse(cached);
	}

	const result = await fn();
	cache.set(key, JSON.stringify(result), ttl);
	return result;
}

export async function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

const turndownService = new TurndownService();

export function htmlToMarkdown(html: string) {
	return turndownService.turndown(html);
}
