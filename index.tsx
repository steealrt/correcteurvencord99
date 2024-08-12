/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import definePlugin from "@utils/types";
import { insertTextIntoChatInputBox } from "@utils/discord";

const API_URL = 'https://api.languagetool.org/v2/check';
const LANGUAGE = 'fr';

// Fonction pour vérifier l'orthographe
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

// Fonction pour corriger le texte
async function correctText() {
    const textArea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textArea) return;

    const text = textArea.value;
    const matches = await checkSpelling(text);

    if (matches.length > 0) {
        let correctedText = text;
        matches.forEach(match => {
            const replacement = match.replacements.length > 0 ? match.replacements[0].value : match.context.text.substring(match.context.offset, match.context.offset + match.context.length);
            correctedText = correctedText.replace(match.context.text.substring(match.context.offset, match.context.offset + match.context.length), replacement);
        });

        insertTextIntoChatInputBox(correctedText);
    }
}

// Exportation du plugin
export default definePlugin({
    name: "SpellChecker",
    description: "Corrects spelling in your messages using LanguageTool API before sending.",
    authors: ["YourName"],
    dependencies: [],
    onMessageSend: correctText, // Fonction appelée avant l'envoi du message
});
