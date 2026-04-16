function appendQuery(baseUrl = '', query = {}) {
  const queryEntries = Object.keys(query)
    .filter((key) => query[key] !== undefined && query[key] !== null && `${query[key]}` !== '')
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`)

  if (!queryEntries.length) {
    return baseUrl
  }

  return `${baseUrl}?${queryEntries.join('&')}`
}

function buildStageUrl(stepKey = '', pointId = 0, pointName = '') {
  const pageMap = {
    diagnose: '/pages/path-diagnose/path-diagnose',
    theory: '/pages/path-theory/path-theory',
    training: '/pages/path-training/path-training',
    exam: '/pages/path-exam/path-exam',
    drill: '/pages/path-drill/path-drill',
    report: '/pages/path-report/path-report',
  }

  const baseUrl = pageMap[stepKey] || ''
  if (!baseUrl) {
    return ''
  }

  return appendQuery(baseUrl, {
    pointId,
    pointName,
  })
}

module.exports = {
  buildStageUrl,
}
