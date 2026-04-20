const {
  fetchStudentAccessSummary,
  fetchStudentProfile,
  fetchStudentReviewOverview,
  fetchStudentStudyCourse,
} = require('../../utils/student-api')
const { syncCustomTabBar } = require('../../utils/custom-tab-bar')
const { buildStageUrl } = require('../../utils/path-stage-routes')

const CURRENT_LEARNING_TASK_KEY = 'current_learning_task'
const HOME_ACCESS_SUMMARY_KEY = 'student_home_access_summary'
const PRACTICE_COURSE_STORAGE_KEY = 'student_has_practice_course'
const DIAGNOSE_COURSE_STORAGE_KEY = 'student_has_diagnose_course'
const HOME_DEBUG_TEST_SCENARIO = false
const STAGE_KEYS = ['diagnose', 'theory', 'training', 'exam', 'report', 'drill']
const PATH_MAP_HEIGHT_RPX = 900
const PATH_MAP_TOP_PADDING_RPX = 20
const PATH_MAP_BOTTOM_PADDING_RPX = 16
const PATH_MAP_VISUAL_NODE_SIZE_RPX = 176
const PATH_STEP_VERTICAL_EXTRA_GAP_RPX = 24
const PATH_VERTICAL_GAP_RPX = 92
const PATH_NODE_SIZE_RPX = 108
const PROMPT_CARD_SPACE_RPX = 270
const PATH_LAYOUT_PRESETS = {
  compact: {
    key: 'compact',
    mapHeight: 850,
    nodeSize: 108,
    nodeTextSize: 22,
    bodyRightPadding: 96,
    ipTop: 292,
    ipRight: 0,
    ipWidth: 336,
    ipOpacity: 1,
    pointLayoutsByCount: {
      6: [
        { x: 0, y: 0 },
        { x: -74, y: 128 },
        { x: -120, y: 262 },
        { x: -72, y: 404 },
        { x: 0, y: 548 },
        { x: 78, y: 688 },
      ],
      7: [
        { x: 0, y: 0 },
        { x: -12, y: 82 },
        { x: -58, y: 170 },
        { x: 34, y: 246 },
        { x: -66, y: 334 },
        { x: -18, y: 420 },
        { x: 8, y: 504 },
      ],
    },
  },
  standard: {
    key: 'standard',
    mapHeight: 900,
    nodeSize: PATH_NODE_SIZE_RPX,
    nodeTextSize: 24,
    bodyRightPadding: 116,
    ipTop: 306,
    ipRight: 4,
    ipWidth: 408,
    ipOpacity: 1,
    pointLayoutsByCount: {
      6: [
        { x: 0, y: 0 },
        { x: -80, y: 138 },
        { x: -128, y: 284 },
        { x: -78, y: 436 },
        { x: 0, y: 592 },
        { x: 86, y: 744 },
      ],
      7: [
        { x: 0, y: 0 },
        { x: -16, y: 90 },
        { x: -76, y: 186 },
        { x: 44, y: 270 },
        { x: -84, y: 364 },
        { x: -24, y: 458 },
        { x: 10, y: 548 },
      ],
    },
  },
  wide: {
    key: 'wide',
    mapHeight: 940,
    nodeSize: 120,
    nodeTextSize: 22,
    bodyRightPadding: 140,
    ipTop: 320,
    ipRight: 8,
    ipWidth: 450,
    ipOpacity: 1,
    pointLayoutsByCount: {
      6: [
        { x: 0, y: 0 },
        { x: -86, y: 146 },
        { x: -138, y: 300 },
        { x: -84, y: 458 },
        { x: 0, y: 620 },
        { x: 96, y: 778 },
      ],
      7: [
        { x: 0, y: 0 },
        { x: -10, y: 92 },
        { x: -56, y: 190 },
        { x: 32, y: 280 },
        { x: -62, y: 380 },
        { x: -18, y: 478 },
        { x: 8, y: 572 },
      ],
    },
  },
}

const DEFAULT_CURRENT_TASK = {
  pointId: 2,
  pointName: '提炼转述困难',
  day: 'Day 1',
  taskLabel: '1v1共识课',
  progress: 0,
}

const DEFAULT_DONE_STAGE_STATUS_MAP = {
  diagnose: 'done',
  theory: 'done',
  training: 'done',
  exam: 'done',
  report: 'done',
  drill: 'done',
}

const DEFAULT_HOME_PROGRESS = {
  activePointId: 0,
  focusPointId: 0,
  purchasedPointIds: [],
  completedPointIds: [],
  pointStageProgressMap: {},
  hasDiagnoseCourse: false,
}

const DEFAULT_HOME_DIALOG = {
  visible: false,
  stepId: '',
  kicker: '',
  message: '',
  actionText: '我知道了',
  actionUrl: '',
  cardStyle: '',
}

const DEFAULT_BUKA_SPEECH = {
  visible: false,
  pointId: 0,
  text: '',
}

const DEFAULT_BUKA_MOTION = {
  pointId: 0,
}

const BUKA_TAP_SPEECH = '不卡申论，申论不卡'

const TEST_HOME_PROGRESS = {
  activePointId: 2,
  focusPointId: 2,
  purchasedPointIds: [1, 2],
  completedPointIds: [1],
  pointStageProgressMap: {
    1: {
      currentStageKey: '',
      currentStepIndex: -1,
      currentTaskText: '已学完',
      stageStatusMap: { ...DEFAULT_DONE_STAGE_STATUS_MAP },
    },
    2: {
      currentStageKey: 'drill',
      currentStepIndex: 5,
      currentTaskText: '当前在学：刷题',
      stageStatusMap: {
        diagnose: 'done',
        theory: 'done',
        training: 'done',
        exam: 'done',
        report: 'done',
        drill: 'current',
      },
    },
  },
  hasDiagnoseCourse: true,
}

const POINT_ORDER = [1, 2, 5, 3, 4, 6, 7, 8]

const POINT_NAME_BY_ID = {
  1: '要点不全不准',
  2: '提炼转述困难',
  3: '分析结构不清',
  4: '公文结构不清',
  5: '对策推导困难',
  6: '作文立意不准',
  7: '作文论证不清',
  8: '作文表达不畅',
}

