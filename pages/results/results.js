const app = getApp()
const { uiIcons } = require('../../utils/ui-icons')
const { syncCustomTabBar } = require('../../utils/custom-tab-bar')
const { fetchStudentReviewOverview } = require('../../utils/student-api')
const {
  buildPointRateChart: createPointRateChart,
  buildProgressChart: createProgressChart,
  buildStudyTimeChart: createStudyTimeChart,
  buildStudyTimeTabs: createStudyTimeTabs,
  getStudyTimePreset: pickStudyTimePreset,
} = require('../../features/review/charts')
const {
  normalizePointRateItems: mapPointRateItems,
  normalizeProgressPayload: mapProgressPayload,
  normalizeStudyTimeMap: mapStudyTimeMap,
  sortStudyTimeGroups: orderStudyTimeGroups,
} = require('../../features/review/overview')
const {
  buildAvatarText: createAvatarText,
  formatExamCountdown: getExamCountdown,
  formatRaiseTarget: getRaiseTarget,
} = require('../../features/review/profile')
const REVIEW_PROGRESS_PRESET = {
  entryScore: 55,
  currentScore: 65,
  targetScore: 80,
}
const REVIEW_POINT_LIST = [
  { id: 1, name: '要点不全不准' },
  { id: 2, name: '提炼转述困难' },
  { id: 3, name: '分析结构不清' },
  { id: 4, name: '公文结构不清' },
  { id: 5, name: '对策推导困难' },
  { id: 6, name: '作文立意不准' },
  { id: 7, name: '作文论证不清' },
  { id: 8, name: '作文表达不畅' },
]
const REVIEW_POINT_NAME_TO_ID = REVIEW_POINT_LIST.reduce((result, item) => {
  result[item.name] = item.id
  return result
}, {})
const REVIEW_POINT_STATUS_PRIORITY = {
  learning: 0,
  completed: 1,
  pending: 2,
  locked: 3,
}
const REVIEW_POINT_STATUS_TEXT_MAP = {
  learning: '学习中',
  completed: '已完成',
  pending: '待突破',
  locked: '待解锁',
}
const FORCE_REVIEW_POINT_STATUS_PREVIEW = false
const REVIEW_POINT_STATUS_PREVIEW_ORDER = ['learning', 'completed', 'pending', 'locked']
const REVIEW_POINT_RATE_PRESET = [
  { id: 1, name: '要点不全不准', shortTop: '要点不全', shortBottom: '不准', currentRate: 65, targetRate: 80 },
  { id: 2, name: '提炼转述困难', shortTop: '提炼转述', shortBottom: '困难', currentRate: 50, targetRate: 80 },
  { id: 5, name: '对策推导困难', shortTop: '对策推导', shortBottom: '困难', currentRate: 60, targetRate: 80 },
  { id: 3, name: '分析结构不清', shortTop: '分析结构', shortBottom: '不清', currentRate: 65, targetRate: 80 },
  { id: 4, name: '公文结构不清', shortTop: '公文结构', shortBottom: '不清', currentRate: 60, targetRate: 80 },
  { id: 6, name: '作文立意不准', shortTop: '作文立意', shortBottom: '不准', currentRate: 50, targetRate: 70 },
  { id: 7, name: '作文论证不清', shortTop: '作文论证', shortBottom: '不清', currentRate: 50, targetRate: 70 },
  { id: 8, name: '作文表达不畅', shortTop: '作文表达', shortBottom: '不畅', currentRate: 50, targetRate: 70 },
]
const STUDY_TIME_RANGE_OPTIONS = [
  { key: 'day', label: '按天' },
  { key: 'week', label: '按周' },
  { key: 'month', label: '按月' },
]
const REVIEW_CHART_COPY = {
  progress: {
    title: '\u7533\u8bba\u7a81\u7834\u8fdb\u5ea6',
    emptyHint: '\u8fd8\u6ca1\u89e3\u9501\u5462\uff0c\u53bb\u8bca\u65ad\u5427~',
    entryLabel: '\u5165\u5b66\u8bca\u65ad\u5206\u6570',
    currentLabel: '\u5f53\u524d\u8bca\u65ad\u5206\u6570',
    targetLabel: '\u8fdb\u9762\u76ee\u6807\u5206\u6570',
  },
  pointRate: {
    title: '\u7533\u8bba\u5361\u70b9\u7a81\u7834\u60c5\u51b5',
    legendBar: '\u5f97\u5206\u7387',
    legendLine: '\u8fdb\u9762\u76ee\u6807',
    emptyHint: '\u8fd8\u6ca1\u89e3\u9501\u5462\uff0c\u53bb\u8bca\u65ad\u5427~',
    partialHint: '\u672c\u6708\u5237\u9898\u4efb\u52a1\u6ca1\u6709\u5b8c\u6210\uff0c\u7edf\u8ba1\u4e0d\u5168\u54e6~~',
  },
  studyTime: {
    title: '\u7533\u8bba\u5b66\u4e60\u65f6\u95f4\u7edf\u8ba1',
    fallbackRangeLabel: '\u6309\u5468',
    legendBar: '\u65f6\u957f',
    legendLine: '\u8d8b\u52bf',
    emptyHint: '\u8fd8\u6ca1\u89e3\u9501\u5462\uff0c\u53bb\u8bca\u65ad\u5427~',
    partialHint: '\u672c\u5468/\u672c\u6708\u6ca1\u6709\u5b66\u4e60\u6570\u636e\uff0c\u8981\u52a0\u6cb9\u54e6~~',
  },
}

