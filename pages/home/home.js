const { fetchStudentProfile } = require('../../utils/student-api')
const { syncCustomTabBar } = require('../../utils/custom-tab-bar')
const { buildStageUrl } = require('../../utils/path-stage-routes')

const CURRENT_LEARNING_TASK_KEY = 'current_learning_task'
const STAGE_KEYS = ['diagnose', 'theory', 'training', 'exam', 'drill', 'report']
const PATH_MAP_HEIGHT_RPX = 900
const PATH_VERTICAL_GAP_RPX = 92
const PATH_NODE_SIZE_RPX = 108
const PATH_LAYOUT_PRESETS = {
  compact: {
    key: 'compact',
    mapHeight: 850,
    nodeSize: 108,
    nodeTextSize: 22,
    bodyRightPadding: 96,
    ipTop: 292,
    ipRight: 0,
    ipWidth: 112,
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
    ipWidth: 136,
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
    ipWidth: 150,
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
    color: '#EA5A52',
    cardBg: '#FFF4F3',
    expandBg: '#FFF9F8',
    border: '#FFD5D4',
    divider: '#FFD9D8',
    shadow: 'rgba(255, 94, 91, 0.12)',
    shadowStrong: 'rgba(255, 94, 91, 0.16)',
  },
  2: {
    tone: 'red',
    color: '#EA5A52',
    cardBg: '#FFF4F3',
    expandBg: '#FFF9F8',
    border: '#FFD5D4',
    divider: '#FFD9D8',
    shadow: 'rgba(255, 94, 91, 0.12)',
    shadowStrong: 'rgba(255, 94, 91, 0.16)',
  },
  3: {
    tone: 'yellow',
    color: '#FFC94A',
    cardBg: '#FFF9EC',
    expandBg: '#FFFDF6',
    border: '#FFE4A0',
    divider: '#FFE9B8',
    shadow: 'rgba(255, 201, 74, 0.14)',
    shadowStrong: 'rgba(255, 201, 74, 0.18)',
  },
  4: {
    tone: 'yellow',
    color: '#FFC94A',
    cardBg: '#FFF9EC',
    expandBg: '#FFFDF6',
    border: '#FFE4A0',
    divider: '#FFE9B8',
    shadow: 'rgba(255, 201, 74, 0.14)',
    shadowStrong: 'rgba(255, 201, 74, 0.18)',
  },
  5: {
    tone: 'yellow',
    color: '#FFC94A',
    cardBg: '#FFF9EC',
    expandBg: '#FFFDF6',
    border: '#FFE4A0',
    divider: '#FFE9B8',
    shadow: 'rgba(255, 201, 74, 0.14)',
    shadowStrong: 'rgba(255, 201, 74, 0.18)',
  },
  6: {
    tone: 'blue',
    color: '#46AFFF',
    cardBg: '#F2F8FF',
    expandBg: '#F8FBFF',
    border: '#CBE7FF',
    divider: '#D9EEFF',
    shadow: 'rgba(70, 175, 255, 0.14)',
    shadowStrong: 'rgba(70, 175, 255, 0.18)',
  },
  7: {
    tone: 'blue',
    color: '#46AFFF',
    cardBg: '#F2F8FF',
    expandBg: '#F8FBFF',
    border: '#CBE7FF',
    divider: '#D9EEFF',
    shadow: 'rgba(70, 175, 255, 0.14)',
    shadowStrong: 'rgba(70, 175, 255, 0.18)',
  },
  8: {
    tone: 'blue',
    color: '#46AFFF',
    cardBg: '#F2F8FF',
    expandBg: '#F8FBFF',
    border: '#CBE7FF',
    divider: '#D9EEFF',
    shadow: 'rgba(70, 175, 255, 0.14)',
    shadowStrong: 'rgba(70, 175, 255, 0.18)',
  },
}