const POINT_THEME_BY_ID = {
  1: {
    tone: 'red',
    color: '#FE4A4C',
    deepColor: '#CD3B3F',
    cardBg: '#FFF4F4',
    expandBg: '#FFF9F9',
    border: '#FFD5D6',
    divider: '#FFDCDD',
    shadow: 'rgba(254, 74, 76, 0.12)',
    shadowStrong: 'rgba(254, 74, 76, 0.16)',
  },
  2: {
    tone: 'red',
    color: '#FE4A4C',
    deepColor: '#CD3B3F',
    cardBg: '#FFF4F4',
    expandBg: '#FFF9F9',
    border: '#FFD5D6',
    divider: '#FFDCDD',
    shadow: 'rgba(254, 74, 76, 0.12)',
    shadowStrong: 'rgba(254, 74, 76, 0.16)',
  },
  3: {
    tone: 'blue',
    color: '#1FB0F5',
    deepColor: '#0D8EC9',
    cardBg: '#F1FAFF',
    expandBg: '#F7FCFF',
    border: '#CFEFFF',
    divider: '#DCF3FF',
    shadow: 'rgba(31, 176, 245, 0.14)',
    shadowStrong: 'rgba(31, 176, 245, 0.18)',
  },
  4: {
    tone: 'blue',
    color: '#1FB0F5',
    deepColor: '#0D8EC9',
    cardBg: '#F1FAFF',
    expandBg: '#F7FCFF',
    border: '#CFEFFF',
    divider: '#DCF3FF',
    shadow: 'rgba(31, 176, 245, 0.14)',
    shadowStrong: 'rgba(31, 176, 245, 0.18)',
  },
  5: {
    tone: 'blue',
    color: '#1FB0F5',
    deepColor: '#0D8EC9',
    cardBg: '#F1FAFF',
    expandBg: '#F7FCFF',
    border: '#CFEFFF',
    divider: '#DCF3FF',
    shadow: 'rgba(31, 176, 245, 0.14)',
    shadowStrong: 'rgba(31, 176, 245, 0.18)',
  },
  6: {
    tone: 'yellow',
    color: '#FF9601',
    deepColor: '#CA790B',
    cardBg: '#FFF7EB',
    expandBg: '#FFFCF5',
    border: '#FFE0B3',
    divider: '#FFE8C8',
    shadow: 'rgba(255, 150, 1, 0.14)',
    shadowStrong: 'rgba(255, 150, 1, 0.18)',
  },
  7: {
    tone: 'yellow',
    color: '#FF9601',
    deepColor: '#CA790B',
    cardBg: '#FFF7EB',
    expandBg: '#FFFCF5',
    border: '#FFE0B3',
    divider: '#FFE8C8',
    shadow: 'rgba(255, 150, 1, 0.14)',
    shadowStrong: 'rgba(255, 150, 1, 0.18)',
  },
  8: {
    tone: 'yellow',
    color: '#FF9601',
    deepColor: '#CA790B',
    cardBg: '#FFF7EB',
    expandBg: '#FFFCF5',
    border: '#FFE0B3',
    divider: '#FFE8C8',
    shadow: 'rgba(255, 150, 1, 0.14)',
    shadowStrong: 'rgba(255, 150, 1, 0.18)',
  },
}

const POINT_NAME_ALIASES = {
  '要点不全不准': 1,
  '游走式找点': 1,
  '提炼转述困难': 2,
  '总结转述难': 2,
  '提炼转述错误': 2,
  '分析结构不清': 3,
  '分析结构错误': 3,
  '公文结构不清': 4,
  '公文结构错误': 4,
  '对策推导困难': 5,
  '对策推导难': 5,
  '对策推导错误': 5,
  '作文立意不准': 6,
  '作文立意错误': 6,
  '作文论证不清': 7,
  '作文逻辑不清': 7,
  '作文逻辑不稳': 7,
  '作文逻辑不清晰': 7,
  '作文表达不畅': 8,
  '作文表达不流畅': 8,
}

function getPointIdByName(pointName = '') {
  return Number(POINT_NAME_ALIASES[pointName] || DEFAULT_CURRENT_TASK.pointId)
}

const MAIN_PATH_STEPS = [
  {
    key: 'diagnose',
    title: '诊断',
  },
  {
    key: 'theory',
    title: '理论',
  },
  {
    key: 'training',
    title: '实训',
  },
  {
    key: 'exam',
    title: '测试',
  },
  {
    key: 'report',
    title: '报告',
  },
  {
    key: 'drill',
    title: '刷题',
  },
]

const HOME_STAGE_SEQUENCE = ['diagnose', 'theory', 'training', 'exam', 'report', 'drill']
const LEARNING_STAGE_SEQUENCE = ['theory', 'training', 'exam', 'drill']

function toPointItem(course = {}) {
  return {
    id: Number(course.course_id || course.courseId || course.id || 0),
    name: course.name || '',
    subject: course.subject || '',
    progress: Number(course.progress || 0),
    status: course.status || '',
  }
}

function resolveHomeProgress(state = {}) {
  const defaultProgress = DEFAULT_HOME_PROGRESS
  const hasStoredProgress = !!(
    POINT_ORDER.includes(Number(state.activePointId))
    || POINT_ORDER.includes(Number(state.focusPointId))
    || (Array.isArray(state.purchasedPointIds) && state.purchasedPointIds.length)
    || (Array.isArray(state.completedPointIds) && state.completedPointIds.length)
    || (state && typeof state.pointStageProgressMap === 'object' && Object.keys(state.pointStageProgressMap || {}).length)
  )

  if (!hasStoredProgress) {
    return {
      activePointId: defaultProgress.activePointId,
      focusPointId: defaultProgress.focusPointId,
      purchasedPointIds: [...defaultProgress.purchasedPointIds],
      completedPointIds: [...defaultProgress.completedPointIds],
      pointStageProgressMap: {},
      hasDiagnoseCourse: defaultProgress.hasDiagnoseCourse,
    }
  }

  const purchasedPointIds = Array.isArray(state.purchasedPointIds)
    ? state.purchasedPointIds
      .map((item) => Number(item))
      .filter((item) => POINT_ORDER.includes(item))
    : []
  const completedPointIds = Array.isArray(state.completedPointIds)
    ? state.completedPointIds
      .map((item) => Number(item))
      .filter((item) => POINT_ORDER.includes(item))
    : [...defaultProgress.completedPointIds]

  return {
    activePointId: POINT_ORDER.includes(Number(state.activePointId))
      ? Number(state.activePointId)
      : defaultProgress.activePointId,
    focusPointId: POINT_ORDER.includes(Number(state.focusPointId))
      ? Number(state.focusPointId)
      : defaultProgress.focusPointId,
    purchasedPointIds,
    completedPointIds,
    pointStageProgressMap: state && typeof state.pointStageProgressMap === 'object' && state.pointStageProgressMap
      ? {
        ...state.pointStageProgressMap,
      }
      : {},
    hasDiagnoseCourse: typeof state.hasDiagnoseCourse === 'boolean'
      ? state.hasDiagnoseCourse
      : defaultProgress.hasDiagnoseCourse,
  }
}

function isExamTask(task = {}) {
  const type = String(task.type || '').trim()
  const name = String(task.name || '').trim()
  return type === 'exam' || /鑰冭瘯|娴嬭瘯/.test(name)
}

function isTheoryTask(task = {}) {
  const type = String(task.type || '').trim()
  return type === 'video' || type === 'review'
}

function resolveDayStatus(day = {}) {
  const status = String(day.status || '').trim()
  if (status === 'completed' || status === 'in_progress' || status === 'pending') {
    return status
  }

  const tasks = Array.isArray(day.tasks) ? day.tasks : []
  if (!tasks.length) return 'pending'
  if (tasks.every((task) => Number(task.completed) === 1)) return 'completed'
  if (tasks.some((task) => Number(task.completed) === 1)) return 'in_progress'
  return 'pending'
}

