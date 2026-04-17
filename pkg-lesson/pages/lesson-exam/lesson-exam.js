const { uiIcons } = require('../../../utils/ui-icons')
const { completeLocalUpload, isOfflineMode } = require('../../../utils/offline')
const { ensureSilentLogin, getStudentAuthHeader } = require('../../../utils/auth')
const { finishCountdownStudySession, startCountdownStudySession } = require('../../../utils/countdown-study-session')
const {
  createTimerPickerHours,
  createTimerPickerMinutes,
  minutesToPickerValue,
  pickerValueToMinutes,
} = require('../../../utils/timer-picker')

const TIMER_PICKER_HOURS = createTimerPickerHours()
const TIMER_PICKER_MINUTES = createTimerPickerMinutes()

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
    examInfo: {
      title: '科技是这个时代最大的公益',
      type: '大作文',
      timeLimit: '60分钟',
    },
    files: [
      { id: 1, name: '考试题目-科技是这个时代最大的公益.pdf', type: '题目讲义', url: '', opened: false },
      { id: 2, name: '考试题目-科技是这个时代最大的公益解析.pdf', type: '解析', url: '', opened: false },
    ],
    videoId: '1e6eaa05af8d3a8b562c73baf58c0ec3_1',
    timerDisplay: '60:00',
    timerRunning: false,
    timeLow: false,
    timeUp: false,
    submitted: false,
    notes: '',
    recommendedMinutes: 60,
    timerPickerHours: TIMER_PICKER_HOURS,
    timerPickerMinutes: TIMER_PICKER_MINUTES,
    timerPickerRange: [TIMER_PICKER_HOURS, TIMER_PICKER_MINUTES],
    timerPickerValue: minutesToPickerValue(60),
  },

  remainSeconds: 0,
  totalSeconds: 0,
  timerInterval: null,

  onLoad(options) {
    this.studyOptions = options || {}
    const minutes = parseInt(this.data.examInfo.timeLimit) || 60
    this.totalSeconds = minutes * 60
    this.remainSeconds = this.totalSeconds
    this.setData({ timerDisplay: this.fmt(this.remainSeconds) })
  },

  onHide() {
    this.stop()
    finishCountdownStudySession(this, {
      remainingSeconds: this.remainSeconds,
    })
    if (this.data.timerRunning) {
      this.setData({ timerRunning: false })
    }
  },

  onUnload() {
    this.stop()
    finishCountdownStudySession(this, {
      remainingSeconds: this.remainSeconds,
    })
  },

  fmt(sec) {
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    const mm = String(m).padStart(2, '0')
    const ss = String(s).padStart(2, '0')
    if (h > 0) return `${String(h).padStart(2, '0')}:${mm}:${ss}`
    return `${mm}:${ss}`
  },

  stop() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
      this.timerInterval = null
    }
  },

  toggleTimer() {
    if (this.data.timeUp) return

    if (this.data.timerRunning) {
      this.stop()
      finishCountdownStudySession(this, {
        remainingSeconds: this.remainSeconds,
      })
      this.setData({ timerRunning: false })
    } else {
      startCountdownStudySession(this, {
        remainingSeconds: this.remainSeconds,
      }, {
        sessionType: 'exam',
        courseId: (page) => page.studyOptions && page.studyOptions.courseId,
        studyTaskId: (page) => (page.studyOptions && (page.studyOptions.studyTaskId || page.studyOptions.taskId)) || null,
        pointName: (page) => page.studyOptions && page.studyOptions.pointName,
      })
      this.timerInterval = setInterval(() => {
        this.remainSeconds--

        if (this.remainSeconds <= 0) {
          this.remainSeconds = 0
          this.stop()
          finishCountdownStudySession(this, {
            remainingSeconds: 0,
          }, {
            force: true,
          })
          this.setData({
            timerDisplay: '00:00',
            timerRunning: false,
            timeLow: false,
            timeUp: true,
          })
          wx.showModal({
            title: '时间到！',
            content: '考试时间已结束，请立即提交答案。',
            showCancel: false,
            confirmText: '去提交',
          })
          return
        }

        const timeLow = this.remainSeconds <= 300
        this.setData({
          timerDisplay: this.fmt(this.remainSeconds),
          timeLow,
        })
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
        this.stop()
        finishCountdownStudySession(this, {
          remainingSeconds: this.remainSeconds,
        })
        this.remainSeconds = this.totalSeconds
        this.setData({
          timerDisplay: this.fmt(this.totalSeconds),
          timerRunning: false,
          timeLow: false,
          timeUp: false,
        })
      },
    })
  },

  onTimerPickerConfirm(e) {
    if (this.data.timerRunning) {
      this.stop()
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
      timerDisplay: this.fmt(this.totalSeconds),
      timerRunning: false,
      timeLow: false,
      timeUp: false,
      timerPickerValue: minutesToPickerValue(minutes),
    })
  },

  openFile(e) {
    const id = e.currentTarget.dataset.id
    const file = this.data.files.find((item) => item.id === id)
    if (!file || !file.url) return
    const files = this.data.files.map((item) => item.id === id ? { ...item, opened: true } : item)
    this.setData({ files })
    wx.downloadFile({
      url: file.url,
      success: (res) => wx.openDocument({ filePath: res.tempFilePath, showMenu: true }),
    })
  },

  uploadAnswer() {
    const app = getApp()
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['pdf'],
      success: async (res) => {
        const file = res.tempFiles[0]
        wx.showLoading({ title: '上传中...', mask: true })

        const profile = app.globalData.userProfile
        const examInfo = this.data.examInfo
        const submittedNormal = !this.data.timeUp

        if (isOfflineMode()) {
          completeLocalUpload({
            fileName: file.name,
            studentName: profile.name,
            reviewType: 'checkpoint-exam',
            checkpoint: examInfo.title,
            submittedNormal,
            sourcePath: file.path,
          })
          wx.hideLoading()
          this.setData({ submitted: true })
          wx.showToast({ title: '答案已提交，等待老师批改', icon: 'success' })
          return
        }

        try {
          await ensureSilentLogin(app)
        } catch (error) {
          wx.hideLoading()
          wx.showToast({ title: '登录状态已失效，请稍后重试', icon: 'none' })
          return
        }

        wx.uploadFile({
          url: `${app.globalData.serverBase}/api/submissions`,
          filePath: file.path,
          name: 'file',
          header: getStudentAuthHeader(),
          formData: {
            studentName: profile.name,
            studentId: profile.name,
            reviewType: '阶段测试',
            checkpoint: examInfo.title,
            deadline: '今日 23:59',
            priority: submittedNormal ? 'normal' : 'urgent',
            submittedNormal: String(submittedNormal),
          },
          success: (uploadRes) => {
            wx.hideLoading()
            const result = JSON.parse(uploadRes.data)
            if (result.ok) {
              this.setData({ submitted: true })
              wx.showToast({ title: '答案已提交', icon: 'success' })
            } else {
              wx.showToast({ title: result.error || '上传失败', icon: 'none' })
            }
          },
          fail: () => {
            wx.hideLoading()
            wx.showToast({ title: '网络错误，请重试', icon: 'none' })
          },
        })
      },
    })
  },

  watchAnalysis() {
    wx.showToast({ title: '视频加载中...', icon: 'loading' })
  },

  askTeacher() {
    wx.switchTab({ url: '/pages/chat/chat' })
  },

  onNotesInput(e) {
    this.setData({ notes: e.detail.value })
  },
})