const FORCE_STUDY_TIME_PREVIEW = false

const REVIEW_STUDY_TIME_PRESET = {
  day: [
    { key: 'day1', label: '周一', hours: 2.5 },
    { key: 'day2', label: '周二', hours: 3 },
    { key: 'day3', label: '周三', hours: 1.5 },
    { key: 'day4', label: '周四', hours: 4 },
    { key: 'day5', label: '周五', hours: 2 },
    { key: 'day6', label: '周六', hours: 5.5 },
    { key: 'day7', label: '周日', hours: 4.5 },
  ],
  week: [
    { key: 'week1', label: '第一周', hours: 30 },
    { key: 'week2', label: '第二周', hours: 20 },
    { key: 'week3', label: '第三周', hours: 10 },
    { key: 'week4', label: '第四周', hours: 45 },
  ],
  month: [
    { key: 'month1', label: '1月', hours: 36 },
    { key: 'month2', label: '2月', hours: 42 },
    { key: 'month3', label: '3月', hours: 58 },
    { key: 'month4', label: '4月', hours: 64 },
    { key: 'month5', label: '5月', hours: 48 },
    { key: 'month6', label: '6月', hours: 72 },
  ],
}
const REVIEW_STUDY_TIME_PREVIEW_DATA = {
  day: [
    { key: 'preview-day-1', label: 'Mon', hours: 1.2 },
    { key: 'preview-day-2', label: 'Tue', hours: 3.8 },
    { key: 'preview-day-3', label: 'Wed', hours: 2.1 },
    { key: 'preview-day-4', label: 'Thu', hours: 6.4 },
    { key: 'preview-day-5', label: 'Fri', hours: 4.2 },
    { key: 'preview-day-6', label: 'Sat', hours: 7.1 },
    { key: 'preview-day-7', label: 'Sun', hours: 5.6 },
  ],
  week: [
    { key: 'preview-week-1', label: 'W1', hours: 18 },
    { key: 'preview-week-2', label: 'W2', hours: 26 },
    { key: 'preview-week-3', label: 'W3', hours: 14 },
    { key: 'preview-week-4', label: 'W4', hours: 35 },
  ],
  month: [
    { key: 'preview-month-1', label: 'Jan', hours: 36 },
    { key: 'preview-month-2', label: 'Feb', hours: 44 },
    { key: 'preview-month-3', label: 'Mar', hours: 52 },
    { key: 'preview-month-4', label: 'Apr', hours: 68 },
    { key: 'preview-month-5', label: 'May', hours: 57 },
    { key: 'preview-month-6', label: 'Jun', hours: 74 },
  ],
}