const POINT_NAME_ALIASES = {
  要点不全不准: 1,
  游走式找点: 1,
  提炼转述困难: 2,
  总结转述难: 2,
  提炼转述错误: 2,
  分析结构不清: 3,
  分析结构错误: 3,
  公文结构不清: 4,
  公文结构错误: 4,
  对策推导困难: 5,
  对策推导难: 5,
  对策推导错误: 5,
  作文立意不准: 6,
  作文立意错误: 6,
  作文论证不清: 7,
  作文逻辑不清: 7,
  作文逻辑不稳: 7,
  作文逻辑不清晰: 7,
  作文表达不畅: 8,
  作文表达不流畅: 8,
}

function getPointIdByName(pointName = '') {
  return Number(POINT_NAME_ALIASES[pointName] || DEFAULT_CURRENT_TASK.pointId)
}

const MAIN_PATH_STEPS = [
  {
    key: 'diagnose',
    title: '诊断',
    note: '诊断群 / 电话沟通 / 诊断试卷 / 听解析课 / 1v1诊断课 / 报告',
  },
  {
    key: 'theory',
    title: '理论',
    note: '1v1共识 / 理论课 / 1v1纠偏',
  },
  {
    key: 'training',
    title: '实训',
    note: '实训练习与提交',
  },
  {
    key: 'exam',
    title: '考试',
    note: '倒计时 / 题目 / 卡点报告 / 课堂反馈',
  },
  {
    key: 'drill',
    title: '刷题',
    note: '倒计时 / 题目 / 课堂反馈',
  },
  {
    key: 'report',
    title: '报告',
    note: '查看刷题报告',
  },
]

function toPointItem(course = {}) {
  return {
    id: Number(course.course_id || course.courseId || course.id || 0),
    name: course.name || '',
    subject: course.subject || '',
    progress: Number(course.progress || 0),
    status: course.status || '',
  }
}

function buildCurrentTaskFromCourse(course = {}) {
  const pointName = course.name || DEFAULT_CURRENT_TASK.pointName
  const pointId = getPointIdByName(pointName)
  const progress = Number(course.progress || 0)
  let day = 'Day 1'
  let taskLabel = '1v1共识课'

  if (progress >= 80) {
    day = 'Day 7'
    taskLabel = '阶段复盘'
  } else if (progress >= 55) {
    day = 'Day 5'
    taskLabel = '刷题训练'
  } else if (progress >= 30) {
    day = 'Day 3'
    taskLabel = '1v1纠偏课'
  }

  return {
    pointId,
    pointName,
    day,
    taskLabel,
    progress,
  }
}

function resolveCurrentTask(taskState = {}) {
  const pointId = Number(taskState.pointId) || getPointIdByName(taskState.pointName)

  return {
    pointId,
    pointName: taskState.pointName || POINT_NAME_BY_ID[pointId] || DEFAULT_CURRENT_TASK.pointName,
    day: taskState.day || DEFAULT_CURRENT_TASK.day,
    taskLabel: taskState.taskLabel || DEFAULT_CURRENT_TASK.taskLabel,
    progress: Number(taskState.progress || 0),
  }
}

function getSectionNoteByStatus(status = '') {
  if (status === 'done') return '已完成'
  if (status === 'current') return '当前学习'
  if (status === 'locked') return '待解锁'
  return '可查看'
}

