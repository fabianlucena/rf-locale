import { format, merge } from './lib/utils.js';
import en from './locale/en.js';

export class Locale {
  static availableLanguages = {
    en: en,
  };

  language = null;
  driver = null;

  constructor(options) {
    this.init(options);
  }

  clone(options) {
    return new Locale({ ...this, ...options });
  }

  async init(options) {
    for (const k in options) {
      this[k] = options[k];
    }

    if (!this.language) {
      this.language = 'en';
    }

    if (!await this.initLocale(this.language)) {
      throw new Error('No language specified.');
    }
  }

  loadLanguageFromAcceptLanguage(acceptLanguage) {
    const languageDataList = this.getLanguageDataListFromAcceptLanguage(acceptLanguage);
    if (languageDataList?.length) {
      for (const languageData of languageDataList) {
        if (Locale.availableLanguages[languageData.language]) {
          this.language = languageData.language;
          return;
        }
      }
    }
  }

  async initLocale(copyLanguage) {
    if (!copyLanguage) {
      return false;
    }

    let copyLocale;
    if (this.getLanguageDefinition) {
      copyLocale = await this.getLanguageDefinition(copyLanguage);
    }

    if (!copyLocale) {
      if (!Locale.availableLanguages[this.language]) {
        throw new Error(`Language "${this.language}" is not available.`);
      }

      copyLocale = Locale.availableLanguages[copyLanguage];
    }

    await this.initLocale(copyLocale.copy);

    merge(this, copyLocale);

    return true;
  }

  getLanguageDataListFromAcceptLanguage(acceptLanguage) {
    return acceptLanguage?.split(',')
      .map(lang => {
        const data = lang.split(';');
        const newLang = { language: data[0] };
        if (data.length > 1) {
          const q = data[1];
          if (/q=[\d.]+/.test(q)) {
            newLang.q = Number(q.split('=')[1]);
          }
        } else {
          newLang.q = 1;
        }

        return newLang;
      })
      .sort((a, b) => b.q - a.q);
  }

  plural(n) {
    return (n < 2)? n: 2;
  }

  async getTextRaw(texts, options) {
    if (!this.driver || texts === undefined || texts === null) {
      return texts;
    }

    if (!Array.isArray(texts)) {
      texts = [texts];
    }

    return this.driver(options?.language ?? this.language, texts, options);
  }

  async _dc(domain, context, text, ...opt) {
    if (text === undefined || text === null) {
      return text;
    }

    text = (await this.getTextRaw(text, { domain, context }))[text] ?? text;

    const newOpt = [];
    for (let op of opt) {
      if (typeof op === 'function') {
        op = await op(loc, context, domain);
      }

      newOpt.push(op);
    }

    return format(text, ...newOpt);
  }

  _dcf(domain, context, text, ...params) {
    if (params && params.length) {
      return [text, ...params];
    }

    return text;
  }
  
  async _(text, ...opt) {
    return this._dc(null, null, text, ...opt);
  }

  _f(text, ...params) {
    if (params && params.length) {
      return [text, ...params];
    }

    return text;
  }
  
  async _d(domain, text, ...opt) {
    return this._dc(domain, null, text, ...opt);
  }

  _df(domain, text, ...params) {
    if (params && params.length) {
      return [text, ...params];
    }

    return text;
  }

  async _c(context, text, ...opt) {
    return this._dc(null, context, text, ...opt);
  }

  _cf(context, text, ...params) {
    if (params && params.length) {
      return [text, ...params];
    }

    return text;
  }

  async _nndc(domain, context, n, none, singular, plural, ...opt) {
    const original = [none, singular, plural];
    const translations = (await this.getTextRaw([original], { domain, context }))[original] ?? original;

    let text;
    if (translations) {
      text = translations[this.plural(n)];
    } else if (!n && none) {
      text = none;
    } else {
      text = (n == 1)? singular: plural;
    }

    return format(text, ...opt);
  }
  
  _nndcf(domain, context, n, none, singular, plural, ...opt) {
    return [none, singular, plural, ...opt];
  }

