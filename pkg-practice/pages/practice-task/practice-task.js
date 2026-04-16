const { uiIcons } = require('../../../utils/ui-icons')
const { finishStudySession, startStudySession } = require('../../../utils/study-session')

Page({
  data: {
    uiIcons,
    taskInfo: {
      title: '第 2 周 · 对策推导困难刷题任务',
      dueText: '今日 23:59 前完成',
      pointName: '对策推导困难',
      setName: '专题 01 · 针对性对策',
      teacher: '李老师',
      pdfName: '对策推导困难-本周刷题任务.pdf',
      uploadTime: '今天 09:20',
      pages: '12 页',
    },
    taskTags: ['题目 PDF', '限时 40 分钟', '先做再看解析'],
    checklist: [
      '先独立完成题目，再回看题干要求。',
      '重点标记“问题—对策”是否一一对应。',
      '做题后把最不确定的 1 处单独记下来，提交作业时一起发给老师。',
    ],
    notes: '',
    openedPdf: false,
  },

  onLoad(options) {
    this.studyOptions = options || {}
  },

  onShow() {
    startStudySession(this, {
      sessionType: 'practice',
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

  openPdf() {
    this.setData({ openedPdf: true })
    wx.showToast({
      title: '已打开题目 PDF 预览位',
      icon: 'none',
    })
  },

  onNotesInput(e) {
    this.setData({ notes: e.detail.value })
  },

  goSubmit() {
    wx.navigateTo({
      url: '/pkg-practice/pages/practice-submit/practice-submit',
    })
  },
})
