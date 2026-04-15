const app = getApp()
const { getDiagnosePathData } = require('../../utils/diagnose-path-data')

const PAGE_MAP = {
  diagnose: {
    navTitle: '诊断课学习数据',
    badge: '诊断课',
    intro: '这里集中查看诊断阶段的学习记录、完成进度和整体学习路径。',
    doneStatus: '已完成诊断',
    pendingStatus: '待开始诊断',
    doneProgress: '4/6',
    pendingProgress: '1/6',
    doneRecordTitle: '最近一次诊断',
    doneRecordDesc: '已生成诊断结论，接下来可以继续按学习路径推进。',
    pendingRecordTitle: '当前状态',
    pendingRecordDesc: '当前还在诊断前期，建议先按学习路径完成信息填写和作答。',
  },
  practice: {
    navTitle: '刷题课学习数据',
    badge: '刷题课',
    intro: '这里集中查看刷题阶段的学习记录、任务进度和训练节奏。',
    doneStatus: '训练进行中',
    pendingStatus: '待开启刷题',
    doneProgress: '2/4',
    pendingProgress: '0/4',
    doneRecordTitle: '最近一次训练',
    doneRecordDesc: '已进入当前刷题周期，可查看作业、讲评和训练安排。',
    pendingRecordTitle: '当前状态',
    pendingRecordDesc: '还没有开启刷题课，开通后会同步训练数据。',
  },
}

Page({
  data: {
    pageTitle: '学习数据',
    scene: 'diagnose',
    badgeText: '',
    introText: '',
    studentName: '张三',
    gradeText: '2026届',
    targetExam: '未设置目标考试',
    statusText: '待开始',
    studyDuration: '0h 00m',
    progressText: '0/0',
    recordTitle: '',
    recordDesc: '',
    showPathSection: false,
    pathSummary: null,
    pathSteps: [],
  },

  onLoad(options) {
    const scene = options.scene === 'practice' ? 'practice' : 'diagnose'
    const config = PAGE_MAP[scene]
    const profile = app.globalData.userProfile || {}
    const diagnosis = app.globalData.diagnosis || {}
    const hasCourse = scene === 'practice'
      ? !!app.globalData.hasPracticeCourse
      : !!app.globalData.hasDiagnoseCourse
    const windowWidth = wx.getSystemInfoSync ? wx.getSystemInfoSync().windowWidth : 375
    const pathData = getDiagnosePathData(hasCourse ? 'done' : 'current', windowWidth)

    wx.setNavigationBarTitle({
      title: config.navTitle,
    })

    this.setData({
      scene,
      pageTitle: config.navTitle,
      badgeText: config.badge,
      introText: config.intro,
      studentName: profile.name || '张三',
      gradeText: profile.grade || '2026届',
      targetExam: diagnosis.targetExam || '未设置目标考试',
      statusText: hasCourse ? config.doneStatus : config.pendingStatus,
      studyDuration: hasCourse
        ? (scene === 'practice' ? '14h 20m' : '6h 40m')
        : '0h 00m',
      progressText: hasCourse ? config.doneProgress : config.pendingProgress,
      recordTitle: hasCourse ? config.doneRecordTitle : config.pendingRecordTitle,
      recordDesc: hasCourse ? config.doneRecordDesc : config.pendingRecordDesc,
      showPathSection: scene === 'diagnose',
      pathSummary: scene === 'diagnose' ? pathData.summary : null,
      pathSteps: scene === 'diagnose' ? pathData.pathSteps : [],
    })
  },
})
