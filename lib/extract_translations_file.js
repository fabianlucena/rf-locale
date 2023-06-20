'use strict';

import {stripQuotes} from './utils.js';
import {loadJson} from './load_json.js';
import fs from 'fs';

export async function extractTranslationsFile(options) {
    const sources = options?.sources;
    if (!sources || !sources.length)
        return;

    const language = options?.language;
    if (!language) {
        console.error(`Language param is mandatory.`);
        process.exit();
    }

    let translations = await loadJson(options.translationsFilename, {emptyIfNotExists: true});
    
    if (!translations)
        translations = {};

    for (let t in translations)
        translations[t].used = false;

    for (let s in sources) {
        let data = sources[s];
        let source = data.source;

        data.ref ??= `${data.file} [${data.line},${data.column}]`;

        if (data.error) {
            console.error(`\x1b[91mERROR in snippet: ${data.snippet} in ${data.ref}: ${data.error}\x1b[0m`);
            continue;
        }

        if (typeof source === 'string') {
            source = stripQuotes(source);
            if (!source) {
                console.error(`\x1b[93mWARINING in snippet: ${data.snippet} in ${data.ref}: text is not a constant string, is not enquoted.\x1b[0m`);
                continue;
            }
        } else if (Array.isArray(source)) {
            source = source.map(s => stripQuotes(s));
            if (source.some(s => s === undefined)) {
                console.error(`\x1b[93mWARINING in snippet: ${data.snippet} in ${data.ref}: Text is not a constant string, is not enquoted.\x1b[0m`);
                continue;
            }

            if (source.length === 1)
                source = source[0];
            else {
                data.isJson = true;
                source = JSON.stringify(source);
            }
        }

        let existent = translations[source];
        if (typeof existent === 'string')
            existent = {translation: translations[source]};

        let domain = data.domain ?? existent?.domain;
        if (!domain)
            domain = undefined;

        let context = data.context ?? existent?.context;
        if (!context)
            context = undefined;

        if (options.detailedTranslation)
            translations[source] = {
                language: language,
                domain: domain,
                context: context,
                ...existent,
                ...data,
                ref: data.ref ?? existent?.ref,
                source
            };
        else
            translations[source] = {
                language: language,
                domain: domain,
                context: context,
                ref: data.ref ?? existent?.ref,
                translation: data.translation ?? existent?.translation ?? null,
                isJson: data.isJson,
            };
    }

    if (!options.keepUnused) {
        for (let t in translations) {
            const used = translations[t].used;
            if (used !== undefined && !used)
                delete translations[t];
        }
    }

    const json = JSON.stringify(translations, null, 4);
    fs.writeFileSync(options.translationsFilename, json);

    if (options.showTranslations)
        console.log(json);
}