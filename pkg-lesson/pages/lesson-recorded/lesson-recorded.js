const { uiIcons } = require('../../../utils/ui-icons')
const { finishStudySession, startStudySession } = require('../../../utils/study-session')

Page({
  data: {
    uiIcons,
    preFiles: [
      { id: 1, name: '理论课论证思路不合理讲义.pdf', url: '', opened: false }
    ],
    videoId: '1e6eaa05af2e0e1fba3b74c3bc3b0caa_1',
    videoTitle: '论证思路不合理',
    postFiles: [
      { id: 2, name: '理论课论证思路不合理课后作业讲义.pdf', url: '', opened: false },
      { id: 3, name: '理论课论证思路不合理课后作业解析.pdf', url: '', opened: false }
    ],
    postVideoId: '1e6eaa05af6585eba6fe22be45882fc4_1',
    postVideoTitle: '课后作业讲解视频',
    feedback: '',
    recordedTasks: [
      { id: 1, title: '阅读课前讲义', desc: '理论课论证思路不合理讲义', done: false },
      { id: 2, title: '观看理论课录播视频', desc: '论证思路不合理', done: false },
      { id: 3, title: '完成课后作业', desc: '参考课后作业讲义独立完成', done: false },
      { id: 4, title: '观看课后作业讲解视频', desc: '对照解析检查自己的作答', done: false },
      { id: 5, title: '上传作业等待老师点评', desc: '老师将在 24 小时内批改', done: false }
    ],
    recordedDoneCount: 0
  },
  onLoad(options) {
    this.studyOptions = options || {}
  },
  onShow() {
    startStudySession(this, {
      sessionType: 'video',
      courseId: (page) => page.studyOptions && page.studyOptions.courseId,
      studyTaskId: (page) => (page.studyOptions && (page.studyOptions.studyTaskId || page.studyOptions.taskId)) || null,
    })
  },
  onHide() {
    finishStudySession(this)
  },
  onUnload() {
    finishStudySession(this)
  },
  openFile(e) {
    const { list, id } = e.currentTarget.dataset
    const file = this.data[list].find(f => f.id === id)
    if (!file || !file.url) return
    const files = this.data[list].map(f => f.id === id ? { ...f, opened: true } : f)
    this.setData({ [list]: files })
    wx.downloadFile({
      url: file.url,
      success: (res) => wx.openDocument({ filePath: res.tempFilePath, showMenu: true })
    })
  },
  enterVideo() {
    wx.showToast({ title: '视频加载中...', icon: 'loading' })
  },
  enterPostVideo() {
    wx.showToast({ title: '视频加载中...', icon: 'loading' })
  },
  askTeacher() {
    wx.switchTab({ url: '/pages/chat/chat' })
  },
  toggleRecordedTask(e) {
    const id = e.currentTarget.dataset.id
    const tasks = this.data.recordedTasks.map(t =>
      t.id === id ? { ...t, done: !t.done } : t
    )
    const doneCount = tasks.filter(t => t.done).length
    this.setData({ recordedTasks: tasks, recordedDoneCount: doneCount })
  },
  onFeedbackInput(e) {
    this.setData({ feedback: e.detail.value })
  }
})
