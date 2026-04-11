const { uiIcons } = require('../../utils/ui-icons')

const CURRENT_LEARNING_TASK_KEY = 'current_learning_task'
const DIAGNOSE_COUPON_STORAGE_KEY = 'new_user_diagnose_coupon'
const DIAGNOSE_COUPON_DURATION = 30 * 60 * 1000

const DEFAULT_CURRENT_TASK = {
  pointId: 2,
  pointName: '总结转述难',
  day: 'Day 1',
  taskLabel: '1v1共识课',
}

const LEARNING_POINT_ORDER = [1, 2, 5, 3, 4, 6, 7, 8]
const FORCED_ACTIVE_POINT_IDS = [5, 3]

const SUBPATH_STATUS_META = {
  completed: {
    label: '已完成',
    className: 'completed',
    locked: false,
  },
  active: {
    label: '学习中',
    className: 'active',
    locked: false,
  },
  locked: {
    label: '待解锁',
    className: 'locked',
    locked: true,
  },
}

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

function createDiagnoseCouponState(now = Date.now()) {
  return {
    createdAt: now,
    expiresAt: now + DIAGNOSE_COUPON_DURATION,
    claimed: false,
  }
}

function readDiagnoseCouponState() {
  return wx.getStorageSync(DIAGNOSE_COUPON_STORAGE_KEY) || null
}

function writeDiagnoseCouponState(state) {
  wx.setStorageSync(DIAGNOSE_COUPON_STORAGE_KEY, state)
}