  async _nn(n, none, singular, plural, ...opt) {
    return this._nndc(null, null, n, none, singular, plural, ...opt);
  }
  
  _nnf(n, none, singular, plural, ...opt) {
    return [none, singular, plural, ...opt];
  }

  async _nnd(domain, n, none, singular, plural, ...opt) {
    return this._nndc(domain, null, n, none, singular, plural, ...opt);
  }
  
  _nndf(domain, n, none, singular, plural, ...opt) {
    return [none, singular, plural, ...opt];
  }

  async _nnc(context, n, none, singular, plural, ...opt) {
    return this._nndc(null, context, n, none, singular, plural, ...opt);
  }
  
  _nncf(context, n, none, singular, plural, ...opt) {
    return [none, singular, plural, ...opt];
  }

  async _ndc(domain, context, n, singular, plural, ...opt) {
    return this._nndc(domain, context, n, null, singular, plural, ...opt);
  }
  
  _ndcf(domain, context, n, singular, plural, ...opt) {
    return [singular, plural, ...opt];
  }

  async _n(n, singular, plural, ...opt) {
    return this._nndc(null, null, n, null, singular, plural, ...opt);
  }
  
  _nf(n, singular, plural, ...opt) {
    return [singular, plural, ...opt];
  }

  async _nd(domain, n, singular, plural, ...opt) {
    return this._nndc(domain, null, n, null, singular, plural, ...opt);
  }
  
  _ndf(domain, n, singular, plural, ...opt) {
    return [singular, plural, ...opt];
  }

  async _nc(context, n, singular, plural, ...opt) {
    return this._nndc(null, context, n, null, singular, plural, ...opt);
  }
  
  _ncf(context, n, singular, plural, ...opt) {
    return [singular, plural, ...opt];
  }

  async _a(texts) {
    return Promise.all(texts.map(async v => {
      if (typeof v === 'function') {
        v = await v();
      }
  
      return v;
    }));
  }

  async _or(...list) {
    if (list.length < 2) {
      return list[0];
    }
    
    return list.slice(0, -1).join(', ') + ', or ' + list[list.length - 1];
  }

  async _and(...list) {
    if (list.length < 2) {
      return list[0];
    }
    
    return list.slice(0, -1).join(', ') + ', and ' + list[list.length - 1];
  }

  /**
   * Returns the week number for this date. dowOffset is the day of week the week
   * "starts" on for your locale - it can be from 0 to 6. If dowOffset is 1 (Monday),
   * the week returned is the ISO 8601 week number.
   * @param int dowOffset
   * @return int
   */
  getWeek(time) {
    var onejan = new Date(time.getFullYear(), 0, 1);
    var today = new Date(time.getFullYear(), time.getMonth(), time.getDate());
    var dayOfYear = ((today - onejan + 86400000) / 86400000);
    return Math.ceil(dayOfYear / 7);
  }

  dayOfYear(time) {
    return Math.ceil((time - new Date(time.getFullYear(), 0, 0)) / 86400000);
  }

  iso8601WeekDay(time) {
    return time.getDay() || 7;
  }

  weekOfSundays(time) {
    return Math.floor((this.dayOfYear(time) + 7 - time.getDay()) / 7);
  }

  weekOfMondays(time) {
    return Math.floor((this.dayOfYear(time) + 7 - (time.getDay() - 1) % 7) / 7);
  }

  isLeapYear(year) {
    if (!(year % 400)) {
      return false;
    }

    return !(year % 100);
  }

  iso8601YearWeeks(year) {
    const firstDate = new Date(year, 0, 0);
    const firstDay = firstDate.getDay();
    const isLeapYear = this.isLeapYear(year);
    if (!isLeapYear) {
      if (firstDay === 4 /* Thursday */) {
        return 53;
      }
    } else if (isLeapYear) {
      if (firstDay === 3 /* Wednesday */) {
        return 53;
      }
    }

    const lastDate = new Date(year, 11, 31);
    const lastDay = lastDate.getDay();
    if (!isLeapYear) {
      if (lastDay.getDay() === 4 /* Thursday */) {
        return 53;
      }
    } else if (isLeapYear) {
      if (lastDay.getDay() === 5 /* Friday */) {
        return 53;
      }
    }
  }

