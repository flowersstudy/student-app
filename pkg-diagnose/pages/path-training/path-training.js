const { bindPathCountdown, formatCountdownParts } = require('../../../utils/path-countdown')
const { finishCountdownStudySession, startCountdownStudySession } = require('../../../utils/countdown-study-session')
const {
  createTimerPickerHours,
  createTimerPickerMinutes,
  minutesToPickerValue,
  pickerValueToMinutes,
} = require('../../../utils/timer-picker')

const TRAINING_RECOMMENDED_MINUTES = 135
const TRAINING_DURATION = TRAINING_RECOMMENDED_MINUTES * 60
const TIMER_PICKER_HOURS = createTimerPickerHours()
const TIMER_PICKER_MINUTES = createTimerPickerMinutes()

function normalizeMinutes(value, fallbackMinutes = TRAINING_RECOMMENDED_MINUTES) {
  const minutes = parseInt(value, 10)
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return fallbackMinutes
  }

  return Math.min(minutes, 999)
}

const pageConfig = {
  data: {
    pointName: '当前卡点',
    stageIndex: '3 / 6',
    stageName: '实训',
    stageSubtitle: '按顺序完成限时训练、上传作业和课堂反馈。',
    sectionTitle: '实训路径',
    pathCountdownRunning: false,
    pathCountdownFinished: false,
    recommendedMinutes: TRAINING_RECOMMENDED_MINUTES,
    timerPickerHours: TIMER_PICKER_HOURS,
    timerPickerMinutes: TIMER_PICKER_MINUTES,
    timerPickerRange: [TIMER_PICKER_HOURS, TIMER_PICKER_MINUTES],
    timerPickerValue: minutesToPickerValue(TRAINING_RECOMMENDED_MINUTES),
    pathItems: [
      {
        title: '计时器',
        desc: '当前实训剩余时间',
        status: 'done',
        countdownParts: formatCountdownParts(TRAINING_DURATION),
        countdownEditable: true,
      },
      { title: '训练题目', desc: '进入当前实训练习，先独立完成。', status: 'current', actionText: '去做题', actionLabel: '实训题目' },
      { title: '上传作业（待批改）', desc: '提交本次作业，提交后等待老师批改。', status: 'pending', actionText: '去上传', actionLabel: '上传作业' },
      { title: '题目 02（待批改）', desc: '第二道实训练习题，完成后等待老师批改。', status: 'pending', actionText: '查看', actionLabel: '实训题目' },
      { title: '题目 03（待批改）', desc: '第三道实训练习题，完成后等待老师批改。', status: 'pending', actionText: '查看', actionLabel: '实训题目' },
      { title: '课堂反馈', desc: '查看老师对本次实训的整体反馈。', status: 'pending', actionText: '查看', actionLabel: '课堂反馈' },
    ],
  },

  onLoad(options) {
    const pointName = options.pointName ? decodeURIComponent(options.pointName) : '当前卡点'
    this.studyOptions = {
      ...(options || {}),
      pointName,
    }
    this.setData({ pointName })
    wx.setNavigationBarTitle({
      title: '实训',
    })
    this.resetPathCountdown()
  },

  onUnload() {
    finishCountdownStudySession(this, {
      remainingSeconds: this.getPathCountdownRemainingSeconds(),
    })
    this.clearPathCountdown()
  },

  onHide() {
    finishCountdownStudySession(this, {
      remainingSeconds: this.getPathCountdownRemainingSeconds(),
    })
    this.pausePathCountdown()
  },

  onActionTap(e) {
    const { label } = e.currentTarget.dataset

    wx.showToast({
      title: `${label || '内容'}待接入`,
      icon: 'none',
    })
  },

  onCountdownPickerConfirm(e) {
    finishCountdownStudySession(this, {
      remainingSeconds: this.getPathCountdownRemainingSeconds(),
    })
    this.pausePathCountdown()
    const minutes = normalizeMinutes(pickerValueToMinutes(e.detail.value))
    this.setPathCountdownDuration(minutes * 60, true)
    this.setData({
      timerPickerValue: minutesToPickerValue(minutes),
    })
  },

  togglePathCountdown() {
    if (this.data.pathCountdownFinished) return

    if (this.data.pathCountdownRunning) {
      finishCountdownStudySession(this, {
        remainingSeconds: this.getPathCountdownRemainingSeconds(),
      })
      this.pausePathCountdown()
      return
    }

    startCountdownStudySession(this, {
      remainingSeconds: this.getPathCountdownRemainingSeconds(),
    }, {
      sessionType: 'practice',
      courseId: (page) => page.studyOptions && page.studyOptions.courseId,
      studyTaskId: (page) => (page.studyOptions && (page.studyOptions.studyTaskId || page.studyOptions.taskId)) || null,
      pointName: (page) => page.studyOptions && page.studyOptions.pointName,
    })
    this.startPathCountdown()
  },

  resetCurrentCountdown() {
    finishCountdownStudySession(this, {
      remainingSeconds: this.getPathCountdownRemainingSeconds(),
    })
    this.resetPathCountdown()
  },
}

bindPathCountdown(pageConfig, {
  durationSeconds: TRAINING_DURATION,
  runningDesc: '当前实训剩余时间',
  finishedDesc: '实训时间已结束',
  onComplete(page) {
    finishCountdownStudySession(page, {
      remainingSeconds: 0,
    }, {
      force: true,
    })
  },
})

Page(pageConfig)
