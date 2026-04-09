const { uiIcons } = require('../../utils/ui-icons')

Page({
  data: {
    uiIcons,
    drillQuestions: [
      {
        id: 1,
        title: '第一题：追寻长期价值',
        preFiles: [
          { id: 1, name: '第一题追寻长期价值讲义.pdf', url: '', opened: false }
        ],
        postFiles: [
          { id: 2, name: '第一题追寻长期价值解析.pdf', url: '', opened: false }
        ],
        videoId: '1e6eaa05af1b0990cb0f567c5998f78b_1',
        done: false
      },
      {
        id: 2,
        title: '第二题：流动与新生',
        preFiles: [
          { id: 3, name: '第二题流动与新生讲义.pdf', url: '', opened: false }
        ],
        postFiles: [
          { id: 4, name: '第二题流动与新生解析.pdf', url: '', opened: false }
        ],
        videoId: '1e6eaa05af15b87585e99ad013114054_1',
        done: false
      },
      {
        id: 3,
        title: '第三题：思维播种',
        preFiles: [
          { id: 5, name: '第三题思维播种讲义.pdf', url: '', opened: false }
        ],
        postFiles: [
          { id: 6, name: '第三题思维播种解析.pdf', url: '', opened: false }
        ],
        videoId: '1e6eaa05afab76694ff7011e202b8d26_1',
        done: false
      }
    ],
    timerDisplay: '90:00',
    timerRunning: false,
    timeLow: false,
    timeUp: false,
    showTimerEdit: false,
    editMinutes: '90',
    notes: '',
    drillDoneCount: 0
  },

  remainSeconds: 0,
  totalSeconds: 0,
  timerInterval: null,

  onLoad(options) {
    const set = parseInt(options.set)
    if (set) {
      const drillQuestions = this.data.drillQuestions.filter(q => q.id === set)
      this.setData({ drillQuestions })
    }
    // 默认 90 分钟（3 题各 30 分钟）
    this.totalSeconds = 90 * 60
    this.remainSeconds = this.totalSeconds
    this.setData({ timerDisplay: this._fmt(this.remainSeconds) })
  },

  onUnload() {
    this._stop()
  },

  _fmt(sec) {
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    const p = n => String(n).padStart(2, '0')
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
    const q = this.data.drillQuestions.find(q => q.id === qid)
    const file = q && q[key].find(f => f.id === fileid)
    if (!file || !file.url) return
    const questions = this.data.drillQuestions.map(q => {
      if (q.id !== qid) return q
      return { ...q, [key]: q[key].map(f => f.id === fileid ? { ...f, opened: true } : f) }
    })
    this.setData({ drillQuestions: questions })
    wx.downloadFile({
      url: file.url,
      success: (res) => wx.openDocument({ filePath: res.tempFilePath, showMenu: true })
    })
  },
  toggleTimer() {
    if (this.data.timeUp) return
    if (this.data.timerRunning) {
      this._stop()
      this.setData({ timerRunning: false })
    } else {
      this.timerInterval = setInterval(() => {
        this.remainSeconds--
        if (this.remainSeconds <= 0) {
          this.remainSeconds = 0
          this._stop()
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
      content: '确认将倒计时重置为初始时间？',
      success: (res) => {
        if (!res.confirm) return
        this._stop()
        this.remainSeconds = this.totalSeconds
        this.setData({ timerDisplay: this._fmt(this.totalSeconds), timerRunning: false, timeLow: false, timeUp: false })
      }
    })
  },

  openTimerEdit() {
    if (this.data.timerRunning) {
      this._stop()
      this.setData({ timerRunning: false })
    }
    this.setData({ showTimerEdit: true, editMinutes: String(Math.ceil(this.totalSeconds / 60)) })
  },

  onEditMinutesInput(e) {
    this.setData({ editMinutes: e.detail.value })
  },

  confirmTimerEdit() {
    const minutes = Math.max(1, parseInt(this.data.editMinutes) || 90)
    this.totalSeconds = minutes * 60
    this.remainSeconds = this.totalSeconds
    this.setData({
      timerDisplay: this._fmt(this.totalSeconds),
      timerRunning: false, timeLow: false, timeUp: false,
      showTimerEdit: false, editMinutes: String(minutes)
    })
  },

  cancelTimerEdit() {
    this.setData({ showTimerEdit: false })
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
    const questions = this.data.drillQuestions.map(q =>
      q.id === id ? { ...q, done: !q.done } : q
    )
    const doneCount = questions.filter(q => q.done).length
    this.setData({ drillQuestions: questions, drillDoneCount: doneCount })
  },
  onNotesInput(e) {
    this.setData({ notes: e.detail.value })
  }
})
