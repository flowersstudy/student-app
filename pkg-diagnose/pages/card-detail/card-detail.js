const { fetchStudentPointLearningSummary } = require('../../../utils/student-api')
const { buildStageUrl } = require('../../../utils/path-stage-routes')
const { buildReviewItemVideoRoute } = require('../../../utils/polyv-video')
const {
  buildLearningPathProgress,
  syncLearningPathFromServer,
} = require('../../../utils/learning-path')

const POINT_MAP = {
  1: { name: '要点不全不准' },
  2: { name: '提炼转述困难' },
  3: { name: '分析结构不清' },
  4: { name: '公文结构不清' },
  5: { name: '对策推导困难' },
  6: { name: '作文立意不准' },
  7: { name: '作文论证不清' },
  8: { name: '作文表达不畅' },
}

const PATH_STAGE_TEMPLATE = [
  {
    key: 'diagnose',
    title: '诊断',
    reviewItems: [
      '诊断试卷',
      '听解析课',
      '去回顾（直播课回放链接）',
    ],
  },
  {
    key: 'theory',
    title: '理论',
    reviewItems: [
      '课前讲义（PDF）',
      {
        title: '第一轮',
        expanded: true,
        children: [
          '理论课（录播）',
          '课后作业（PDF）',
          '视频讲解',
        ],
      },
      {
        title: '第二轮',
        expanded: true,
        children: [
          '理论课（录播）',
          '课后作业（PDF）',
          '视频讲解',
        ],
      },
      {
        title: '第三轮',
        expanded: true,
        children: [
          '理论课（录播）',
          '课后作业（PDF）',
          '视频讲解',
        ],
      },
      '上传思维导图（PDF/照片）',
    ],
  },
  {
    key: 'training',
    title: '实训',
    reviewItems: [
      {
        title: '第一题',
        expanded: true,
        children: [
          '题目（PDF）',
          '视频讲解（PDF 文档及视频链接）',
          '批改反馈【基于前者的一个 PDF】',
        ],
      },
      {
        title: '第二题',
        expanded: true,
        children: [
          '题目（PDF）',
          '视频讲解（PDF 文档及视频链接）',
          '批改反馈【基于前者的一个 PDF】',
        ],
      },
      {
        title: '第三题',
        expanded: true,
        children: [
          '题目（PDF）',
          '视频讲解（PDF 文档及视频链接）',
          '批改反馈【基于前者的一个 PDF】',
        ],
      },
    ],
  },
  {
    key: 'exam',
    title: '测试',
    reviewItems: [
      '题目（PDF）',
      '视频讲解（PDF 文档及视频链接）',
      '批改反馈【基于前者的一个 PDF】',
      '查看卡点报告',
    ],
  },
  {
    key: 'drill',
    title: '刷题',
    reviewItems: [
      '计时器',
      '题目（PDF）',
      '上传作业（PDF/图片）',
      'AI批改',
      '去上课（直播课连接）',
      '去回顾（直播课回放连接）',
      '群内答疑总结',
      '刷题报告总结',
    ],
  },
]

const DEMO_LEARNING_SUMMARY = {
  totalDurationSec: 18 * 3600 + 35 * 60,
  earliestSession: {
    date: '2026-03-18T00:00:00',
    startedAt: '2026-03-18T06:30:00',
  },
  latestSession: {
    date: '2026-03-25T00:00:00',
    endedAt: '2026-03-26T02:00:00',
  },
  lastPlaybackAt: '2026-03-24T22:08:00',
  lastHomeworkSubmitAt: '2026-03-25T21:14:00',
}

