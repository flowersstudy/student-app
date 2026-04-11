const {
  PATH_SYSTEM_OVERVIEW,
  POINT_VERSION_PATHS,
  VERSION_META,
  getPointVersionData,
} = require('../../utils/card-paths')

const POINT_LEVEL_META = {
  1: { level: '底层卡点', levelClass: 'foundation' },
  2: { level: '底层卡点', levelClass: 'foundation' },
  3: { level: '专项卡点', levelClass: 'special' },
  4: { level: '专项卡点', levelClass: 'special' },
  5: { level: '专项卡点', levelClass: 'special' },
  6: { level: '专项卡点', levelClass: 'special' },
  7: { level: '专项卡点', levelClass: 'special' },
  8: { level: '专项卡点', levelClass: 'special' },
}

function buildOtherPoints(currentPointId) {
  return Object.keys(POINT_VERSION_PATHS)
    .map((key) => Number(key))
    .filter((pointId) => pointId !== currentPointId)
    .map((pointId) => {
      const pointData = getPointVersionData(pointId)
      const levelMeta = POINT_LEVEL_META[pointId] || { level: '卡点', levelClass: 'special' }
      return {
        pointId,
        pointName: pointData.pointName,
        ...levelMeta,
      }
    })
}

function buildVersionTabs(pointData, selectedVersionKey) {
  return Object.keys(VERSION_META).map((key) => {
    const meta = VERSION_META[key]
    const versionData = (pointData.versions || {})[key]
    const available = !!versionData && versionData.available !== false

    return {
      key,
      label: meta.shortLabel,
      fullLabel: meta.label,
      available,
      selected: key === selectedVersionKey,
    }
  })
}

function resolveVersionKey(pointData, preferredVersionKey = 'progressive') {
  const versionData = (pointData.versions || {})[preferredVersionKey]
  if (versionData && versionData.available !== false) {
    return preferredVersionKey
  }

  return Object.keys(VERSION_META).find((key) => {
    const current = (pointData.versions || {})[key]
    return current && current.available !== false
  }) || 'progressive'
}

function buildStageTabs(versionData, selectedStageKey) {
  if (!versionData || !versionData.stages) return []

  const resolvedStageKey = versionData.stages.some((item) => item.key === selectedStageKey)
    ? selectedStageKey
    : versionData.stages[0].key

  return versionData.stages.map((item) => ({
    key: item.key,
    label: item.label,
    selected: item.key === resolvedStageKey,
  }))
}

function getResolvedStage(versionData, preferredStageKey = '') {
  if (!versionData || !versionData.stages || versionData.stages.length === 0) {
    return null
  }

  return versionData.stages.find((item) => item.key === preferredStageKey) || versionData.stages[0]
}

function buildCurrentPath(pointData, versionKey, stageKey) {
  const versionMeta = VERSION_META[versionKey]
  const versionData = (pointData.versions || {})[versionKey] || {}
  const resolvedStage = getResolvedStage(versionData, stageKey)
  const pathSteps = resolvedStage ? resolvedStage.steps : (versionData.steps || [])

  return {
    currentVersionKey: versionKey,
    currentVersionMeta: {
      ...versionMeta,
      unavailableText: versionData.unavailableText || '',
    },
    currentStageKey: resolvedStage ? resolvedStage.key : '',
    currentStageLabel: resolvedStage ? resolvedStage.label : '',
    versionTabs: buildVersionTabs(pointData, versionKey),
    stageTabs: buildStageTabs(versionData, stageKey),
    pathSteps: pathSteps.map((item, index) => ({
      ...item,
      index: index + 1,
    })),
  }
}

Page({
  data: {
    pointId: 1,
    pointName: '游走式找点',
    hasPointContext: false,
    systemOverview: PATH_SYSTEM_OVERVIEW,
    versionTabs: [],
    stageTabs: [],
    currentVersionKey: 'progressive',
    currentVersionMeta: VERSION_META.progressive,
    currentStageKey: 'stage1',
    currentStageLabel: '一阶',
    pathSteps: [],
    previewHint: '当前页面是购买方案页，选择版本后会生成对应的真实学习路径。',
    otherPoints: [],
  },

  onLoad(options) {
    const pointId = parseInt(options.pointId || options.id, 10) || 1
    const hasPointContext = Boolean(options.pointId || options.id)
    const pointData = getPointVersionData(pointId)
    const currentVersionKey = resolveVersionKey(pointData, options.version || 'progressive')
    const currentPath = buildCurrentPath(pointData, currentVersionKey, options.stage || 'stage1')

    this.setData({
      pointId,
      pointName: pointData.pointName,
      hasPointContext,
      otherPoints: hasPointContext ? buildOtherPoints(pointId) : [],
      ...currentPath,
    })

    wx.setNavigationBarTitle({
      title: '购买方案',
    })
  },

  handleVersionChange(e) {
    const { key } = e.currentTarget.dataset
    const pointData = getPointVersionData(this.data.pointId)
    const versionData = (pointData.versions || {})[key]

    if (!versionData || versionData.available === false) {
      wx.showToast({
        title: (versionData && versionData.unavailableText) || '当前版本暂未开放',
        icon: 'none',
      })
      return
    }

    this.setData({
      ...buildCurrentPath(pointData, key, 'stage1'),
    })
  },

  handleStageChange(e) {
    const { key } = e.currentTarget.dataset
    const pointData = getPointVersionData(this.data.pointId)

    this.setData({
      ...buildCurrentPath(pointData, this.data.currentVersionKey, key),
    })
  },

  confirmPurchase() {
    const app = getApp()
    const {
      hasPointContext,
      pointId,
      currentVersionKey,
      currentVersionMeta,
    } = this.data

    if (app && app.globalData) {
      app.globalData.selectedPurchaseVersion = currentVersionKey
    }

    if (!hasPointContext) {
      wx.showToast({
        title: `已选择${currentVersionMeta.label}`,
        icon: 'success',
      })
      return
    }

    if (app && app.globalData) {
      app.globalData.isEnrolled = true
      app.globalData.pointVersionSelections = {
        ...(app.globalData.pointVersionSelections || {}),
        [pointId]: currentVersionKey,
      }
    }

    wx.showToast({
      title: `已选择${currentVersionMeta.label}`,
      icon: 'success',
      duration: 1200,
    })

    setTimeout(() => {
      wx.redirectTo({
        url: `/pages/progress/progress?id=${pointId}&version=${currentVersionKey}`,
      })
    }, 1200)
  },

  handleOtherPointTap(e) {
    const { pointId } = e.currentTarget.dataset
    if (!pointId) return

    wx.redirectTo({
      url: `/pages/purchase/purchase?pointId=${pointId}`,
    })
  },
})
