const { bindPathCountdown, formatCountdownParts } = require('../../utils/path-countdown')

const DRILL_DURATION = 42 * 60 + 18

const pageConfig = {
  data: {
    pointName: '当前卡点',
    stageIndex: '5 / 6',
    stageName: '刷题',
    stageSubtitle: '按顺序完成限时刷题和课堂反馈。',
    sectionTitle: '刷题路径',
    pathItems: [
      {
        title: '倒计时显示器',
        desc: '当前刷题剩余时间',
        status: 'done',
        countdownParts: formatCountdownParts(DRILL_DURATION),
      },
      { title: '题目（待批改）', desc: '完成当前刷题任务，提交后等待批改。', status: 'current', actionText: '去刷题', actionLabel: '刷题题目' },
      { title: '课堂反馈', desc: '查看老师对当前刷题情况的反馈。', status: 'pending', actionText: '查看', actionLabel: '课堂反馈' },
    ],
  },

  onLoad(options) {
    const pointName = options.pointName ? decodeURIComponent(options.pointName) : '当前卡点'
    this.setData({ pointName })
    wx.setNavigationBarTitle({
      title: '刷题',
    })
    this.startPathCountdown(true)
  },

  onShow() {
    this.startPathCountdown()
  },

  onUnload() {
    this.clearPathCountdown()
  },

  onHide() {
    this.clearPathCountdown()
  },

  onActionTap(e) {
    const { label } = e.currentTarget.dataset

    wx.showToast({
      title: `${label || '内容'}待接入`,
      icon: 'none',
    })
  },
}

bindPathCountdown(pageConfig, {
  durationSeconds: DRILL_DURATION,
  runningDesc: '当前刷题剩余时间',
  finishedDesc: '刷题时间已结束',
})

Page(pageConfig)
