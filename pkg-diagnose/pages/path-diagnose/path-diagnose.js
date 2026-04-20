const {
  buildLearningPathStage,
  completeLearningPathTask,
  openTeacherTab,
  persistLearningPathTask,
  syncLearningPathFromServer,
} = require('../../../utils/learning-path')
const { buildLearningTaskVideoRoute } = require('../../../utils/polyv-video')
const { normalizeStudyOptions } = require('../../../utils/study-route')

function buildAppointmentOptions() {
  const today = new Date()
  const dateOptions = Array.from({ length: 7 }, (_, index) => {
    const currentDate = new Date(today.getTime() + index * 24 * 60 * 60 * 1000)
    return `${currentDate.getMonth() + 1}月${currentDate.getDate()}日`
  })

  return {
    range: [
      dateOptions,
      ['09:00', '10:30', '14:00', '16:00', '19:00', '20:30'],
    ],
    value: [0, 0],
  }
}

function getActionToast(actionType = '', title = '') {
  switch (actionType) {
    case 'group':
      return '已记录加群操作，后续可接入群链接'
    case 'document':
      return `${title || '资料'}已标记完成，后续可接入 PDF`
    case 'video':
      return `${title || '视频'}已标记完成，后续可接入视频链接`
    case 'live':
      return '已记录上课操作，后续可接入直播链接'
    case 'feedback':
      return '已查看课后反馈'
    case 'replay':
      return '已完成回顾'
    case 'report':
      return '已查看报告'
    default:
      return '已完成'
  }
}

Page({
  data: {
    pointName: '当前卡点',
    stageIndex: '1 / 6',
    stageName: '诊断',
    stageSubtitle: '按顺序完成诊断任务。',
    sectionTitle: '诊断路径',
    pathItems: [],
    appointmentPickerRange: [[], []],
    appointmentPickerValue: [0, 0],
  },

  onLoad(options) {
    this.app = getApp()
    this.studyOptions = normalizeStudyOptions(options, {
      pointName: '当前卡点',
    })
    const appointmentOptions = buildAppointmentOptions()

    this.setData({
      pointName: this.studyOptions.pointName,
      appointmentPickerRange: appointmentOptions.range,
      appointmentPickerValue: appointmentOptions.value,
    })

    wx.setNavigationBarTitle({
      title: '诊断',
    })

    this.loadRemoteStage()
  },

  async loadRemoteStage() {
    const pointName = (this.studyOptions && this.studyOptions.pointName) || this.data.pointName
    try {
      await syncLearningPathFromServer(pointName, this.app)
    } catch (_error) {}
    this.refreshStage()
  },

  refreshStage() {
    const stage = buildLearningPathStage('diagnose', this.data.pointName)

    this.setData({
      stageIndex: stage.stageIndex,
      stageName: stage.stageName,
      stageSubtitle: stage.stageSubtitle,
      sectionTitle: stage.sectionTitle,
      pathItems: ((stage.groups || [])[0] || {}).items || [],
    })
  },

  async onActionTap(e) {
    const { taskId, status, actionType, title } = e.currentTarget.dataset
    if (!taskId) return

    if (status === 'pending') {
      wx.showToast({
        title: '请先完成上一个待办',
        icon: 'none',
      })
      return
    }

    completeLearningPathTask(this.data.pointName, 'diagnose', taskId)
    try {
      await persistLearningPathTask(this.data.pointName, 'diagnose', taskId, {}, this.app)
    } catch (_error) {}
    this.refreshStage()

    if (actionType === 'video') {
      const url = buildLearningTaskVideoRoute({
        pointName: this.data.pointName,
        taskId,
        title,
        studyOptions: this.studyOptions,
      })

      if (url) {
        wx.navigateTo({ url })
      }
    }

    wx.showToast({
      title: getActionToast(actionType, title),
      icon: 'none',
    })
  },

  async onAppointmentConfirm(e) {
    const { taskId, status } = e.currentTarget.dataset
    if (!taskId) return

    if (status === 'pending') {
      wx.showToast({
        title: '请先完成上一个待办',
        icon: 'none',
      })
      return
    }

    const value = Array.isArray(e.detail.value) ? e.detail.value : [0, 0]
    const dateLabel = this.data.appointmentPickerRange[0][value[0]] || ''
    const timeLabel = this.data.appointmentPickerRange[1][value[1]] || ''
    const selectedLabel = `${dateLabel} ${timeLabel}`.trim()

    this.setData({
      appointmentPickerValue: value,
    })

    completeLearningPathTask(this.data.pointName, 'diagnose', taskId, {
      selectedLabel,
    })
    try {
      await persistLearningPathTask(this.data.pointName, 'diagnose', taskId, {
        selectedLabel,
        appointment: {
          label: selectedLabel,
        },
      }, this.app)
    } catch (_error) {}
    this.refreshStage()

    wx.showToast({
      title: `已预约 ${selectedLabel}`,
      icon: 'none',
    })
  },

  onSecondaryActionTap(e) {
    const { status, actionType } = e.currentTarget.dataset
    if (status === 'pending') {
      wx.showToast({
        title: '请先完成上一个待办',
        icon: 'none',
      })
      return
    }

    if (actionType === 'askTeacher') {
      void openTeacherTab()
    }
  },
})
