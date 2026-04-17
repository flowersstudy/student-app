const { uiIcons } = require('../../../utils/ui-icons')
const { finishCountdownStudySession, startCountdownStudySession } = require('../../../utils/countdown-study-session')
const {
  createTimerPickerHours,
  createTimerPickerMinutes,
  minutesToPickerValue,
  pickerValueToMinutes,
} = require('../../../utils/timer-picker')

const RECOMMENDED_MINUTES_PER_QUESTION = 30
const TIMER_PICKER_HOURS = createTimerPickerHours()
const TIMER_PICKER_MINUTES = createTimerPickerMinutes()

function getRecommendedMinutes(questionCount = 0) {
  return Math.max(1, questionCount) * RECOMMENDED_MINUTES_PER_QUESTION
}

function normalizeMinutes(value, fallbackMinutes) {
  const minutes = parseInt(value, 10)
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return fallbackMinutes
  }

  return Math.min(minutes, 999)
}

Page({
  data: {
    uiIcons,
    drillQuestions: [
      {
        id: 1,
        title: '第一题：追寻长期价值',
        preFiles: [
          { id: 1, name: '第一题追寻长期价值讲义.pdf', url: '', opened: false },
        ],
        postFiles: [
          { id: 2, name: '第一题追寻长期价值解析.pdf', url: '', opened: false },
        ],
        videoId: '1e6eaa05af1b0990cb0f567c5998f78b_1',
        done: false,
      },
      {
        id: 2,
        title: '第二题：流动与新生',
        preFiles: [
          { id: 3, name: '第二题流动与新生讲义.pdf', url: '', opened: false },
        ],
        postFiles: [
          { id: 4, name: '第二题流动与新生解析.pdf', url: '', opened: false },
        ],
        videoId: '1e6eaa05af15b87585e99ad013114054_1',
        done: false,
      },
      {
        id: 3,
        title: '第三题：思维播种',
        preFiles: [
          { id: 5, name: '第三题思维播种讲义.pdf', url: '', opened: false },
        ],
        postFiles: [
          { id: 6, name: '第三题思维播种解析.pdf', url: '', opened: false },
        ],
        videoId: '1e6eaa05afab76694ff7011e202b8d26_1',
        done: false,
      },
    ],
    timerDisplay: '90:00',
    timerRunning: false,
    timeLow: false,
    timeUp: false,
    recommendedMinutes: 90,
    timerPickerHours: TIMER_PICKER_HOURS,
    timerPickerMinutes: TIMER_PICKER_MINUTES,
    timerPickerRange: [TIMER_PICKER_HOURS, TIMER_PICKER_MINUTES],
    timerPickerValue: minutesToPickerValue(90),
    notes: '',
    drillDoneCount: 0,
  },

  remainSeconds: 0,
  totalSeconds: 0,
  timerInterval: null,

  onLoad(options) {
    this.studyOptions = options || {}
    const set = parseInt(options.set)
    let drillQuestions = this.data.drillQuestions
    if (set) {
      const matchedQuestions = this.data.drillQuestions.filter((question) => question.id === set)
      if (matchedQuestions.length) {
        drillQuestions = matchedQuestions
      }
    }

    const recommendedMinutes = getRecommendedMinutes(drillQuestions.length)
    this.totalSeconds = recommendedMinutes * 60
    this.remainSeconds = this.totalSeconds
    this.setData({
      drillQuestions,
      recommendedMinutes,
      timerPickerValue: minutesToPickerValue(recommendedMinutes),
      timerDisplay: this._fmt(this.remainSeconds),
    })
  },

  onHide() {
    this._stop()
    finishCountdownStudySession(this, {
      remainingSeconds: this.remainSeconds,
    })
    if (this.data.timerRunning) {
      this.setData({ timerRunning: false })
    }
  },

  onUnload() {
    this._stop()
    finishCountdownStudySession(this, {
      remainingSeconds: this.remainSeconds,
    })
  },

  _fmt(sec) {
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    const p = (num) => String(num).padStart(2, '0')
    if (h > 0) return `${p(h)}:${p(m)}:${p(s)}`
    return `${p(m)}:${p(s)}`
  },

  _stop() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
      this.timerInterval = null
    }
  },

  openFile(e) {
    const { qid, filetype, fileid } = e.currentTarget.dataset
    const key = filetype === 'pre' ? 'preFiles' : 'postFiles'
    const question = this.data.drillQuestions.find((item) => item.id === qid)
    const file = question && question[key].find((item) => item.id === fileid)
    if (!file || !file.url) return

    const questions = this.data.drillQuestions.map((item) => {
      if (item.id !== qid) return item
      return { ...item, [key]: item[key].map((fileItem) => fileItem.id === fileid ? { ...fileItem, opened: true } : fileItem) }
    })
    this.setData({ drillQuestions: questions })
    wx.downloadFile({
      url: file.url,
      success: (res) => wx.openDocument({ filePath: res.tempFilePath, showMenu: true }),
    })
  },

  toggleTimer() {
    if (this.data.timeUp) return
    if (this.data.timerRunning) {
      this._stop()
      finishCountdownStudySession(this, {
        remainingSeconds: this.remainSeconds,
      })
      this.setData({ timerRunning: false })
    } else {
      startCountdownStudySession(this, {
        remainingSeconds: this.remainSeconds,
      }, {
        sessionType: 'practice',
        courseId: (page) => page.studyOptions && page.studyOptions.courseId,
        studyTaskId: (page) => (page.studyOptions && (page.studyOptions.studyTaskId || page.studyOptions.taskId || page.studyOptions.set)) || null,
        pointName: (page) => page.studyOptions && page.studyOptions.pointName,
      })
      this.timerInterval = setInterval(() => {
        this.remainSeconds--
        if (this.remainSeconds <= 0) {
          this.remainSeconds = 0
          this._stop()
          finishCountdownStudySession(this, {
            remainingSeconds: 0,
          }, {
            force: true,
          })
          this.setData({ timerDisplay: '00:00', timerRunning: false, timeLow: false, timeUp: true })
          wx.showModal({ title: '时间到！', content: '刷题时间已结束，请及时提交。', showCancel: false, confirmText: '知道了' })
          return
        }
        const timeLow = this.remainSeconds <= 300
        this.setData({ timerDisplay: this._fmt(this.remainSeconds), timeLow })
      }, 1000)
      this.setData({ timerRunning: true })
    }
  },

  resetTimer() {
    wx.showModal({
      title: '重置计时器',
      content: '确认将倒计时重置为初始时间吗？',
      success: (res) => {
        if (!res.confirm) return
        this._stop()
        finishCountdownStudySession(this, {
          remainingSeconds: this.remainSeconds,
        })
        this.remainSeconds = this.totalSeconds
        this.setData({ timerDisplay: this._fmt(this.totalSeconds), timerRunning: false, timeLow: false, timeUp: false })
      },
    })
  },

  onTimerPickerConfirm(e) {
    if (this.data.timerRunning) {
      this._stop()
      finishCountdownStudySession(this, {
        remainingSeconds: this.remainSeconds,
      })
      this.setData({ timerRunning: false })
    }

    const minutes = normalizeMinutes(
      pickerValueToMinutes(e.detail.value),
      this.data.recommendedMinutes
    )
    this.totalSeconds = minutes * 60
    this.remainSeconds = this.totalSeconds
    this.setData({
      timerDisplay: this._fmt(this.totalSeconds),
      timerRunning: false,
      timeLow: false,
      timeUp: false,
      timerPickerValue: minutesToPickerValue(minutes),
    })
  },

  uploadHomework() {
    wx.showToast({ title: '上传作业功能开发中', icon: 'none' })
  },

  watchAnalysis() {
    wx.showToast({ title: '解析视频加载中...', icon: 'loading' })
  },

  uploadAnswer() {
    wx.showToast({ title: '上传答案功能开发中', icon: 'none' })
  },

  askQuestion() {
    wx.switchTab({ url: '/pages/chat/chat' })
  },

  correctError() {
    wx.showToast({ title: '纠错功能开发中', icon: 'none' })
  },

  toggleDrillTask(e) {
    const id = e.currentTarget.dataset.id
    const questions = this.data.drillQuestions.map((question) =>
      question.id === id ? { ...question, done: !question.done } : question
    )
    const doneCount = questions.filter((question) => question.done).length
    this.setData({ drillQuestions: questions, drillDoneCount: doneCount })
  },

  onNotesInput(e) {
    this.setData({ notes: e.detail.value })
  },
})
