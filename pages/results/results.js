const app = getApp()
const { uiIcons } = require('../../utils/ui-icons')

Page({
  data: {
    uiIcons,
    isEnrolled: false,
    hasDiagnoseCourse: false,
    hasPracticeCourse: false,
    studentName: '张三',
    diagnosisScore: 108,
    targetScore: 130,
    stats: {
      scoreGap: 22,
      solved: 3,
      pending: 5
    },
    diagnosisReport: {
      reportDate: '2026-04-10',
      teacher: '何可心',
      exam: '27年浙江省考 / 事业编',
      diagnosisScore: '60.5',
      targetScore: '70',
      scoreGap: '9.5',
      summary: '你的对策推导与结构掌握较好，如突破“游走式找点”，离目标分只差临门一脚。',
      keyFindings: ['游走式找点', '要点遗漏', '前置词错误']
    },
    diagnoseReportActionText: '查看完整报告',
    practiceCourse: {
      title: '破局刷题课',
      cycleLabel: '4 周训练',
      statusLabel: '查看完整报告',
      currentWeek: '第 2 周',
      currentStage: '刷题作业中',
      currentTaskCount: '2/4',
      nextLiveDate: '4/24',
      summary: '刷题课按周推进刷题、作业、复盘和直播讲评，当前已进入第 2 周训练节奏。',
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
    const hasDiagnoseCourse = !!app.globalData.hasDiagnoseCourse
    const hasPracticeCourse = !!app.globalData.hasPracticeCourse
    const diagnosisScoreGap = Number(diagnosis.scoreGap)
    const defaultDiagnosisReport = {
      reportDate: '2026-04-10',
      teacher: '何可心',
      exam: diagnosis.targetExam || '27年浙江省考 / 事业编',
      diagnosisScore: '60.5',
      targetScore: '70',
      scoreGap: '9.5',
      summary: '你的对策推导与结构掌握较好，如突破“游走式找点”，离目标分只差临门一脚。',
      keyFindings: ['游走式找点', '要点遗漏', '前置词错误']
    }
    const introDiagnosisReport = {
      reportDate: '课程介绍',
      teacher: '1v1 人工诊断',
      exam: '未开通 · 先看病因再决定怎么提分',
      diagnosisScore: '1v1',
      targetScore: '8维',
      scoreGap: '报告',
      summary: '先通过老师人工拆解失分原因，判断你真正卡在理解、结构还是表达，再给出书面诊断结论和后续学习建议。',
      keyFindings: ['失分病因', '核心卡点', '学习路径']
    }

    this.setData({
      isEnrolled: app.globalData.isEnrolled,
      hasDiagnoseCourse,
      hasPracticeCourse,
      studentName: profile.name || '张三',
      diagnosisScore: diagnosis.diagnosisScore || this.data.diagnosisScore,
      targetScore: diagnosis.targetScore || this.data.targetScore,
      diagnosisReport: hasDiagnoseCourse ? {
        ...defaultDiagnosisReport,
        exam: diagnosis.targetExam || defaultDiagnosisReport.exam,
      } : introDiagnosisReport,
      diagnoseReportActionText: hasDiagnoseCourse ? '查看完整报告' : '立即了解',
      'stats.scoreGap': hasDiagnoseCourse
        ? (Number.isFinite(diagnosisScoreGap) ? diagnosisScoreGap : this.data.stats.scoreGap)
        : 0,
      'practiceCourse.statusLabel': hasPracticeCourse ? '查看完整报告' : '了解刷题课',
      'practiceCourse.currentWeek': hasPracticeCourse ? '第 2 周' : '未开通',
      'practiceCourse.currentStage': hasPracticeCourse ? '刷题作业中' : '开通后展示训练节奏',
      'practiceCourse.currentTaskCount': hasPracticeCourse ? '2/4' : '--',
      'practiceCourse.nextLiveDate': hasPracticeCourse ? '4/24' : '--',
      'practiceCourse.summary': hasPracticeCourse
        ? '刷题课按周推进刷题、作业、复盘和直播讲评，当前已进入第 2 周训练节奏。'
        : '刷题课会按周展示刷题任务、作业提交、复盘提醒和直播讲评，开通后这里再展示你的训练进展。',
      'practiceCourse.keyNotes': hasPracticeCourse
        ? ['刷题作业', '复盘反馈', '直播讲评']
        : ['每周训练安排', '作业与复盘', '直播讲评']
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
    if (!this.data.hasDiagnoseCourse) {
      wx.navigateTo({ url: '/pages/diagnose-detail/diagnose-detail?source=results_report_intro' })
      return
    }

    wx.navigateTo({ url: '/pages/diagnose-report/diagnose-report' })
  },

  handleGoalGapTap() {
    if (!this.data.hasDiagnoseCourse) {
      wx.navigateTo({ url: '/pages/diagnose-detail/diagnose-detail?source=results_goal_gap' })
      return
    }

    this.goDiagnoseReport()
  },

  goPracticeCourse() {
    if (app.globalData.hasPracticeCourse) {
      wx.navigateTo({ url: '/pages/practice-report/practice-report' })
      return
    }

    wx.navigateTo({ url: '/pages/practice-purchase/practice-purchase' })
  }
})
