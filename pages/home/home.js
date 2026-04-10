const DIAGNOSE_PROGRESS_KEY = 'diagnose_progress_state'

function getDefaultCurrentTask() {
  return {
    label: '当前待上',
    title: '1v1诊断课',
  }
}

function resolveCurrentTask(progressState = {}) {
  const step2 = progressState.step2 || {}
  const step3 = progressState.step3 || {}
  const step4 = progressState.step4 || {}
  const step5 = progressState.step5 || {}

  if (step5.status === '待上课') {
    return { label: '当前待上', title: '1v1诊断课' }
  }

  if (step5.status === '待约课') {
    return { label: '当前待约', title: '1v1诊断课' }
  }

  if (step4.status === '去反馈' && !step4.feedbackSubmitted) {
    return { label: '当前待完成', title: '听讲反馈' }
  }

  if (step3.status === '去答题' && !step3.answerUploaded) {
    return { label: '当前待完成', title: '诊断卷' }
  }

  if (step2.status === '待电话沟通') {
    return { label: '当前待上', title: '1v1电话沟通' }
  }

  return { label: '当前任务', title: '底层卡点学习' }
}

function makeDetailItems(items) {
  return items.map((text, index) => ({
    text,
    showLine: index !== items.length - 1,
  }))
}

function createPathNodes() {
  return [
    {
      id: 'diagnose',
      title: '诊断',
      status: 'done',
      note: '已完成',
      icon: '诊',
      action: '/pages/diagnose/diagnose',
      showCurve: false,
      showHighlight: false,
      hasDetail: false,
      expanded: false,
      detailVisible: false,
      detailClosing: false,
      expandText: '',
      detailStateClass: 'close',
      detailSections: [],
    },
    {
      id: 'final-card',
      title: '底层卡点',
      status: 'current',
      note: '当前卡点',
      icon: '学',
      action: '',
      showCurve: true,
      showHighlight: true,
      hasDetail: true,
      expanded: false,
      detailVisible: false,
      detailClosing: false,
      expandText: '展开',
      detailStateClass: 'close',
      detailSections: [
        { items: makeDetailItems(['游走式找点', '总结转述']) },
      ],
    },
    {
      id: 'yellow-card',
      title: '专项卡点',
      status: 'locked',
      note: '未解锁',
      icon: '专',
      action: '',
      showCurve: true,
      showHighlight: false,
      hasDetail: true,
      expanded: false,
      detailVisible: false,
      detailClosing: false,
      expandText: '展开',
      detailStateClass: 'close',
      detailSections: [
        { items: makeDetailItems(['对策推导', '分析结构', '公文结构']) },
      ],
    },
    {
      id: 'blue-card',
      title: '靶向卡点',
      status: 'locked',
      note: '未解锁',
      icon: '靶',
      action: '',
      showCurve: true,
      showHighlight: false,
      hasDetail: true,
      expanded: false,
      detailVisible: false,
      detailClosing: false,
      expandText: '展开',
      detailStateClass: 'close',
      detailSections: [
        { items: makeDetailItems(['作文立意', '作文逻辑', '作文表达']) },
      ],
    },
  ]
}

function getBranchDisplay(expanded) {
  if (expanded) {
    return {
      state: 'expanded',
      subtitle: '学习搭子',
      slogan: '沿着当前主线，继续拆开看。',
    }
  }

  return {
    state: 'default',
    subtitle: '学习搭子',
    slogan: '思路不打卡，上岸稳一点。',
  }
}

function updateNodeState(node, nextState) {
  return {
    ...node,
    expanded: nextState.expanded,
    detailVisible: nextState.detailVisible,
    detailClosing: nextState.detailClosing,
    expandText: nextState.expanded ? '收起' : node.hasDetail ? '展开' : '',
    detailStateClass: nextState.expanded ? 'open' : 'close',
  }
}