function getFirstExamDayNumber(days = []) {
  const examDay = (Array.isArray(days) ? days : []).find((day) => {
    const tasks = Array.isArray(day.tasks) ? day.tasks : []
    return tasks.some((task) => isExamTask(task))
  })

  return Number(examDay && examDay.day_number) || 0
}

function resolveStageKeyForDay(day = {}, firstExamDayNumber = 0) {
  const dayNumber = Number(day.day_number || 0)
  const tasks = Array.isArray(day.tasks) ? day.tasks : []

  if (firstExamDayNumber && dayNumber > firstExamDayNumber) {
    return 'drill'
  }

  if (tasks.some((task) => isExamTask(task))) {
    return 'exam'
  }

  if (tasks.some((task) => isTheoryTask(task))) {
    return 'theory'
  }

  return 'training'
}

function createStageMeta() {
  return {
    hasAny: false,
    hasStarted: false,
    hasCurrent: false,
    allDone: false,
  }
}

function buildCourseStageMeta(days = []) {
  const list = Array.isArray(days) ? days : []
  const firstExamDayNumber = getFirstExamDayNumber(list)
  const meta = {
    theory: createStageMeta(),
    training: createStageMeta(),
    exam: createStageMeta(),
    drill: createStageMeta(),
  }
  const stageDaysMap = {
    theory: [],
    training: [],
    exam: [],
    drill: [],
  }

  list.forEach((day) => {
    const stageKey = resolveStageKeyForDay(day, firstExamDayNumber)
    if (!stageDaysMap[stageKey]) return
    stageDaysMap[stageKey].push(day)
  })

  Object.keys(stageDaysMap).forEach((stageKey) => {
    const stageDays = stageDaysMap[stageKey]
    const stageMeta = meta[stageKey]
    if (!stageMeta) return

    if (!stageDays.length) {
      stageMeta.allDone = false
      return
    }

    stageMeta.hasAny = true
    stageMeta.hasStarted = stageDays.some((day) => {
      const status = resolveDayStatus(day)
      return status === 'completed' || status === 'in_progress'
    })
    stageMeta.hasCurrent = stageDays.some((day) => resolveDayStatus(day) === 'in_progress')
    stageMeta.allDone = stageDays.every((day) => resolveDayStatus(day) === 'completed')
  })

  return meta
}

function inferHasDiagnoseCourse(reviewOverview = {}) {
  const progress = reviewOverview && reviewOverview.progress ? reviewOverview.progress : {}
  const pointRates = Array.isArray(reviewOverview && reviewOverview.pointRates) ? reviewOverview.pointRates : []
  const hasFiniteProgressValue = (value) => (
    value !== null
    && value !== undefined
    && value !== ''
    && Number.isFinite(Number(value))
  )

  return !!(
    String(reviewOverview && reviewOverview.targetExam || '').trim()
    || hasFiniteProgressValue(progress.entryScore)
    || hasFiniteProgressValue(progress.currentScore)
    || hasFiniteProgressValue(progress.targetScore)
    || pointRates.length
  )
}

function buildFallbackCurrentStageKey(course = {}) {
  const progress = Number(course.progress || 0)

  if (progress >= 85) return 'drill'
  if (progress >= 70) return 'report'
  if (progress >= 50) return 'exam'
  if (progress >= 25) return 'training'
  return 'theory'
}

function getReviewOverviewPointIds(reviewOverview = {}) {
  const pointRates = Array.isArray(reviewOverview && reviewOverview.pointRates) ? reviewOverview.pointRates : []
  const pointStatuses = Array.isArray(reviewOverview && reviewOverview.pointStatuses) ? reviewOverview.pointStatuses : []
  const pointIds = []

  pointRates.forEach((item) => {
    const pointId = getPointIdByName(item && (item.pointName || item.point_name) || '')
    if (POINT_ORDER.includes(pointId) && !pointIds.includes(pointId)) {
      pointIds.push(pointId)
    }
  })

  pointStatuses.forEach((item) => {
    const status = String(item && item.status || '').trim()
    if (!status || status === 'locked') {
      return
    }

    const pointId = getPointIdByName(item && (item.pointName || item.point_name) || '')
    if (POINT_ORDER.includes(pointId) && !pointIds.includes(pointId)) {
      pointIds.push(pointId)
    }
  })

  return pointIds
}

function buildStageProgressFromCourse(course = {}, study = null, hasDiagnoseCourse = false) {
  const stageStatusMap = {
    diagnose: hasDiagnoseCourse || !!course.id ? 'done' : 'locked',
    theory: 'locked',
    training: 'locked',
    exam: 'locked',
    report: 'locked',
    drill: 'locked',
  }
  const courseStatus = String(course.status || '').trim()

  if (courseStatus === 'completed') {
    HOME_STAGE_SEQUENCE.forEach((stageKey) => {
      stageStatusMap[stageKey] = 'done'
    })

    return {
      currentStageKey: '',
      currentStepIndex: -1,
      currentTaskText: '已学完',
      stageStatusMap,
    }
  }

  const stageMeta = buildCourseStageMeta((study && study.days) || [])
  const hasStudyDays = LEARNING_STAGE_SEQUENCE.some((stageKey) => stageMeta[stageKey] && stageMeta[stageKey].hasAny)
  let currentStageKey = ''

  if (hasStudyDays) {
    if (stageMeta.theory.hasAny && !stageMeta.theory.allDone) {
      currentStageKey = 'theory'
    } else if (stageMeta.training.hasAny && !stageMeta.training.allDone) {
      currentStageKey = 'training'
    } else if (stageMeta.exam.hasAny && !stageMeta.exam.allDone) {
      currentStageKey = 'exam'
    } else if (stageMeta.exam.allDone && (!stageMeta.drill.hasAny || !stageMeta.drill.hasStarted)) {
      currentStageKey = 'report'
    } else if (stageMeta.drill.hasAny && !stageMeta.drill.allDone) {
      currentStageKey = 'drill'
    } else if (stageMeta.drill.hasAny && stageMeta.drill.allDone) {
      currentStageKey = 'drill'
    }
  }

  if (!currentStageKey) {
    currentStageKey = buildFallbackCurrentStageKey(course)
  }

  const currentStageIndex = HOME_STAGE_SEQUENCE.indexOf(currentStageKey)

  HOME_STAGE_SEQUENCE.forEach((stageKey, index) => {
    if (index < currentStageIndex) {
      stageStatusMap[stageKey] = 'done'
      return
    }

    if (index === currentStageIndex) {
      stageStatusMap[stageKey] = 'current'
      return
    }

    stageStatusMap[stageKey] = 'locked'
  })

  if (currentStageKey === 'drill') {
    stageStatusMap.report = 'done'
  }

  return {
    currentStageKey,
    currentStepIndex: currentStageIndex,
    currentTaskText: currentStageKey
      ? `当前在学：${(MAIN_PATH_STEPS.find((item) => item.key === currentStageKey) || {}).title || ''}`
      : '',
    stageStatusMap,
  }
}

