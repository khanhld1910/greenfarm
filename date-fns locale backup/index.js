function buildDistanceInWordsLocale () {
  var distanceInWordsLocale = {
    lessThanXSeconds: {
      one: 'ít hơn một giây',
      other: 'ít hơn {{count}} giây'
    },

    xSeconds: {
      one: '1 giây',
      other: '{{count}} giây'
    },

    halfAMinute: 'nửa phút',

    lessThanXMinutes: {
      one: 'ít hơn một phút',
      other: 'ít hơn {{count}} phút'
    },

    xMinutes: {
      one: '1 phút',
      other: '{{count}} phút'
    },

    aboutXHours: {
      one: 'khoảng 1 giờ',
      other: 'khoảng {{count}} giờ'
    },

    xHours: {
      one: '1 giờ',
      other: '{{count}} giờ'
    },

    xDays: {
      one: '1 ngày',
      other: '{{count}} ngày'
    },

    aboutXMonths: {
      one: 'khoảng 1 tháng',
      other: 'khoảng {{count}} tháng'
    },

    xMonths: {
      one: '1 tháng',
      other: '{{count}} tháng'
    },

    aboutXYears: {
      one: 'khoảng 1 năm',
      other: 'khoảng {{count}} năm'
    },

    xYears: {
      one: '1 năm',
      other: '{{count}} năm'
    },

    overXYears: {
      one: 'hơn 1 năm',
      other: 'hơn {{count}} năm'
    },

    almostXYears: {
      one: 'gần 1 năm',
      other: 'gần {{count}} năm'
    }
  }

  function localize (token, count, options) {
    options = options || {}

    var result
    if (typeof distanceInWordsLocale[token] === 'string') {
      result = distanceInWordsLocale[token]
    } else if (count === 1) {
      result = distanceInWordsLocale[token].one
    } else {
      result = distanceInWordsLocale[token].other.replace('{{count}}', count)
    }

    if (options.addSuffix) {
      if (options.comparison > 0) {
        return 'trong ' + result
      } else {
        return result + ' trước'
      }
    }

    return result
  }

  return {
    localize: localize
  }
}

module.exports = buildDistanceInWordsLocale
