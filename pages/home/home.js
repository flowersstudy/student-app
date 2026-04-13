const { uiIcons } = require('../../utils/ui-icons')
const { fetchStudentNotifications, fetchStudentProfile } = require('../../utils/student-api')
const { syncChatUnreadBadge } = require('../../utils/chat-badge')

const CURRENT_LEARNING_TASK_KEY = 'current_learning_task'
const DIAGNOSE_COUPON_STORAGE_KEY = 'new_user_diagnose_coupon'
const DIAGNOSE_COUPON_DURATION = 30 * 60 * 1000
const BUKA_LAST_ACTIVE_AT_KEY = 'buka_last_active_at'
const BUKA_REVIEW_HINT_KEY = 'buka_review_hint'
const OFFLINE_SUBMISSIONS_KEY = 'offline_submissions'
const BUKA_DEBUG_SCENE_KEY = 'buka_debug_scene'
const BUKA_INACTIVE_THRESHOLD = 3 * 24 * 60 * 60 * 1000
const BUKA_ACHIEVEMENT_WINDOW = 6 * 60 * 60 * 1000
const BUKA_REVIEW_WINDOW_START = 18 * 60 * 60 * 1000
const BUKA_REVIEW_WINDOW_END = 72 * 60 * 60 * 1000
const BUKA_DEBUG_SCENE_ORDER = [
  '',
  'class_reminder',
  'homework_due',
  'task_continue',
  'review_due',
  'inactive',
  'achievement',
]
const TAB_BAR_PAGE_PATHS = [
  '/pages/home/home',
  '/pages/chat/chat',
  '/pages/study-square/study-square',
  '/pages/results/results',
]

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

const POINT_NAME_ALIASES = {
  '游走式找点': 1,
  '总结转述难': 2,
  '提炼转述错误': 2,
  '分析结构不清': 3,
  '分析结构错误': 3,
  '公文结构不清': 4,
  '公文结构错误': 4,
  '对策推导难': 5,
  '对策推导错误': 5,
  '作文立意不准': 6,
  '作文立意错误': 6,
  '作文逻辑不清': 7,
  '作文逻辑不清晰': 7,
  '作文表达不畅': 8,
  '作文表达不流畅': 8,
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
  return Number(POINT_NAME_ALIASES[pointName] || DEFAULT_CURRENT_TASK.pointId)
}

function splitCoursesBySubject(courses = []) {
  return courses.reduce((acc, item) => {
    const subject = String(item.subject || '')
    if (subject.includes('行测')) {
      acc.xingce.push(item)
    } else {
      acc.shenlun.push(item)
    }
    return acc
  }, { xingce: [], shenlun: [] })
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
  }
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

function normalizePageUrl(url = '') {
  if (!url) return ''
  return url.startsWith('/') ? url : `/${url}`
}

function navigateByUrl(url = '') {
  const normalizedUrl = normalizePageUrl(url)
  if (!normalizedUrl) return

  const pagePath = normalizedUrl.split('?')[0]
  if (TAB_BAR_PAGE_PATHS.includes(pagePath)) {
    wx.switchTab({ url: pagePath })
    return
  }

  wx.navigateTo({ url: normalizedUrl })
}

function createBukaScene({
  code = 'task_continue',
  priority = 0,
  mood = 'normal',
  title = '',
  slogan = '',
  ctaText = '',
  ctaUrl = '',
} = {}) {
  return {
    code,
    priority,
    mood,
    title,
    slogan,
    ctaText,
    ctaUrl,
  }
}

function getDaysBetween(now, pastTime) {
  if (!pastTime) return 0
  const diff = now - pastTime
  if (diff <= 0) return 0
  return Math.max(1, Math.floor(diff / (24 * 60 * 60 * 1000)))
}

function getReviewSceneUrl(task) {
  return `/pages/review/review?type=cycle_end&pointName=${task.pointName}`
}