function buildHomeProgress({ profile = {}, reviewOverview = {}, study = null } = {}) {
  const inProgress = Array.isArray(profile && profile.inProgress) ? profile.inProgress.map(toPointItem) : []
  const completed = Array.isArray(profile && profile.completed) ? profile.completed.map(toPointItem) : []
  const allCourses = [...inProgress, ...completed]
  const activeCourse = inProgress[0] || null
  const latestCompletedCourse = completed[completed.length - 1] || null
  const profilePurchasedPointIds = allCourses
    .map((course) => getPointIdByName(course.name))
    .filter((pointId, index, list) => POINT_ORDER.includes(pointId) && list.indexOf(pointId) === index)
  const reviewOverviewPointIds = getReviewOverviewPointIds(reviewOverview)
  const purchasedPointIds = [...profilePurchasedPointIds]
  reviewOverviewPointIds.forEach((pointId) => {
    if (POINT_ORDER.includes(pointId) && !purchasedPointIds.includes(pointId)) {
      purchasedPointIds.push(pointId)
    }
  })
  const completedPointIds = completed
    .map((course) => getPointIdByName(course.name))
    .filter((pointId) => POINT_ORDER.includes(pointId))
  const activePointId = activeCourse
    ? getPointIdByName(activeCourse.name)
    : (reviewOverviewPointIds[0] || 0)
  const focusPointId = activePointId
    || (latestCompletedCourse ? getPointIdByName(latestCompletedCourse.name) : 0)
    || (reviewOverviewPointIds[0] || 0)
  const pointStageProgressMap = {}
  const hasDiagnoseCourse = inferHasDiagnoseCourse(reviewOverview)

  if (activeCourse && activePointId) {
    pointStageProgressMap[activePointId] = buildStageProgressFromCourse(activeCourse, study, hasDiagnoseCourse)
  } else if (activePointId) {
    pointStageProgressMap[activePointId] = buildStageProgressFromCourse({
      id: activePointId,
      progress: 0,
      status: 'in_progress',
    }, null, hasDiagnoseCourse)
  }

  return {
    activePointId,
    focusPointId,
    purchasedPointIds,
    completedPointIds,
    pointStageProgressMap,
    hasDiagnoseCourse,
  }
}

function hasPurchasedPoint(pointId, homeProgress = {}) {
  const purchasedPointIds = Array.isArray(homeProgress.purchasedPointIds) ? homeProgress.purchasedPointIds : []
  return purchasedPointIds.includes(Number(pointId) || 0)
}


function getPointStatus(pointId, homeProgress = {}) {
  const completedPointIds = Array.isArray(homeProgress.completedPointIds) ? homeProgress.completedPointIds : []
  const activePointId = Number(homeProgress.activePointId) || 0

  if (completedPointIds.includes(pointId)) {
    return 'done'
  }

  if (activePointId === pointId) {
    return 'current'
  }

  return 'locked'
}

function getExpandedMap(list = []) {
  return list.reduce((acc, item) => {
    if (item && item.id && item.expanded) {
      acc[item.id] = true
    }
    return acc
  }, {})
}

function ensureExpandedMapWithCurrent(expandedMap = {}, currentPointId = 0) {
  const nextMap = { ...(expandedMap || {}) }
  if (currentPointId) {
    nextMap[`point-${currentPointId}`] = true
  }
  return nextMap
}

function getPointCurveDirection(pointId) {
  const pointIndex = POINT_ORDER.indexOf(pointId)
  if (pointIndex === -1) return 1
  return pointIndex % 2 === 0 ? 1 : -1
}

function getPointTheme(pointId = 0) {
  return POINT_THEME_BY_ID[pointId] || {
    tone: 'blue',
    color: '#8A95A6',
    deepColor: '#677386',
    cardBg: '#F7F8FA',
    expandBg: '#FBFCFE',
    border: '#E6EBF2',
    divider: '#EEF2F6',
    shadow: 'rgba(29, 45, 74, 0.06)',
    shadowStrong: 'rgba(29, 45, 74, 0.08)',
  }
}

function isDiagnoseStep(stepKey = '') {
  return String(stepKey || '').trim() === 'diagnose'
}

function buildDiagnoseUnlockDialog(stepId = '', stepTitle = '') {
  return {
    stepId,
    kicker: stepTitle || '诊断',
    message: '你还没有解锁哦~快去解锁吧~',
    actionText: '去诊断',
    actionUrl: '/pages/purchase/purchase?mode=diagnose&source=home_locked_diagnose',
  }
}

function buildPointUnlockDialog(stepId = '', stepTitle = '', pointId = '', stepKey = '') {
  return {
    stepId,
    kicker: stepTitle || '暂未解锁',
    message: '你还没有解锁哦~快去解锁吧~',
    actionText: '去解锁',
    actionUrl: `/pages/purchase/purchase?pointId=${pointId || ''}&source=home_locked_step&stepKey=${stepKey || ''}`,
  }
}

function buildNotStartedDialog(stepId = '', stepTitle = '') {
  return {
    stepId,
    kicker: stepTitle || '学习进度未到',
    message: '你还没学到这里哦~',
    actionText: '我知道啦',
  }
}

function getPointKnowledgeItems() {
  return []
}

function getTestAccessSummary() {
  return {
    hasPurchasedCourse: true,
    hasDiagnoseCourse: true,
    activeCourseCount: 1,
    completedCourseCount: 1,
    enrolledCourseCount: 2,
    paidOrderCourseCount: 2,
    diagnosisReportCount: 1,
    pointRateCount: 2,
  }
}

function getStageIconPath(stepKey = '', tone = 'blue') {
  const safeStepKey = STAGE_KEYS.includes(stepKey) ? stepKey : 'diagnose'
  const safeTone = ['red', 'yellow', 'blue'].includes(tone) ? tone : 'blue'
  if (safeStepKey === 'diagnose') {
    return `/assets/path/stage-${safeStepKey}-${safeTone}-white-top.png`
  }

  return `/assets/path/stage-${safeStepKey}-${safeTone}.png`
}

function getStageIconPathByStatus(stepKey = '', tone = 'blue', status = 'locked') {
  const safeStepKey = STAGE_KEYS.includes(stepKey) ? stepKey : 'diagnose'
  const safeTone = ['red', 'yellow', 'blue'].includes(tone) ? tone : 'blue'

  if (status === 'locked') {
    return `/assets/path/v2/stage-${safeStepKey}-locked.png`
  }

  if (status === 'done') {
    return `/assets/path/v2/stage-${safeStepKey}-${safeTone}-done.png`
  }

  return `/assets/path/v2/stage-${safeStepKey}-${safeTone}-current.png`
}

function buildPointThemeStyle(pointId = 0) {
  const theme = getPointTheme(pointId)
  return [
    `background:linear-gradient(180deg, ${theme.cardBg} 0%, #ffffff 88%)`,
    `border-color:${theme.border}`,
    `box-shadow:0 10rpx 24rpx ${theme.shadow}`,
    `--point-accent:${theme.color}`,
    `--point-deep:${theme.deepColor || theme.color}`,
    `--point-card-bg:${theme.cardBg}`,
    `--point-expand-bg:${theme.expandBg}`,
    `--point-border:${theme.border}`,
    `--point-divider:${theme.divider}`,
    `--point-shadow:${theme.shadow}`,
    `--point-shadow-strong:${theme.shadowStrong}`,
  ].join(';')
}