const REVIEW_POINT_META = {
  要点不全不准: { id: 1, shortTop: '要点不全', shortBottom: '不准' },
  游走式找点: { id: 1, shortTop: '游走式', shortBottom: '找点' },
  提炼转述困难: { id: 2, shortTop: '提炼转述', shortBottom: '困难' },
  总结转述难: { id: 2, shortTop: '总结转述', shortBottom: '难' },
  对策推导困难: { id: 5, shortTop: '对策推导', shortBottom: '困难' },
  对策推导难: { id: 5, shortTop: '对策推导', shortBottom: '难' },
  分析结构不清: { id: 3, shortTop: '分析结构', shortBottom: '不清' },
  公文结构不清: { id: 4, shortTop: '公文结构', shortBottom: '不清' },
  作文立意不准: { id: 6, shortTop: '作文立意', shortBottom: '不准' },
  作文论证不清: { id: 7, shortTop: '作文论证', shortBottom: '不清' },
  作文逻辑不清: { id: 7, shortTop: '作文逻辑', shortBottom: '不清' },
  作文表达不畅: { id: 8, shortTop: '作文表达', shortBottom: '不畅' },
}

function getReviewPointId(item = {}) {
  const itemId = Number(item && item.id)
  if (Number.isFinite(itemId) && itemId > 0) {
    return itemId
  }

  const pointName = String(item && item.name ? item.name : item && item.pointName ? item.pointName : '').trim()
  return REVIEW_POINT_NAME_TO_ID[pointName] || 0
}

function buildReviewPointStatusItem(item = {}, status = 'locked') {
  const safeStatus = REVIEW_POINT_STATUS_TEXT_MAP[status] ? status : 'locked'

  return {
    ...item,
    status: safeStatus,
    statusText: REVIEW_POINT_STATUS_TEXT_MAP[safeStatus] || '待解锁',
    actionText: safeStatus === 'locked' ? '去解锁' : '去回顾',
  }
}

function buildReviewPointPreviewList() {
  return REVIEW_POINT_LIST.map((item, index) => {
    const status = REVIEW_POINT_STATUS_PREVIEW_ORDER[index % REVIEW_POINT_STATUS_PREVIEW_ORDER.length]
    return buildReviewPointStatusItem(item, status)
  }).sort((prev, next) => {
    const prevPriority = Object.prototype.hasOwnProperty.call(REVIEW_POINT_STATUS_PRIORITY, prev.status)
      ? REVIEW_POINT_STATUS_PRIORITY[prev.status]
      : 99
    const nextPriority = Object.prototype.hasOwnProperty.call(REVIEW_POINT_STATUS_PRIORITY, next.status)
      ? REVIEW_POINT_STATUS_PRIORITY[next.status]
      : 99
    const priorityDiff = prevPriority - nextPriority
    if (priorityDiff !== 0) {
      return priorityDiff
    }

    return prev.id - next.id
  })
}

function buildReviewPointList(profile = {}, hasDiagnoseCourse = false) {
  if (FORCE_REVIEW_POINT_STATUS_PREVIEW) {
    return buildReviewPointPreviewList()
  }

  const inProgressSet = new Set(
    (Array.isArray(profile && profile.inProgress) ? profile.inProgress : [])
      .map(getReviewPointId)
      .filter((itemId) => itemId > 0)
  )
  const completedSet = new Set(
    (Array.isArray(profile && profile.completed) ? profile.completed : [])
      .map(getReviewPointId)
      .filter((itemId) => itemId > 0)
  )

  return REVIEW_POINT_LIST
    .map((item) => {
      let status = 'locked'
      let statusText = '待解锁'

      if (inProgressSet.has(item.id)) {
        status = 'learning'
        statusText = '学习中'
      } else if (completedSet.has(item.id)) {
        status = 'completed'
        statusText = '已完成'
      } else if (hasDiagnoseCourse) {
        status = 'pending'
        statusText = '待突破'
      }

      return {
        ...buildReviewPointStatusItem(item, status),
        statusText,
      }
    })
    .sort((prev, next) => {
      const prevPriority = Object.prototype.hasOwnProperty.call(REVIEW_POINT_STATUS_PRIORITY, prev.status)
        ? REVIEW_POINT_STATUS_PRIORITY[prev.status]
        : 99
      const nextPriority = Object.prototype.hasOwnProperty.call(REVIEW_POINT_STATUS_PRIORITY, next.status)
        ? REVIEW_POINT_STATUS_PRIORITY[next.status]
        : 99
      const priorityDiff = prevPriority - nextPriority
      if (priorityDiff !== 0) {
        return priorityDiff
      }

      return prev.id - next.id
    })
}