function createBukaDebugScene(debugSceneCode, taskState = {}) {
  const safeTask = resolveCurrentTask(taskState)
  const currentTaskUrl = `/pages/progress/progress?id=${safeTask.pointId}`
  const sceneMap = {
    class_reminder: createBukaScene({
      code: 'class_reminder',
      priority: 100,
      mood: 'urgent',
      title: '19:00 直播课提醒',
      slogan: '课前材料先过一遍，进教室会更顺。',
      ctaText: '进入课程',
      ctaUrl: '/pages/lesson-live/lesson-live',
    }),
    homework_due: createBukaScene({
      code: 'homework_due',
      priority: 90,
      mood: 'remind',
      title: '作业待提交',
      slogan: '先交当前版本，老师才能帮你看问题。',
      ctaText: '去提交',
      ctaUrl: '/pages/lesson-correct/lesson-correct',
    }),
    task_continue: createBukaScene({
      code: 'task_continue',
      priority: 10,
      mood: 'normal',
      title: `今天先推进「${safeTask.pointName}」`,
      slogan: `先完成 ${safeTask.day} 的 ${safeTask.taskLabel}，一步一步来。`,
      ctaText: '去学习',
      ctaUrl: currentTaskUrl,
    }),
    review_due: createBukaScene({
      code: 'review_due',
      priority: 60,
      mood: 'calm',
      title: '该复习一下啦',
      slogan: `「${safeTask.pointName}」回顾一次，会比硬往前冲更稳。`,
      ctaText: '去复盘',
      ctaUrl: getReviewSceneUrl(safeTask),
    }),
    inactive: createBukaScene({
      code: 'inactive',
      priority: 50,
      mood: 'remind',
      title: '你已经 3 天没学了',
      slogan: '没关系，今天先回来 10 分钟，把状态接上就行。',
      ctaText: '继续学习',
      ctaUrl: currentTaskUrl,
    }),
    achievement: createBukaScene({
      code: 'achievement',
      priority: 30,
      mood: 'warm',
      title: '这一步完成啦',
      slogan: `「${safeTask.pointName}」已提交，接下来等反馈就好。`,
      ctaText: '查看成果',
      ctaUrl: '/pages/results/results',
    }),
  }

  return sceneMap[debugSceneCode] || null
}

function readLatestOfflineSubmission() {
  const submissions = wx.getStorageSync(OFFLINE_SUBMISSIONS_KEY) || []
  if (!Array.isArray(submissions) || submissions.length === 0) {
    return null
  }
  return submissions[0]
}

function getLatestSubmissionTime(latestSubmission) {
  if (!latestSubmission || !latestSubmission.createdAt) return 0
  const timestamp = new Date(latestSubmission.createdAt).getTime()
  return Number.isFinite(timestamp) ? timestamp : 0
}

function pickFirstNotification(notifications = [], types = []) {
  return notifications.find((item) => types.includes(item.type))
}

