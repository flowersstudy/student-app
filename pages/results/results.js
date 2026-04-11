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
      keyFindings: ['作文逻辑不清', '总结转述难', '公文结构不清']
    },
    practiceCourse: {
      title: '申论八大卡点·破局刷题营',
      cycleLabel: '4 周训练',
      statusLabel: '进行中',
      currentWeek: '第 2 周',
      currentStage: '刷题作业中',
      currentTaskCount: '2/4',
      nextLiveDate: '4/24',
      summary: '刷题班按周推进刷题、作业、复盘和直播讲评，当前已进入第 2 周训练节奏。',
      keyNotes: ['刷题作业', '复盘反馈', '直播讲评']
    },
    totalStudyDisplay: '20h 40m',
    totalPoints: 1260,
    solvedPoints: [
      { id: 2, name: '总结转述难', completedAt: '2026-03-10', summary: '已掌握主题句提炼技巧，答题准确率提升 20%。' },
      { id: 4, name: '公文结构不清', completedAt: '2026-03-18', summary: '公文格式与套路熟练掌握，得分更加稳定。' },
      { id: 6, name: '作文立意不准', completedAt: '2026-03-22', summary: '立意跑偏问题已解决，审题准确率明显提升。' }
    ],
    pendingPoints: [
      { id: 1, name: '游走式找点', desc: '找点逻辑还不够清晰，需要加强材料精读训练。' },
      { id: 5, name: '对策推导难', desc: '对策思维仍然不足，需要结合真题反复练习。' },
      { id: 3, name: '分析结构不清', desc: '材料分析框架尚未建立，需要重点突破。' },
      { id: 7, name: '作文逻辑不清', desc: '论述结构比较混乱，缺少清晰层次。' },
      { id: 8, name: '作文表达不畅', desc: '书面表达还不够规范，语言偏口语化。' }
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

  goCardDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/card-detail/card-detail?id=${id}` })
  },

  goDiagnoseReport() {
    wx.navigateTo({ url: '/pages/diagnose-report/diagnose-report' })
  },

  goPracticeCourse() {
    wx.navigateTo({ url: '/pages/trial-experience/trial-experience' })
  }
})
