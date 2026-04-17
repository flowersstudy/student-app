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
    theory: '/pkg-lesson/pages/path-theory/path-theory',
    training: '/pkg-training/pages/path-training/path-training',
    exam: '/pkg-exam/pages/path-exam/path-exam',
    report: '/pkg-report/pages/path-report/path-report',
    drill: '/pkg-practice/pages/path-drill/path-drill',
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