function formatCouponCountdown(remainingMs) {
  const safeRemaining = Math.max(0, remainingMs)
  const totalSeconds = Math.floor(safeRemaining / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function getPointIdByName(pointName = '') {
  return Number(
    Object.keys(POINT_NAME_BY_ID).find((id) => POINT_NAME_BY_ID[id] === pointName) || DEFAULT_CURRENT_TASK.pointId
  )
}

function resolveCurrentTask(taskState = {}) {
  const pointId = Number(taskState.pointId) || getPointIdByName(taskState.pointName)
  return {
    pointId,
    pointName: taskState.pointName || POINT_NAME_BY_ID[pointId] || DEFAULT_CURRENT_TASK.pointName,
    day: taskState.day || DEFAULT_CURRENT_TASK.day,
    taskLabel: taskState.taskLabel || DEFAULT_CURRENT_TASK.taskLabel,
  }
}

function getDefaultCurrentTaskText() {
  return `${DEFAULT_CURRENT_TASK.pointName} · ${DEFAULT_CURRENT_TASK.day} ${DEFAULT_CURRENT_TASK.taskLabel}`
}

function getCurrentTaskText(taskState = {}) {
  const pointName = taskState.pointName || ''
  const day = taskState.day || ''
  const taskLabel = taskState.taskLabel || ''

  if (pointName && day && taskLabel) {
    return `${pointName} · ${day} ${taskLabel}`
  }

  if (pointName && taskLabel) {
    return `${pointName} · ${taskLabel}`
  }

  if (taskLabel) {
    return taskLabel
  }

  return getDefaultCurrentTaskText()
}

function getPointStatus(pointId, currentPointId) {
  if (FORCED_ACTIVE_POINT_IDS.includes(pointId)) {
    return 'active'
  }

  const pointIndex = LEARNING_POINT_ORDER.indexOf(pointId)
  const currentIndex = LEARNING_POINT_ORDER.indexOf(currentPointId)

  if (pointIndex === -1 || currentIndex === -1) {
    return 'locked'
  }

  if (pointIndex < currentIndex) {
    return 'completed'
  }

  if (pointIndex === currentIndex) {
    return 'active'
  }

  return 'locked'
}

function buildDetailItems(items, currentPointId) {
  return items.map((item, index) => {
    const status = getPointStatus(item.pointId, currentPointId)
    const statusMeta = SUBPATH_STATUS_META[status]

    return {
      ...item,
      status,
      statusLabel: statusMeta.label,
      statusClass: statusMeta.className,
      locked: statusMeta.locked,
      showLine: index !== items.length - 1,
    }
  })
}

function createPathNodes(currentPointId = DEFAULT_CURRENT_TASK.pointId) {
  const isInBasicStage = [1, 2].includes(currentPointId)
  const isInSpecialStage = [5, 3, 4, 6, 7, 8].includes(currentPointId) || FORCED_ACTIVE_POINT_IDS.length > 0

  return [
    {
      id: 'diagnose',
      title: '诊断',
      status: 'done',
      note: '已完成',
      icon: '诊',
      action: '/pages/diagnose-detail/diagnose-detail',
      showCurve: false,
      showHighlight: false,
      hasDetail: false,
      expanded: false,
      detailVisible: false,
      detailStateClass: 'close',
      expandText: '',
      detailSections: [],
    },
    {
      id: 'final-card',
      title: '底层卡点',
      status: isInBasicStage ? 'current' : 'done',
      note: isInBasicStage ? '当前在学' : '已完成',
      icon: '底',
      action: '',
      showCurve: true,
      showHighlight: isInBasicStage,
      hasDetail: true,
      expanded: false,
      detailVisible: false,
      detailStateClass: 'close',
      expandText: '展开',
      detailSections: [
        {
          items: buildDetailItems(
            [
              { pointId: 1, text: '游走式找点' },
              { pointId: 2, text: '总结转述难' },
            ],
            currentPointId
          ),
        },
      ],
    },
    {
      id: 'yellow-card',
      title: '专项卡点',
      status: isInSpecialStage ? 'current' : 'browse',
      note: isInSpecialStage ? '当前在学' : '下一阶段',
      icon: '专',
      action: '',
      showCurve: true,
      showHighlight: isInSpecialStage,
      hasDetail: true,
      expanded: false,
      detailVisible: false,
      detailStateClass: 'close',
      expandText: '展开',
      detailSections: [
        {
          items: buildDetailItems(
            [
              { pointId: 5, text: '对策推导难' },
              { pointId: 3, text: '分析结构不清' },
              { pointId: 4, text: '公文结构不清' },
              { pointId: 6, text: '作文立意不准' },
              { pointId: 7, text: '作文逻辑不清' },
              { pointId: 8, text: '作文表达不畅' },
            ],
            currentPointId
          ),
        },
      ],
    },
    {
      id: 'blue-card',
      title: '靶向卡点',
      status: 'locked',
      note: '后续解锁',
      icon: '靶',
      action: '',
      showCurve: true,
      showHighlight: false,
      hasDetail: false,
      expanded: false,
      detailVisible: false,
      detailStateClass: 'close',
      expandText: '',
      detailSections: [],
    },
  ]
}

function getBranchDisplay(expanded) {
  return {
    state: expanded ? 'expanded' : 'default',
    title: '布卡',
    subtitle: '',
    slogan: '思路不卡，上岸稳了！',
  }
}

function updateNodeState(node, expanded) {
  return {
    ...node,
    expanded,
    detailVisible: expanded,
    detailStateClass: expanded ? 'open' : 'close',
    expandText: node.hasDetail ? (expanded ? '收起' : '展开') : '',
  }
}

function getSubpathTarget(pointId, status) {
  if (status === 'completed') {
    return `/pages/card-detail/card-detail?id=${pointId}`
  }

  if (status === 'active') {
    return `/pages/progress/progress?id=${pointId}`
  }

  return `/pages/course-intro/course-intro?id=${pointId}`
}

Page({
  data: {
    notificationIcon: uiIcons.bell,
    unreadNotificationCount: 0,
    examInfo: {
      subjectIcon: uiIcons.class,
      subjectValue: '申论',
      targetIcon: uiIcons.target,
      targetValue: '+20分',
      deadlineIcon: uiIcons.calendar,
      deadlineValue: '04/25',
    },
    topTagText: '生成专属学习报告',
    currentTaskText: getDefaultCurrentTaskText(),
    currentCardProgress: 36,
    branchState: 'default',
    branchNode: getBranchDisplay(false),
    pathNodes: createPathNodes(),
    showDiagnoseCoupon: false,
    diagnoseCoupon: {
      badge: '新用户专享',
      title: '1v1申论诊断课限时优惠券',
      subtitle: '先看清失分原因，再决定后续怎么学',
      countdownLabel: '倒计时 30 分钟',
      remainingText: '30:00',
      originalPrice: '¥380',
      price: '¥199',
      saveText: '限时立省 ¥181',
      featureTags: ['8维人工诊断', '电话沟通分析', '书面诊断报告'],
      summary: '适合先定位问题、再决定课程和学习路径的新用户。',
    },
  },

  onLoad() {
    this.syncCurrentTask()
    this.syncNotifications()
    this.tryShowDiagnoseCoupon()
  },

  onShow() {
    this.syncNotifications()
    this.tryShowDiagnoseCoupon()
  },

  onHide() {
    this.stopDiagnoseCouponTimer()
  },

  onUnload() {
    this.stopDiagnoseCouponTimer()
  },

  syncCurrentTask() {
    const savedTask = wx.getStorageSync(CURRENT_LEARNING_TASK_KEY) || {}
    const currentTask = resolveCurrentTask(savedTask)

    this.setData({
      currentTaskText: getCurrentTaskText(currentTask),
      pathNodes: createPathNodes(currentTask.pointId),
    })
  },

  syncNotifications() {
    const app = getApp()
    const notifications = (app && app.globalData && app.globalData.notifications) || []
    const unreadNotificationCount = notifications.filter((item) => item.read !== true).length

    this.setData({
      unreadNotificationCount,
    })
  },

  tryShowDiagnoseCoupon() {
    const app = getApp()
    const isNewUser = !!(app && app.globalData && app.globalData.isNewUser)

    if (!isNewUser || this._diagnoseCouponDismissed) {
      return
    }

    const now = Date.now()
    let couponState = readDiagnoseCouponState()

    if (!couponState) {
      couponState = createDiagnoseCouponState(now)
      writeDiagnoseCouponState(couponState)
    }

    if (couponState.claimed || couponState.expiresAt <= now) {
      this.stopDiagnoseCouponTimer()
      this.setData({
        showDiagnoseCoupon: false,
        'diagnoseCoupon.remainingText': '00:00',
      })
      return
    }

    this.setData({
      showDiagnoseCoupon: true,
      'diagnoseCoupon.remainingText': formatCouponCountdown(couponState.expiresAt - now),
    })

    this.startDiagnoseCouponTimer()
  },

  startDiagnoseCouponTimer() {
    this.stopDiagnoseCouponTimer()
    this._diagnoseCouponTimer = setInterval(() => {
      const couponState = readDiagnoseCouponState()
      if (!couponState) {
        this.stopDiagnoseCouponTimer()
        return
      }

      const remaining = couponState.expiresAt - Date.now()
      if (remaining <= 0) {
        this.stopDiagnoseCouponTimer()
        this.setData({
          showDiagnoseCoupon: false,
          'diagnoseCoupon.remainingText': '00:00',
        })
        return
      }

      this.setData({
        'diagnoseCoupon.remainingText': formatCouponCountdown(remaining),
      })
    }, 1000)
  },

  stopDiagnoseCouponTimer() {
    if (this._diagnoseCouponTimer) {
      clearInterval(this._diagnoseCouponTimer)
      this._diagnoseCouponTimer = null
    }
  },

  closeDiagnoseCoupon() {
    this._diagnoseCouponDismissed = true
    this.stopDiagnoseCouponTimer()
    this.setData({
      showDiagnoseCoupon: false,
    })
  },

  handleDiagnoseCouponTap() {
    const couponState = readDiagnoseCouponState()
    const now = Date.now()

    if (!couponState || couponState.expiresAt <= now) {
      this.setData({
        showDiagnoseCoupon: false,
        'diagnoseCoupon.remainingText': '00:00',
      })
      wx.showToast({
        title: '优惠券已过期',
        icon: 'none',
      })
      return
    }

    writeDiagnoseCouponState({
      ...couponState,
      claimed: true,
    })
    this.stopDiagnoseCouponTimer()
    this.setData({
      showDiagnoseCoupon: false,
    })
    wx.navigateTo({ url: '/pages/diagnose-detail/diagnose-detail' })
  },

  handlePlanTap() {
    wx.navigateTo({ url: '/pages/diagnose-detail/diagnose-detail' })
  },

  handleNotificationsTap() {
    wx.navigateTo({ url: '/pages/notifications/notifications' })
  },

  handleBranchTap() {
    return
  },

  handleNodeTap(e) {
    const { id } = e.currentTarget.dataset
    const node = this.data.pathNodes.find((item) => item.id === id)
    if (!node) return

    if (!node.hasDetail) {
      if (node.action) {
        wx.navigateTo({ url: node.action })
      }
      return
    }

    const nextNodes = this.data.pathNodes.map((item) => {
      if (item.id === id) {
        return updateNodeState(item, !item.expanded)
      }
      if (!item.hasDetail) return item
      return updateNodeState(item, false)
    })

    const activeNode = nextNodes.find((item) => item.id === id)
    this.setData({
      pathNodes: nextNodes,
      branchState: activeNode && activeNode.expanded ? 'expanded' : 'default',
      branchNode: getBranchDisplay(activeNode && activeNode.expanded),
    })
  },

  handleSubpathTap(e) {
    const { pointId, status } = e.currentTarget.dataset
    if (!pointId) return
    wx.navigateTo({ url: getSubpathTarget(pointId, status) })
  },
})
