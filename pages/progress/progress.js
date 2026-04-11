const app = getApp()
const {
  VERSION_META,
  getPointVersionData,
} = require('../../utils/card-paths')

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

function resolveTaskAction(stepTitle) {
  if (/测试|模考/.test(stepTitle)) {
    return {
      text: '去测试',
      url: '/pages/lesson-exam/lesson-exam',
    }
  }

  if (/训练|刷题/.test(stepTitle)) {
    return {
      text: '去练习',
      url: '/pages/lesson-drill/lesson-drill?set=1',
    }
  }

  if (/讲义/.test(stepTitle)) {
    return {
      text: '去查看',
      url: '/pages/lesson-recorded/lesson-recorded',
    }
  }

  if (/纠偏/.test(stepTitle)) {
    return {
      text: '去学习',
      url: '/pages/lesson-correct/lesson-correct',
    }
  }

  if (/理论/.test(stepTitle)) {
    return {
      text: '去学习',
      url: '/pages/lesson-recorded/lesson-recorded',
    }
  }

  return {
    text: '去学习',
    url: '/pages/lesson-live/lesson-live',
  }
}

function resolveTaskStatus(groupIndex, taskIndex) {
  if (groupIndex === 0 && taskIndex === 0) {
    return '已完成'
  }

  if (groupIndex === 0 && taskIndex === 1) {
    return '学习中'
  }

  return '待开始'
}

function buildGroupStatus(tasks) {
  if (tasks.length > 0 && tasks.every((task) => task.status === '已完成')) {
    return '已完成'
  }

  if (tasks.some((task) => task.status !== '待开始')) {
    return '学习中'
  }

  return '待开始'
}

function buildStageGroups(pointData, versionKey) {
  const versionMeta = VERSION_META[versionKey]
  const versionData = (pointData.versions || {})[versionKey] || {}
  const rawGroups = versionData.stages
    ? versionData.stages.map((stage) => ({
        key: stage.key,
        label: stage.label,
        subtitle: `${versionMeta.label} · ${stage.label}`,
        steps: stage.steps,
      }))
    : [{
        key: 'main',
        label: '核心路径',
        subtitle: versionMeta.label,
        steps: versionData.steps || [],
      }]

  return rawGroups.map((group, groupIndex) => {
    const tasks = (group.steps || []).map((step, taskIndex) => {
      const action = resolveTaskAction(step.title)
      return {
        id: `${group.key}-${taskIndex + 1}`,
        index: taskIndex + 1,
        title: step.title,
        note: step.note || '',
        status: resolveTaskStatus(groupIndex, taskIndex),
        actionText: action.text,
        url: action.url,
      }
    })

    return {
      ...group,
      tasks,
      status: buildGroupStatus(tasks),
    }
  })
}

function buildProgressSummary(stageGroups) {
  const allTasks = stageGroups.reduce((result, group) => result.concat(group.tasks), [])
  const totalTaskCount = allTasks.length
  const completedTaskCount = allTasks.filter((task) => task.status === '已完成').length
  const learningTaskCount = allTasks.filter((task) => task.status === '学习中').length
  const progressPercent = totalTaskCount
    ? Math.round(((completedTaskCount + learningTaskCount * 0.5) / totalTaskCount) * 100)
    : 0
  const currentTask = allTasks.find((task) => task.status === '学习中') || allTasks.find((task) => task.status === '待开始') || null

  return {
    totalTaskCount,
    completedTaskCount,
    progressPercent,
    currentTaskTitle: currentTask ? currentTask.title : '当前路径已完成',
  }
}

Page({
  data: {
    pointId: 1,
    pointName: '游走式找点',
    currentVersionKey: 'progressive',
    currentVersionMeta: VERSION_META.progressive,
    stageGroups: [],
    totalTaskCount: 0,
    completedTaskCount: 0,
    progressPercent: 0,
    currentTaskTitle: '',
    progressHint: '已按当前版本生成学习路径，后续与后端联通后会同步真实学习状态。',
  },

  onLoad(options) {
    const pointId = parseInt(options.id, 10) || 1
    const pointData = getPointVersionData(pointId)
    const storedVersionKey = app.globalData.pointVersionSelections
      ? app.globalData.pointVersionSelections[pointId]
      : ''
    const currentVersionKey = resolveVersionKey(pointData, options.version || storedVersionKey || 'progressive')
    const stageGroups = buildStageGroups(pointData, currentVersionKey)
    const summary = buildProgressSummary(stageGroups)

    this.setData({
      pointId,
      pointName: pointData.pointName,
      currentVersionKey,
      currentVersionMeta: VERSION_META[currentVersionKey],
      stageGroups,
      ...summary,
    })

    wx.setNavigationBarTitle({
      title: `${pointData.pointName}学习路径`,
    })
  },

  goTask(e) {
    const url = e.currentTarget.dataset.url
    const stepName = e.currentTarget.dataset.stepName || ''
    if (stepName && app.globalData && app.globalData.leaveStatus) {
      app.globalData.leaveStatus.stepName = stepName
    }
    this._checkLeaveAndNavigate(url)
  },

  _checkLeaveAndNavigate(url) {
    const ls = app.globalData.leaveStatus
    if (!ls || !ls.active) {
      wx.navigateTo({ url })
      return
    }

    const statusText = ls.approvalStatus === 'approved' ? '（已批准）' : '（审批中）'
    const detail = ls.pointName
      ? `卡点：${ls.pointName}\n课节：${ls.stepName}`
      : '整体请假'

    wx.showModal({
      title: '你当前处于请假状态',
      content: `${detail}\n时长：${ls.days} ${statusText}\n\n开始学习将自动销假，是否继续？`,
      confirmText: '销假继续',
      cancelText: '暂不学习',
      success: (res) => {
        if (!res.confirm) return
        app.globalData.leaveStatus = {
          active: false, approvalStatus: '', pointName: '',
          stepName: '', days: '', submitTime: ''
        }
        wx.navigateTo({ url })
      }
    })
  }
})