function resolveBukaScene({
  currentTask,
  notifications,
  latestSubmission,
  reviewHint,
  lastActiveAt,
  now = Date.now(),
} = {}) {
  const safeTask = resolveCurrentTask(currentTask)
  const currentTaskUrl = `/pages/progress/progress?id=${safeTask.pointId}`
  const scenes = []

  const classNotification = pickFirstNotification(notifications, ['class', 'exam'])
  if (classNotification) {
    scenes.push(createBukaScene({
      code: 'class_reminder',
      priority: 100,
      mood: 'urgent',
      title: classNotification.label || '马上要上课啦',
      slogan: classNotification.desc || '课前材料先过一遍，进教室会更顺。',
      ctaText: '进入课程',
      ctaUrl: classNotification.url || (classNotification.type === 'exam' ? '/pages/lesson-exam/lesson-exam' : '/pages/lesson-live/lesson-live'),
    }))
  }

  const homeworkNotification = pickFirstNotification(notifications, ['hw', 'drill', 'video'])
  if (homeworkNotification) {
    scenes.push(createBukaScene({
      code: 'homework_due',
      priority: 90,
      mood: 'remind',
      title: homeworkNotification.label || '作业还没交哦',
      slogan: homeworkNotification.desc || '先交当前版本，老师才能帮你看问题。',
      ctaText: '去提交',
      ctaUrl: homeworkNotification.url || '/pages/lesson-correct/lesson-correct',
    }))
  }

  if (reviewHint && reviewHint.enabled) {
    scenes.push(createBukaScene({
      code: 'review_due',
      priority: 60,
      mood: 'calm',
      title: reviewHint.title || '该复习一下啦',
      slogan: reviewHint.slogan || `「${safeTask.pointName}」回顾一次，会比硬往前冲更稳。`,
      ctaText: reviewHint.ctaText || '去复盘',
      ctaUrl: reviewHint.ctaUrl || getReviewSceneUrl(safeTask),
    }))
  }

  const latestSubmissionTime = getLatestSubmissionTime(latestSubmission)
  if (latestSubmissionTime) {
    const sinceLatestSubmission = now - latestSubmissionTime

    if (sinceLatestSubmission <= BUKA_ACHIEVEMENT_WINDOW) {
      scenes.push(createBukaScene({
        code: 'achievement',
        priority: 30,
        mood: 'warm',
        title: '这一步完成啦',
        slogan: `「${latestSubmission.checkpoint || safeTask.pointName}」已提交，接下来等反馈就好。`,
        ctaText: '查看成果',
        ctaUrl: getReviewSceneUrl(safeTask),
      }))
    }

    if (sinceLatestSubmission >= BUKA_REVIEW_WINDOW_START && sinceLatestSubmission <= BUKA_REVIEW_WINDOW_END) {
      scenes.push(createBukaScene({
        code: 'review_due',
        priority: 60,
        mood: 'calm',
        title: '该复习一下啦',
        slogan: '趁还记得，回顾一遍更容易真正记住。',
        ctaText: '去复盘',
        ctaUrl: '/pages/results/results',
      }))
    }
  }

  if (lastActiveAt && now - lastActiveAt >= BUKA_INACTIVE_THRESHOLD) {
    const inactiveDays = getDaysBetween(now, lastActiveAt)
    scenes.push(createBukaScene({
      code: 'inactive',
      priority: 50,
      mood: 'remind',
      title: `你已经 ${inactiveDays} 天没学了`,
      slogan: '没关系，今天先回来 10 分钟，把状态接上就行。',
      ctaText: '继续学习',
      ctaUrl: currentTaskUrl,
    }))
  }

  scenes.push(createBukaScene({
    code: 'task_continue',
    priority: 10,
    mood: 'normal',
    title: `今天先推进「${safeTask.pointName}」`,
    slogan: `先完成 ${safeTask.day} 的 ${safeTask.taskLabel}，一步一步来。`,
    ctaText: '去学习',
    ctaUrl: currentTaskUrl,
  }))

  return scenes.sort((a, b) => b.priority - a.priority)[0]
}

function hasDiagnoseCourse() {
  const app = getApp()
  const globalData = (app && app.globalData) || {}
  const userProfile = globalData.userProfile || {}
  return globalData.hasDiagnoseCourse === true || !!userProfile.phone
}