  iso8601WeekNumber(time) {
    const woy = (10 + this.dayOfYear(time) - this.iso8601WeekDay(time)) / 7;
    if (woy < 1) {
      return this.iso8601YearWeeks(time.getFullYear() - 1);
    }
    
    if (woy > this.iso8601YearWeeks(time.getFullYear())) {
      return 1;
    }

    return woy;
  }

  iso8601WeekYear(time) {
    const woy = (10 + this.dayOfYear(time) - this.iso8601WeekDay(time)) / 7;
    if (woy < 1) {
      return time.getFullYear() - 1;
    }
    
    if (woy > this.iso8601YearWeeks(time.getFullYear())) {
      return time.getFullYear() + 1;
    }

    return time.getFullYear();
  }

  iso8601Offset(time) {
    const offset = time.getTimezoneOffset(); 
    
    if (offset <= 600) {
      const sign = offset >= 0? '+': '-';
      return sign + ((offset * 5 / 3) + (offset % 60));
    }

    return '';
  }

  iso8601TimeZone(time) {
    return time.toLocaleDateString(undefined, { day: 'numeric', timeZoneName: 'short' }).split(',')[1].trim() ?? '';
  }

  textToDate(text, options) {
    if (!text) {
      return text;
    }

    let result;
    const isoDateMatched = /(\d{4})-?(\d{2})-?(\d{2})/.exec(text);
    if (isoDateMatched) {
      const dateParams = [isoDateMatched[1], isoDateMatched[2] - 1, isoDateMatched[3]];

      const isoTimeMatched = /[ T]?(\d{2}):?(\d{2}):?(\d{2})/.exec(text);
      if (isoTimeMatched) {
        dateParams.push(isoTimeMatched[1], isoTimeMatched[2], isoTimeMatched[3]);
      }

      result = new Date(...dateParams);
    } else {
      result = new Date(text);
    }

    if (options?.offset) {
      result.setDate(result.getDate() + options.offset);
    }

    return result;
  }

