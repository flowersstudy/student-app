const { recordStudentStudySession } = require('./student-api')

const DEFAULT_MIN_DURATION_SEC = 15

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

module.exports = {
  createStudySessionTracker,
  finishStudySession,
  startStudySession,
}