function normalizeReviewPointStatuses(items = [], profile = {}, hasDiagnoseCourse = false) {
  if (FORCE_REVIEW_POINT_STATUS_PREVIEW) {
    return buildReviewPointPreviewList()
  }

  if (!Array.isArray(items) || !items.length) {
    return buildReviewPointList(profile, hasDiagnoseCourse)
  }

  const fallbackById = buildReviewPointList(profile, hasDiagnoseCourse).reduce((result, item) => {
    result[item.id] = item
    return result
  }, {})

  return items
    .map((item, index) => {
      const pointId = getReviewPointId(item) || index + 1
      const fallbackItem = fallbackById[pointId] || REVIEW_POINT_LIST.find((point) => point.id === pointId) || null
      const safeStatus = ['learning', 'completed', 'pending', 'locked'].includes(String(item && item.status || ''))
        ? String(item.status)
        : (fallbackItem ? fallbackItem.status : 'locked')
      const pointName = String(item && (item.pointName || item.name) ? (item.pointName || item.name) : fallbackItem && fallbackItem.name ? fallbackItem.name : '').trim()

      return {
        id: pointId,
        name: pointName || (fallbackItem ? fallbackItem.name : `卡点${pointId}`),
        ...buildReviewPointStatusItem({
          id: pointId,
          name: pointName || (fallbackItem ? fallbackItem.name : `卡点${pointId}`),
        }, safeStatus),
      }
    })
    .sort((prev, next) => {
      const prevPriority = Object.prototype.hasOwnProperty.call(REVIEW_POINT_STATUS_PRIORITY, prev.status)
        ? REVIEW_POINT_STATUS_PRIORITY[prev.status]
        : 99
      const nextPriority = Object.prototype.hasOwnProperty.call(REVIEW_POINT_STATUS_PRIORITY, next.status)
        ? REVIEW_POINT_STATUS_PRIORITY[next.status]
        : 99
      const priorityDiff = prevPriority - nextPriority
      if (priorityDiff !== 0) {
        return priorityDiff
      }

      return prev.id - next.id
    })
}

function buildStudyTimeTabs(currentRange = 'week') {
  return createStudyTimeTabs(currentRange, STUDY_TIME_RANGE_OPTIONS)
}

function getStudyTimePreset(range = 'week') {
  return pickStudyTimePreset(range, REVIEW_STUDY_TIME_PRESET)
}

function normalizeProgressPayload(payload = {}) {
  return mapProgressPayload(payload)
}

function normalizePointRateItems(items = []) {
  return mapPointRateItems(items, REVIEW_POINT_META)
}

function normalizeStudyTimeMap(items = []) {
  return mapStudyTimeMap(items)
}

function sortStudyTimeGroups(groupMap = {}) {
  return orderStudyTimeGroups(groupMap)
}

function buildProgressChart(progressData = {}) {
  return createProgressChart(progressData, REVIEW_CHART_COPY.progress)
}

function buildPointRateChart(pointItems = []) {
  return createPointRateChart(pointItems, REVIEW_CHART_COPY.pointRate)
}

function buildStudyTimeChart(studyItems = [], range = 'week') {
  return createStudyTimeChart(studyItems, range, {
    rangeOptions: STUDY_TIME_RANGE_OPTIONS,
    ...REVIEW_CHART_COPY.studyTime,
  })
}

function buildAvatarText(name = '') {
  return createAvatarText(name)
}

function formatExamCountdown(rawValue = '') {
  return getExamCountdown(rawValue)
}

function formatRaiseTarget(scoreGap) {
  return getRaiseTarget(scoreGap)
}

