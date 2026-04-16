function formatCountdownParts(totalSeconds) {
  const safeSeconds = Math.max(0, totalSeconds)
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const seconds = safeSeconds % 60

  return [
    { value: String(hours).padStart(2, '0'), label: '时' },
    { value: String(minutes).padStart(2, '0'), label: '分' },
    { value: String(seconds).padStart(2, '0'), label: '秒' },
  ]
}

function resolveCountdownDuration(page, fallbackSeconds) {
  const customSeconds = Number(page && page._countdownDurationSeconds)
  if (Number.isFinite(customSeconds) && customSeconds >= 0) {
    return Math.round(customSeconds)
  }

  return Math.max(0, Math.round(Number(fallbackSeconds) || 0))
}

function bindPathCountdown(pageConfig, options = {}) {
  const {
    itemIndex = 0,
    durationSeconds = 0,
    runningDesc = '当前剩余时间',
    finishedDesc = '倒计时已结束',
    readyDesc = '',
    onComplete = null,
  } = options

  pageConfig.getPathCountdownRemainingSeconds = function getPathCountdownRemainingSeconds() {
    const targetAt = Number(this._countdownTargetAt || 0)
    if (targetAt > 0 && this._countdownRunning) {
      return Math.max(0, Math.ceil((targetAt - Date.now()) / 1000))
    }

    const pausedSeconds = Number(this._countdownRemainingSeconds)
    if (Number.isFinite(pausedSeconds) && pausedSeconds >= 0) {
      return Math.round(pausedSeconds)
    }

    return resolveCountdownDuration(this, durationSeconds)
  }

  pageConfig.updatePathCountdown = function updatePathCountdown() {
    const remainingSeconds = this.getPathCountdownRemainingSeconds()
    const pathItems = this.data.pathItems.slice()
    const currentItem = pathItems[itemIndex]
    const running = !!this._countdownRunning && remainingSeconds > 0

    if (!currentItem) {
      return
    }

    pathItems[itemIndex] = {
      ...currentItem,
      desc: remainingSeconds > 0 ? (running ? runningDesc : readyDesc) : finishedDesc,
      countdownParts: formatCountdownParts(remainingSeconds),
    }

    this.setData({
      pathItems,
      pathCountdownRunning: running,
      pathCountdownFinished: remainingSeconds === 0,
    })

    if (remainingSeconds === 0) {
      const wasRunning = !!this._countdownRunning
      this._countdownRemainingSeconds = 0
      this._countdownTargetAt = 0
      this._countdownRunning = false
      this.clearPathCountdown()
      if (wasRunning && typeof onComplete === 'function') {
        onComplete(this)
      }
    }
  }

  pageConfig.setPathCountdownDuration = function setPathCountdownDuration(nextDurationSeconds = 0, reset = true) {
    const safeDurationSeconds = Math.max(0, Math.round(Number(nextDurationSeconds) || 0))
    this._countdownDurationSeconds = safeDurationSeconds

    if (reset) {
      this._countdownRemainingSeconds = safeDurationSeconds
      this._countdownTargetAt = 0
      this._countdownRunning = false
      this.clearPathCountdown()
    }

    this.updatePathCountdown()
  }

  pageConfig.startPathCountdown = function startPathCountdown(reset = false) {
    this.clearPathCountdown()
    if (reset || !Number.isFinite(Number(this._countdownRemainingSeconds))) {
      this._countdownRemainingSeconds = resolveCountdownDuration(this, durationSeconds)
    }
    this._countdownTargetAt = Date.now() + this.getPathCountdownRemainingSeconds() * 1000
    this._countdownRunning = true
    this.updatePathCountdown()
    this._countdownTimer = setInterval(() => {
      this.updatePathCountdown()
    }, 1000)
  }

  pageConfig.pausePathCountdown = function pausePathCountdown() {
    this._countdownRemainingSeconds = this.getPathCountdownRemainingSeconds()
    this._countdownTargetAt = 0
    this._countdownRunning = false
    this.clearPathCountdown()
    this.updatePathCountdown()
  }

  pageConfig.resetPathCountdown = function resetPathCountdown() {
    this._countdownRemainingSeconds = resolveCountdownDuration(this, durationSeconds)
    this._countdownTargetAt = 0
    this._countdownRunning = false
    this.clearPathCountdown()
    this.updatePathCountdown()
  }

  pageConfig.clearPathCountdown = function clearPathCountdown() {
    if (this._countdownTimer) {
      clearInterval(this._countdownTimer)
      this._countdownTimer = null
    }
  }
}

module.exports = {
  bindPathCountdown,
  formatCountdownParts,
}