function cleanReviewItemTitle(title = '') {
  return String(title || '')
    .replace(/（[^）]*）/g, '')
    .replace(/【[^】]*】/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildReviewEntry(title = '') {
  const safeTitle = String(title || '').trim()

  if (!safeTitle) {
    return {
      actionText: '查看',
      actionType: 'view',
    }
  }

  if (safeTitle.includes('去回顾')) {
    return {
      actionText: '去回顾',
      actionType: 'review',
    }
  }

  if (safeTitle.includes('去上课')) {
    return {
      actionText: '去上课',
      actionType: 'live',
    }
  }

  if (safeTitle.includes('上传')) {
    return {
      actionText: '去上传',
      actionType: 'upload',
    }
  }

  if (
    safeTitle.includes('讲义')
    || safeTitle.includes('题目')
    || safeTitle.includes('试卷')
    || safeTitle.includes('作业')
  ) {
    return {
      actionText: 'PDF',
      actionType: 'pdf',
    }
  }

  if (
    safeTitle.includes('理论课')
    || safeTitle.includes('视频讲解')
    || safeTitle.includes('听解析课')
  ) {
    return {
      actionText: '视频',
      actionType: 'video',
    }
  }

  if (safeTitle.includes('报告')) {
    return {
      actionText: '报告',
      actionType: 'report',
    }
  }

  if (safeTitle.includes('课表')) {
    return {
      actionText: '课表',
      actionType: 'schedule',
    }
  }

  if (safeTitle.includes('计时器')) {
    return {
      actionText: '开始',
      actionType: 'timer',
    }
  }

  return {
    actionText: '查看',
    actionType: 'view',
  }
}

function buildReviewItemUrl(stageKey = '', rawTitle = '', pointId = 0, pointName = '', reviewIndex = -1, childIndex = -1) {
  const videoUrl = buildReviewItemVideoRoute({
    pointName,
    stageKey,
    reviewIndex,
    childIndex,
    title: cleanReviewItemTitle(rawTitle),
  })

  if (videoUrl) {
    return videoUrl
  }

  const targetStageKey = String(rawTitle || '').includes('报告') ? 'report' : stageKey
  return buildStageUrl(targetStageKey, pointId, pointName)
}

function buildReviewItem(stageKey = '', reviewItem = '', reviewIndex = 0, pointId = 0, pointName = '') {
  if (reviewItem && typeof reviewItem === 'object') {
    const rawTitle = reviewItem.title || ''

    return {
      id: `${stageKey}-${reviewIndex}`,
      rawTitle,
      title: cleanReviewItemTitle(rawTitle),
      expanded: reviewItem.expanded !== false,
      children: (reviewItem.children || []).map((childTitle, childIndex) => ({
        id: `${stageKey}-${reviewIndex}-${childIndex}`,
        rawTitle: childTitle,
        title: cleanReviewItemTitle(childTitle),
        url: buildReviewItemUrl(stageKey, childTitle, pointId, pointName, reviewIndex, childIndex),
        ...buildReviewEntry(childTitle),
      })),
    }
  }

  return {
    id: `${stageKey}-${reviewIndex}`,
    rawTitle: reviewItem,
    title: cleanReviewItemTitle(reviewItem),
    url: buildReviewItemUrl(stageKey, reviewItem, pointId, pointName, reviewIndex, -1),
    ...buildReviewEntry(reviewItem),
  }
}

function isLockedCourseStatus(courseStatus = 'pending') {
  return courseStatus === 'locked'
}

function normalizeCourseStatus(courseStatus = '') {
  const safeStatus = String(courseStatus || '').trim()

  if (['solved', 'completed', 'done'].includes(safeStatus)) {
    return 'solved'
  }

  if (['learning', 'current', 'in_progress'].includes(safeStatus)) {
    return 'learning'
  }

  if (safeStatus === 'locked') {
    return 'locked'
  }

  return 'pending'
}

function buildPathStages(stageStatusMap = {}, pointId = 0, pointName = '') {
  return PATH_STAGE_TEMPLATE.map((item, index) => {
    const status = stageStatusMap[item.key] || 'locked'

    return {
      ...item,
      reviewItems: (item.reviewItems || []).map((reviewItem, reviewIndex) => (
        buildReviewItem(item.key, reviewItem, reviewIndex, pointId, pointName)
      )),
      index: index + 1,
      status,
      expanded: true,
      isLast: index === PATH_STAGE_TEMPLATE.length - 1,
    }
  })
}

function padNumber(value) {
  return String(value).padStart(2, '0')
}

function parseDate(dateText = '') {
  if (!dateText) return null
  const safeDate = new Date(String(dateText).replace(' ', 'T'))
  return Number.isNaN(safeDate.getTime()) ? null : safeDate
}

function formatMonthDay(dateText = '') {
  const safeDate = parseDate(dateText)
  if (!safeDate) return ''
  return `${safeDate.getMonth() + 1}.${safeDate.getDate()}`
}

function formatDurationText(durationSec = 0) {
  const safeSeconds = Math.max(0, Number(durationSec) || 0)
  const totalMinutes = Math.round(safeSeconds / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours <= 0) {
    return `${minutes}分钟`
  }

  if (minutes === 0) {
    return `${hours}小时`
  }

  return `${hours}小时${minutes}分钟`
}

function formatTimeText(dateText = '') {
  const safeDate = parseDate(dateText)
  if (!safeDate) return ''

  const hours = safeDate.getHours()
  const minutes = safeDate.getMinutes()
  const minuteText = minutes === 0 ? '整' : padNumber(minutes)

  if (hours < 6) {
    return minutes === 0 ? `凌晨${hours}点` : `凌晨${hours}:${minuteText}`
  }

  if (hours < 12) {
    return minutes === 0 ? `早上${hours}点` : `早上${hours}:${minuteText}`
  }

  if (hours < 18) {
    const displayHour = hours === 12 ? 12 : hours - 12
    return minutes === 0 ? `下午${displayHour}点` : `下午${displayHour}:${minuteText}`
  }

  return minutes === 0 ? `晚上${hours}点` : `晚上${hours}:${minuteText}`
}

function getTimeHour(dateText = '') {
  const safeDate = parseDate(dateText)
  return safeDate ? safeDate.getHours() : null
}

function formatRelativeDateTime(dateText = '') {
  const safeDate = parseDate(dateText)
  if (!safeDate) return ''

  const target = new Date(safeDate)
  target.setHours(0, 0, 0, 0)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const diffDays = Math.round((target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))
  const timeText = formatTimeText(dateText)

  if (diffDays === 0) {
    return `今天 ${timeText}`
  }

  if (diffDays === -1) {
    return `昨天 ${timeText}`
  }

  return `${formatMonthDay(dateText)} ${timeText}`.trim()
}

function getMessageRotationStorageKey(pointId = 0) {
  return `student_point_path_message_rotation_${Number(pointId) || 0}`
}

function getStoredRotationIndex(pointId = 0) {
  try {
    return Number(wx.getStorageSync(getMessageRotationStorageKey(pointId)) || 0)
  } catch (error) {
    return 0
  }
}

function saveRotationIndex(pointId = 0, nextIndex = 0) {
  try {
    wx.setStorageSync(getMessageRotationStorageKey(pointId), Number(nextIndex) || 0)
  } catch (error) {}
}

function pickCandidateByRotation(candidates = [], pointId = 0) {
  if (!Array.isArray(candidates) || !candidates.length) {
    return ''
  }

  const storedIndex = getStoredRotationIndex(pointId)
  const currentIndex = storedIndex % candidates.length
  const nextIndex = (currentIndex + 1) % candidates.length

  saveRotationIndex(pointId, nextIndex)
  return candidates[currentIndex]
}

function buildEncouragementCandidates(summary = {}) {
  const candidates = []
  const totalDurationSec = Number(summary.totalDurationSec || 0)

  if (summary.latestSession && summary.latestSession.endedAt) {
    const latestHour = getTimeHour(summary.latestSession.endedAt)
    const latestTimeText = formatTimeText(summary.latestSession.endedAt)

    if (latestTimeText && latestHour !== null && latestHour < 5) {
      candidates.push(`有一次，你在这个卡点上学到了${latestTimeText}。`)
      candidates.push(`这个卡点里，有一天你学到了${latestTimeText}。`)
    }
  }

  if (summary.earliestSession && summary.earliestSession.startedAt) {
    const earliestHour = getTimeHour(summary.earliestSession.startedAt)
    const earliestTimeText = formatTimeText(summary.earliestSession.startedAt)

    if (earliestTimeText && earliestHour !== null && earliestHour < 10) {
      candidates.push(`有一次，你从${earliestTimeText}就开始啃这个卡点了。`)
      candidates.push(`你曾经在${earliestTimeText}就开始学这个卡点。`)
    }
  }

  if (summary.lastPlaybackAt) {
    const playbackText = formatRelativeDateTime(summary.lastPlaybackAt)
    if (playbackText) {
      candidates.push(`你上一次打开这节回放，是在${playbackText}。`)
    }
  }

  if (summary.lastHomeworkSubmitAt) {
    const submitText = formatRelativeDateTime(summary.lastHomeworkSubmitAt)
    if (submitText) {
      candidates.push(`你最近一次提交相关练习，是在${submitText}。`)
    }
  }

  if (!candidates.length && totalDurationSec > 0) {
    candidates.push(`这个卡点，你已经走过${formatDurationText(totalDurationSec)}。`)
    candidates.push(`你已经在这里学了${formatDurationText(totalDurationSec)}。`)
  }

  if (!candidates.length) {
    candidates.push('从这里开始，慢慢把这个卡点啃透。')
  }

  return candidates
}

function buildEncouragement(summary = {}, pointId = 0) {
  return pickCandidateByRotation(buildEncouragementCandidates(summary), pointId)
}

function buildLearningSummary(summary = {}, pointId = 0) {
  const totalDurationSec = Number(summary.totalDurationSec || 0)

  return {
    totalText: totalDurationSec > 0 ? formatDurationText(totalDurationSec) : '0分钟',
    encouragement: buildEncouragement(summary, pointId),
  }
}

Page({
  data: {
    pointId: 2,
    pointName: '提炼转述困难',
    courseStatus: 'pending',
    isLocked: false,
    pathStages: buildPathStages(buildLearningPathProgress('提炼转述困难', 'pending').stageStatusMap, 2, '提炼转述困难'),
    learningSummary: buildLearningSummary({}, 2),
  },

  onLoad(options) {
    this.app = getApp()
    const id = parseInt(options.id, 10) || 2
    const courseStatus = normalizeCourseStatus(options.status)
    const optionPointName = options.pointName ? decodeURIComponent(options.pointName) : ''
    const point = POINT_MAP[id] || POINT_MAP[2]
    const pointName = optionPointName || point.name
    const initialProgress = buildLearningPathProgress(pointName, courseStatus)

    this.setData({
      pointId: id,
      pointName,
      courseStatus: initialProgress.courseStatus,
      isLocked: isLockedCourseStatus(initialProgress.courseStatus),
      pathStages: buildPathStages(initialProgress.stageStatusMap, id, pointName),
    })

    wx.setNavigationBarTitle({
      title: pointName,
    })

    void this.initializePage(pointName)
  },

  onShow() {
    if (this._learningSummarySource) {
      this.applyLearningSummary(this._learningSummarySource)
    }
  },

  onViewReport() {
    if (this.data.isLocked) {
      wx.showToast({
        title: '还未解锁',
        icon: 'none',
      })
      return
    }

    const { pointId, pointName } = this.data
    const url = buildStageUrl('report', pointId, pointName)

    if (!url) {
      return
    }

    wx.navigateTo({ url })
  },

  async initializePage(pointName) {
    await this.loadPathProgress(pointName)
    await this.loadLearningSummary(pointName)
  },

  applyPathProgress(progress = {}) {
    const resolvedCourseStatus = normalizeCourseStatus(progress.courseStatus || this.data.courseStatus)

    this.setData({
      courseStatus: resolvedCourseStatus,
      isLocked: isLockedCourseStatus(resolvedCourseStatus),
      pathStages: buildPathStages(progress.stageStatusMap || {}, this.data.pointId, this.data.pointName),
    })
  },

  async loadPathProgress(pointName) {
    try {
      await syncLearningPathFromServer(pointName, this.app)
    } catch (_error) {}

    this.applyPathProgress(buildLearningPathProgress(pointName, this.data.courseStatus))
  },

  onReviewItemTap(e) {
    const { status, url, title } = e.currentTarget.dataset

    if (status === 'locked') {
      if (!this.data.isLocked) {
        wx.showToast({
          title: '你还没学到这里哦~',
          icon: 'none',
        })
        return
      }

      wx.showToast({
        title: '还未解锁',
        icon: 'none',
      })
      return
    }

    if (status === 'pending') {
      wx.showToast({
        title: '你还没学到这里哦~',
        icon: 'none',
      })
      return
    }

    if (!url) {
      wx.showToast({
        title: `${title || '内容'}待接入`,
        icon: 'none',
      })
      return
    }

    wx.navigateTo({ url })
  },

  toggleReviewGroup(e) {
    const { stageKey, childId } = e.currentTarget.dataset

    if (!stageKey || !childId) {
      return
    }

    this.setData({
      pathStages: this.data.pathStages.map((stage) => {
        if (stage.key !== stageKey) {
          return stage
        }

        return {
          ...stage,
          reviewItems: stage.reviewItems.map((item) => (
            item.id === childId
              ? { ...item, expanded: !item.expanded }
              : item
          )),
        }
      }),
    })
  },

  toggleStageExpand(e) {
    const { key } = e.currentTarget.dataset

    if (!key) {
      return
    }

    this.setData({
      pathStages: this.data.pathStages.map((item) => (
        item.key === key
          ? { ...item, expanded: !item.expanded }
          : item
      )),
    })
  },

  applyLearningSummary(summary = {}) {
    this._learningSummarySource = summary
    this.setData({
      learningSummary: buildLearningSummary(summary, this.data.pointId),
    })
  },

  async loadLearningSummary(pointName) {
    if (this.data.isLocked) {
      this.applyLearningSummary({})
      return
    }

    try {
      const result = await fetchStudentPointLearningSummary(pointName, this)
      const hasStudyData = result && (
        Number(result.totalDurationSec || 0) > 0
        || !!(result.latestSession && result.latestSession.endedAt)
        || !!(result.earliestSession && result.earliestSession.startedAt)
        || !!result.lastPlaybackAt
        || !!result.lastHomeworkSubmitAt
      )

      this.applyLearningSummary(hasStudyData ? result : DEMO_LEARNING_SUMMARY)
    } catch (error) {
      this.applyLearningSummary(DEMO_LEARNING_SUMMARY)
    }
  },
})