Page({
  data: {
    uiIcons,
    isEnrolled: false,
    hasDiagnoseCourse: false,
    pointRateLegendExpanded: true,
    studentName: '张三',
    profileSummary: {
      avatarUrl: '',
      avatarText: '学',
      identityTag: '体验用户',
      targetExam: '未设置目标考试',
      examCountdown: '待设置',
      raiseTarget: '待评估',
    },
    progressChart: buildProgressChart(REVIEW_PROGRESS_PRESET),
    pointRateChart: buildPointRateChart(REVIEW_POINT_RATE_PRESET),
    reviewStudyTimeData: REVIEW_STUDY_TIME_PRESET,
    studyTimeRange: 'week',
    studyTimeTabs: buildStudyTimeTabs('week'),
    studyTimeChart: buildStudyTimeChart(getStudyTimePreset('week'), 'week'),
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
      summary: '你的对策推导与结构掌握较好，如突破“要点不全不准”，离目标分只差临门一脚。',
      keyFindings: ['要点不全不准', '要点遗漏', '前置词错误']
    },
    diagnoseReportActionText: '查看完整报告',
    totalPoints: 1260,
    reviewPointList: buildReviewPointList({}, false),
  },

  async onShow() {
    syncCustomTabBar(this, 'results')
    const profile = app.globalData.userProfile || {}
    const diagnosis = app.globalData.diagnosis || {}
    const hasDiagnoseCourse = !!app.globalData.hasDiagnoseCourse
    const diagnosisScoreGap = Number(diagnosis.scoreGap)
    const studentName = profile.name || '张三'
    const examTime = profile.examTime || diagnosis.examTime || ''
    const defaultDiagnosisReport = {
      reportDate: '2026-04-10',
      teacher: '何可心',
      exam: diagnosis.targetExam || '27年浙江省考 / 事业编',
      diagnosisScore: '60.5',
      targetScore: '70',
      scoreGap: '9.5',
      summary: '你的对策推导与结构掌握较好，如突破“要点不全不准”，离目标分只差临门一脚。',
      keyFindings: ['要点不全不准', '要点遗漏', '前置词错误']
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

    const nextDiagnosisReport = hasDiagnoseCourse ? {
      ...defaultDiagnosisReport,
      exam: diagnosis.targetExam || defaultDiagnosisReport.exam,
    } : introDiagnosisReport

    this.setData({
      isEnrolled: app.globalData.isEnrolled,
      hasDiagnoseCourse,
      studentName,
      profileSummary: {
        avatarUrl: profile.avatar || '',
        avatarText: buildAvatarText(studentName),
        identityTag: hasDiagnoseCourse ? '在读学员' : '体验用户',
        targetExam: diagnosis.targetExam || '未设置目标考试',
        examCountdown: formatExamCountdown(examTime),
        raiseTarget: formatRaiseTarget(diagnosis.scoreGap),
      },
      diagnosisScore: diagnosis.diagnosisScore || this.data.diagnosisScore,
      targetScore: diagnosis.targetScore || this.data.targetScore,
      diagnosisReport: nextDiagnosisReport,
      diagnoseReportActionText: hasDiagnoseCourse ? '查看完整报告' : '立即了解',
      reviewPointList: buildReviewPointList(profile, hasDiagnoseCourse),
      'stats.scoreGap': hasDiagnoseCourse
        ? (Number.isFinite(diagnosisScoreGap) ? diagnosisScoreGap : this.data.stats.scoreGap)
        : 0,
    })

    this.applyReviewOverviewFallback()
    await this.loadReviewOverview()
  },

  onLoad() {},

  togglePointRateLegend() {
    this.setData({
      pointRateLegendExpanded: !this.data.pointRateLegendExpanded,
    })
  },

  switchStudyTimeRange(e) {
    const { range } = e.currentTarget.dataset
    if (!range || range === this.data.studyTimeRange) return

    const reviewStudyTimeData = this.data.reviewStudyTimeData || REVIEW_STUDY_TIME_PRESET
    const rangeData = reviewStudyTimeData[range] || getStudyTimePreset(range)
    this.setData({
      studyTimeRange: range,
      studyTimeTabs: buildStudyTimeTabs(range),
      studyTimeChart: buildStudyTimeChart(rangeData, range),
    })
  },

  applyReviewOverviewFallback() {
    const studyTimeRange = this.data.studyTimeRange || 'week'
    const studyTimeData = FORCE_STUDY_TIME_PREVIEW
      ? REVIEW_STUDY_TIME_PREVIEW_DATA
      : REVIEW_STUDY_TIME_PRESET

    this.setData({
      progressChart: buildProgressChart(REVIEW_PROGRESS_PRESET),
      pointRateChart: buildPointRateChart(REVIEW_POINT_RATE_PRESET),
      reviewStudyTimeData: studyTimeData,
      studyTimeTabs: buildStudyTimeTabs(studyTimeRange),
      studyTimeChart: buildStudyTimeChart(studyTimeData[studyTimeRange] || getStudyTimePreset(studyTimeRange), studyTimeRange),
    })
  },

  async loadReviewOverview() {
    try {
      const result = await fetchStudentReviewOverview(app)
      const hasRemoteTargetExam = !!(result && Object.prototype.hasOwnProperty.call(result, 'targetExam'))
      const remoteTargetExam = hasRemoteTargetExam ? String(result.targetExam || '').trim() : ''
      const targetExamText = remoteTargetExam || '未设置目标考试'
      const progressPayload = normalizeProgressPayload(result && result.progress ? result.progress : {})
      const pointRateItems = normalizePointRateItems(result && result.pointRates ? result.pointRates : [])
      const studyTimeMap = sortStudyTimeGroups(normalizeStudyTimeMap(result && result.studyTimes ? result.studyTimes : []))
      const mergedStudyTimeData = FORCE_STUDY_TIME_PREVIEW
        ? REVIEW_STUDY_TIME_PREVIEW_DATA
        : {
            ...REVIEW_STUDY_TIME_PRESET,
            ...studyTimeMap,
          }
      const studyTimeRange = mergedStudyTimeData[this.data.studyTimeRange]
        ? this.data.studyTimeRange
        : Object.keys(mergedStudyTimeData)[0] || 'week'

      if (hasRemoteTargetExam) {
        app.globalData.diagnosis = {
          ...(app.globalData.diagnosis || {}),
          targetExam: remoteTargetExam,
        }
      }

      this.setData({
        ...(hasRemoteTargetExam ? {
          'profileSummary.targetExam': targetExamText,
          'diagnosisReport.exam': targetExamText,
        } : {}),
        reviewPointList: normalizeReviewPointStatuses(
          result && result.pointStatuses ? result.pointStatuses : [],
          app.globalData.userProfile || {},
          this.data.hasDiagnoseCourse
        ),
        progressChart: buildProgressChart(
          progressPayload.entryScore !== null || progressPayload.currentScore !== null || progressPayload.targetScore !== null
            ? progressPayload
            : REVIEW_PROGRESS_PRESET
        ),
        pointRateChart: buildPointRateChart(pointRateItems.length ? pointRateItems : REVIEW_POINT_RATE_PRESET),
        reviewStudyTimeData: mergedStudyTimeData,
        studyTimeRange,
        studyTimeTabs: buildStudyTimeTabs(studyTimeRange),
        studyTimeChart: buildStudyTimeChart(mergedStudyTimeData[studyTimeRange] || getStudyTimePreset(studyTimeRange), studyTimeRange),
      })
    } catch (error) {
      console.warn('复盘总览加载失败，使用本地兜底数据:', error && error.message ? error.message : error)
      this.applyReviewOverviewFallback()
    }
  },

  goEnroll() {
    wx.switchTab({ url: '/pages/home/home' })
  },

  goCardDetail(e) {
    const id = e.currentTarget.dataset.id
    const status = e.currentTarget.dataset.status || 'pending'
    const pointName = encodeURIComponent(e.currentTarget.dataset.pointName || '')

    wx.navigateTo({ url: `/pkg-diagnose/pages/card-detail/card-detail?id=${id}&status=${status}&pointName=${pointName}` })
  },

  goAvatarPicker() {
    wx.navigateTo({ url: '/pages/avatar-picker/avatar-picker' })
  },

  goDiagnoseReport() {
    wx.navigateTo({ url: '/pkg-diagnose/pages/diagnose-path/diagnose-path' })
  },

  handleGoalGapTap() {
    if (!this.data.hasDiagnoseCourse) {
      wx.navigateTo({ url: '/pkg-diagnose/pages/diagnose-detail/diagnose-detail?source=results_goal_gap' })
      return
    }

    this.goDiagnoseReport()
  },

  goDiagnosePath() {
    wx.navigateTo({ url: '/pkg-diagnose/pages/diagnose-path/diagnose-path' })
  }
})
