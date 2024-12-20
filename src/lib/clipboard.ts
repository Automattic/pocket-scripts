import { marked } from "marked";
import { select } from "@clack/prompts";
import { $ } from "bun";
import { isMacOS } from "./utilities";

/**
 * Copy rich text to the clipboard
 */
async function copyViaTextUtil(text: string) {
	if ((await isMacOS()) === false) {
		throw new Error("copyRichText is only supported on macOS");
	}
	const tempFile = `/tmp/pr-report-${Date.now()}.html`;
	await $`printf '%s' "${text}" > ${tempFile}`;
	await $`textutil -convert rtf -format html ${tempFile} -stdout | pbcopy`;
	await $`rm ${tempFile}`;
}

/**
 * Copy plain text to the clipboard
 */
export async function copyText(text: string) {
	if ((await isMacOS()) === false) {
		throw new Error("copyText is only supported on macOS");
	}
	await $`printf '%s' "${text}" | pbcopy`;
}

interface CopyOptions {
	html: string;
	text: string;
}

/**
 * Copy rich text to the clipboard
 */
export async function copyAsRichText({ html, text }: CopyOptions) {
	if (await isMacOS()) {
		await copyViaTextUtil(html);
	} else {
		await copyText(text);
	}
}

/**
 * Ask the user to choose how they want to copy the report
 */
export async function askForCopyPreference(content: string): Promise<void> {
	const choice = await select({
		message: "Would you like to copy the report?",
		options: [
			{ label: "Copy as rich text (HTML)", value: "rich" },
			{ label: "Copy as markdown", value: "markdown" },
			{ label: "Don't copy", value: "none" },
		],
	});

	if (choice === "rich") {
		marked.setOptions({
			gfm: true,
			breaks: true,
		});
		const html = await marked.parse(content);
		await copyAsRichText({ html, text: content });
		console.log("Report copied as rich text!");
	} else if (choice === "markdown") {
		await copyText(content);
		console.log("Report copied as markdown!");
	}
}