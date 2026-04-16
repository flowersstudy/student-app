const { buildStageUrl } = require('../../../utils/path-stage-routes')
const { fetchStudentPointLearningSummary } = require('../../../utils/student-api')

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
    desc: '先确认这个卡点的核心问题、目标分差和后续突破方向。',
    hint: '这里后续可展开诊断内容',
  },
  {
    key: 'theory',
    title: '理论',
    desc: '补齐方法理解，先知道这个卡点到底应该怎么做。',
    hint: '这里后续可展开理论内容',
  },
  {
    key: 'training',
    title: '实训',
    desc: '围绕该卡点进入针对性训练，把方法真正练熟。',
    hint: '这里后续可展开实训内容',
  },
  {
    key: 'exam',
    title: '测试',
    desc: '通过阶段测试检查是否掌握，验证当前训练效果。',
    hint: '这里后续可展开测试内容',
  },
  {
    key: 'drill',
    title: '刷题',
    desc: '回到做题场景里稳定输出，把卡点真正打通。',
    hint: '这里后续可展开刷题内容',
  },
  {
    key: 'report',
    title: '报告',
    desc: '最后沉淀本卡点的阶段结论、问题复盘和成长记录。',
    hint: '这里后续可展开报告内容',
  },
]

const DEMO_LEARNING_SUMMARY = {
  totalDurationSec: 18 * 3600 + 35 * 60,
  longestDay: {
    date: '2026-03-25T00:00:00',
    durationSec: 5 * 3600 + 40 * 60,
  },
  earliestSession: {
    date: '2026-03-18T00:00:00',
    startedAt: '2026-03-18T06:30:00',
  },
  latestSession: {
    date: '2026-03-25T00:00:00',
    endedAt: '2026-03-26T02:00:00',
  },
}

function buildPathStages(courseStatus = 'pending', pointId = 0, pointName = '') {
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
      isLast: index === PATH_STAGE_TEMPLATE.length - 1,
      routeUrl: buildStageUrl(item.key, pointId, pointName),
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

function buildRecordItems(summary = {}) {
  const items = []

  if (summary.longestDay && summary.longestDay.date) {
    items.push({
      key: 'longest',
      label: `最长 ${formatMonthDay(summary.longestDay.date) || '--'} · ${formatDurationText(summary.longestDay.durationSec || 0)}`,
    })
  }

  if (summary.earliestSession && summary.earliestSession.startedAt) {
    const earliestDate = formatMonthDay(summary.earliestSession.date) || '--'
    const earliestTime = formatTimeText(summary.earliestSession.startedAt) || '--'
    items.push({
      key: 'earliest',
      label: `最早 ${earliestDate} · ${earliestTime}`,
    })
  }

  if (summary.latestSession && summary.latestSession.endedAt) {
    const latestDate = formatMonthDay(summary.latestSession.date) || '--'
    const latestTime = formatTimeText(summary.latestSession.endedAt) || '--'
    items.push({
      key: 'latest',
      label: `最晚 ${latestDate} · ${latestTime}`,
    })
  }

  return items
}

function buildEncouragement(summary = {}) {
  const totalDurationSec = Number(summary.totalDurationSec || 0)

  if (summary.latestSession && summary.latestSession.endedAt) {
    const latestDate = formatMonthDay(summary.latestSession.date)
    const latestTimeText = formatTimeText(summary.latestSession.endedAt)
    const latestHour = getTimeHour(summary.latestSession.endedAt)
    if (latestDate && latestTimeText && (latestHour !== null && (latestHour >= 22 || latestHour < 5))) {
      return `${latestDate}这天你学到了${latestTimeText}，辛苦啦`
    }
  }

  if (summary.longestDay && Number(summary.longestDay.durationSec || 0) > 0) {
    const longestDate = formatMonthDay(summary.longestDay.date)
    const longestText = formatDurationText(summary.longestDay.durationSec)
    if (longestDate) {
      return `${longestDate}这天你一口气学了${longestText}，真的很能扛`
    }
  }

  if (summary.earliestSession && summary.earliestSession.startedAt) {
    const earliestDate = formatMonthDay(summary.earliestSession.date)
    const earliestTimeText = formatTimeText(summary.earliestSession.startedAt)
    const earliestHour = getTimeHour(summary.earliestSession.startedAt)
    if (earliestDate && earliestTimeText && (earliestHour !== null && earliestHour < 8)) {
      return `${earliestDate}这天你${earliestTimeText}就开始学了，真自律`
    }
  }

  if (totalDurationSec > 0) {
    return `你已经为这个卡点投入了${formatDurationText(totalDurationSec)}，继续保持`
  }

  return '开始记录这张卡点的学习后，这里会留下你最拼的一天'
}

function buildLearningSummary(summary = {}) {
  const totalDurationSec = Number(summary.totalDurationSec || 0)

  return {
    totalText: totalDurationSec > 0 ? formatDurationText(totalDurationSec) : '0分钟',
    totalHint: totalDurationSec > 0 ? '这是你在这个卡点上已经投入的时间' : '你的学习时长会累计在这里',
    encouragement: buildEncouragement(summary),
    recordItems: buildRecordItems(summary),
  }
}

Page({
  data: {
    pointId: 2,
    pointName: '提炼转述困难',
    courseStatus: 'pending',
    pathStages: buildPathStages('pending', 2, '提炼转述困难'),
    learningSummary: buildLearningSummary(),
  },

  onLoad(options) {
    const id = parseInt(options.id, 10) || 2
    const courseStatus = options.status === 'solved' ? 'solved' : 'pending'
    const point = pointMap[id] || pointMap[2]
    const pathStages = buildPathStages(courseStatus, id, point.name)

    this.setData({
      pointId: id,
      pointName: point.name,
      courseStatus,
      pathStages,
    })

    wx.setNavigationBarTitle({
      title: point.name,
    })

    void this.loadLearningSummary(point.name)
  },

  onViewReport() {
    const { pointId, pointName } = this.data
    const url = buildStageUrl('report', pointId, pointName)
    if (!url) return

    wx.navigateTo({ url })
  },

  onStageTap(e) {
    const { url } = e.currentTarget.dataset
    if (!url) return

    wx.navigateTo({ url })
  },

  async loadLearningSummary(pointName) {
    try {
      const result = await fetchStudentPointLearningSummary(pointName, this)
      const hasStudyData = result && Number(result.totalDurationSec || 0) > 0
      this.setData({
        learningSummary: buildLearningSummary(hasStudyData ? result : DEMO_LEARNING_SUMMARY),
      })
    } catch (error) {
      this.setData({
        learningSummary: buildLearningSummary(DEMO_LEARNING_SUMMARY),
      })
    }
  },
})
