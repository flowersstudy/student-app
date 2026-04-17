const { recordStudentStudySession } = require('./student-api')

const DEFAULT_MIN_DURATION_SEC = 15
const DEFAULT_PRESCRIBED_DURATION_MIN = 40

function getAppSafe() {
  try {
    return getApp()
  } catch (error) {
    return null
  }
}

function resolveValue(value, context, fallback = null) {
  if (typeof value === 'function') {
    try {
      const result = value(context)
      return result === undefined ? fallback : result
    } catch (error) {
      return fallback
    }
  }

  return value === undefined ? fallback : value
}

function normalizeId(value) {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) && numericValue > 0
    ? Math.round(numericValue)
    : null
}

function normalizeMinDuration(value) {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) && numericValue >= 0
    ? Math.round(numericValue)
    : DEFAULT_MIN_DURATION_SEC
}

function normalizeDurationMin(value, fallback = DEFAULT_PRESCRIBED_DURATION_MIN) {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) && numericValue > 0
    ? Math.round(numericValue)
    : fallback
}

function getStorageSafe(key) {
  if (!key || typeof wx === 'undefined' || !wx.getStorageSync) {
    return null
  }

  try {
    return wx.getStorageSync(key)
  } catch (error) {
    return null
  }
}

function setStorageSafe(key, value) {
  if (!key || typeof wx === 'undefined' || !wx.setStorageSync) {
    return
  }

  try {
    wx.setStorageSync(key, value)
  } catch (error) {}
}

function buildPrescribedSessionKey(payload = {}) {
  const taskPart = payload.studyTaskId ? `task-${payload.studyTaskId}` : `point-${payload.pointName || 'unknown'}`
  return [
    'study-prescribed-session',
    payload.sessionType || 'other',
    taskPart,
  ].join(':')
}

function createStudySessionTracker(initialOptions = {}) {
  let options = { ...initialOptions }

  return {
    active: false,
    startedAt: null,

    setOptions(nextOptions = {}) {
      options = { ...options, ...nextOptions }
    },

    start(context) {
      if (this.active) {
        return
      }

      this.active = true
      this.startedAt = new Date()
      this.lastContext = context
    },

    async finish(context, overrides = {}) {
      if (!this.active || !this.startedAt) {
        return null
      }

      const startedAt = this.startedAt
      const endedAt = new Date()
      const durationSec = Math.max(0, Math.round((endedAt.getTime() - startedAt.getTime()) / 1000))
      const currentContext = context || this.lastContext
      const mergedOptions = { ...options, ...overrides }
      const force = !!mergedOptions.force

      this.active = false
      this.startedAt = null

      if (!force && durationSec < normalizeMinDuration(mergedOptions.minDurationSec)) {
        return null
      }

      try {
        return await recordStudentStudySession({
          courseId: normalizeId(resolveValue(mergedOptions.courseId, currentContext)),
          studyTaskId: normalizeId(resolveValue(mergedOptions.studyTaskId, currentContext)),
          pointName: resolveValue(mergedOptions.pointName, currentContext, '') || '',
          sessionType: resolveValue(mergedOptions.sessionType, currentContext, 'other') || 'other',
          status: resolveValue(mergedOptions.status, currentContext, 'completed') || 'completed',
          startedAt: startedAt.toISOString(),
          endedAt: endedAt.toISOString(),
          durationSec,
        }, resolveValue(mergedOptions.appInstance, currentContext) || getAppSafe())
      } catch (error) {
        console.warn('record study session failed', error)
        return null
      }
    },
  }
}

function ensureTracker(page, options = {}) {
  if (!page) {
    return null
  }

  if (!page.__studySessionTracker) {
    page.__studySessionTracker = createStudySessionTracker(options)
  } else if (options && Object.keys(options).length) {
    page.__studySessionTracker.setOptions(options)
  }

  return page.__studySessionTracker
}

function startStudySession(page, options = {}) {
  const tracker = ensureTracker(page, options)
  if (!tracker) {
    return
  }

  tracker.start(page)
}

function finishStudySession(page, overrides = {}) {
  const tracker = ensureTracker(page)
  if (!tracker) {
    return Promise.resolve(null)
  }

  return tracker.finish(page, overrides)
}

async function recordPrescribedStudyDuration(context, options = {}) {
  const currentContext = context || {}
  const courseId = normalizeId(resolveValue(options.courseId, currentContext))
  const studyTaskId = normalizeId(resolveValue(options.studyTaskId, currentContext))
  const pointName = resolveValue(options.pointName, currentContext, '') || ''
  const sessionType = resolveValue(options.sessionType, currentContext, 'practice') || 'practice'
  const durationMin = normalizeDurationMin(resolveValue(options.durationMin, currentContext))
  const now = new Date()
  const payload = {
    courseId,
    studyTaskId,
    pointName,
    sessionType,
    status: 'completed',
    startedAt: now.toISOString(),
    endedAt: now.toISOString(),
    durationSec: durationMin * 60,
    durationMin,
    prescribed: true,
  }
  const storageKey = resolveValue(options.dedupeKey, currentContext, '') || buildPrescribedSessionKey(payload)

  if (!options.force && getStorageSafe(storageKey)) {
    return { skipped: true }
  }

  try {
    const result = await recordStudentStudySession(
      payload,
      resolveValue(options.appInstance, currentContext) || getAppSafe()
    )
    setStorageSafe(storageKey, {
      recordedAt: now.toISOString(),
      durationMin,
      sessionType,
      pointName,
      studyTaskId,
    })
    return result
  } catch (error) {
    console.warn('record prescribed study duration failed', error)
    return null
  }
}

module.exports = {
  createStudySessionTracker,
  finishStudySession,
  recordPrescribedStudyDuration,
  startStudySession,
}
