const {
  PATH_SYSTEM_OVERVIEW,
  POINT_VERSION_PATHS,
  VERSION_META,
  getPointVersionData,
} = require('../../utils/card-paths')
const {
  diagnoseCouponContent,
  readDiagnoseCouponState,
  writeDiagnoseCouponState,
  isDiagnoseCouponExpired,
  formatCouponCountdown,
} = require('../../utils/diagnose-coupon')

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

const DIAGNOSE_PURCHASE_META = {
  heroTitle: '先找到失分病因，再决定怎么提分',
  heroSubtitle: '这不是先上系统课，而是先通过 1v1 人工诊断，查清你到底卡在理解、结构还是表达。',
  heroPoints: [
    '先判断真正拖分的核心病因',
    '先确定最该优先突破的卡点',
    '先拿到后续提分方向',
  ],
  clarifyRows: [
    {
      label: '这是什么',
      value: '这不是直接上一节系统课，而是 1 次 1v1 人工病因排查，先判断你真正为什么丢分。',
    },
    {
      label: '购买后怎么进行',
      value: '支付后 → 提交信息 / 老师联系 → 拆解病因 → 输出书面诊断报告。',
    },
  ],
  sampleCauseTitle: '老师会重点帮你排查这些失分病因',
  sampleCauses: [
    {
      tier: 'high',
      tierText: '优先排查',
      name: '总结转述失真',
      desc: '不是看不懂材料，而是写出来时容易照抄原文，抓不到真正该概括的核心信息。',
    },
    {
      tier: 'mid',
      tierText: '重点判断',
      name: '分析结构不清',
      desc: '表面上是答案没层次，背后往往是分析框架没建立，导致观点和论证关系散掉。',
    },
    {
      tier: 'follow',
      tierText: '持续跟进',
      name: '作文逻辑不稳',
      desc: '不是不会写，而是段落推进和总分结构不稳，写到后面容易发散。',
    },
  ],
  benefitTitle: '这次诊断，重点先帮你查清三件事',
  benefitList: [
    '你为什么总在同一类问题上反复丢分',
    '当前最该优先突破的核心卡点是什么',
    '后续应该按什么顺序继续提分',
  ],
  evidenceTitle: '老师会拿什么依据帮你判断病因',
  evidenceRows: [
    { label: '判断方式', value: '老师人工拆解 + 失分分析 + 1v1 沟通确认' },
    { label: '重点输出', value: '失分依据、核心病因、优先级、后续学习建议' },
    { label: '最终交付', value: '一份可以直接指导后续学习的书面诊断报告' },
  ],
  factTitle: '这份诊断不是泛泛建议',
  factList: [
    {
      value: '8',
      label: '核心卡点',
      desc: '围绕申论提分主线拆出 8 个关键卡点，用来定位真正拖分的位置。',
    },
    {
      value: '23',
      label: '学习路径',
      desc: '按卡点继续往下拆，形成更具体的学习路径，而不是只给模糊建议。',
    },
    {
      value: '12',
      label: '干预动作',
      desc: '根据不同问题设计对应动作，让诊断结果能落到后续安排里。',
    },
  ],
  processTitle: '买完后，病因会怎么一步步被找出来',
  processList: [
    {
      title: '人工拆解失分原因',
      desc: '结合答题表现、目标分数和备考周期，先判断真正拖分的根因。',
    },
    {
      title: '1v1 沟通确认病因',
      desc: '老师会围绕你的情况继续追问，确认问题到底卡在理解、结构还是表达。',
    },
    {
      title: '书面诊断报告',
      desc: '最终会给出病因结论、优先级排序和后续学习建议，而不是泛泛而谈。',
    },
  ],
  audienceTitle: '这些情况，更适合先来找病因',
  audienceList: [
    '刷了很多题，但一直不知道问题到底出在哪',
    '想先看清失分病因，再决定后续怎么学',
    '希望拿到一份能直接指导后续学习的诊断报告',
  ],
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

function buildDiagnosePurchaseState(now = Date.now()) {
  const couponState = readDiagnoseCouponState()
  const couponActive = !!(
    couponState
    && couponState.claimed !== true
    && !isDiagnoseCouponExpired(couponState, now)
  )

  return {
    couponActive,
    couponRemainingText: couponActive ? formatCouponCountdown(couponState.expiresAt - now) : '00:00',
    currentPrice: couponActive ? diagnoseCouponContent.price : diagnoseCouponContent.originalPrice,
    originalPrice: diagnoseCouponContent.originalPrice,
    saveText: couponActive ? diagnoseCouponContent.saveText : '限时优惠已结束',
  }
}

Page({
  data: {
    diagnoseMode: false,
    pointId: 1,
    pointName: '游走式找点',
    pointLevel: '底层卡点',
    pointLevelClass: 'foundation',
    hasPointContext: false,
    systemOverview: PATH_SYSTEM_OVERVIEW,
    versionTabs: [],
    stageTabs: [],
    currentVersionKey: 'progressive',
    currentVersionMeta: VERSION_META.progressive,
    currentStageKey: 'stage1',
    currentStageLabel: '第一阶',
    pathSteps: [],
    previewHint: '当前页面是购买方案页，选择版本后会生成对应的真实学习路径。',
    otherPoints: [],
    diagnosePurchase: {
      ...DIAGNOSE_PURCHASE_META,
      ...diagnoseCouponContent,
      couponActive: false,
      couponRemainingText: '00:00',
      currentPrice: diagnoseCouponContent.originalPrice,
      originalPrice: diagnoseCouponContent.originalPrice,
      saveText: '限时优惠已结束',
    },
  },

  onLoad(options) {
    const diagnoseMode = options.mode === 'diagnose'

    if (diagnoseMode) {
      this.setData({
        diagnoseMode: true,
        diagnosePurchase: {
          ...this.data.diagnosePurchase,
          ...buildDiagnosePurchaseState(),
        },
      })

      wx.setNavigationBarTitle({
        title: '诊断课购买',
      })

      this.startDiagnoseTimer()
      return
    }

    const pointId = parseInt(options.pointId || options.id, 10) || 1
    const hasPointContext = Boolean(options.pointId || options.id)
    const pointData = getPointVersionData(pointId)
    const levelMeta = POINT_LEVEL_META[pointId] || { level: '专项卡点', levelClass: 'special' }
    const currentVersionKey = resolveVersionKey(pointData, options.version || 'progressive')
    const currentPath = buildCurrentPath(pointData, currentVersionKey, options.stage || 'stage1')

    this.setData({
      pointId,
      pointName: pointData.pointName,
      pointLevel: levelMeta.level,
      pointLevelClass: levelMeta.levelClass,
      hasPointContext,
      otherPoints: hasPointContext ? buildOtherPoints(pointId) : [],
      ...currentPath,
    })

    wx.setNavigationBarTitle({
      title: '购买方案',
    })
  },

  onShow() {
    if (this.data.diagnoseMode) {
      this.setData({
        diagnosePurchase: {
          ...this.data.diagnosePurchase,
          ...buildDiagnosePurchaseState(),
        },
      })
      this.startDiagnoseTimer()
    }
  },

  onHide() {
    this.stopDiagnoseTimer()
  },

  onUnload() {
    this.stopDiagnoseTimer()
  },

  startDiagnoseTimer() {
    if (!this.data.diagnoseMode) return

    this.stopDiagnoseTimer()
    this._diagnoseTimer = setInterval(() => {
      this.setData({
        diagnosePurchase: {
          ...this.data.diagnosePurchase,
          ...buildDiagnosePurchaseState(),
        },
      })
    }, 1000)
  },

  stopDiagnoseTimer() {
    if (this._diagnoseTimer) {
      clearInterval(this._diagnoseTimer)
      this._diagnoseTimer = null
    }
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
    if (this.data.diagnoseMode) {
      const app = getApp()
      const couponState = readDiagnoseCouponState()

      if (couponState && couponState.claimed !== true && !isDiagnoseCouponExpired(couponState)) {
        writeDiagnoseCouponState({
          ...couponState,
          claimed: true,
          minimized: false,
        })
      }

      if (app && app.globalData) {
        app.globalData.hasDiagnoseCourse = true
      }

      wx.showToast({
        title: '购买成功',
        icon: 'success',
        duration: 1000,
      })

      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/diagnose-detail/diagnose-detail?source=purchase',
        })
      }, 1000)
      return
    }

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

  goDiagnosePreview() {
    wx.navigateTo({
      url: '/pages/diagnose-detail/diagnose-detail?source=purchase_preview',
    })
  },
})
