const DAY_MS = 24 * 60 * 60 * 1000

function buildAvatarText(name = '') {
  const safeName = String(name || '').trim()
  return safeName ? safeName.slice(0, 1) : '\u5b66'
}

function parseExamDate(rawValue = '') {
  const text = String(rawValue || '').trim()
  if (!text) return null

  let year = 0
  let month = 0
  let day = 1

  let matched = text.match(/^(\d{4})[-/](\d{1,2})(?:[-/](\d{1,2}))?$/)
  if (matched) {
    year = Number(matched[1])
    month = Number(matched[2])
    day = Number(matched[3] || 1)
  } else {
    matched = text.match(/(\d{4})\D+(\d{1,2})(?:\D+(\d{1,2}))?/)
    if (!matched) {
      return null
    }
    year = Number(matched[1])
    month = Number(matched[2])
    day = Number(matched[3] || 1)
  }

  if (!year || !month || month > 12 || day > 31) {
    return null
  }

  const examDate = new Date(year, month - 1, day)
  if (Number.isNaN(examDate.getTime())) {
    return null
  }

  examDate.setHours(0, 0, 0, 0)
  return examDate
}

function formatExamCountdown(rawValue = '') {
  const examDate = parseExamDate(rawValue)
  if (!examDate) return '\u5f85\u8bbe\u7f6e'

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const diffDays = Math.ceil((examDate.getTime() - today.getTime()) / DAY_MS)
  if (diffDays < 0) return '\u5df2\u7ed3\u675f'
  if (diffDays === 0) return '\u4eca\u5929'
  return `${diffDays}\u5929`
}

function formatRaiseTarget(scoreGap) {
  const numericGap = Number(scoreGap)
  if (!Number.isFinite(numericGap) || numericGap <= 0) {
    return '\u5f85\u8bc4\u4f30'
  }

  return `+${numericGap}\u5206`
}

module.exports = {
  buildAvatarText,
  formatExamCountdown,
  formatRaiseTarget,
  parseExamDate,
}
