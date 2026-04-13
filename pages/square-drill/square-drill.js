const { uiIcons } = require('../../utils/ui-icons')

Page({
  data: {
    heroBadge: '刷题主岛',
    heroTitle: '今天刷题，今天靠岸一点',
    heroDesc: '先选适合你的方式：自己刷，或者跟班走。',
    overview: [
      { label: '今日题量', value: '30 题' },
      { label: '班课时间', value: '19:30' },
      { label: '连续练习', value: '9 天' },
    ],
    routes: [
      {
        key: 'class',
        badge: '班级入口',
        title: '刷题班',
        desc: '按课表推进刷题、作业、复盘和讲评，进入后直接看本班学习路径。',
        icon: uiIcons.class,
        cta: '进入刷题班',
        url: '/pages/trial-experience/trial-experience',
        stats: [
          { label: '当前周次', value: '第 2 周' },
          { label: '下次直播', value: '4/24 19:00' },
        ],
        tags: ['查看课表', '作业复盘'],
      },
      {
        key: 'xingce',
        badge: '刷题入口',
        title: '行测刷题',
        desc: '直接开始做题，优先把今天的练习推进掉。',
        icon: uiIcons.drill,
        cta: '立即刷题',
        url: '/pages/lesson-drill/lesson-drill',
        stats: [
          { label: '推荐模块', value: '言语 / 判断 / 资料' },
          { label: '当前进度', value: '已完成 18 题' },
        ],
        tags: ['专项练习', '错题回看'],
      },
    ],
  },

  handleRouteTap(e) {
    const { key } = e.currentTarget.dataset
    const route = this.data.routes.find((item) => item.key === key)
    if (!route || !route.url) return

    wx.navigateTo({ url: route.url })
  },
})
