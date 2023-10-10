'use strict';

export function tokens(text) {
    return text.split(/[ _-]/);
}

export function camelize(text) {
    const tokenList = tokens(text);
    return tokenList[0] + tokenList.slice(1).map(token => token.substring(0, 1).toUpperCase() + token.substring(1)).join('');
}

export function pascalize(text) {
    text = camelize(text);
    return text[0].toUpperCase() + text.substring(1);
}

export function isEnquoted(text, quotes) {
    if (!quotes) {
        quotes = ['"', '\'', '`'];
    }

    return (text && text.length > 1)
        && text[0] === text[text.length - 1]
        && quotes.includes(text[0]);
}

export function stripQuotes(text, quotes) {
    if (!isEnquoted(text, quotes)) {
        return;
    }

    return text.substring(1, text.length - 1);
}

export function tryStripQuotes(text, quotes) {
    if (!isEnquoted(text, quotes)) {
        return text;
    }

    return text.substring(1, text.length - 1);
}

export function format(text, ...params) {
    if (!text) {
        return text;
    }

    let i = 0;
    let end = params?.length ?? 0;
    while (text.match("%s") && i < end) {
        text = text.replace("%s", params[i]);
        i++;
    }

    return text
}

export function merge(dst, src) {
    dst ??= {};
    for (var p in src) {
        try {
            if (src[p].constructor == Object) {
                dst[p] = merge(dst[p], src[p]);
            } else {
                dst[p] = src[p];
            }
        } catch(e) {
            dst[p] = src[p];
        }
    }

    return dst;
}