function getDiagnoseEntryConfig() {
  if (hasDiagnoseCourse()) {
    return {
      text: '查看诊断',
      url: '/pages/diagnose-report/diagnose-report',
    }
  }

  return {
    text: '立即诊断',
    url: '/pages/diagnose-detail/diagnose-detail',
  }
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
    bukaScene: createBukaScene({
      code: 'task_continue',
      priority: 10,
      mood: 'normal',
      title: `今天先推进「${DEFAULT_CURRENT_TASK.pointName}」`,
      slogan: `先完成 ${DEFAULT_CURRENT_TASK.day} 的 ${DEFAULT_CURRENT_TASK.taskLabel}，一步一步来。`,
      ctaText: '去学习',
      ctaUrl: `/pages/progress/progress?id=${DEFAULT_CURRENT_TASK.pointId}`,
    }),
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
    syncChatUnreadBadge(getApp())
    this.refreshHomeData()
    this.refreshNotificationsData()
    this.syncCurrentTask()
    this.syncNotifications()
    this.syncDiagnoseEntry()
    this.syncBukaScene()
    this.markBukaActivity()
  },

  onShow() {
    syncChatUnreadBadge(getApp())
    this.refreshHomeData()
    this.refreshNotificationsData()
    this.syncCurrentTask()
    this.syncNotifications()
    this.syncDiagnoseEntry()
    this.syncBukaScene()
    this.markBukaActivity()
  },

  syncCurrentTask() {
    const savedTask = wx.getStorageSync(CURRENT_LEARNING_TASK_KEY) || {}
    const currentTask = resolveCurrentTask(savedTask)

    this.setData({
      currentTaskText: getCurrentTaskText(currentTask),
      pathNodes: createPathNodes(currentTask.pointId),
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

      const courseGroups = splitCoursesBySubject(allCourses)
      const currentCourse = toPointItem(inProgress[0] || completed[completed.length - 1] || allCourses[0])
      const currentTask = buildCurrentTaskFromCourse(currentCourse)

      app.globalData.xingcePoints = courseGroups.xingce
      app.globalData.shenlunPoints = courseGroups.shenlun
      app.globalData.hasPracticeCourse = allCourses.length > 0

      wx.setStorageSync(CURRENT_LEARNING_TASK_KEY, currentTask)

      this.setData({
        currentTaskText: getCurrentTaskText(currentTask),
        currentCardProgress: Math.max(0, Math.min(100, Number(currentCourse.progress || 0))),
        pathNodes: createPathNodes(currentTask.pointId),
        'examInfo.subjectValue': currentCourse.subject || this.data.examInfo.subjectValue,
      })
    } catch (error) {
      console.warn('首页真实数据加载失败:', error && error.message ? error.message : error)
    }
  },

  syncNotifications() {
    const app = getApp()
    const notifications = (app && app.globalData && app.globalData.notifications) || []
    const unreadNotificationCount = notifications.filter((item) => item.read !== true).length

    this.setData({
      unreadNotificationCount,
    })
  },

  async refreshNotificationsData() {
    const app = getApp()

    try {
      const notifications = await fetchStudentNotifications(app)
      app.globalData.notifications = notifications
      this.syncNotifications()
      this.syncBukaScene()
    } catch (error) {
      console.warn('通知加载失败:', error && error.message ? error.message : error)
    }
  },

  syncDiagnoseEntry() {
    const entry = getDiagnoseEntryConfig()
    this._diagnoseEntryUrl = entry.url
    this.setData({
      topTagText: entry.text,
    })
  },

  syncBukaScene() {
    const app = getApp()
    const globalData = (app && app.globalData) || {}
    const notifications = (globalData.notifications || []).filter((item) => item.read !== true)
    const currentTask = resolveCurrentTask(wx.getStorageSync(CURRENT_LEARNING_TASK_KEY) || {})
    const latestSubmission = readLatestOfflineSubmission()
    const reviewHint = wx.getStorageSync(BUKA_REVIEW_HINT_KEY) || null
    const lastActiveAt = wx.getStorageSync(BUKA_LAST_ACTIVE_AT_KEY) || 0
    const debugSceneCode = wx.getStorageSync(BUKA_DEBUG_SCENE_KEY) || ''
    const debugScene = createBukaDebugScene(debugSceneCode, currentTask)
    const bukaScene = resolveBukaScene({
      currentTask,
      notifications,
      latestSubmission,
      reviewHint,
      lastActiveAt,
      now: Date.now(),
    })

    this.setData({ bukaScene: debugScene || bukaScene })
  },

  markBukaActivity() {
    wx.setStorageSync(BUKA_LAST_ACTIVE_AT_KEY, Date.now())
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
    wx.navigateTo({ url: this._diagnoseEntryUrl || '/pages/diagnose-detail/diagnose-detail' })
  },

  handleBukaAction() {
    const { bukaScene } = this.data
    if (!bukaScene || !bukaScene.ctaUrl) return
    navigateByUrl(bukaScene.ctaUrl)
  },

  handleBukaDebugToggle() {
    const currentCode = wx.getStorageSync(BUKA_DEBUG_SCENE_KEY) || ''
    const currentIndex = BUKA_DEBUG_SCENE_ORDER.indexOf(currentCode)
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % BUKA_DEBUG_SCENE_ORDER.length : 0
    const nextCode = BUKA_DEBUG_SCENE_ORDER[nextIndex]

    if (nextCode) {
      wx.setStorageSync(BUKA_DEBUG_SCENE_KEY, nextCode)
    } else {
      wx.removeStorageSync(BUKA_DEBUG_SCENE_KEY)
    }

    this.syncBukaScene()

    const nextScene = this.data.bukaScene
    wx.showToast({
      title: nextCode ? `布卡场景：${nextScene.title}` : '布卡场景：自动',
      icon: 'none',
      duration: 1400,
    })
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