function buildPointExpandStyle(pointId = 0) {
  const theme = getPointTheme(pointId)
  return `background:linear-gradient(180deg, ${theme.expandBg} 0%, #fbfcfe 100%)`
}

function buildStepUrl(stepKey = '', pointId = 0) {
  return buildStageUrl(stepKey, pointId, POINT_NAME_BY_ID[pointId] || '')
}

function buildMainPathSteps(pointId = 0) {
  return MAIN_PATH_STEPS.map((step, index) => ({
    id: `${step.key}-${pointId}-${index + 1}`,
    key: step.key,
    title: step.title,
    url: buildStepUrl(step.key, pointId),
  }))
}

function resolveCurrentStepIndex(progress = 0, stepCount = 0) {
  if (!stepCount) return 0

  const normalized = Math.max(0, Math.min(99, Number(progress || 0)))
  return Math.min(stepCount - 1, Math.floor(normalized / (100 / stepCount)))
}

function getPathLayoutPreset(windowWidth = 375) {
  if (windowWidth <= 360) return PATH_LAYOUT_PRESETS.compact
  if (windowWidth >= 768) return PATH_LAYOUT_PRESETS.wide
  return PATH_LAYOUT_PRESETS.standard
}

function buildPathLayoutData(layoutPreset = PATH_LAYOUT_PRESETS.standard) {
  return {
    key: layoutPreset.key,
    nodeWrapStyle: `width:${layoutPreset.nodeSize + 20}rpx;`,
    nodeStyle: `width:${layoutPreset.nodeSize}rpx; height:${layoutPreset.nodeSize}rpx;`,
    nodeTextStyle: `font-size:${layoutPreset.nodeTextSize}rpx;`,
  }
}

function buildDirectionalChromeStyles(layoutPreset = PATH_LAYOUT_PRESETS.standard, curveDirection = 1) {
  const bodyStyle = curveDirection === 1
    ? `padding-right:${layoutPreset.bodyRightPadding}rpx;`
    : `padding-left:${layoutPreset.bodyRightPadding}rpx;`
  const sideStyle = curveDirection === 1
    ? `right:${layoutPreset.ipRight}rpx;`
    : `left:${layoutPreset.ipRight}rpx;`

  return {
    bodyStyle,
    ipStyle: `top:${layoutPreset.ipTop}rpx; ${sideStyle} width:${layoutPreset.ipWidth}rpx; opacity:${layoutPreset.ipOpacity};`,
  }
}

function getDecoratedStepId(step = {}, index = 0) {
  return `${step.id || 'step'}-${index + 1}`
}

function resolveActiveStepIndex(rawSteps = [], activePromptStepId = '') {
  if (!activePromptStepId) {
    return -1
  }

  return rawSteps.findIndex((step, index) => getDecoratedStepId(step, index) === activePromptStepId)
}

function resolveMapHeight(stepCount = 0, layoutPreset = PATH_LAYOUT_PRESETS.standard, hasPromptSpace = false) {
  const pointLayouts = layoutPreset.pointLayoutsByCount[stepCount] || layoutPreset.pointLayoutsByCount[7] || []
  const lastPoint = pointLayouts.length ? pointLayouts[pointLayouts.length - 1] : { y: 0 }
  const visualNodeSize = Math.max(layoutPreset.nodeSize, PATH_MAP_VISUAL_NODE_SIZE_RPX)
  const extraGap = Math.max(0, pointLayouts.length - 1) * PATH_STEP_VERTICAL_EXTRA_GAP_RPX

  return lastPoint.y + extraGap + visualNodeSize + PATH_MAP_TOP_PADDING_RPX + PATH_MAP_BOTTOM_PADDING_RPX + (hasPromptSpace ? PROMPT_CARD_SPACE_RPX : 0)
}

function decoratePathSteps(rawSteps = [], sectionStatus = 'locked', currentStepIndex = 0, layoutPreset = PATH_LAYOUT_PRESETS.standard, curveDirection = 1, activePromptStepId = '') {
  const total = rawSteps.length
  const pointLayouts = layoutPreset.pointLayoutsByCount[total] || layoutPreset.pointLayoutsByCount[7] || []
  const topOffset = PATH_MAP_TOP_PADDING_RPX
  const activePromptStepIndex = resolveActiveStepIndex(rawSteps, activePromptStepId)

  return rawSteps.map((step, index) => {
    let status = 'locked'

    if (sectionStatus === 'done') {
      status = 'done'
    } else if (sectionStatus === 'current') {
      if (index < currentStepIndex) {
        status = 'done'
      } else if (index === currentStepIndex) {
        status = 'current'
      }
    }

    const point = pointLayouts[index] || { x: 0, y: index * PATH_VERTICAL_GAP_RPX }
    const offsetRpx = point.x * curveDirection
    const promptOffsetRpx = activePromptStepIndex >= 0 && index > activePromptStepIndex ? PROMPT_CARD_SPACE_RPX : 0
    const topRpx = topOffset + point.y + index * PATH_STEP_VERTICAL_EXTRA_GAP_RPX + promptOffsetRpx
    let layout = 'center'

    if (offsetRpx > 8) {
      layout = 'right'
    } else if (offsetRpx < -8) {
      layout = 'left'
    }

    return {
      ...step,
      id: getDecoratedStepId(step, index),
      index: index + 1,
      status,
      layout,
      positionStyle: `top:${topRpx}rpx; left:50%; margin-left:${offsetRpx}rpx;`,
      shortLabel: String(index + 1),
      isLast: index === rawSteps.length - 1,
    }
  })
}

function getPreviewCurrentStepIndex(pointId = 0, steps = []) {
  const list = Array.isArray(steps) ? steps : []
  if (!list.length) return 0

  const candidateIndexes = list.reduce((acc, step, index) => {
    if (step && step.key !== 'diagnose' && step.key !== 'report') {
      acc.push(index)
    }
    return acc
  }, [])

  if (!candidateIndexes.length) {
    return 0
  }

  return candidateIndexes[(pointId * 7 + 3) % candidateIndexes.length]
}

function buildPointPath(pointId, currentStepIndex = 0, curveDirection = 1, activePromptStepId = '') {
  const rawSteps = buildMainPathSteps(pointId)
  const hasPromptSpace = resolveActiveStepIndex(rawSteps, activePromptStepId) >= 0

  return {
    pathTitle: `${POINT_NAME_BY_ID[pointId]}瀛︿範璺緞`,
    pathSummary: '璇婃柇 鈫?鐞嗚 鈫?瀹炶 鈫?娴嬭瘯 鈫?鎶ュ憡 鈫?鍒烽',
    mapHeight: `${resolveMapHeight(rawSteps.length, PATH_LAYOUT_PRESETS.standard, hasPromptSpace) || PATH_MAP_HEIGHT_RPX}rpx`,
    steps: decoratePathSteps(rawSteps, 'current', currentStepIndex, PATH_LAYOUT_PRESETS.standard, curveDirection, activePromptStepId),
  }
}