Page({
  data: {
    examInfo: {
      subjectLabel: '科目考试',
      subjectValue: '申论',
      targetLabel: '提分目标',
      targetValue: '+20分',
      deadlineLabel: '截止时间',
      deadlineValue: '04/25',
    },
    topTagText: '定制专属学习计划',
    currentTaskLabel: getDefaultCurrentTask().label,
    currentTaskTitle: getDefaultCurrentTask().title,
    currentTaskText: '当前待上 · 1v1诊断课',
    currentCardProgress: 36,
    branchState: 'default',
    branchNode: {
      title: '布卡',
      subtitle: '学习搭子',
      slogan: '思路不打卡，上岸稳一点。',
      action: '',
    },
    pathNodes: createPathNodes(),
  },

  onLoad() {
    this._detailTimers = {}
    this.syncExamInfo()
    this.syncCurrentTask()
    this.syncBranchDisplay()
  },

  onShow() {
    this.syncExamInfo()
    this.syncCurrentTask()
    this.syncBranchDisplay()
  },

  onUnload() {
    Object.keys(this._detailTimers || {}).forEach((key) => {
      clearTimeout(this._detailTimers[key])
    })
  },

  syncExamInfo() {
    const app = getApp()
    const diagnosis = app.globalData && app.globalData.diagnosis ? app.globalData.diagnosis : null
    const nextExamInfo = { ...this.data.examInfo }

    if (diagnosis && diagnosis.targetExam) {
      nextExamInfo.subjectValue = diagnosis.targetExam
    }

    if (diagnosis && typeof diagnosis.scoreGap === 'number') {
      nextExamInfo.targetValue = `+${diagnosis.scoreGap}分`
    }

    this.setData({ examInfo: nextExamInfo })
  },

  syncCurrentTask() {
    const savedProgress = wx.getStorageSync(DIAGNOSE_PROGRESS_KEY) || {}
    const currentTask = resolveCurrentTask(savedProgress)

    this.setData({
      currentTaskLabel: currentTask.label,
      currentTaskTitle: currentTask.title,
      currentTaskText: `${currentTask.label} · ${currentTask.title}`,
    })
  },

  syncBranchDisplay(pathNodes = this.data.pathNodes) {
    const expanded = pathNodes.some((item) => item.expanded)
    const branchDisplay = getBranchDisplay(expanded)

    this.setData({
      branchState: branchDisplay.state,
      'branchNode.subtitle': branchDisplay.subtitle,
      'branchNode.slogan': branchDisplay.slogan,
    })
  },

  handleNodeTap(e) {
    const { id } = e.currentTarget.dataset
    const node = this.data.pathNodes.find((item) => item.id === id)

    if (!node) return

    if (node.hasDetail) {
      this.toggleDetailNode(id)
      return
    }

    if (node.status === 'locked') {
      wx.showToast({
        title: '当前卡点完成后解锁',
        icon: 'none',
      })
      return
    }

    if (node.action) {
      wx.navigateTo({ url: node.action })
    }
  },

  handleBranchTap() {
    wx.showToast({
      title: this.data.branchNode.slogan,
      icon: 'none',
    })
  },

  handlePlanTap() {
    wx.navigateTo({
      url: '/pages/diagnose-detail/diagnose-detail',
    })
  },

  handleShellTap() {
    wx.showToast({
      title: '刷题入口保留在这里，完成主线路径后开启',
      icon: 'none',
    })
  },

  handleWhelkTap() {
    wx.showToast({
      title: '行测刷题入口保留在这里，完成主线路径后开启',
      icon: 'none',
    })
  },

  toggleDetailNode(id) {
    const clickedNode = this.data.pathNodes.find((item) => item.id === id)
    if (!clickedNode) return

    if (clickedNode.expanded) {
      this.closeDetailNode(id)
      return
    }

    Object.keys(this._detailTimers || {}).forEach((key) => {
      clearTimeout(this._detailTimers[key])
      delete this._detailTimers[key]
    })

    const nextNodes = this.data.pathNodes.map((item) => {
      if (item.id === id) {
        return updateNodeState(item, {
          expanded: true,
          detailVisible: true,
          detailClosing: false,
        })
      }

      if (item.hasDetail) {
        return updateNodeState(item, {
          expanded: false,
          detailVisible: false,
          detailClosing: false,
        })
      }

      return item
    })

    this.setData({ pathNodes: nextNodes }, () => this.syncBranchDisplay(nextNodes))
  },

  closeDetailNode(id) {
    const nextNodes = this.data.pathNodes.map((item) => {
      if (item.id === id) {
        return updateNodeState(item, {
          expanded: false,
          detailVisible: true,
          detailClosing: true,
        })
      }
      return item
    })

    this.setData({ pathNodes: nextNodes }, () => this.syncBranchDisplay(nextNodes))

    this._detailTimers[id] = setTimeout(() => {
      const closedNodes = this.data.pathNodes.map((item) => {
        if (item.id === id) {
          return updateNodeState(item, {
            expanded: false,
            detailVisible: false,
            detailClosing: false,
          })
        }
        return item
      })

      this.setData({ pathNodes: closedNodes })
      delete this._detailTimers[id]
    }, 240)
  },
})
