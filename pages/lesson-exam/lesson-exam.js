Page({
  data: {
    examInfo: {
      title: '科技是这个时代最大的公益',
      type: '大作文',
      timeLimit: '60分钟'
    },
    files: [
      { id: 1, name: '考试题目科技是这个时代最大的公益讲义.pdf', type: '题目讲义', url: '', opened: false },
      { id: 2, name: '考试题目科技是这个时代最大公益解析.pdf', type: '解析', url: '', opened: false }
    ],
    videoId: '1e6eaa05af8d3a8b562c73baf58c0ec3_1',

    // 计时器显示
    timerDisplay: '60:00',   // 初始显示剩余时间
    timerRunning: false,
    timeLow: false,          // 剩余 ≤5 分钟，变红
    timeUp: false,           // 已归零

    submitted: false,
    notes: '',
    showTimerEdit: false,
    editMinutes: '60'
  },

  // 实例变量（不放 data，避免不必要的 setData）
  remainSeconds: 0,
  totalSeconds: 0,
  timerInterval: null,

  onLoad() {
    const minutes = parseInt(this.data.examInfo.timeLimit) || 60
    this.totalSeconds = minutes * 60
    this.remainSeconds = this.totalSeconds
    this.setData({ timerDisplay: this.fmt(this.remainSeconds) })
  },

  onUnload() {
    this.stop()
  },

  // 格式化为 MM:SS（不足1小时）或 HH:MM:SS
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
      // 暂停
      this.stop()
      this.setData({ timerRunning: false })
    } else {
      // 开始 / 继续
      this.timerInterval = setInterval(() => {
        this.remainSeconds--

        if (this.remainSeconds <= 0) {
          this.remainSeconds = 0
          this.stop()
          this.setData({
            timerDisplay: '00:00',
            timerRunning: false,
            timeLow: false,
            timeUp: true
          })
          wx.showModal({
            title: '时间到！',
            content: '考试时间已结束，请立即提交答案。',
            showCancel: false,
            confirmText: '去提交'
          })
          return
        }

        const timeLow = this.remainSeconds <= 300  // 最后5分钟
        this.setData({
          timerDisplay: this.fmt(this.remainSeconds),
          timeLow
        })
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
        this.stop()
        this.remainSeconds = this.totalSeconds
        this.setData({
          timerDisplay: this.fmt(this.totalSeconds),
          timerRunning: false,
          timeLow: false,
          timeUp: false
        })
      }
    })
  },

  openTimerEdit() {
    if (this.data.timerRunning) {
      this.stop()
      this.setData({ timerRunning: false })
    }
    const currentMinutes = Math.ceil(this.totalSeconds / 60)
    this.setData({ showTimerEdit: true, editMinutes: String(currentMinutes) })
  },

  onEditMinutesInput(e) {
    this.setData({ editMinutes: e.detail.value })
  },

  confirmTimerEdit() {
    const minutes = Math.max(1, parseInt(this.data.editMinutes) || 60)
    this.totalSeconds = minutes * 60
    this.remainSeconds = this.totalSeconds
    this.setData({
      timerDisplay: this.fmt(this.totalSeconds),
      timerRunning: false,
      timeLow: false,
      timeUp: false,
      showTimerEdit: false,
      editMinutes: String(minutes)
    })
  },

  cancelTimerEdit() {
    this.setData({ showTimerEdit: false })
  },

  openFile(e) {
    const id = e.currentTarget.dataset.id
    const file = this.data.files.find(f => f.id === id)
    if (!file || !file.url) return
    const files = this.data.files.map(f => f.id === id ? { ...f, opened: true } : f)
    this.setData({ files })
    wx.downloadFile({
      url: file.url,
      success: (res) => wx.openDocument({ filePath: res.tempFilePath, showMenu: true })
    })
  },

  uploadAnswer() {
    const app = getApp()
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['pdf'],
      success: (res) => {
        const file = res.tempFiles[0]
        wx.showLoading({ title: '上传中…', mask: true })

        const profile   = app.globalData.userProfile
        const examInfo  = this.data.examInfo
        // 判断是否正常提交：时间未到则为正常
        const submittedNormal = !this.data.timeUp

        wx.uploadFile({
          url: `${app.globalData.serverBase}/api/submissions`,
          filePath: file.path,
          name: 'file',
          formData: {
            studentName:     profile.name,
            studentId:       profile.name,
            reviewType:      '卡点考试',
            checkpoint:      examInfo.title,
            deadline:        '今日 23:59',
            priority:        submittedNormal ? 'normal' : 'urgent',
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
  }
})