function getPointStatus(pointId, currentPointId) {
  const pointIndex = POINT_ORDER.indexOf(pointId)
  const currentIndex = POINT_ORDER.indexOf(currentPointId)

  if (pointIndex === -1 || currentIndex === -1) {
    return 'locked'
  }

  if (pointIndex < currentIndex) {
    return 'done'
  }

  if (pointIndex === currentIndex) {
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
    cardBg: '#F7F8FA',
    expandBg: '#FBFCFE',
    border: '#E6EBF2',
    divider: '#EEF2F6',
    shadow: 'rgba(29, 45, 74, 0.06)',
    shadowStrong: 'rgba(29, 45, 74, 0.08)',
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

function buildPointThemeStyle(pointId = 0) {
  const theme = getPointTheme(pointId)
  return [
    `background:linear-gradient(180deg, ${theme.cardBg} 0%, #ffffff 88%)`,
    `border-color:${theme.border}`,
    `box-shadow:0 10rpx 24rpx ${theme.shadow}`,
    `--point-accent:${theme.color}`,
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
    note: step.note,
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

function decoratePathSteps(rawSteps = [], sectionStatus = 'locked', currentStepIndex = 0, layoutPreset = PATH_LAYOUT_PRESETS.standard, curveDirection = 1) {
  const total = rawSteps.length
  const pointLayouts = layoutPreset.pointLayoutsByCount[total] || layoutPreset.pointLayoutsByCount[7] || []
  const contentHeight = pointLayouts.length
    ? pointLayouts[pointLayouts.length - 1].y + layoutPreset.nodeSize
    : layoutPreset.nodeSize
  const topOffset = Math.max(0, Math.floor((layoutPreset.mapHeight - contentHeight) / 2))

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
    const topRpx = topOffset + point.y
    let layout = 'center'

    if (offsetRpx > 8) {
      layout = 'right'
    } else if (offsetRpx < -8) {
      layout = 'left'
    }

    return {
      ...step,
      id: `${step.id || 'step'}-${index + 1}`,
      index: index + 1,
      status,
      layout,
      positionStyle: `top:${topRpx}rpx; left:50%; margin-left:${offsetRpx}rpx;`,
      shortLabel: String(index + 1),
      isLast: index === rawSteps.length - 1,
    }
  })
}

function buildPointPath(pointId, sectionStatus = 'locked', currentProgress = 0, curveDirection = 1) {
  const rawSteps = buildMainPathSteps(pointId)

  const currentStepIndex = sectionStatus === 'current'
    ? resolveCurrentStepIndex(currentProgress, rawSteps.length)
    : 0

  return {
    pathTitle: `${POINT_NAME_BY_ID[pointId]}学习路径`,
    pathSummary: '诊断 → 理论 → 实训 → 考试 → 刷题 → 报告',
    mapHeight: `${PATH_MAP_HEIGHT_RPX}rpx`,
    steps: decoratePathSteps(rawSteps, sectionStatus, currentStepIndex, PATH_LAYOUT_PRESETS.standard, curveDirection),
  }
}

function applyLayoutPresetToPath(path = {}, layoutPreset = PATH_LAYOUT_PRESETS.standard, sectionStatus = 'locked', currentStepIndex = 0, curveDirection = 1) {
  const rawSteps = (path.steps || []).map((step, index) => ({
    id: step.id || `step-${index + 1}`,
    key: step.key || '',
    title: step.title || '',
    note: step.note || '',
    iconPath: step.iconPath || '',
    url: step.url || '',
  }))

  return {
    ...path,
    mapHeight: `${layoutPreset.mapHeight}rpx`,
    steps: decoratePathSteps(rawSteps, sectionStatus, currentStepIndex, layoutPreset, curveDirection),
  }
}

function createPathNodes(currentTask = DEFAULT_CURRENT_TASK, expandedMap = {}, layoutPreset = PATH_LAYOUT_PRESETS.standard) {
  const currentPointId = Number(currentTask.pointId) || DEFAULT_CURRENT_TASK.pointId
  const currentProgress = Number(currentTask.progress || 0)

  return [
    ...POINT_ORDER.map((pointId) => {
      const status = getPointStatus(pointId, currentPointId)
      const curveDirection = getPointCurveDirection(pointId)
      const theme = getPointTheme(pointId)
      const path = buildPointPath(pointId, status, pointId === currentPointId ? currentProgress : 0, curveDirection)
      const currentStepIndex = status === 'current'
        ? resolveCurrentStepIndex(pointId === currentPointId ? currentProgress : 0, (path.steps || []).length)
        : 0
      const section = applyLayoutPresetToPath(path, layoutPreset, status, currentStepIndex, curveDirection)
      const themedSteps = (section.steps || []).map((step) => ({
        ...step,
        iconPath: getStageIconPath(step.key, theme.tone),
      }))
      const chromeStyles = buildDirectionalChromeStyles(layoutPreset, curveDirection)
      const currentTaskText = status === 'current' && section.steps[currentStepIndex]
        ? section.steps[currentStepIndex].title
        : ''

      return {
        id: `point-${pointId}`,
        pointId,
        tone: theme.tone,
        title: POINT_NAME_BY_ID[pointId] || `卡点 ${pointId}`,
        status,
        note: getSectionNoteByStatus(status),
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
  },

  onLoad() {
    this.updatePathLayout()
    this.syncCurrentTask()
    this.refreshHomeData()
  },

  onShow() {
    syncCustomTabBar(this, 'home')
    this.updatePathLayout()
    this.syncCurrentTask()
    this.refreshHomeData()
  },

  syncCurrentTask() {
    const savedTask = wx.getStorageSync(CURRENT_LEARNING_TASK_KEY) || {}
    const currentTask = resolveCurrentTask(savedTask)
    const currentPointId = Number(currentTask.pointId) || DEFAULT_CURRENT_TASK.pointId
    const expandedMap = ensureExpandedMapWithCurrent(getExpandedMap(this.data.pathNodes), currentPointId)
    const layoutPreset = getPathLayoutPreset((wx.getSystemInfoSync() || {}).windowWidth || 375)

    this.setData({
      pathNodes: createPathNodes(currentTask, expandedMap, layoutPreset),
    }, () => {
      this.scrollToCurrentPoint(currentPointId)
    })
  },

  async refreshHomeData() {
    const app = getApp()

    try {
      const profile = await fetchStudentProfile(app)
      const inProgress = Array.isArray(profile && profile.inProgress) ? profile.inProgress : []
      const completed = Array.isArray(profile && profile.completed) ? profile.completed : []
      const allCourses = [...inProgress, ...completed].map(toPointItem)

      if (!allCourses.length) {
        return
      }

      const currentCourse = toPointItem(inProgress[0] || completed[completed.length - 1] || allCourses[0])
      const currentTask = buildCurrentTaskFromCourse(currentCourse)
      const currentPointId = Number(currentTask.pointId) || DEFAULT_CURRENT_TASK.pointId
      const expandedMap = ensureExpandedMapWithCurrent(getExpandedMap(this.data.pathNodes), currentPointId)
      const layoutPreset = getPathLayoutPreset((wx.getSystemInfoSync() || {}).windowWidth || 375)

      app.globalData.hasPracticeCourse = allCourses.length > 0
      wx.setStorageSync(CURRENT_LEARNING_TASK_KEY, currentTask)

      this.setData({
        pathNodes: createPathNodes(currentTask, expandedMap, layoutPreset),
      }, () => {
        this.scrollToCurrentPoint(currentPointId)
      })
    } catch (error) {
      console.warn('首页数据加载失败:', error && error.message ? error.message : error)
    }
  },

  updatePathLayout() {
    const systemInfo = wx.getSystemInfoSync() || {}
    const layoutPreset = getPathLayoutPreset(systemInfo.windowWidth || 375)
    const currentTask = resolveCurrentTask(wx.getStorageSync(CURRENT_LEARNING_TASK_KEY) || {})
    const currentPointId = Number(currentTask.pointId) || DEFAULT_CURRENT_TASK.pointId
    const expandedMap = ensureExpandedMapWithCurrent(getExpandedMap(this.data.pathNodes), currentPointId)

    this.setData({
      pathLayout: buildPathLayoutData(layoutPreset),
      pathNodes: createPathNodes(currentTask, expandedMap, layoutPreset),
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

  handleStepTap(e) {
    const { url } = e.currentTarget.dataset
    if (!url) return

    wx.navigateTo({ url })
  },
})