function applyLayoutPresetToPath(path = {}, layoutPreset = PATH_LAYOUT_PRESETS.standard, sectionStatus = 'locked', currentStepIndex = 0, curveDirection = 1, activePromptStepId = '') {
  const rawSteps = (path.steps || []).map((step, index) => ({
    id: step.id || `step-${index + 1}`,
    key: step.key || '',
    title: step.title || '',
    iconPath: step.iconPath || '',
    url: step.url || '',
  }))
  const hasPromptSpace = resolveActiveStepIndex(rawSteps, activePromptStepId) >= 0

  return {
    ...path,
    mapHeight: `${resolveMapHeight(rawSteps.length, layoutPreset, hasPromptSpace)}rpx`,
    steps: decoratePathSteps(rawSteps, sectionStatus, currentStepIndex, layoutPreset, curveDirection, activePromptStepId),
  }
}

function buildStatusStageText(steps = [], currentStepIndex = 0) {
  const list = Array.isArray(steps) ? steps : []
  const currentStep = list[currentStepIndex]

  if (currentStep && currentStep.title) {
    return `当前在学：${currentStep.title}`
  }

  return ''
}

function buildPointStatusText(status = 'locked', currentTaskText = '', steps = [], currentStepIndex = 0) {
  if (status === 'done') {
    return '已学完'
  }

  if (status === 'current') {
    return currentTaskText || buildStatusStageText(steps, currentStepIndex)
  }

  return ''
}

function createPathNodes(homeProgress = DEFAULT_HOME_PROGRESS, expandedMap = {}, layoutPreset = PATH_LAYOUT_PRESETS.standard, activePromptStepId = '') {
  return [
    ...POINT_ORDER.map((pointId) => {
      const status = getPointStatus(pointId, homeProgress)
      const curveDirection = getPointCurveDirection(pointId)
      const theme = getPointTheme(pointId)
      const pointStageProgress = homeProgress.pointStageProgressMap && homeProgress.pointStageProgressMap[pointId]
        ? homeProgress.pointStageProgressMap[pointId]
        : null
      const currentStepIndex = pointStageProgress && Number.isFinite(Number(pointStageProgress.currentStepIndex)) && Number(pointStageProgress.currentStepIndex) >= 0
        ? Number(pointStageProgress.currentStepIndex)
        : getPreviewCurrentStepIndex(pointId, MAIN_PATH_STEPS)
      const path = buildPointPath(pointId, currentStepIndex, curveDirection, activePromptStepId)
      const section = applyLayoutPresetToPath(path, layoutPreset, status, currentStepIndex, curveDirection, activePromptStepId)
      const themedSteps = (section.steps || []).map((step) => ({
        ...step,
        status: pointStageProgress && pointStageProgress.stageStatusMap && pointStageProgress.stageStatusMap[step.key]
          ? pointStageProgress.stageStatusMap[step.key]
          : step.status,
        iconPath: getStageIconPathByStatus(
          step.key,
          theme.tone,
          pointStageProgress && pointStageProgress.stageStatusMap && pointStageProgress.stageStatusMap[step.key]
            ? pointStageProgress.stageStatusMap[step.key]
            : step.status,
        ),
        currentRingPath: (
          pointStageProgress && pointStageProgress.stageStatusMap && pointStageProgress.stageStatusMap[step.key]
            ? pointStageProgress.stageStatusMap[step.key]
            : step.status
        ) === 'current'
          ? '/assets/path/v2/stage-current-gray-ring.png'
          : '',
      }))
      const chromeStyles = buildDirectionalChromeStyles(layoutPreset, curveDirection)
      const currentTaskText = buildPointStatusText(
        status,
        pointStageProgress && pointStageProgress.currentTaskText ? pointStageProgress.currentTaskText : '',
        section.steps,
        currentStepIndex,
      )

      return {
        id: `point-${pointId}`,
        pointId,
        tone: theme.tone,
        title: POINT_NAME_BY_ID[pointId] || `卡点 ${pointId}`,
        status,
        currentTaskText,
        expanded: !!expandedMap[`point-${pointId}`],
        themeColor: theme.color,
        themeStyle: buildPointThemeStyle(pointId),
        themeExpandStyle: buildPointExpandStyle(pointId),
        bodyStyle: chromeStyles.bodyStyle,
        ipStyle: chromeStyles.ipStyle,
        ...section,
        steps: themedSteps,
      }
    }),
  ]
}

