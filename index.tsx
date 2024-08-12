/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import definePlugin from "@utils/types";
import { findByPropsLazy } from "@webpack";
import { insertTextIntoChatInputBox } from "@utils/discord";

const API_URL = 'https://api.languagetool.org/v2/check';
const LANGUAGE = 'fr';

async function checkSpelling(text: string): Promise<any[]> {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                'text': text,
                'language': LANGUAGE,
            }),
        });

        const result = await response.json();
        return result.matches;
    } catch (error) {
        console.error('Error during spell check:', error);
        return [];
    }
}

async function correctText() {
    const text = document.querySelector('textarea')?.value || '';

    if (!text) return;

    const matches = await checkSpelling(text);
    if (matches.length > 0) {
        const correctedText = matches.reduce((acc, match) => {
            const suggestion = match.replacements.length > 0 ? match.replacements[0].value : match.context.text.substring(match.context.offset, match.context.offset + match.context.length);
            return acc.replace(match.context.text.substring(match.context.offset, match.context.offset + match.context.length), suggestion);
        }, text);

        insertTextIntoChatInputBox(correctedText);
    } else {
        console.log("No spelling errors found.");
    }
}

export default definePlugin({
    name: "SpellChecker",
    description: "Corrects spelling in your messages using LanguageTool API before sending.",
    authors: ["YourName"],
    dependencies: [],
    onMessageSend: correctText, // Hook into the message send event to check and correct text
});
