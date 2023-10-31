import {glob} from 'glob';
import {extractSourcesFromFile} from './extract.js';
import {getOptionsFromArgs} from './options.js';
import {extractTranslationsFile} from './extract_translations_file.js';
import {validateTranslationsFile} from './validate_translations_file.js';
import {showTranslationsFile} from './show_translations_file.js';
import {htmlEditTranslationsFile} from './html_edit_translations_file.js';

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
            '--html-edit-translations-file',
            '--detailed-translation',
        ],
        valueOptions: [
            '--language',
            '--translations-filename',
        ],
        multipleOptions: [
            '--path',
            '--ignore',
        ],
        defaultOption: '--path'
    });

if (options.ignores) {
    options.ignore = options.ignores;
}

if (!options.paths?.length
    && !options.updateTranslationsFile
    && !options.showTranslationsFile
    && !options.validateTranslationsFile
    && !options.htmlValidateTranslationsFile
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
    '_n': {nIndex: 0, sourceMap: {0: null, 1: 1, 2: 2}, isPlural: true},
    '_nf': {nIndex: 0, sourceMap: {0: null, 1: 1, 2: 2}, isPlural: true},
    '_nn': {nIndex: 0, sourceMap: {0: 1, 1: 2, 2: 3}, isPlural: true},
    '_nnf': {nIndex: 0, sourceMap: {0: 1, 1: 2, 2: 3}, isPlural: true},
    '_nd': {domainIndex: 0, nIndex: 1, sourceMap: {0: null, 1: 2, 2: 3}, isPlural: true},
    '_ndf': {domainIndex: 0, nIndex: 1, sourceMap: {0: null, 1: 2, 2: 3}, isPlural: true},
    '_nc': {contextIndex: 0, nIndex: 1, sourceMap: {0: null, 1: 2, 2: 3}, isPlural: true},
    '_ncf': {contextIndex: 0, nIndex: 1, sourceMap: {0: null, 1: 2, 2: 3}, isPlural: true},
    '_ndc': {domainIndex: 0, contextIndex: 1, nIndex: 2, sourceMap: {0: null, 1: 3, 2: 4}, isPlural: true},
    '_ndcf': {domainIndex: 0, contextIndex: 1, nIndex: 2, sourceMap: {0: null, 1: 3, 2: 4}, isPlural: true},
    '_nnd': {domainIndex: 0, nIndex: 1, sourceMap: {0: 2, 1: 3, 2: 4}, isPlural: true},
    '_nndf': {domainIndex: 0, nIndex: 1, sourceMap: {0: 2, 1: 3, 2: 4}, isPlural: true},
    '_nnc': {contextIndex: 0, nIndex: 1, sourceMap: {0: 2, 1: 3, 2: 4}, isPlural: true},
    '_nncf': {contextIndex: 0, nIndex: 1, sourceMap: {0: 2, 1: 3, 2: 4}, isPlural: true},
    '_nndc': {domainIndex: 0, contextIndex: 1, nIndex: 2, sourceMap: {0: 3, 1: 4, 2: 5}, isPlural: true},
    '_nndcf': {domainIndex: 0, contextIndex: 1, nIndex: 2, sourceMap: {0: 3, 1: 4, 2: 5}, isPlural: true},
};

for (const path of options.paths ?? []) {
    if (options.showPaths) {
        console.log(path);
    }

    const files = await glob(path, options);
    for (const file of files) {
        if (options.showFiles) {
            console.log(file);
        }

        if (!options.skipExtraction) {
            extractSourcesFromFile(file, options);
        }
    }
}

if (options.showSources) {
    console.log(options.sources);
}

if (options.extractTranslationsFile) {
    await extractTranslationsFile(options);
}

if (options.updateTranslationsFile) {
    await extractTranslationsFile(options);
    await htmlEditTranslationsFile(options);
}

if (options.showTranslationsFile) {
    await showTranslationsFile(options);
}

if (options.validateTranslationsFile) {
    await validateTranslationsFile(options);
}

if (options.htmlEditTranslationsFile) {
    await htmlEditTranslationsFile(options);
}