  async strftime(format, time) {
    if (!time) {
      return time;
    }

    if (typeof time === 'string') {
      time = this.textToDate(time);
    }
    
    let index = 0;
    let position;
    let result = '';
    while ((position = format.indexOf('%', index)) >= 0) {
      result += format.substring(index, position);
      position++;
      switch (format[position]) {
      case 'a': result += this.time.abday[time.getDay()]; break; // Abbreviated weekday name * Thu
      case 'A': result += this.time.day[time.getDay()]; break; // Full weekday name *  Thursday
      case 'b': result += this.time.abmon[time.getMonth()]; break; // Abbreviated month name * Aug
      case 'B': result += this.time.mon[time.getMonth()]; break; // Full month name * August
      case 'c': result += await this.strftime(this.time.d_t_fmt, time); break; // Date and time representation * Thu Aug 23 14:55:02 2001
      case 'C': result += Math.floor(time.getFullYear() / 100).substring(0, 2); break; // Year divided by 100 and truncated to integer (00-99) 20
      case 'd': result += ('0' + time.getDate()).slice(-2); break; // Day of the month, zero-padded (01-31) 23
      case 'D': result += await this.strftime('%m/%d/%y', time); break; // Short MM/DD/YY date, equivalent to %m/%d/%y 08/23/01
      case 'e': result += (' ' + time.getDate()).slice(-2); break; // Day of the month, space-padded ( 1-31) 23
      case 'f': result += ('00' + time.getMilliseconds()).slice(-3); break; // Short YYYY-MM-DD date, equivalent to %Y-%m-%d 2001-08-23
      case 'F': result += await this.strftime('%Y-%m-%d', time); break; // Short YYYY-MM-DD date, equivalent to %Y-%m-%d 2001-08-23
      case 'g': result += ('0' + this.iso8601WeekYear(time)).slice(-2); break; // Week-based year, last two digits (00-99) 01
      case 'G': result += this.iso8601WeekYear(time); break; // Week-based year 2001
      case 'h': result += this.time.abmon[time.getMonth()]; break; // Abbreviated month name * (same as %b) Aug
      case 'H': result += ('0' + time.getHours()).slice(-2); break; // Hour in 24h format (00-23) 14
      case 'I': result += ('0' + (time.getHours() % 12) || 12).slice(-2); break; // Hour in 12h format (01-12) 02
      case 'j': result += ('00' + this.dayOfYear(time)).slice(-3); break; // Day of the year (001-366) 235
      case 'm': result += ('0' + (time.getMonth() + 1)).slice(-2); break; // Month as a decimal number (01-12) 08
      case 'M': result += ('0' + time.getMinutes()).slice(-2); break; // Minute (00-59) 55
      case 'n': result += '\n'; break; // New-line character ('\n') 
      case 'p': result += (time.getHours() < 12)? this.time.am_pm[0]: this.time.am_pm[1]; break; // AM or PM designation PM
      case 'r': result += await this.strftime(this.time.t_fmt_ampm, time); break; // 12-hour clock time * 02:55:02 pm
      case 'R': result += await this.strftime('%H:%M', time); break; // 24-hour HH:MM time, equivalent to %H:%M 14:55
      case 'S': result += ('0' + time.getSeconds()).slice(-2); break; // Second (00-61) 02
      case 't': result += '\t'; break; // Horizontal-tab character ('\t') 
      case 'T': result += await this.strftime('%H:%M:%S', time); break; // ISO 8601 time format (HH:MM:SS), equivalent to %H:%M:%S 14:55:02
      case 'u': result += this.iso8601WeekDay(time); break; // ISO 8601 weekday as number with Monday as 1 (1-7) 4
      case 'U': result += this.weekOfSundays(time); break; // Week number with the first Sunday as the first day of week one (00-53) 33
      case 'V': result += ('0' + this.iso8601WeekNumber(time)).slice(-2); break; // ISO 8601 week number (01-53) 34
      case 'w': result += time.getDay(); break; // Weekday as a decimal number with Sunday as 0 (0-6) 4
      case 'W': result += ('0' + this.weekOfMondays(time)).slice(-2); break; // Week number with the first Monday as the first day of week one (00-53) 34
      case 'x': result += await this.strftime(this.time.d_fmt, time); break; // Date representation * 08/23/01
      case 'X': result += await this.strftime(this.time.t_fmt, time); break; // Time representation * 14:55:02
      case 'y': result += ('0' + (time.getFullYear() % 100)).slice(-2);  break; // Year, last two digits (00-99) 01
      case 'Y': result += ('000' + time.getFullYear()).slice(-4); break; // Year 2001
      case 'z': result += this.iso8601Offset(time); break; // ISO 8601 offset from UTC in timezone (1 minute=1, 1 hour=100) If timezone cannot be determined, no characters +100
      case 'Z': result += this.iso8601TimeZone(time); break; // Timezone name or abbreviation * If timezone cannot be determined, no characters CDT
      case '%': result += '%'; break; // A % sign %
      default: result += '%' + format[position];
      }

      position++;
      index = position;
    }

    result += format.substring(index, format.length);

    return result;
  }

