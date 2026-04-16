const { bindPathCountdown, formatCountdownParts } = require('../../utils/path-countdown')

const EXAM_DURATION = 1 * 3600 + 8 * 60 + 42

const pageConfig = {
  data: {
    pointName: '当前卡点',
    stageIndex: '4 / 6',
    stageName: '测试',
    stageSubtitle: '按顺序完成限时测试、卡点报告和课堂反馈。',
    sectionTitle: '测试路径',
    pathItems: [
      {
        title: '倒计时显示器',
        desc: '当前测试剩余时间',
        status: 'done',
        countdownParts: formatCountdownParts(EXAM_DURATION),
      },
      { title: '题目（待批改）', desc: '进入阶段测试题目，提交后等待批改。', status: 'current', actionText: '去作答', actionLabel: '测试题目' },
      { title: '查看卡点报告', desc: '测试后查看当前卡点的阶段报告。', status: 'pending', actionText: '查看', actionLabel: '卡点报告' },
      { title: '课堂反馈', desc: '查看老师结合测试表现给出的反馈。', status: 'pending', actionText: '查看', actionLabel: '课堂反馈' },
    ],
  },

  onLoad(options) {
    const pointName = options.pointName ? decodeURIComponent(options.pointName) : '当前卡点'
    this.setData({ pointName })
    wx.setNavigationBarTitle({
      title: '测试',
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
  durationSeconds: EXAM_DURATION,
  runningDesc: '当前测试剩余时间',
  finishedDesc: '测试时间已结束',
})

Page(pageConfig)
