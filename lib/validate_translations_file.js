'use strict';

import {simplePrompt} from './simple_prompt.js';
import {loadJson} from './load_json.js';
import fs from 'fs';

export async function validateTranslationsFile(options) {
    let translations = await loadJson(options.translationsFilename, {emptyIfNotExists: true});
    if (!translations)
        return;

    let terminatedByUser = false

    let showHeader = true;
    for (const translation of translations) {
        if (!translation.translation || translation.draft) {
            console.log('---------------------------------------------------------------------');
            console.log(`[Source]: ${translation.source}`);
            let data = [];
            if (translation.isJson)
                data.push('[Is JSON]: yes');
            if (translation.domain)
                data.push('[Domain]: ' + translation.domain);
            if (translation.context)
                data.push('[Context]: ' + translation.context);
            if (translation.ref)
                data.push('[Reference]: ' + translation.ref);
            console.log(data.join(', '));
            const trans = await simplePrompt('Write translation');
            if (!trans) {
                if (!showHeader) {
                    showHeader = false;
                    console.log('Please enter the following translations.');
                }

                const answer = await simplePrompt('Do you want to terminate? [y|n|<empty>] (empty put blank space for this translation)');
                if (answer) {
                    if (answer[0].toUpperCase() === 'Y') {
                        terminatedByUser = true;
                        break;
                    } else
                        continue;
                }
            }

            if (translation.isDraft)
                delete translation.isDraft ;

            translation.translation = trans;
        }
    }

    let saveToFile;
    if (terminatedByUser) {
        saveToFile = false;
        const answer = await simplePrompt('Do you want to save the current work to file? [Y|n]');
        saveToFile = !answer || answer[0].toUpperCase() === 'Y';
    } else
        saveToFile = true

    if (saveToFile) {
        const json = JSON.stringify(translations, null, 4);
        fs.writeFileSync(options.translationsFilename, json);
    }
}