  number_format(number, optionsOrDecimals, options) {
    if (number === undefined || number === null) {
      return number;
    }

    const defaultOptions = {
      thousands_sep: ',',
      decimal_point: '.',
      ...this.numeric,
    };

    if (optionsOrDecimals === undefined) {
      options = { ...defaultOptions, ...options };
    } else if (typeof optionsOrDecimals !== 'object') {
      options = { ...defaultOptions, ...options, frac_digits: optionsOrDecimals };
    } else {
      options = { ...defaultOptions, ...options, ...optionsOrDecimals };
    }

    if (options.int) {
      options = {
        symbol:         defaultOptions.int_curr_symbol,
        frac_digits:    defaultOptions.int_frac_digits,
        p_cs_precedes:  defaultOptions.int_p_cs_precedes,
        p_sep_by_space: defaultOptions.int_p_sep_by_space,
        n_cs_precedes:  defaultOptions.int_n_cs_precedes,
        n_sep_by_space: defaultOptions.int_n_sep_by_space,
        p_sign_posn:    defaultOptions.int_p_sign_posn,
        n_sign_posn:    defaultOptions.int_n_sign_posn,
      };
    }

    if (!options.symbol) {
      if (options.int) {
        if (options.intSymbolName) {
          options.symbol = options[options.intSymbolName];
        }

        if (options.intDefaultSymbol) {
          options.symbol = options.intDefaultSymbol;
        }
      } else {
        if (options.symbolName) {
          options.symbol = options[options.symbolName];
        }

        if (options.defaultSymbol) {
          options.symbol = options.defaultSymbol;
        }
      }
    }

    let formatted;
    if (options.frac_digits === undefined) {
      formatted = Math.abs(number).toString();
    } else {
      formatted = Math.abs(number).toFixed(options.frac_digits);
    }

    const parts = formatted.split('.');
    if (options.grouping) {
      let integer = parts[0];
      let rgx = new RegExp(`(\\d+)(\\d{${options.grouping}})`);
    
      while (rgx.test(integer)) {
        integer = integer.replace(rgx, '$1' + options.thousands_sep + '$2');
      }
      parts[0] = integer;
    }

    formatted = parts.join(options.decimal_point);

    let sign;
    let sep;
    let precedes;
    let signPos;

    if (number >= 0) {
      sign = options.positive_sign;
      sep = options.p_sep_by_space? ' ': '';
      precedes = options.p_cs_precedes;
      signPos = options.p_sign_posn;
    } else {
      sign = options.negative_sign;
      sep = options.n_sep_by_space? ' ': '';
      precedes = options.n_cs_precedes;
      signPos = options.n_sign_posn;
    }

    if (precedes) {
      number = options.symbol + sep + number;
    } else {
      number = number + sep + options.symbol;
    }

    switch (signPos) {
    case 0:
      if (precedes) {
        formatted = options.symbol + sep + formatted;
      } else {
        formatted = formatted + sep + options.symbol;
      }

      formatted = `(${formatted})`;
      break;

    case 1:
      if (precedes) {
        formatted = options.symbol + sep + formatted;
      } else {
        formatted = formatted + sep + options.symbol;
      }

      formatted = sign + formatted;
      break;

    case 2:
      if (precedes) {
        formatted = options.symbol + sep + formatted;
      } else {
        formatted = formatted + sep + options.symbol;
      }

      formatted = formatted + sign;
      break;

    case 3:
      if (precedes) {
        formatted = sign + options.symbol + sep + formatted;
      } else {
        formatted = formatted + sep + sign + options.symbol;
      }
      break;

    case 4:
      if (precedes) {
        formatted = options.symbol + sign + sep + formatted;
      } else {
        formatted = formatted + sep + options.symbol + sign;
      }
      break;
    }

    return formatted;
  }

  number(number, optionsOrDecimals) {
    return this.number_format(number, optionsOrDecimals);
  }

  percent_format(number, optionsOrDecimals) {
    const defaultOptions = {
      defaultSymbol: '%',
      symbolName: 'percent_symbol',
      ...this.percent,
    };

    return this.number_format(number, optionsOrDecimals, defaultOptions);
  }

  percent(number, optionsOrDecimals) {
    return this.percent_format(number, optionsOrDecimals);
  }

  monetary_format(number, optionsOrDecimals, int) {
    if (number === undefined || number === null) {
      return number;
    }

    const defaultOptions = {
      defaultSymbol: '$',
      intDefaultSymbol: '$',
      symbolName: 'currency_symbol',
      intSymbolName: 'int_curr_symbol',
      ...this.monetary,
      decimal_point: this.monetary.mon_decimal_point,
      thousands_sep: this.monetary.mon_thousands_sep,
      mon_grouping: this.monetary.mon_grouping,
      int,
    };

    return this.number_format(number, optionsOrDecimals, defaultOptions);
  }

  money(number, optionsOrDecimals, int) {
    return this.percent_format(number, optionsOrDecimals, int);
  }
}

export const loc = new Locale();
loc.init();

export const defaultLoc = loc;
