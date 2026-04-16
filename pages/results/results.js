const app = getApp()
const { uiIcons } = require('../../utils/ui-icons')
const { syncCustomTabBar } = require('../../utils/custom-tab-bar')
const { fetchStudentReviewOverview } = require('../../utils/student-api')
const DAY_MS = 24 * 60 * 60 * 1000
const REVIEW_PROGRESS_PRESET = {
  entryScore: 55,
  currentScore: 65,
  targetScore: 80,
}
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

function buildStudyTimeTabs(currentRange = 'week') {
  return STUDY_TIME_RANGE_OPTIONS.map((item) => ({
    ...item,
    active: item.key === currentRange,
  }))
}

function getStudyTimePreset(range = 'week') {
  return REVIEW_STUDY_TIME_PRESET[range] || REVIEW_STUDY_TIME_PRESET.week
}

function normalizeNumber(value) {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : null
}

function clampPercent(value) {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) {
    return 0
  }

  return Math.max(0, Math.min(100, numericValue))
}

function roundUpBy(value, step = 10) {
  if (!Number.isFinite(value) || value <= 0) {
    return step
  }

  return Math.ceil(value / step) * step
}

function splitPointName(pointName = '') {
  const safeName = String(pointName || '').trim()
  if (!safeName) {
    return {
      shortTop: '',
      shortBottom: '',
    }
  }

  if (safeName.length <= 4) {
    return {
      shortTop: safeName,
      shortBottom: '',
    }
  }

  return {
    shortTop: safeName.slice(0, safeName.length - 2),
    shortBottom: safeName.slice(-2),
  }
}

function normalizeProgressPayload(payload = {}) {
  return {
    entryScore: normalizeNumber(payload.entryScore),
    currentScore: normalizeNumber(payload.currentScore),
    targetScore: normalizeNumber(payload.targetScore),
  }
}

function normalizePointRateItems(items = []) {
  if (!Array.isArray(items)) {
    return []
  }

  return items.map((item, index) => {
    const pointName = String(item.pointName || item.name || '').trim()
    const meta = REVIEW_POINT_META[pointName] || splitPointName(pointName)

    return {
      id: Number(item.id || meta.id || index + 1),
      name: pointName || `卡点${index + 1}`,
      shortTop: meta.shortTop || '',
      shortBottom: meta.shortBottom || '',
      currentRate: normalizeNumber(item.currentRate),
      targetRate: normalizeNumber(item.targetRate),
    }
  })
}

function normalizeStudyTimeMap(items = []) {
  if (!Array.isArray(items)) {
    return {}
  }

  return items.reduce((result, item, index) => {
    const cycleType = String(item.cycleType || 'week').trim() || 'week'
    if (!result[cycleType]) {
      result[cycleType] = []
    }

    result[cycleType].push({
      key: String(item.key || `${cycleType}${index + 1}`),
      label: String(item.label || `第${index + 1}项`),
      hours: normalizeNumber(item.hours),
      sortOrder: Number(item.sortOrder || index + 1),
    })

    return result
  }, {})
}

function sortStudyTimeGroups(groupMap = {}) {
  return Object.keys(groupMap).reduce((result, key) => {
    result[key] = (groupMap[key] || [])
      .slice()
      .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
      .map((item) => ({
        key: item.key,
        label: item.label,
        hours: item.hours,
      }))
    return result
  }, {})
}

function getSeriesX(index, count) {
  if (count <= 1) return 50

  return ((index + 0.5) / count) * 100
}

function getProgressNodePosition(score, minScore, maxScore, fallbackPosition = 50) {
  const numericScore = normalizeNumber(score)
  if (numericScore === null) {
    return fallbackPosition
  }

  const safeMin = Number.isFinite(minScore) ? minScore : numericScore
  const safeMax = Number.isFinite(maxScore) ? maxScore : numericScore
  const span = safeMax - safeMin
  if (span <= 0) {
    return fallbackPosition
  }

  const clampedScore = Math.max(safeMin, Math.min(safeMax, numericScore))
  const ratio = (clampedScore - safeMin) / span
  const edgePadding = 6

  return edgePadding + ratio * (100 - edgePadding * 2)
}

