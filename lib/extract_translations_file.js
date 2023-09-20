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

    let currentTranslations = (await loadJson(options.translationsFilename, {emptyIfNotExists: true}));
    if (!Array.isArray(currentTranslations)) {
        const newCurrentTranslations = [];
        for (const source in currentTranslations)
            newCurrentTranslations.push({source, ...currentTranslations[source]});

        currentTranslations = newCurrentTranslations;
    }

    const translations = [];

    for (const s in sources) {
        let data = sources[s];
        let source = data.source;

        data.ref ??= `${data.file} [${data.line},${data.column}]`;

        if (data.error) {
            console.error(`\x1b[91mERROR in snippet: ${data.snippet} in ${data.ref}: ${data.error}\x1b[0m`);
            continue;
        }

        if (typeof source === 'string') {
            source = [source];
        }

        if (Array.isArray(source)) {
            source = source.map(s => {
                if (!s) {
                    return s;
                }

                const removeCR = s[0] === '`';
                s = stripQuotes(s);

                if (s !== undefined && removeCR) {
                    s = s.replace(/\r/g, '');
                }

                return s;
            });
            if (source.some(s => s === undefined)) {
                console.error(`\x1b[93mWARINING in snippet: ${data.snippet} in ${data.ref}: Text is not a constant string, is not enquoted.\x1b[0m`);
                continue;
            }

            if (source.length === 1) {
                source = source[0];
            } else {
                data.isJson = true;
                source = JSON.stringify(source);
            }
        } else {
            console.error(`\x1b[93mWARINING in snippet: ${data.snippet} in ${data.ref}: text is not a constant string, is not enquoted.\x1b[0m`);
            continue;
        }
        
        const translationIndex = translations.findIndex(translation => 
            translation
            && translation.source == source
            && translation.isPlural == data.isPlural
            && translation.isJson == data.isJson
            && translation.domain == data.domain
            && translation.context == data.context
        );

        if (translationIndex >= 0) {
            let translation = translations[translationIndex];
            if (data.ref) {
                if (translation.ref)
                    translation.ref += '\n' + data.ref;
                else
                    translation.ref = data.ref;
            }

            if (options.detailedTranslation)
                translation = {
                    ...translation,
                    ...currentTranslation,
                    ...data,
                    ...translation,
                };
            else
                translation = {...translation};

            translations[translationIndex] = translation;
        } else {
            let currentTranslation = currentTranslations.find(translation => 
                    translation
                    && translation.source == source
                    && translation.isPlural == data.isPlural
                    && translation.isJson == data.isJson
                    && translation.domain == data.domain
                    && translation.context == data.context
                );

            if (!currentTranslation) {
                currentTranslation = currentTranslations.find(translation => 
                    translation
                    && translation.source == source
                    && translation.isPlural == data.isPlural
                    && translation.isJson == data.isJson
                    && translation.domain == data.domain
                );

                if (!currentTranslation) {
                    currentTranslation = currentTranslations.find(translation => 
                        translation
                        && translation.source == source
                        && translation.isPlural == data.isPlural
                        && translation.isJson == data.isJson
                        && translation.context == data.context
                    );

                    if (!currentTranslation)
                        currentTranslation = currentTranslations.find(translation =>
                            translation
                            && translation.source == source
                            && translation.isPlural == data.isPlural
                            && translation.isJson == data.isJson
                        );
                }

                currentTranslation = {...currentTranslation, isDraft: true, ref: undefined};
            }

            const isPlural = data.isPlural ?? undefined;
            let translation = {source, isPlural, language};
            if (data.domain) translation.domain = data.domain;
            if (data.context) translation.context = data.context;
            if (data.isJson) translation.isJson = data.isJson;
            if (currentTranslation.isDraft) translation.isDraft = currentTranslation.isDraft;
            translation.translation = currentTranslation.translation ?? null;
            if (data.ref) {
                if (translation.ref)
                    translation.ref += ', ' + data.ref;
                else
                    translation.ref = data.ref;
            }

            if (options.detailedTranslation)
                translation = {
                    ...translation,
                    ...currentTranslation,
                    ...data,
                    ...translation,
                };
            else
                translation = {...translation};
                
            translations.push(translation);
        }
    }

    if (!options.keepUnused) {
        for (const t in translations) {
            const used = translations[t].used;
            if (used !== undefined && !used)
                delete translations[t];
        }
    }

    translations.sort((a, b) => {
        if (a.source < b.source)
            return -1;

        if (a.source > b.source)
            return 1;

        if (a.domain < b.domain)
            return -1;

        if (a.domain > b.domain)
            return 1;

        if (a.context < b.context)
            return -1;

        if (a.context > b.context)
            return 1;

        return 0;
    });

    const json = JSON.stringify(translations, null, 4);
    fs.writeFileSync(options.translationsFilename, json);

    if (options.showTranslations)
        console.log(json);
}