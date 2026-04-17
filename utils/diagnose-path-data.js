const PATH_MAP_HEIGHT_RPX = 660
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
    },
  },
}

const rawDiagnoseSteps = [
  {
    title: '预约诊断',
    note: '确认考试方向、目标分和当前问题',
    url: '/pkg-diagnose/pages/diagnose-detail/diagnose-detail',
  },
  {
    title: '填写信息',
    note: '补充基础信息与学习背景',
    url: '/pkg-diagnose/pages/diagnose-detail/diagnose-detail',
  },
  {
    title: '下载试卷',
    note: '领取诊断题并开始作答',
    url: '/pkg-diagnose/pages/diagnose-detail/diagnose-detail',
  },
  {
    title: '上传答案',
    note: '提交答案进入人工批改',
    url: '/pkg-diagnose/pages/diagnose-detail/diagnose-detail',
  },
  {
    title: '1v1诊断课',
    note: '老师拆解失分原因与后续路径',
    url: '/pkg-diagnose/pages/diagnose-report/diagnose-report',
  },
  {
    title: '查看报告',
    note: '生成专属诊断报告和建议',
    url: '/pkg-diagnose/pages/diagnose-report/diagnose-report',
  },
]

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
  const pointLayouts = layoutPreset.pointLayoutsByCount[total] || []
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

    const point = pointLayouts[index] || { x: 0, y: index * 92 }
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
      id: `${step.id || 'diagnose-step'}-${index + 1}`,
      index: index + 1,
      status,
      layout,
      positionStyle: `top:${topRpx}rpx; left:50%; margin-left:${offsetRpx}rpx;`,
      shortLabel: String(index + 1),
      isLast: index === rawSteps.length - 1,
    }
  })
}

function buildDiagnosePath(sectionStatus = 'current', layoutPreset = PATH_LAYOUT_PRESETS.standard) {
  return {
    pathTitle: '诊断课学习路径',
    pathSummary: `共 ${rawDiagnoseSteps.length} 步`,
    mapHeight: `${layoutPreset.mapHeight}rpx`,
    steps: decoratePathSteps(rawDiagnoseSteps, sectionStatus, 0, layoutPreset),
  }
}

function getDiagnosePathData(sectionStatus = 'current', windowWidth = 375) {
  const layoutPreset = getPathLayoutPreset(windowWidth)
  const diagnosePath = buildDiagnosePath(sectionStatus, layoutPreset)
  const statusTextMap = {
    done: '已完成',
    current: '进行中',
    locked: '待解锁',
  }

  return {
    pathSteps: diagnosePath.steps.map((item) => ({
      ...item,
      statusText: statusTextMap[item.status] || '待开始',
      actionText: '查看',
    })),
    summary: {
      title: diagnosePath.pathTitle,
      desc: '沿用首页诊断课学习路径，从预约诊断到查看报告完整推进。',
      totalText: diagnosePath.pathSummary,
    },
    diagnosePath,
    pathLayout: buildPathLayoutData(layoutPreset),
  }
}

module.exports = {
  buildDiagnosePath,
  buildPathLayoutData,
  getDiagnosePathData,
  getPathLayoutPreset,
}
