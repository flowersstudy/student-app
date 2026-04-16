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

function bindPathCountdown(pageConfig, options = {}) {
  const {
    itemIndex = 0,
    durationSeconds = 0,
    runningDesc = '当前剩余时间',
    finishedDesc = '倒计时已结束',
  } = options

  pageConfig.updatePathCountdown = function updatePathCountdown() {
    const remainingSeconds = Math.max(
      0,
      Math.ceil((this._countdownTargetAt - Date.now()) / 1000)
    )
    const pathItems = this.data.pathItems.slice()
    const currentItem = pathItems[itemIndex]

    if (!currentItem) {
      return
    }

    pathItems[itemIndex] = {
      ...currentItem,
      desc: remainingSeconds > 0 ? runningDesc : finishedDesc,
      countdownParts: formatCountdownParts(remainingSeconds),
    }

    this.setData({ pathItems })

    if (remainingSeconds === 0) {
      this.clearPathCountdown()
    }
  }

  pageConfig.startPathCountdown = function startPathCountdown(reset = false) {
    this.clearPathCountdown()
    if (!this._countdownTargetAt || reset) {
      this._countdownTargetAt = Date.now() + Math.max(0, durationSeconds) * 1000
    }
    this.updatePathCountdown()
    this._countdownTimer = setInterval(() => {
      this.updatePathCountdown()
    }, 1000)
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
