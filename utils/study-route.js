function decodeOption(value, fallback = '') {
  if (value === undefined || value === null || `${value}` === '') {
    return fallback
  }

  try {
    return decodeURIComponent(`${value}`)
  } catch (error) {
    return `${value}`
  }
}

function normalizeStudyOptions(options = {}, fallback = {}) {
  const taskId = options.studyTaskId || options.taskId || fallback.studyTaskId || fallback.taskId || ''

  return {
    ...fallback,
    ...options,
    courseId: options.courseId || fallback.courseId || '',
    studyTaskId: taskId,
    taskId,
    pointName: decodeOption(options.pointName, fallback.pointName || ''),
    durationMin: options.durationMin
      || options.prescribedDurationMin
      || options.homeworkDurationMin
      || fallback.durationMin
      || fallback.prescribedDurationMin
      || fallback.homeworkDurationMin
      || '',
  }
}

function appendStudyQuery(baseUrl = '', options = {}, extra = {}) {
  const query = {
    ...options,
    ...extra,
  }
  const queryEntries = Object.keys(query)
    .filter((key) => query[key] !== undefined && query[key] !== null && `${query[key]}` !== '')
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`)

  if (!queryEntries.length) {
    return baseUrl
  }

  return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${queryEntries.join('&')}`
}

module.exports = {
  appendStudyQuery,
  normalizeStudyOptions,
}
