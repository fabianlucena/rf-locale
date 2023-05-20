'use strict';

import {format} from './lib/utils.js';

export class Locale {
    constructor(options) {
        this.setOptions(options);
    }

    clone() {
        return new Locale(this);
    }

    setOptions(options) {
        for (const k in options)
            this[k] = options[k];

        return this;
    }

    getPluralFromIndex(n) {
        return (n < 2)? n: 2;
    }

    async getTextRaw(texts, domain, language) {
        if (!this.driver)
            return;

        return this.driver(this.language ?? language, texts, domain);
    }

    _f(text, ...params) {
        if (params && params.length)
            return [text, ...params];

        return text;
    }
    
    _nf(n, singular, plural, ...opt) {
        return [singular, plural, ...opt];
    }

    async _d(domains, text, ...opt) {
        text = (await this.getTextRaw(text, domains))[text] ?? text;

        return format(text, ...opt);
    }
    
    async _(text, ...opt) {
        return this._d(null, text, ...opt);
    }

    async _nd(domains, n, singular, plural, ...opt) {
        let text;
        const texts = (await this.getTextRaw([[null, singular, plural]], domains))[[null, singular, plural]];
        if (texts)
            text = texts[this.getPluralFromIndex(n)];
        else
            text = (n == 1)? singular: plural;

        return format(text, ...opt);
    }

    async _n(n, singular, plural, ...opt) {
        return this._nd(null, n, singular, plural, ...opt);
    }

    async _a(texts) {
        return Promise.all(texts.map(async v => {
            if (typeof v === 'function')
                v = await v();
    
            return v;
        }));
    }

    async _or(...list) {
        if (list.length < 2)
            return list[0];
        
        return list.slice(0, -1).join(', ') + ', or ' + list[list.length - 1];
    }

    async _and(...list) {
        if (list.length < 2)
            return list[0];
        
        return list.slice(0, -1).join(', ') + ', and ' + list[list.length - 1];
    }
}

export const loc = new Locale();

export async function getTranslatedParamsAsync(params, all, loc) {
    if (all) {
        return Promise.all(await params.map(async param => {
            if (param instanceof Array)
                return await loc._(...param);
            else
                return await loc._(param);
        }));
    } else {
        return Promise.all(await params.map(async param => {
            if (param instanceof Array)
                return await loc._(...param);
            else
                return param;
        }));
    }
}
