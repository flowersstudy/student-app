const { bindPathCountdown, formatCountdownParts } = require('../../utils/path-countdown')

const TRAINING_DURATION = 2 * 3600 + 15 * 60 + 36

const pageConfig = {
  data: {
    pointName: '当前卡点',
    stageIndex: '3 / 6',
    stageName: '实训',
    stageSubtitle: '按顺序完成限时训练、上传作业和课堂反馈。',
    sectionTitle: '实训路径',
    pathItems: [
      {
        title: '倒计时显示器',
        desc: '当前实训剩余时间',
        status: 'done',
        countdownParts: formatCountdownParts(TRAINING_DURATION),
      },
      { title: '题目', desc: '进入当前实训题目，先独立完成。', status: 'current', actionText: '去做题', actionLabel: '实训题目' },
      { title: '上传作业（待批改）', desc: '提交本次作业，提交后等待批改。', status: 'pending', actionText: '去上传', actionLabel: '上传作业' },
      { title: '题目 02（待批改）', desc: '第二道实训练习题，完成后等待批改。', status: 'pending', actionText: '查看', actionLabel: '实训题目' },
      { title: '题目 03（待批改）', desc: '第三道实训练习题，完成后等待批改。', status: 'pending', actionText: '查看', actionLabel: '实训题目' },
      { title: '课堂反馈', desc: '查看老师对本次实训的整体反馈。', status: 'pending', actionText: '查看', actionLabel: '课堂反馈' },
    ],
  },

  onLoad(options) {
    const pointName = options.pointName ? decodeURIComponent(options.pointName) : '当前卡点'
    this.setData({ pointName })
    wx.setNavigationBarTitle({
      title: '实训',
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
  durationSeconds: TRAINING_DURATION,
  runningDesc: '当前实训剩余时间',
  finishedDesc: '实训时间已结束',
})

Page(pageConfig)
