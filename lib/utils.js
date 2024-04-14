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

  text = text.replace(/%%/g, '%');
  for (const replacement of params) {
    text = text.replace('%s', replacement);
  }

  return text;
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

/**
 * Taken from https://stackoverflow.com/questions/18516942/fastest-general-purpose-levenshtein-javascript-implementation
 * @param {*} s 
 * @param {*} t 
 * @returns 
 */
export function levenshtein(s, t) {
  if (s === t) {
    return 0;
  }
  var n = s.length, m = t.length;
  if (n === 0 || m === 0) {
    return n + m;
  }
  var x = 0, y, a, b, c, d, g, h, k;
  var p = new Array(n);
  for (y = 0; y < n;) {
    p[y] = ++y;
  }

  for (; (x + 3) < m; x += 4) {
    var e1 = t.charCodeAt(x);
    var e2 = t.charCodeAt(x + 1);
    var e3 = t.charCodeAt(x + 2);
    var e4 = t.charCodeAt(x + 3);
    c = x;
    b = x + 1;
    d = x + 2;
    g = x + 3;
    h = x + 4;
    for (y = 0; y < n; y++) {
      k = s.charCodeAt(y);
      a = p[y];
      if (a < c || b < c) {
        c = (a > b ? b + 1 : a + 1);
      }
      else {
        if (e1 !== k) {
          c++;
        }
      }

      if (c < b || d < b) {
        b = (c > d ? d + 1 : c + 1);
      }
      else {
        if (e2 !== k) {
          b++;
        }
      }

      if (b < d || g < d) {
        d = (b > g ? g + 1 : b + 1);
      }
      else {
        if (e3 !== k) {
          d++;
        }
      }

      if (d < g || h < g) {
        g = (d > h ? h + 1 : d + 1);
      }
      else {
        if (e4 !== k) {
          g++;
        }
      }
      p[y] = h = g;
      g = d;
      d = b;
      b = c;
      c = a;
    }
  }

  for (; x < m;) {
    var e = t.charCodeAt(x);
    c = x;
    d = ++x;
    for (y = 0; y < n; y++) {
      a = p[y];
      if (a < c || d < c) {
        d = (a > d ? d + 1 : a + 1);
      }
      else {
        if (e !== s.charCodeAt(y)) {
          d = c + 1;
        }
        else {
          d = c;
        }
      }
      p[y] = d;
      c = a;
    }
    h = d;
  }

  return h;
}