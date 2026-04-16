const { bindPathCountdown, formatCountdownParts } = require('../../../utils/path-countdown')
const { finishCountdownStudySession, startCountdownStudySession } = require('../../../utils/countdown-study-session')
const {
  createTimerPickerHours,
  createTimerPickerMinutes,
  minutesToPickerValue,
  pickerValueToMinutes,
} = require('../../../utils/timer-picker')

const EXAM_RECOMMENDED_MINUTES = 60
const EXAM_DURATION = EXAM_RECOMMENDED_MINUTES * 60
const TIMER_PICKER_HOURS = createTimerPickerHours()
const TIMER_PICKER_MINUTES = createTimerPickerMinutes()

function normalizeMinutes(value, fallbackMinutes = EXAM_RECOMMENDED_MINUTES) {
  const minutes = parseInt(value, 10)
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return fallbackMinutes
  }

  return Math.min(minutes, 999)
}

const pageConfig = {
  data: {
    pointName: '当前卡点',
    stageIndex: '4 / 6',
    stageName: '测试',
    stageSubtitle: '按顺序完成限时测试、卡点报告和课堂反馈。',
    sectionTitle: '测试路径',
    pathCountdownRunning: false,
    pathCountdownFinished: false,
    recommendedMinutes: EXAM_RECOMMENDED_MINUTES,
    timerPickerHours: TIMER_PICKER_HOURS,
    timerPickerMinutes: TIMER_PICKER_MINUTES,
    timerPickerRange: [TIMER_PICKER_HOURS, TIMER_PICKER_MINUTES],
    timerPickerValue: minutesToPickerValue(EXAM_RECOMMENDED_MINUTES),
    pathItems: [
      {
        title: '计时器',
        desc: '当前测试剩余时间',
        status: 'done',
        countdownParts: formatCountdownParts(EXAM_DURATION),
        countdownEditable: true,
      },
      { title: '测试题目（待批改）', desc: '进入阶段测试题目，提交后等待老师批改。', status: 'current', actionText: '去作答', actionLabel: '测试题目' },
      { title: '查看卡点报告', desc: '测试后查看当前卡点的阶段报告。', status: 'pending', actionText: '查看', actionLabel: '卡点报告' },
      { title: '课堂反馈', desc: '查看老师结合测试表现给出的反馈。', status: 'pending', actionText: '查看', actionLabel: '课堂反馈' },
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
      title: '测试',
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
      sessionType: 'exam',
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
  durationSeconds: EXAM_DURATION,
  runningDesc: '当前测试剩余时间',
  finishedDesc: '测试时间已结束',
  onComplete(page) {
    finishCountdownStudySession(page, {
      remainingSeconds: 0,
    }, {
      force: true,
    })
  },
})

Page(pageConfig)
