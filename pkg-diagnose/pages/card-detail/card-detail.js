const { fetchStudentPointLearningSummary } = require('../../../utils/student-api')
const { buildStageUrl } = require('../../../utils/path-stage-routes')

const pointMap = {
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
    reviewItems: ['诊断试卷', '解析课回放', '1v1诊断回放', '诊断报告'],
  },
  {
    key: 'theory',
    title: '理论',
    reviewItems: ['1v1共识回放', '1v1共识课后反馈', '课前讲义', '理论课回放', '视频讲解', '1v1纠偏回放', '1v1纠偏课后反馈'],
  },
  {
    key: 'training',
    title: '实训',
    reviewItems: ['训练题目', '已交作业', '课堂反馈'],
  },
  {
    key: 'exam',
    title: '测试',
    reviewItems: ['测试题目', '卡点报告', '课堂反馈'],
  },
  {
    key: 'report',
    title: '报告',
    reviewItems: ['先停一停，把前面几步整理好，再去刷题里继续巩固。'],
  },
  {
    key: 'drill',
    title: '刷题',
    reviewItems: ['刷题题目', '已交作业', '课堂反馈'],
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

function buildPathStages(courseStatus = 'pending') {
  const currentIndex = courseStatus === 'solved' ? 5 : 2

  return PATH_STAGE_TEMPLATE.map((item, index) => {
    let status = 'pending'

    if (index < currentIndex) {
      status = 'done'
    } else if (index === currentIndex) {
      status = 'current'
    }

    return {
      ...item,
      index: index + 1,
      status,
      expanded: true,
      isLast: index === PATH_STAGE_TEMPLATE.length - 1,
    }
  })
}

function padNumber(value) {
  return `${value}`.padStart(2, '0')
}

function formatMonthDay(dateText = '') {
  if (!dateText) return ''
  const safeDate = new Date(String(dateText).replace(' ', 'T'))
  if (Number.isNaN(safeDate.getTime())) return ''
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
  if (!dateText) return ''
  const safeDate = new Date(String(dateText).replace(' ', 'T'))
  if (Number.isNaN(safeDate.getTime())) return ''

  const hours = safeDate.getHours()
  const minutes = safeDate.getMinutes()

  if (hours < 6) {
    return minutes === 0 ? `凌晨${hours}点` : `凌晨${hours}:${padNumber(minutes)}`
  }

  if (hours < 12) {
    return minutes === 0 ? `早上${hours}点` : `早上${hours}:${padNumber(minutes)}`
  }

  if (hours < 18) {
    const displayHour = hours === 12 ? 12 : hours - 12
    return minutes === 0 ? `下午${displayHour}点` : `下午${displayHour}:${padNumber(minutes)}`
  }

  return minutes === 0 ? `晚上${hours}点` : `晚上${hours}:${padNumber(minutes)}`
}

function getTimeHour(dateText = '') {
  if (!dateText) return null
  const safeDate = new Date(String(dateText).replace(' ', 'T'))
  if (Number.isNaN(safeDate.getTime())) return null
  return safeDate.getHours()
}

function formatRelativeDateTime(dateText = '') {
  if (!dateText) return ''

  const safeDate = new Date(String(dateText).replace(' ', 'T'))
  if (Number.isNaN(safeDate.getTime())) return ''

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
      candidates.push(`有一次，你从${earliestTimeText}就开始碰这个卡点了。`)
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
    candidates.push('从这里开始，慢慢把这个卡点走顺。')
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
    pathStages: buildPathStages('pending'),
    learningSummary: buildLearningSummary({}, 2),
  },

  onLoad(options) {
    const id = parseInt(options.id, 10) || 2
    const courseStatus = options.status === 'solved' ? 'solved' : 'pending'
    const point = pointMap[id] || pointMap[2]

    this.setData({
      pointId: id,
      pointName: point.name,
      courseStatus,
      pathStages: buildPathStages(courseStatus),
    })

    wx.setNavigationBarTitle({
      title: point.name,
    })

    void this.loadLearningSummary(point.name)
  },

  onShow() {
    if (this._learningSummarySource) {
      this.applyLearningSummary(this._learningSummarySource)
    }
  },

  onViewReport() {
    const { pointId, pointName } = this.data
    const url = buildStageUrl('report', pointId, pointName)
    if (!url) return

    wx.navigateTo({ url })
  },

  applyLearningSummary(summary = {}) {
    this._learningSummarySource = summary
    this.setData({
      learningSummary: buildLearningSummary(summary, this.data.pointId),
    })
  },

  toggleStageExpand(e) {
    const { key } = e.currentTarget.dataset
    if (!key) return

    this.setData({
      pathStages: this.data.pathStages.map((item) => (
        item.key === key
          ? { ...item, expanded: !item.expanded }
          : item
      )),
    })
  },

  async loadLearningSummary(pointName) {
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
