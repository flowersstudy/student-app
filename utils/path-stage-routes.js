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
    diagnose: '/pkg-diagnose/pages/path-diagnose/path-diagnose',
    theory: '/pkg-diagnose/pages/path-theory/path-theory',
    training: '/pkg-diagnose/pages/path-training/path-training',
    exam: '/pkg-diagnose/pages/path-exam/path-exam',
    drill: '/pkg-diagnose/pages/path-drill/path-drill',
    report: '/pkg-diagnose/pages/path-report/path-report',
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
