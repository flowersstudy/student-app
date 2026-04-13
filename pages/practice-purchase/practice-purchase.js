const app = getApp()

const WEEK_PLAN = [
  {
    week: '第 1 周',
    focus: '找点与转述纠偏',
    desc: '先围绕游走式找点、总结转述难开第一轮刷题，建立稳定做题节奏。',
  },
  {
    week: '第 2 周',
    focus: '对策专项推进',
    desc: '继续完成专题刷题、提交作业，并结合讲评把对策推导问题捋顺。',
  },
  {
    week: '第 3 周',
    focus: '结构与公文巩固',
    desc: '按周推进刷题、复盘与直播讲评，把结构感真正练出来。',
  },
  {
    week: '第 4 周',
    focus: '作文专项冲刺',
    desc: '围绕立意、逻辑、表达收口，形成完整的刷题闭环。',
  },
]

Page({
  data: {
    course: {
      badge: '全勤返现班',
      title: '刷题班',
      subtitle: '把每周刷题、作业、复盘和直播讲评排成固定节奏。先按 99 元 / 月开通，4 次直播全勤后返还 99 元。',
      price: '99 元 / 月',
      extra: '4 次直播全勤返还 99 元',
      headline: '4 次直播全勤返 99 元',
      arrivalPrice: '最低 0 元',
      heroTags: ['每周训练安排', '作业与复盘', '直播讲评'],
    },
    pricingRows: [
      { label: '开通价', value: '99 元 / 月' },
      { label: '全勤返现', value: '99 元' },
      { label: '到手最低', value: '0 元' },
    ],
    fitList: [
      '已经知道自己的卡点，想进入稳定训练节奏',
      '不想再自己乱刷题，希望有人把周计划排清楚',
      '想把刷题、作业、复盘和讲评串成闭环',
    ],
    serviceList: [
      '每周刷题任务安排',
      '作业提交与阶段反馈',
      '刷题复盘提醒',
      '4 次直播讲评安排',
    ],
    refundList: [
      '先按月开通刷题班',
      '当月 4 次直播全部按时参加',
      '满足全勤后返还当月 99 元',
      '更适合想先低门槛开始训练的人',
    ],
    weekPlan: WEEK_PLAN,
  },

  onLoad() {
    wx.setNavigationBarTitle({
      title: '刷题课购买',
    })
  },

  goCardPurchase() {
    wx.navigateTo({
      url: '/pages/purchase/purchase',
    })
  },

  confirmPurchase() {
    if (app && app.globalData) {
      app.globalData.hasPracticeCourse = true
    }

    wx.setStorageSync('student_has_practice_course', true)

    wx.showToast({
      title: '已开通刷题课',
      icon: 'success',
      duration: 1000,
    })

    setTimeout(() => {
      wx.redirectTo({
        url: '/pages/trial-experience/trial-experience',
      })
    }, 1000)
  },
})
