'use strict';

import {glob} from 'glob';
import {extractSourcesFromFile} from './extract.js';
import {getOptionsFromArgs} from './options.js';
import {extractTranslationsFile} from './extract_translations_file.js';
import {validateTranslationsFile} from './validate_translations_file.js';
import {showTranslationsFile} from './show_translations_file.js';

const options = getOptionsFromArgs(
    {},
    {
        switchOptions: [
            '--show-options',
            '--show-paths',
            '--show-files',
            '--show-sources',
            '--show-translations',
            '--show-translations-file',
            '--skip-extraction',
            '--keep-unused',
            '--update-translations-file',
            '--extract-translations-file',
            '--validate-translations-file',
            '--detailed-translation',
        ],
        valueOptions: [
            '--language',
            '--translations-filename',
            '--ignore'
        ],
        multipleOptions: [
            '--path'
        ],
        defaultOption: '--path'
    });

if (!options.paths?.length
    && !options.updateTranslationsFile
    && !options.showTranslationsFile
    && !options.validateTranslationsFile
)
    options.paths = ['./**/*.js'];

if (options.showOptions) {
    console.log(options);
}

options.patterns ??= {
    'gt': {sourceMap: {0:0}},
    '_': {sourceMap: {0:0}},
    '_f': {sourceMap: {0:0}},
    '_d': {domainIndex: 0, sourceMap: {0:1}},
    '_df': {domainIndex: 0, sourceMap: {0:1}},
    '_c': {contextIndex: 0, sourceMap: {0:1}},
    '_cf': {contextIndex: 0, sourceMap: {0:1}},
    '_dc': {domainIndex: 0, contextIndex: 1, sourceMap: {0:2}},
    '_dcf': {domainIndex: 0, contextIndex: 1, sourceMap: {0:2}},
    '_n': {nIndex: 0, sourceMap: {0: null, 1: 1, 2: 2}},
    '_nf': {nIndex: 0, sourceMap: {0: null, 1: 1, 2: 2}},
    '_nn': {nIndex: 0, sourceMap: {0: 1, 1: 2, 2: 3}},
    '_nnf': {nIndex: 0, sourceMap: {0: 1, 1: 2, 2: 3}},
    '_nd': {domainIndex: 0, nIndex: 1, sourceMap: {0: null, 1: 2, 2: 3}},
    '_ndf': {domainIndex: 0, nIndex: 1, sourceMap: {0: null, 1: 2, 2: 3}},
    '_nc': {contextIndex: 0, nIndex: 1, sourceMap: {0: null, 1: 2, 2: 3}},
    '_ncf': {contextIndex: 0, nIndex: 1, sourceMap: {0: null, 1: 2, 2: 3}},
    '_ndc': {domainIndex: 0, contextIndex: 1, nIndex: 2, sourceMap: {0: null, 1: 3, 2: 4}},
    '_ndcf': {domainIndex: 0, contextIndex: 1, nIndex: 2, sourceMap: {0: null, 1: 3, 2: 4}},
    '_nnd': {domainIndex: 0, nIndex: 1, sourceMap: {0: 2, 1: 3, 2: 4}},
    '_nndf': {domainIndex: 0, nIndex: 1, sourceMap: {0: 2, 1: 3, 2: 4}},
    '_nnc': {contextIndex: 0, nIndex: 1, sourceMap: {0: 2, 1: 3, 2: 4}},
    '_nncf': {contextIndex: 0, nIndex: 1, sourceMap: {0: 2, 1: 3, 2: 4}},
    '_nndc': {domainIndex: 0, contextIndex: 1, nIndex: 2, sourceMap: {0: 3, 1: 4, 2: 5}},
    '_nndcf': {domainIndex: 0, contextIndex: 1, nIndex: 2, sourceMap: {0: 3, 1: 4, 2: 5}},
};

for (let p in options.paths) {
    const path = options.paths[p];
    if (options.showPaths)
        console.log(path);

    const files = await glob(path, options);
    for (let f in files) {
        const file = files[f];
        if (options.showFiles)
            console.log(file);

        if (!options.skipExtraction)
            extractSourcesFromFile(file, options);
    }
}

if (options.showSources)
    console.log(options.sources);

if (options.extractTranslationsFile)
    await extractTranslationsFile(options);

if (options.updateTranslationsFile) {
    await extractTranslationsFile(options);
    await validateTranslationsFile(options);
}

if (options.showTranslationsFile)
    await showTranslationsFile(options);

if (options.validateTranslationsFile)
    await validateTranslationsFile(options);