Page({
  data: {
    pathLayout: buildPathLayoutData(),
    pathNodes: createPathNodes(),
    hasPurchasedCourse: false,
    hasDiagnoseCourse: false,
    bukaMotion: {
      ...DEFAULT_BUKA_MOTION,
    },
    bukaSpeech: {
      ...DEFAULT_BUKA_SPEECH,
    },
    promptDialog: {
      ...DEFAULT_HOME_DIALOG,
    },
  },

  onLoad() {
    this.syncAccessFlags()
    this.updatePathLayout()
    this.syncCurrentTask()
    this.refreshHomeData()
  },

  onShow() {
    syncCustomTabBar(this, 'home')
    this.syncAccessFlags()
    this.updatePathLayout()
    this.syncCurrentTask()
    this.refreshHomeData()
  },

  onPageScroll() {
    if (this.data.promptDialog && this.data.promptDialog.visible) {
      this.closePromptDialog()
    }
  },

  handlePageTouchMove() {
    if (this.data.promptDialog && this.data.promptDialog.visible) {
      this.closePromptDialog()
    }
  },

  syncAccessFlags() {
    if (HOME_DEBUG_TEST_SCENARIO) {
      this.setData({
        hasPurchasedCourse: true,
        hasDiagnoseCourse: true,
      })
      return
    }

    const app = getApp()
    const globalData = (app && app.globalData) || {}
    const storedAccessSummary = wx.getStorageSync(HOME_ACCESS_SUMMARY_KEY) || {}
    const storedProgress = wx.getStorageSync(CURRENT_LEARNING_TASK_KEY) || {}
    const hasPurchasedCourseSnapshot = typeof storedAccessSummary.hasPurchasedCourse === 'boolean'
    const hasDiagnoseCourseSnapshot = typeof storedAccessSummary.hasDiagnoseCourse === 'boolean'

    this.setData({
      hasPurchasedCourse: hasPurchasedCourseSnapshot
        ? storedAccessSummary.hasPurchasedCourse
        : !!globalData.hasPracticeCourse,
      hasDiagnoseCourse: hasDiagnoseCourseSnapshot
        ? storedAccessSummary.hasDiagnoseCourse
        : !!(globalData.hasDiagnoseCourse || storedProgress.hasDiagnoseCourse),
    })
  },

  getHomeProgressForView() {
    if (HOME_DEBUG_TEST_SCENARIO) {
      return resolveHomeProgress(TEST_HOME_PROGRESS)
    }

    if (!this.data.hasPurchasedCourse) {
      return resolveHomeProgress()
    }

    return resolveHomeProgress(wx.getStorageSync(CURRENT_LEARNING_TASK_KEY) || {})
  },

  buildPathNodePayload(activePromptStepId = '') {
    const homeProgress = this.getHomeProgressForView()
    const focusPointId = Number(homeProgress.focusPointId) || Number(homeProgress.activePointId) || 0
    const expandedMap = ensureExpandedMapWithCurrent(getExpandedMap(this.data.pathNodes), focusPointId)
    const layoutPreset = getPathLayoutPreset((wx.getSystemInfoSync() || {}).windowWidth || 375)

    return {
      focusPointId,
      layoutPreset,
      pathNodes: createPathNodes(homeProgress, expandedMap, layoutPreset, activePromptStepId),
    }
  },

  syncCurrentTask() {
    const activePromptStepId = (this.data.promptDialog && this.data.promptDialog.stepId) || ''
    const payload = this.buildPathNodePayload(activePromptStepId)

    this.setData({
      pathNodes: payload.pathNodes,
    }, () => {
      this.scrollToCurrentPoint(payload.focusPointId)
    })
  },

  async refreshHomeData() {
    const app = getApp()

    if (HOME_DEBUG_TEST_SCENARIO) {
      const homeProgress = resolveHomeProgress(TEST_HOME_PROGRESS)
      const accessSummary = getTestAccessSummary()
      const activePromptStepId = (this.data.promptDialog && this.data.promptDialog.stepId) || ''
      const focusPointId = Number(homeProgress.focusPointId) || Number(homeProgress.activePointId) || 0
      const expandedMap = ensureExpandedMapWithCurrent(getExpandedMap(this.data.pathNodes), focusPointId)
      const layoutPreset = getPathLayoutPreset((wx.getSystemInfoSync() || {}).windowWidth || 375)

      if (app && app.globalData) {
        app.globalData.hasPracticeCourse = true
        app.globalData.hasDiagnoseCourse = true
      }

      wx.setStorageSync(HOME_ACCESS_SUMMARY_KEY, {
        ...accessSummary,
        updatedAt: Date.now(),
      })
      wx.setStorageSync(PRACTICE_COURSE_STORAGE_KEY, true)
      wx.setStorageSync(DIAGNOSE_COURSE_STORAGE_KEY, true)
      wx.setStorageSync(CURRENT_LEARNING_TASK_KEY, {
        ...homeProgress,
        hasPurchasedCourse: true,
        hasDiagnoseCourse: true,
      })

      this.setData({
        hasPurchasedCourse: true,
        hasDiagnoseCourse: true,
        pathNodes: createPathNodes(homeProgress, expandedMap, layoutPreset, activePromptStepId),
      }, () => {
        this.scrollToCurrentPoint(focusPointId)
      })
      return
    }

    try {
      const [accessSummary, profileResult, reviewOverview] = await Promise.all([
        fetchStudentAccessSummary(app).catch((error) => {
          console.warn('首页权限数据加载失败:', error && error.message ? error.message : error)
          return null
        }),
        fetchStudentProfile(app).catch((error) => {
          console.warn('首页课程数据加载失败:', error && error.message ? error.message : error)
          return { inProgress: [], completed: [] }
        }),
        fetchStudentReviewOverview(app).catch((error) => {
          console.warn('首页诊断数据加载失败:', error && error.message ? error.message : error)
          return null
        }),
      ])
      const profile = profileResult || { inProgress: [], completed: [] }
      const inProgress = Array.isArray(profile && profile.inProgress) ? profile.inProgress : []
      const completed = Array.isArray(profile && profile.completed) ? profile.completed : []
      const allCourses = [...inProgress, ...completed].map(toPointItem)
      const hasPurchasedCourse = accessSummary && typeof accessSummary.hasPurchasedCourse === 'boolean'
        ? accessSummary.hasPurchasedCourse
        : allCourses.length > 0
      const currentCourse = toPointItem(inProgress[0] || {})
      const hasDiagnoseCourse = accessSummary && typeof accessSummary.hasDiagnoseCourse === 'boolean'
        ? accessSummary.hasDiagnoseCourse
        : inferHasDiagnoseCourse(reviewOverview || {})
      const study = hasPurchasedCourse && currentCourse.id
        ? await fetchStudentStudyCourse(currentCourse.id, app).catch((error) => {
          console.warn('首页学习进度加载失败:', error && error.message ? error.message : error)
          return null
        })
        : null
      const homeProgress = buildHomeProgress({
        profile: hasPurchasedCourse ? profile : { inProgress: [], completed: [] },
        reviewOverview: hasDiagnoseCourse ? (reviewOverview || { targetExam: '已解锁诊断' }) : {},
        study,
      })
      const activePromptStepId = (this.data.promptDialog && this.data.promptDialog.stepId) || ''
      const focusPointId = Number(homeProgress.focusPointId) || Number(homeProgress.activePointId) || 0
      const expandedMap = ensureExpandedMapWithCurrent(getExpandedMap(this.data.pathNodes), focusPointId)
      const layoutPreset = getPathLayoutPreset((wx.getSystemInfoSync() || {}).windowWidth || 375)

      if (app && app.globalData) {
        app.globalData.hasPracticeCourse = hasPurchasedCourse
        app.globalData.hasDiagnoseCourse = hasDiagnoseCourse
      }

      wx.setStorageSync(HOME_ACCESS_SUMMARY_KEY, {
        ...(accessSummary || {}),
        hasPurchasedCourse,
        hasDiagnoseCourse,
        updatedAt: Date.now(),
      })
      wx.setStorageSync(PRACTICE_COURSE_STORAGE_KEY, hasPurchasedCourse)
      wx.setStorageSync(DIAGNOSE_COURSE_STORAGE_KEY, hasDiagnoseCourse)
      wx.setStorageSync(CURRENT_LEARNING_TASK_KEY, {
        ...homeProgress,
        hasPurchasedCourse,
        hasDiagnoseCourse,
      })

      this.setData({
        hasPurchasedCourse,
        hasDiagnoseCourse,
        pathNodes: createPathNodes(homeProgress, expandedMap, layoutPreset, activePromptStepId),
      }, () => {
        this.scrollToCurrentPoint(focusPointId)
      })
    } catch (error) {
      console.warn('首页数据加载失败:', error && error.message ? error.message : error)
    }
  },

  updatePathLayout() {
    const systemInfo = wx.getSystemInfoSync() || {}
    const layoutPreset = getPathLayoutPreset(systemInfo.windowWidth || 375)
    const homeProgress = this.getHomeProgressForView()
    const focusPointId = Number(homeProgress.focusPointId) || Number(homeProgress.activePointId) || 0
    const expandedMap = ensureExpandedMapWithCurrent(getExpandedMap(this.data.pathNodes), focusPointId)
    const activePromptStepId = (this.data.promptDialog && this.data.promptDialog.stepId) || ''

    this.setData({
      pathLayout: buildPathLayoutData(layoutPreset),
      pathNodes: createPathNodes(homeProgress, expandedMap, layoutPreset, activePromptStepId),
    })
  },

  scrollToCurrentPoint(pointId) {
    if (!pointId) return

    const query = this.createSelectorQuery()
    query.selectViewport().scrollOffset()
    query.select(`#path-node-${pointId}`).boundingClientRect()
    query.exec((res) => {
      const viewport = res && res[0] ? res[0] : {}
      const rect = res && res[1] ? res[1] : null

      if (!rect) return

      const scrollTop = Math.max(0, Number(viewport.scrollTop || 0) + rect.top - 20)
      wx.pageScrollTo({
        scrollTop,
        duration: 280,
      })
    })
  },

  handleNodeTap(e) {
    const { id } = e.currentTarget.dataset
    if (!id) return

    const nextNodes = this.data.pathNodes.map((item) => ({
      ...item,
      expanded: item.id === id ? !item.expanded : item.expanded,
    }))

    this.setData({
      pathNodes: nextNodes,
    })
  },

  handleBukaTap(e) {
    const pointId = Number(e.currentTarget.dataset.pointId) || 0
    if (!pointId) return

    if (this.bukaMotionTimer) {
      clearTimeout(this.bukaMotionTimer)
      this.bukaMotionTimer = null
    }
    if (this.bukaSpeechTimer) {
      clearTimeout(this.bukaSpeechTimer)
      this.bukaSpeechTimer = null
    }

    this.setData({
      bukaMotion: {
        pointId,
      },
      bukaSpeech: {
        visible: true,
        pointId,
        text: BUKA_TAP_SPEECH,
      },
    })

    this.bukaMotionTimer = setTimeout(() => {
      const currentMotion = this.data.bukaMotion || {}
      if (Number(currentMotion.pointId) !== pointId) {
        return
      }

      this.setData({
        bukaMotion: {
          ...DEFAULT_BUKA_MOTION,
        },
      })
      this.bukaMotionTimer = null
    }, 520)

    this.bukaSpeechTimer = setTimeout(() => {
      const currentSpeech = this.data.bukaSpeech || {}
      if (!currentSpeech.visible || Number(currentSpeech.pointId) !== pointId) {
        return
      }

      this.setData({
        bukaSpeech: {
          ...DEFAULT_BUKA_SPEECH,
        },
      })
      this.bukaSpeechTimer = null
    }, 2600)
  },

  handleKnowledgeTap(e) {
    const { pointId } = e.currentTarget.dataset
    if (!pointId) return

    this.closePromptDialog()
    wx.navigateTo({
      url: `/pages/point-knowledge/point-knowledge?pointId=${pointId}`,
    })
  },

  handleStepTap(e) {
    const {
      url,
      pointId,
      status,
      stepKey,
      stepId,
      stepTitle,
    } = e.currentTarget.dataset

    const clickedDiagnoseStep = isDiagnoseStep(stepKey)
    const homeProgress = this.getHomeProgressForView()
    const purchasedCurrentPoint = hasPurchasedPoint(pointId, homeProgress)

    if (clickedDiagnoseStep && !this.data.hasDiagnoseCourse) {
      this.openPromptDialog(buildDiagnoseUnlockDialog(stepId, stepTitle))
      return
    }

    if (status === 'done' || status === 'current') {
      if (!url) return
      this.closePromptDialog()
      wx.navigateTo({ url })
      return
    }

    if (status === 'locked' || status === 'pending') {
      if (purchasedCurrentPoint) {
        this.openPromptDialog(buildNotStartedDialog(stepId, stepTitle))
        return
      }

      if (clickedDiagnoseStep) {
        this.openPromptDialog(buildDiagnoseUnlockDialog(stepId, stepTitle))
        return
      }

      this.openPromptDialog(buildPointUnlockDialog(stepId, stepTitle, pointId, stepKey))
      return
    }

    this.openPromptDialog(buildNotStartedDialog(stepId, stepTitle))
  },

  openPromptDialog(config = {}) {
    const nextDialog = {
      ...DEFAULT_HOME_DIALOG,
      visible: true,
      cardStyle: 'opacity:0; pointer-events:none;',
      ...config,
    }
    const payload = this.buildPathNodePayload(nextDialog.stepId)

    this.setData({
      promptDialog: nextDialog,
      pathNodes: payload.pathNodes,
    }, () => {
      this.updatePromptCardPosition(nextDialog.stepId)
    })
  },

  updatePromptCardPosition(stepId = '') {
    if (!stepId) return

    const systemInfo = wx.getSystemInfoSync() || {}
    const windowWidth = Number(systemInfo.windowWidth || 375)
    const selector = `#path-step-${stepId}`

    this.createSelectorQuery()
      .select(selector)
      .boundingClientRect()
      .exec((res) => {
        const rect = res && res[0] ? res[0] : null
        if (!rect) return

        const cardMarginPx = 18
        const cardWidthPx = Math.min(windowWidth - cardMarginPx * 2, 325)
        const cardLeftPx = (windowWidth - cardWidthPx) / 2
        const nodeCenterX = Number(rect.left || 0) + Number(rect.width || 0) / 2
        const arrowLeftPx = Math.max(26, Math.min(cardWidthPx - 26, nodeCenterX - cardLeftPx))
        const cardTopPx = Number(rect.bottom || 0) + 14
        const cardStyle = [
          `top:${cardTopPx}px`,
          `left:${cardLeftPx}px`,
          `width:${cardWidthPx}px`,
          `--tip-arrow-left:${arrowLeftPx}px`,
          'opacity:1',
        ].join(';')

        this.setData({
          'promptDialog.cardStyle': cardStyle,
        })
      })
  },

  closePromptDialog() {
    const currentDialog = this.data.promptDialog || {}
    const currentSpeech = this.data.bukaSpeech || {}
    if (!currentDialog.visible && !currentDialog.stepId && !currentSpeech.visible) {
      return
    }

    if (this.bukaMotionTimer) {
      clearTimeout(this.bukaMotionTimer)
      this.bukaMotionTimer = null
    }
    if (this.bukaSpeechTimer) {
      clearTimeout(this.bukaSpeechTimer)
      this.bukaSpeechTimer = null
    }

    const payload = this.buildPathNodePayload('')

    this.setData({
      bukaMotion: {
        ...DEFAULT_BUKA_MOTION,
      },
      bukaSpeech: {
        ...DEFAULT_BUKA_SPEECH,
      },
      promptDialog: {
        ...DEFAULT_HOME_DIALOG,
      },
      pathNodes: payload.pathNodes,
    })
  },

  handlePromptAction() {
    const { actionUrl } = this.data.promptDialog
    this.closePromptDialog()

    if (!actionUrl) {
      return
    }

    wx.navigateTo({ url: actionUrl })
  },

  onHide() {
    if (this.bukaMotionTimer) {
      clearTimeout(this.bukaMotionTimer)
      this.bukaMotionTimer = null
    }
    if (this.bukaSpeechTimer) {
      clearTimeout(this.bukaSpeechTimer)
      this.bukaSpeechTimer = null
    }
  },

  onUnload() {
    if (this.bukaMotionTimer) {
      clearTimeout(this.bukaMotionTimer)
      this.bukaMotionTimer = null
    }
    if (this.bukaSpeechTimer) {
      clearTimeout(this.bukaSpeechTimer)
      this.bukaSpeechTimer = null
    }
  },

  noop() {},
})