function buildLineSvg(series = [], { strokeColor = '#4b5563' } = {}) {
  const validSeries = series.filter((item) => item && item.value !== null)
  if (validSeries.length < 2) {
    return ''
  }

  const polylinePoints = validSeries
    .map((item) => `${item.x.toFixed(2)},${(100 - item.percent).toFixed(2)}`)
    .join(' ')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="${polylinePoints}" fill="none" stroke="${strokeColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.82"/></svg>`

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function buildLinePoints(series = []) {
  return series
    .filter((item) => item && item.value !== null)
    .map((item, index) => ({
      key: item.key || `line-point-${index}`,
      style: `left:${item.x.toFixed(2)}%; bottom:${item.percent.toFixed(2)}%;`,
    }))
}

function buildProgressChart(progressData = {}) {
  const entryScore = normalizeNumber(progressData.entryScore)
  const currentScore = normalizeNumber(progressData.currentScore)
  const targetScore = normalizeNumber(progressData.targetScore)
  const isEmpty = entryScore === null && currentScore === null && targetScore === null
  const fallbackScores = [entryScore, currentScore, targetScore].filter((item) => item !== null)
  const axisMin = entryScore !== null
    ? entryScore
    : fallbackScores.length
      ? Math.min(...fallbackScores)
      : null
  const axisMax = targetScore !== null
    ? targetScore
    : fallbackScores.length
      ? Math.max(...fallbackScores)
      : null
  const rawNodes = [
    { key: 'entry', label: '入学诊断分数', value: entryScore, hidden: false },
    { key: 'current', label: '当前诊断分数', value: currentScore, hidden: !isEmpty && entryScore !== null && currentScore === null },
    { key: 'target', label: '进面目标分数', value: targetScore, hidden: false },
  ]
  const visibleRawNodes = rawNodes.filter((item) => !item.hidden)
  const fallbackPositions = visibleRawNodes.length <= 1
    ? [50]
    : visibleRawNodes.map((item, index) => (index / (visibleRawNodes.length - 1)) * 100)
  const visibleNodes = visibleRawNodes.map((item, index) => {
    const position = getProgressNodePosition(item.value, axisMin, axisMax, fallbackPositions[index])
    const align = index === 0
      ? 'start'
      : index === visibleRawNodes.length - 1
        ? 'end'
        : 'center'

    return {
      ...item,
      active: item.value !== null && !isEmpty,
      valueText: item.value === null ? '--' : `${item.value}`,
      position,
      align,
      style: `left:${position}%;`,
    }
  })
  const activeNodes = visibleNodes.filter((item) => item.active)

  return {
    title: '我的申论突破进度',
    hint: isEmpty ? '还没解锁呢~去诊断吧~' : '',
    isEmpty,
    axisMinText: axisMin === null ? '--' : `${axisMin}`,
    axisMaxText: axisMax === null ? '--' : `${axisMax}`,
    nodes: visibleNodes,
    activeLineStyle: activeNodes.length >= 2
      ? `left:${activeNodes[0].position}%; width:${activeNodes[activeNodes.length - 1].position - activeNodes[0].position}%;`
      : '',
  }
}

function buildPointRateChart(pointItems = []) {
  const normalizedItems = pointItems.map((item) => {
    const currentRate = normalizeNumber(item.currentRate)
    const targetRate = normalizeNumber(item.targetRate)

    return {
      ...item,
      currentRate,
      targetRate,
    }
  })
  const hasAnyData = normalizedItems.some((item) => item.currentRate !== null)
  const hasMissingData = hasAnyData && normalizedItems.some((item) => item.currentRate === null)
  const targetSeries = normalizedItems.map((item, index) => ({
    key: `target-${item.id || index}`,
    value: item.targetRate,
    percent: clampPercent(item.targetRate),
    x: getSeriesX(index, normalizedItems.length),
  }))

  return {
    title: '我的申论卡点突破情况',
    legendBar: '得分率',
    legendLine: '进面目标',
    hint: !hasAnyData
      ? '还没解锁呢~去诊断吧~'
      : hasMissingData
        ? '本月刷题任务没有完成，统计不全呢~~'
        : '',
    isEmpty: !hasAnyData,
    yAxis: [100, 80, 60, 40, 20, 0].map((value) => ({
      value,
      label: `${value}%`,
      bottom: `${value}%`,
    })),
    lineSvg: hasAnyData
      ? buildLineSvg(targetSeries, { strokeColor: '#4b5563' })
      : '',
    linePoints: hasAnyData ? buildLinePoints(targetSeries) : [],
    items: normalizedItems.map((item, index) => ({
      ...item,
      indexLabel: `${index + 1}`,
      valueText: item.currentRate === null ? '--' : `${item.currentRate}%`,
      targetText: item.targetRate === null ? '--' : `${item.targetRate}%`,
      barHeight: item.currentRate === null ? 12 : clampPercent(item.currentRate),
      isMissing: item.currentRate === null,
    })),
  }
}

function buildStudyTimeChart(studyItems = [], range = 'week') {
  const normalizedItems = studyItems.map((item) => ({
    ...item,
    hours: normalizeNumber(item.hours),
  }))
  const validHours = normalizedItems
    .map((item) => item.hours)
    .filter((item) => item !== null)
  const hasAnyData = validHours.length > 0
  const hasMissingData = hasAnyData && normalizedItems.some((item) => item.hours === null)
  const maxHours = hasAnyData ? roundUpBy(Math.max(...validHours), 10) : 50
  const hourSeries = normalizedItems.map((item, index) => ({
    key: item.key || `hour-${index}`,
    value: item.hours,
    percent: item.hours === null ? 0 : clampPercent((item.hours / maxHours) * 100),
    x: getSeriesX(index, normalizedItems.length),
  }))

  return {
    title: '我的申论学习时间统计',
    rangeLabel: (STUDY_TIME_RANGE_OPTIONS.find((item) => item.key === range) || {}).label || '按周',
    legendBar: '时长',
    legendLine: '趋势',
    hint: !hasAnyData
      ? '还没解锁呢~去诊断吧~'
      : hasMissingData
        ? '本周/月没有学习数据，要加油呢~~'
        : '',
    isEmpty: !hasAnyData,
    lineSvg: hasAnyData
      ? buildLineSvg(hourSeries, { strokeColor: '#22c55e' })
      : '',
    linePoints: hasAnyData ? buildLinePoints(hourSeries) : [],
    items: normalizedItems.map((item) => ({
      ...item,
      valueText: item.hours === null ? '--' : `${item.hours}`,
      barHeight: item.hours === null ? 12 : clampPercent((item.hours / maxHours) * 100),
      isMissing: item.hours === null,
    })),
  }
}

function buildAvatarText(name = '') {
  const safeName = String(name || '').trim()
  return safeName ? safeName.slice(0, 1) : '\u5b66'
}

function parseExamDate(rawValue = '') {
  const text = String(rawValue || '').trim()
  if (!text) return null

  let year = 0
  let month = 0
  let day = 1

  let matched = text.match(/^(\d{4})[-/](\d{1,2})(?:[-/](\d{1,2}))?$/)
  if (matched) {
    year = Number(matched[1])
    month = Number(matched[2])
    day = Number(matched[3] || 1)
  } else {
    matched = text.match(/(\d{4})\D+(\d{1,2})(?:\D+(\d{1,2}))?/)
    if (!matched) {
      return null
    }
    year = Number(matched[1])
    month = Number(matched[2])
    day = Number(matched[3] || 1)
  }

  if (!year || !month || month > 12 || day > 31) {
    return null
  }

  const examDate = new Date(year, month - 1, day)
  if (Number.isNaN(examDate.getTime())) {
    return null
  }

  examDate.setHours(0, 0, 0, 0)
  return examDate
}

function formatExamCountdown(rawValue = '') {
  const examDate = parseExamDate(rawValue)
  if (!examDate) return '\u5f85\u8bbe\u7f6e'

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const diffDays = Math.ceil((examDate.getTime() - today.getTime()) / DAY_MS)
  if (diffDays < 0) return '\u5df2\u7ed3\u675f'
  if (diffDays === 0) return '\u4eca\u5929'
  return `${diffDays}\u5929`
}

function formatRaiseTarget(scoreGap) {
  const numericGap = Number(scoreGap)
  if (!Number.isFinite(numericGap) || numericGap <= 0) {
    return '\u5f85\u8bc4\u4f30'
  }

  return `+${numericGap}\u5206`
}

Page({
  data: {
    uiIcons,
    isEnrolled: false,
    hasDiagnoseCourse: false,
    sectionExpanded: {
      diagnose: true,
      solved: true,
      pending: true,
    },
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
    solvedPoints: [
      { id: 2, name: '提炼转述困难' },
      { id: 4, name: '公文结构不清' },
      { id: 6, name: '作文立意不准' }
    ],
    pendingPoints: [
      { id: 1, name: '要点不全不准' },
      { id: 5, name: '对策推导困难' },
      { id: 3, name: '分析结构不清' },
      { id: 7, name: '作文论证不清' },
      { id: 8, name: '作文表达不畅' }
    ]
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
      'stats.scoreGap': hasDiagnoseCourse
        ? (Number.isFinite(diagnosisScoreGap) ? diagnosisScoreGap : this.data.stats.scoreGap)
        : 0,
    })

    this.applyReviewOverviewFallback()
    await this.loadReviewOverview()
  },

  onLoad() {},

  toggleSection(e) {
    const { key } = e.currentTarget.dataset
    if (!key) return

    this.setData({
      [`sectionExpanded.${key}`]: !this.data.sectionExpanded[key],
    })
  },

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

    this.setData({
      progressChart: buildProgressChart(REVIEW_PROGRESS_PRESET),
      pointRateChart: buildPointRateChart(REVIEW_POINT_RATE_PRESET),
      reviewStudyTimeData: REVIEW_STUDY_TIME_PRESET,
      studyTimeTabs: buildStudyTimeTabs(studyTimeRange),
      studyTimeChart: buildStudyTimeChart(getStudyTimePreset(studyTimeRange), studyTimeRange),
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
      const mergedStudyTimeData = {
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
    wx.navigateTo({ url: `/pkg-diagnose/pages/card-detail/card-detail?id=${id}&status=${status}` })
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
