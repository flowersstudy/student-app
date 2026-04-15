const { fetchStudentProfile } = require('../../utils/student-api')
const { getPointVersionData } = require('../../utils/card-paths')
const { syncCustomTabBar } = require('../../utils/custom-tab-bar')

const CURRENT_LEARNING_TASK_KEY = 'current_learning_task'
const PATH_MAP_HEIGHT_RPX = 660
const PATH_VERTICAL_GAP_RPX = 92
const PATH_NODE_SIZE_RPX = 88
const PATH_LAYOUT_PRESETS = {
  compact: {
    key: 'compact',
    mapHeight: 620,
    nodeSize: 84,
    nodeTextSize: 22,
    bodyRightPadding: 84,
    ipTop: 206,
    ipRight: 4,
    ipWidth: 78,
    ipOpacity: 0.24,
    pointLayoutsByCount: {
      6: [
        { x: 0, y: 0 },
        { x: -14, y: 88 },
        { x: -62, y: 180 },
        { x: 30, y: 264 },
        { x: -58, y: 354 },
        { x: -12, y: 446 },
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
    mapHeight: PATH_MAP_HEIGHT_RPX,
    nodeSize: PATH_NODE_SIZE_RPX,
    nodeTextSize: 24,
    bodyRightPadding: 104,
    ipTop: 232,
    ipRight: 6,
    ipWidth: 102,
    ipOpacity: 0.26,
    pointLayoutsByCount: {
      6: [
        { x: 0, y: 0 },
        { x: -18, y: 96 },
        { x: -74, y: 194 },
        { x: 40, y: 286 },
        { x: -72, y: 382 },
        { x: -18, y: 478 },
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
    mapHeight: 700,
    nodeSize: 90,
    nodeTextSize: 22,
    bodyRightPadding: 102,
    ipTop: 244,
    ipRight: 10,
    ipWidth: 92,
    ipOpacity: 0.22,
    pointLayoutsByCount: {
      6: [
        { x: 0, y: 0 },
        { x: -12, y: 96 },
        { x: -58, y: 198 },
        { x: 34, y: 292 },
        { x: -56, y: 392 },
        { x: -10, y: 490 },
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
  pointName: '总结转述难',
  day: 'Day 1',
  taskLabel: '1v1共识课',
  progress: 0,
}

const POINT_ORDER = [1, 2, 5, 3, 4, 6, 7, 8]

const POINT_NAME_BY_ID = {
  1: '游走式找点',
  2: '总结转述难',
  3: '分析结构不清',
  4: '公文结构不清',
  5: '对策推导难',
  6: '作文立意不准',
  7: '作文逻辑不清',
  8: '作文表达不畅',
}

const POINT_NAME_ALIASES = {
  游走式找点: 1,
  总结转述难: 2,
  提炼转述错误: 2,
  分析结构不清: 3,
  分析结构错误: 3,
  公文结构不清: 4,
  公文结构错误: 4,
  对策推导难: 5,
  对策推导错误: 5,
  作文立意不准: 6,
  作文立意错误: 6,
  作文逻辑不清: 7,
  作文逻辑不清晰: 7,
  作文表达不畅: 8,
  作文表达不流畅: 8,
}

function getPointIdByName(pointName = '') {
  return Number(POINT_NAME_ALIASES[pointName] || DEFAULT_CURRENT_TASK.pointId)
}

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

function hasDiagnoseCourse() {
  const app = getApp()
  const globalData = (app && app.globalData) || {}
  const userProfile = globalData.userProfile || {}
  return globalData.hasDiagnoseCourse === true || !!userProfile.phone
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

function pickVersionData(pointData = {}) {
  const versions = pointData.versions || {}

  if (versions.progressive && versions.progressive.available !== false) {
    return {
      key: 'progressive',
      label: '循序渐进',
      data: versions.progressive,
    }
  }

  const fallbackKey = Object.keys(versions).find((key) => versions[key] && versions[key].available !== false)

  if (!fallbackKey) {
    return {
      key: 'progressive',
      label: '学习路径',
      data: { steps: [] },
    }
  }

  return {
    key: fallbackKey,
    label: fallbackKey === 'fast' ? '极速提升' : fallbackKey === 'premium' ? '尊享路径' : '学习路径',
    data: versions[fallbackKey],
  }
}

function resolveTaskUrl(stepTitle = '', pointId = 0) {
  if (/测试|模考/.test(stepTitle)) {
    return '/pages/lesson-exam/lesson-exam'
  }

  if (/训练|刷题/.test(stepTitle)) {
    return `/pages/lesson-drill/lesson-drill?pointId=${pointId}`
  }

  if (/讲义/.test(stepTitle)) {
    return '/pages/lesson-recorded/lesson-recorded'
  }

  if (/纠偏/.test(stepTitle)) {
    return '/pages/lesson-correct/lesson-correct'
  }

  if (/理论/.test(stepTitle)) {
    return '/pages/lesson-recorded/lesson-recorded'
  }

  return `/pages/progress/progress?id=${pointId}`
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
    bodyStyle: `padding-right:${layoutPreset.bodyRightPadding}rpx;`,
    ipStyle: `top:${layoutPreset.ipTop}rpx; right:${layoutPreset.ipRight}rpx; width:${layoutPreset.ipWidth}rpx; opacity:${layoutPreset.ipOpacity};`,
    nodeWrapStyle: `width:${layoutPreset.nodeSize}rpx;`,
    nodeStyle: `width:${layoutPreset.nodeSize}rpx; height:${layoutPreset.nodeSize}rpx;`,
    nodeTextStyle: `font-size:${layoutPreset.nodeTextSize}rpx;`,
  }
}

function decoratePathSteps(rawSteps = [], sectionStatus = 'locked', currentStepIndex = 0, layoutPreset = PATH_LAYOUT_PRESETS.standard) {
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
    const offsetRpx = point.x
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

function buildDiagnosePath(sectionStatus = 'current') {
  const rawSteps = [
    {
      title: '预约诊断',
      note: '确认考试方向、目标分和当前问题',
      url: '/pages/diagnose-detail/diagnose-detail',
    },
    {
      title: '填写信息',
      note: '补充基础信息与学习背景',
      url: '/pages/diagnose/diagnose',
    },
    {
      title: '下载试卷',
      note: '领取诊断题并开始作答',
      url: '/pages/diagnose/diagnose',
    },
    {
      title: '上传答案',
      note: '提交答案进入人工批改',
      url: '/pages/diagnose/diagnose',
    },
    {
      title: '1v1诊断课',
      note: '老师拆解失分原因与后续路径',
      url: '/pages/diagnose-report/diagnose-report',
    },
    {
      title: '查看报告',
      note: '生成专属诊断报告和建议',
      url: '/pages/diagnose-report/diagnose-report',
    },
  ]

  return {
    pathTitle: '诊断课学习路径',
    pathSummary: `共 ${rawSteps.length} 步`,
    mapHeight: `${PATH_MAP_HEIGHT_RPX}rpx`,
    steps: decoratePathSteps(rawSteps, sectionStatus, sectionStatus === 'current' ? 0 : 0),
  }
}

function buildPointPath(pointId, sectionStatus = 'locked', currentProgress = 0) {
  const pointData = getPointVersionData(pointId)
  const version = pickVersionData(pointData)
  const rawSteps = []

  if (version.data && Array.isArray(version.data.stages)) {
    version.data.stages.forEach((stage) => {
      const stageLabel = stage.label || '阶段学习'
      ;(stage.steps || []).forEach((step, index) => {
        rawSteps.push({
          id: `${stage.key || 'stage'}-${index + 1}`,
          title: step.title || `步骤 ${index + 1}`,
          note: step.note || `${version.label} · ${stageLabel}`,
          url: resolveTaskUrl(step.title || '', pointId),
        })
      })
    })
  } else {
    ;((version.data && version.data.steps) || []).forEach((step, index) => {
      rawSteps.push({
        id: `${version.key}-${index + 1}`,
        title: step.title || `步骤 ${index + 1}`,
        note: step.note || `${version.label} · 核心路径`,
        url: resolveTaskUrl(step.title || '', pointId),
      })
    })
  }

  const currentStepIndex = sectionStatus === 'current'
    ? resolveCurrentStepIndex(currentProgress, rawSteps.length)
    : 0

  return {
    pathTitle: `${POINT_NAME_BY_ID[pointId]}学习路径`,
    pathSummary: `${version.label} · 共 ${rawSteps.length} 步`,
    mapHeight: `${PATH_MAP_HEIGHT_RPX}rpx`,
    steps: decoratePathSteps(rawSteps, sectionStatus, currentStepIndex),
  }
}

function applyLayoutPresetToPath(path = {}, layoutPreset = PATH_LAYOUT_PRESETS.standard, sectionStatus = 'locked', currentStepIndex = 0) {
  const rawSteps = (path.steps || []).map((step, index) => ({
    id: step.id || `step-${index + 1}`,
    title: step.title || '',
    note: step.note || '',
    url: step.url || '',
  }))

  return {
    ...path,
    mapHeight: `${layoutPreset.mapHeight}rpx`,
    steps: decoratePathSteps(rawSteps, sectionStatus, currentStepIndex, layoutPreset),
  }
}

function createPathNodes(currentTask = DEFAULT_CURRENT_TASK, expandedMap = {}, layoutPreset = PATH_LAYOUT_PRESETS.standard) {
  const currentPointId = Number(currentTask.pointId) || DEFAULT_CURRENT_TASK.pointId
  const currentProgress = Number(currentTask.progress || 0)
  const diagnoseStatus = hasDiagnoseCourse() ? 'done' : 'current'
  const diagnosePath = buildDiagnosePath(diagnoseStatus)
  const diagnoseSection = applyLayoutPresetToPath(diagnosePath, layoutPreset, diagnoseStatus, 0)

  return [
    {
      id: 'diagnose',
      pointId: 0,
      title: '诊断',
      status: diagnoseStatus,
      note: diagnoseStatus === 'done' ? '已完成' : '待诊断',
      expanded: !!expandedMap.diagnose,
      ...diagnoseSection,
    },
    ...POINT_ORDER.map((pointId) => {
      const status = getPointStatus(pointId, currentPointId)
      const path = buildPointPath(pointId, status, pointId === currentPointId ? currentProgress : 0)
      const currentStepIndex = status === 'current'
        ? resolveCurrentStepIndex(pointId === currentPointId ? currentProgress : 0, (path.steps || []).length)
        : 0
      const section = applyLayoutPresetToPath(path, layoutPreset, status, currentStepIndex)

      return {
        id: `point-${pointId}`,
        pointId,
        title: POINT_NAME_BY_ID[pointId] || `卡点 ${pointId}`,
        status,
        note: getSectionNoteByStatus(status),
        expanded: !!expandedMap[`point-${pointId}`],
        ...section,
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
    const expandedMap = getExpandedMap(this.data.pathNodes)
    const layoutPreset = getPathLayoutPreset((wx.getSystemInfoSync() || {}).windowWidth || 375)

    this.setData({
      pathNodes: createPathNodes(currentTask, expandedMap, layoutPreset),
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
      const expandedMap = getExpandedMap(this.data.pathNodes)
      const layoutPreset = getPathLayoutPreset((wx.getSystemInfoSync() || {}).windowWidth || 375)

      app.globalData.hasPracticeCourse = allCourses.length > 0
      wx.setStorageSync(CURRENT_LEARNING_TASK_KEY, currentTask)

      this.setData({
        pathNodes: createPathNodes(currentTask, expandedMap, layoutPreset),
      })
    } catch (error) {
      console.warn('首页数据加载失败:', error && error.message ? error.message : error)
    }
  },

  updatePathLayout() {
    const systemInfo = wx.getSystemInfoSync() || {}
    const layoutPreset = getPathLayoutPreset(systemInfo.windowWidth || 375)
    const currentTask = resolveCurrentTask(wx.getStorageSync(CURRENT_LEARNING_TASK_KEY) || {})
    const expandedMap = getExpandedMap(this.data.pathNodes)

    this.setData({
      pathLayout: buildPathLayoutData(layoutPreset),
      pathNodes: createPathNodes(currentTask, expandedMap, layoutPreset),
    })
  },

  handleNodeTap(e) {
    const { id } = e.currentTarget.dataset
    if (!id) return

    const nextNodes = this.data.pathNodes.map((item) => ({
      ...item,
      expanded: item.id === id ? !item.expanded : false,
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
