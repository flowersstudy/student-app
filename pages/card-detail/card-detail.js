const { buildStageUrl } = require('../../utils/path-stage-routes')

const pointMap = {
  1: { name: '要点不全不准', type: '申论卡点' },
  2: { name: '提炼转述困难', type: '申论卡点' },
  3: { name: '分析结构不清', type: '申论卡点' },
  4: { name: '公文结构不清', type: '申论卡点' },
  5: { name: '对策推导困难', type: '申论卡点' },
  6: { name: '作文立意不准', type: '申论卡点' },
  7: { name: '作文论证不清', type: '申论卡点' },
  8: { name: '作文表达不畅', type: '申论卡点' },
}

const PATH_STAGE_TEMPLATE = [
  {
    key: 'diagnose',
    title: '诊断',
    shortTitle: '诊断',
    desc: '先确认这个卡点的核心问题、目标分差和后续突破方向。',
    hint: '这里后续可展开诊断内容',
  },
  {
    key: 'theory',
    title: '理论',
    shortTitle: '理论',
    desc: '补齐方法理解，先知道这个卡点到底应该怎么做。',
    hint: '这里后续可展开理论内容',
  },
  {
    key: 'training',
    title: '实训',
    shortTitle: '实训',
    desc: '围绕该卡点进入针对性训练，把方法真正练熟。',
    hint: '这里后续可展开实训内容',
  },
  {
    key: 'exam',
    title: '测试',
    shortTitle: '测试',
    desc: '通过阶段测试检查是否掌握，验证当前训练效果。',
    hint: '这里后续可展开测试内容',
  },
  {
    key: 'drill',
    title: '刷题',
    shortTitle: '刷题',
    desc: '回到做题场景里稳定输出，把卡点真正打通。',
    hint: '这里后续可展开刷题内容',
  },
  {
    key: 'report',
    title: '报告',
    shortTitle: '报告',
    desc: '最后沉淀本卡点的阶段结论、问题复盘和成长记录。',
    hint: '这里后续可展开报告内容',
  },
]

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

function buildStageSummary(stages = []) {
  const currentStage = stages.find((item) => item.status === 'current') || stages[0]

  return {
    pathText: '诊断 → 理论 → 实训 → 测试 → 刷题 → 报告',
    currentStageTitle: currentStage ? currentStage.title : '诊断',
    currentStageDesc: currentStage ? currentStage.desc : '',
  }
}

Page({
  data: {
    pointId: 2,
    pointName: '提炼转述困难',
    pointType: '申论卡点',
    courseStatus: 'pending',
    statusText: '待突破',
    statusTone: 'orange',
    pathStages: buildPathStages('pending', 2, '提炼转述困难'),
    stageSummary: buildStageSummary(buildPathStages('pending', 2, '提炼转述困难')),
  },

  onLoad(options) {
    const id = parseInt(options.id, 10) || 2
    const courseStatus = options.status === 'solved' ? 'solved' : 'pending'
    const point = pointMap[id] || pointMap[2]
    const pathStages = buildPathStages(courseStatus, id, point.name)

    this.setData({
      pointId: id,
      pointName: point.name,
      pointType: point.type,
      courseStatus,
      statusText: courseStatus === 'solved' ? '已解决' : '待突破',
      statusTone: courseStatus === 'solved' ? 'green' : 'orange',
      pathStages,
      stageSummary: buildStageSummary(pathStages),
    })
  },

  onStageTap(e) {
    const { url } = e.currentTarget.dataset
    if (!url) return

    wx.navigateTo({ url })
  },
})
