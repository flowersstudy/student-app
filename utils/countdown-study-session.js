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

function normalizeNumber(value, fallback = null) {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : fallback
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

function computeConsumedDurationSec(startedAt, startRemainingSec, endRemainingSec) {
  const startRemaining = normalizeNumber(startRemainingSec)
  const endRemaining = normalizeNumber(endRemainingSec)

  if (startRemaining !== null && endRemaining !== null) {
    return Math.max(0, Math.round(startRemaining - endRemaining))
  }

  if (!startedAt) {
    return 0
  }

  return Math.max(0, Math.round((Date.now() - startedAt.getTime()) / 1000))
}

function createCountdownStudyTracker(initialOptions = {}) {
  let options = { ...initialOptions }

  return {
    active: false,
    startedAt: null,
    startRemainingSec: null,

    setOptions(nextOptions = {}) {
      options = { ...options, ...nextOptions }
    },

    start(context, meta = {}) {
      if (this.active) {
        return
      }

      this.active = true
      this.startedAt = new Date()
      this.startRemainingSec = normalizeNumber(meta.remainingSeconds)
      this.lastContext = context
    },

    async stop(context, meta = {}, overrides = {}) {
      if (!this.active || !this.startedAt) {
        return null
      }

      const startedAt = this.startedAt
      const endedAt = new Date()
      const currentContext = context || this.lastContext
      const mergedOptions = { ...options, ...overrides }
      const force = !!mergedOptions.force
      const durationSec = computeConsumedDurationSec(
        startedAt,
        this.startRemainingSec,
        meta.remainingSeconds
      )

      this.active = false
      this.startedAt = null
      this.startRemainingSec = null

      if (!force && durationSec < normalizeMinDuration(mergedOptions.minDurationSec)) {
        return null
      }

      try {
        return await recordStudentStudySession({
          courseId: normalizeId(resolveValue(mergedOptions.courseId, currentContext)),
          studyTaskId: normalizeId(resolveValue(mergedOptions.studyTaskId, currentContext)),
          pointName: resolveValue(mergedOptions.pointName, currentContext, '') || '',
          sessionType: resolveValue(mergedOptions.sessionType, currentContext, 'practice') || 'practice',
          status: resolveValue(mergedOptions.status, currentContext, 'completed') || 'completed',
          startedAt: startedAt.toISOString(),
          endedAt: endedAt.toISOString(),
          durationSec,
        }, resolveValue(mergedOptions.appInstance, currentContext) || getAppSafe())
      } catch (error) {
        console.warn('record countdown study session failed', error)
        return null
      }
    },
  }
}

function ensureCountdownTracker(page, options = {}) {
  if (!page) {
    return null
  }

  if (!page.__countdownStudyTracker) {
    page.__countdownStudyTracker = createCountdownStudyTracker(options)
  } else if (options && Object.keys(options).length) {
    page.__countdownStudyTracker.setOptions(options)
  }

  return page.__countdownStudyTracker
}

function startCountdownStudySession(page, meta = {}, options = {}) {
  const tracker = ensureCountdownTracker(page, options)
  if (!tracker) {
    return
  }

  tracker.start(page, meta)
}

function finishCountdownStudySession(page, meta = {}, overrides = {}) {
  const tracker = ensureCountdownTracker(page)
  if (!tracker) {
    return Promise.resolve(null)
  }

  return tracker.stop(page, meta, overrides)
}

module.exports = {
  createCountdownStudyTracker,
  ensureCountdownTracker,
  finishCountdownStudySession,
  startCountdownStudySession,
}
