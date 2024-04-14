export default {
  messages: {
    yesexpr: '^([yY][eE][sS]|[yY])',
    noexpr:  '^([nN][oO]|[nN])',
  },

  numeric: {
    decimal_point: '.',
    thousands_sep: ',',
    grouping:        3,
  },

  percent: {
    symbol:        '%',
    positive_sign: '',
    negative_sign: '-',
    frac_digits:     2,
    p_cs_precedes:   0,
    p_sep_by_space:  1,
    n_cs_precedes:   0,
    n_sep_by_space:  1,
    p_sign_posn:     1,
    n_sign_posn:     1,
  },

  time: {
    // 'For use in %a
    abday: [
      'Sun',
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
    ],
    
    // 'For use in %A
    day: [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ],
    
    // 'For use in %b
    abmon: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
    
    // 'For use in %B
    mon: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    
    // 'Equivalent of AM/PM (%p)
    am_pm: ['AM', 'PM'],
        
    // 'Appropriate date and time representation (%c) "%a %b %e %H:%M:%S %Y"
    d_t_fmt: '%a %d %b %Y %r %Z',
            
    // 'Appropriate date representation (%x) "%d/%m/%Y"
    d_fmt: '%m/%d/%Y',
    
    // 'Appropriate time representation (%X) "%H:%M:%S"
    t_fmt: '%r',
    
    // 'Appropriate 12-hour time representation (%r) "%I:%M:%S %p"
    t_fmt_ampm: '%I:%M:%S %p',
    
    date_fmt: '%F %Z',
  },

  monetary: {
    int_curr_symbol:      'USD ',
    currency_symbol:      '$',
    mon_decimal_point:    ',',
    mon_thousands_sep:    '.',
    mon_grouping:         3,
    positive_sign:        '',
    negative_sign:        '-',
    int_frac_digits:      2,
    frac_digits:          2,
    p_cs_precedes:        1,
    p_sep_by_space:       1,
    n_cs_precedes:        1,
    n_sep_by_space:       1,
    p_sign_posn:          1,
    n_sign_posn:          1,
    int_p_cs_precedes:    1,
    int_p_sep_by_space:   1,
    int_n_cs_precedes:    -1,
    int_n_sep_by_space:   -1,
    int_p_sign_posn:      -1,
    int_n_sign_posn:      -1,
  },
};