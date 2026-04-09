const app = getApp()
const { uiIcons } = require('../../utils/ui-icons')

Page({
  data: {
    uiIcons,
    isEnrolled: false,
    studentName: '张三',
    diagnosisScore: 108,
    targetScore: 130,
    stats: {
      scoreGap: 22,
      solved: 3,
      pending: 5
    },
    diagnosisReport: {
      reportDate: '2026-04-03',
      teacher: '李老师',
      exam: '国考行测申论',
      summary: '当前核心问题集中在审题稳定性、材料提炼和作文结构，建议优先处理高频失分卡点。',
      keyFindings: ['作文逻辑不清晰', '提炼转述错误', '公文结构错误']
    },
    practiceReport: {
      totalQuestions: 86,
      accuracy: 85,
      recentDays: 7,
      recentCompleted: 18,
      strongestPoint: '提炼转述错误',
      weakestPointId: 1,
      weakestPoint: '游走式找点',
      weakestAdvice: '当前主要问题集中在找点聚焦和材料提炼，建议优先巩固段落功能判断与关键信息识别。',
      recentRecords: [
        { id: 1, title: '游走式找点专项练习', score: 78, date: '04-04' },
        { id: 2, title: '公文结构限时训练', score: 84, date: '04-05' },
        { id: 3, title: '作文逻辑真题刷题', score: 67, date: '04-06' }
      ]
    },
    totalStudyDisplay: '20h 40m',
    totalPoints: 1260,
    solvedPoints: [
      { id: 2, name: '提炼转述错误', completedAt: '2026-03-10', summary: '已掌握主题句提炼技巧，答题准确率提升 20%。' },
      { id: 4, name: '公文结构错误', completedAt: '2026-03-18', summary: '公文格式与套路熟练掌握，得分更加稳定。' },
      { id: 6, name: '作文立意错误', completedAt: '2026-03-22', summary: '立意跑偏问题已解决，审题准确率明显提升。' }
    ],
    pendingPoints: [
      { id: 1, name: '游走式找点', desc: '找点逻辑还不够清晰，需要加强材料精读训练。' },
      { id: 5, name: '对策推导错误', desc: '对策思维仍然不足，需要结合真题反复练习。' },
      { id: 3, name: '分析结构错误', desc: '材料分析框架尚未建立，需要重点突破。' },
      { id: 7, name: '作文逻辑不清晰', desc: '论述结构比较混乱，缺少清晰层次。' },
      { id: 8, name: '作文表达不流畅', desc: '书面表达还不够规范，语言偏口语化。' }
    ]
  },

  onShow() {
    const profile = app.globalData.userProfile || {}
    const diagnosis = app.globalData.diagnosis || {}
    this.setData({
      isEnrolled: app.globalData.isEnrolled,
      studentName: profile.name || '张三',
      diagnosisScore: diagnosis.diagnosisScore || this.data.diagnosisScore,
      targetScore: diagnosis.targetScore || this.data.targetScore,
      'diagnosisReport.exam': diagnosis.targetExam || '国考行测申论',
      'stats.scoreGap': diagnosis.scoreGap || this.data.stats.scoreGap
    })
  },

  onLoad() {},

  goEnroll() {
    wx.switchTab({ url: '/pages/home/home' })
  },

  goStudySquare() {
    wx.navigateTo({ url: '/pages/study-square/study-square' })
  },

  goCardDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/card-detail/card-detail?id=${id}` })
  },

  goDiagnoseReport() {
    wx.navigateTo({ url: '/pages/diagnose-report/diagnose-report' })
  },

  goPracticeReport() {
    const pendingFirst = this.data.pendingPoints[0] ? this.data.pendingPoints[0].id : null
    const solvedFirst = this.data.solvedPoints[0] ? this.data.solvedPoints[0].id : null
    const id = this.data.practiceReport.weakestPointId || pendingFirst || solvedFirst
    if (!id) return
    wx.navigateTo({ url: `/pages/card-detail/card-detail?id=${id}` })
  }
})
