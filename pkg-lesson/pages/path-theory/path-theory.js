const {
  fetchStudentPointLearningSummary,
  fetchStudentStudyCourse,
} = require('../../../utils/student-api')

const DEFAULT_GROUPS = [
  {
    title: '1v1共识',
    items: [
      { title: '去上课', status: 'pending', actionText: '待接入', actionLabel: '1v1共识直播课连接' },
      { title: '已上课', status: 'pending', actionText: '待接入', actionLabel: '1v1共识回放课连接' },
      { title: '课后反馈', status: 'pending', actionText: '待接入', actionLabel: '1v1共识课后反馈' },
    ],
  },
  {
    title: '理论课',
    items: [
      { title: '理论课数据加载中', status: 'pending', actionText: '' },
    ],
  },
  {
    title: '1v1纠偏',
    items: [
      { title: '去上课', status: 'pending', actionText: '待接入', actionLabel: '1v1纠偏直播课连接' },
      { title: '已上课', status: 'pending', actionText: '待接入', actionLabel: '1v1纠偏回放课连接' },
      { title: '课后反馈', status: 'pending', actionText: '待接入', actionLabel: '1v1纠偏课后反馈' },
    ],
  },
]

function getStatusByTask(task = {}, hasResource = false) {
  if (Number(task.completed) === 1) return 'done'
  if (hasResource) return 'current'
  return 'pending'
}

function buildTheoryItems(days = []) {
  const items = []

  days.forEach((day) => {
    ;(day.tasks || [])
      .filter((task) => task.type === 'video' || task.type === 'review')
      .forEach((task) => {
        const resources = Array.isArray(task.resources) ? task.resources : []
        const preResources = resources.filter((resource) => resource.phase === 'pre')
        const mainResources = resources.filter((resource) => resource.phase === 'main')
        const postResources = resources.filter((resource) => resource.phase === 'post')
        const status = getStatusByTask(task, resources.length > 0)

        preResources.forEach((resource) => {
          items.push({
            title: resource.title || `${task.name} · 课前资料`,
            status,
            actionText: '查看详情',
            actionLabel: resource.title || task.name,
            routeTarget: 'recorded',
          })
        })

        mainResources.forEach((resource, index) => {
          items.push({
            title: resource.title || task.name,
            status,
            actionText: index === 0 ? '进入详情' : '查看详情',
            actionLabel: resource.title || task.name,
            routeTarget: 'recorded',
          })
        })

        postResources.forEach((resource) => {
          items.push({
            title: resource.title || `${task.name} · 课后资料`,
            status,
            actionText: '查看详情',
            actionLabel: resource.title || task.name,
            routeTarget: 'recorded',
          })
        })

        if (!resources.length) {
          items.push({
            title: task.name || `第${day.day_number}天理论任务`,
            status,
            actionText: '查看详情',
            actionLabel: task.name || '理论课任务',
            routeTarget: 'recorded',
          })
        }
      })
  })

  return items.length > 0
    ? items
    : [{ title: '当前卡点暂无理论课内容', status: 'pending', actionText: '' }]
}

Page({
  data: {
    pointName: '当前卡点',
    courseId: '',
    stageIndex: '2 / 6',
    stageName: '理论',
    stageSubtitle: '按「1v1共识 → 理论课 → 1v1纠偏」三层推进，会更清晰。',
    theoryGroups: DEFAULT_GROUPS,
  },

  onLoad(options) {
    const pointName = options.pointName ? decodeURIComponent(options.pointName) : '当前卡点'
    this.setData({ pointName })
    wx.setNavigationBarTitle({
      title: '理论',
    })

    void this.loadTheoryData(pointName)
  },

  async loadTheoryData(pointName) {
    try {
      const summary = await fetchStudentPointLearningSummary(pointName, this)
      const courseId = summary && summary.courseId ? String(summary.courseId) : ''

      if (!courseId) {
        this.setData({
          theoryGroups: DEFAULT_GROUPS.map((group) => (
            group.title === '理论课'
              ? { ...group, items: [{ title: '当前卡点暂无已分配理论课', status: 'pending', actionText: '' }] }
              : group
          )),
        })
        return
      }

      const study = await fetchStudentStudyCourse(courseId, this)
      const theoryItems = buildTheoryItems((study && study.days) || [])

      this.setData({
        courseId,
        theoryGroups: DEFAULT_GROUPS.map((group) => (
          group.title === '理论课'
            ? { ...group, items: theoryItems }
            : group
        )),
      })
    } catch (error) {
      this.setData({
        theoryGroups: DEFAULT_GROUPS.map((group) => (
          group.title === '理论课'
            ? { ...group, items: [{ title: '理论课数据读取失败', status: 'pending', actionText: '' }] }
            : group
        )),
      })
    }
  },

  onActionTap(e) {
    const { label, target } = e.currentTarget.dataset

    if (target === 'recorded' && this.data.courseId) {
      wx.navigateTo({
        url: `/pkg-lesson/pages/lesson-recorded/lesson-recorded?courseId=${encodeURIComponent(this.data.courseId)}&pointName=${encodeURIComponent(this.data.pointName)}`,
      })
      return
    }

    wx.showToast({
      title: `${label || '内容'}待接入`,
      icon: 'none',
    })
  },
})
