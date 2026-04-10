const SELLING_POINTS = [
  {
    title: '核心卖点：不再盲目刷题——先找卡点，再开药方',
    desc: '别人让你刷 100 道，我让你先找到你专属的“八大卡点”是哪几个，刷 1 道顶 10 道。',
    tone: 'primary',
  },
  {
    title: '卖点 1：追问式自评表——逼出你的真实思考漏洞',
    desc: '每道题配一份“灵魂追问表”，一步步还原你是怎么想歪的，自己都能当自己的老师。',
    tone: 'blue',
  },
  {
    title: '卖点 2：直播“剖作业”——拒绝不知道为什么会错',
    desc: '每个卡点分类剖析学员作业，当场拆解“为什么会错”，让你隔着屏幕照镜子。',
    tone: 'orange',
  },
  {
    title: '卖点 3：全勤免费学——你敢坚持，我敢免单',
    desc: '1 个月 4 场直播，全程跟完就全额返 99 元，相当于白赚一套方法论 + 精题册 + 笔记。',
    tone: 'green',
  },
]

const PROCESS_STEPS = [
  '完成刷题任务',
  '提交刷题作业',
  '完成并反馈复盘',
  '直播学习',
]

const RIGHTS = [
  '全勤免费学（全勤标准：完整跟完 4 次直播）。',
  '配备 4 场直播，每场直播最低 60 分钟讲解 + 30 分钟答疑。',
  '配备 5 道精题（电子版）+ 对应题目的 AI 批改。',
  '获得 4 份申论卡点直播笔记（电子版）。',
]

const SCHEDULE_WEEKS = [
  {
    label: '4 月第 1 周',
    days: [
      { date: '13', weekday: '日', title: '完成 1 道游走式找点 + 提炼转述错误的刷题', tag: '任务' },
      { date: '14', weekday: '一', title: '提交刷题作业', note: 'AI 批改', tag: '提交' },
      { date: '15', weekday: '二', title: '根据指导完成刷题复盘', tag: '复盘' },
      { date: '16', weekday: '三', title: '提交刷题复盘', tag: '提交' },
      { date: '17', weekday: '四', title: '直播 1：讲解精准找点的方法', note: '19:00-20:30', tag: '直播' },
      { date: '18', weekday: '五', title: '休息', tag: '休息' },
      { date: '19', weekday: '六', title: '休息', tag: '休息' },
    ],
  },
  {
    label: '4 月第 2 周',
    days: [
      { date: '20', weekday: '日', title: '完成 1 道对策推导错误的刷题', tag: '任务' },
      { date: '21', weekday: '一', title: '提交刷题作业', note: 'AI 批改', tag: '提交' },
      { date: '22', weekday: '二', title: '根据指导完成刷题复盘', tag: '复盘' },
      { date: '23', weekday: '三', title: '提交刷题复盘', tag: '提交' },
      { date: '24', weekday: '四', title: '直播 2：分享对策精准可行的思路', note: '19:00-20:30', tag: '直播' },
      { date: '25', weekday: '五', title: '休息', tag: '休息' },
      { date: '26', weekday: '六', title: '休息', tag: '休息' },
    ],
  },
  {
    label: '4 月第 3 周',
    days: [
      { date: '27', weekday: '日', title: '完成 1 道分析结构错误的刷题', tag: '任务' },
      { date: '28', weekday: '一', title: '完成 1 道公文结构错误的刷题 + 提交作业', note: 'AI 批改', tag: '提交' },
      { date: '30', weekday: '三', title: '根据指导完成刷题复盘并提交', tag: '复盘' },
      { date: '30', weekday: '三', title: '直播 3：讲解结构正确的方法', note: '19:00-20:30', tag: '直播' },
      { date: '1', weekday: '四', title: '休息', note: '5 月 1 日', tag: '休息' },
      { date: '2', weekday: '五', title: '休息', tag: '休息' },
      { date: '3', weekday: '六', title: '休息', tag: '休息' },
    ],
  },
  {
    label: '5 月第 1 周',
    days: [
      { date: '4', weekday: '日', title: '完成 1 道作文立意错误的刷题', note: '完成立意', tag: '任务' },
      { date: '5', weekday: '一', title: '完成 1 道作文逻辑不清晰 + 表达不流畅的刷题', note: '完成开头 + 1 个分论点论证 + 结尾', tag: '任务' },
      { date: '6', weekday: '二', title: '提交刷题作业', note: 'AI 批改', tag: '提交' },
      { date: '7', weekday: '三', title: '根据指导完成刷题复盘并提交', tag: '复盘' },
      { date: '8', weekday: '四', title: '直播 4：探讨写好作文的技巧', note: '19:00-21:00', tag: '直播' },
      { date: '9', weekday: '五', title: '休息', tag: '休息' },
      { date: '10', weekday: '六', title: '休息', tag: '休息' },
    ],
  },
]

const NOTICE_LIST = [
  '所有任务需要当天按时提交。',
  '本次直播在腾讯会议 APP 中进行，无回放，请提前下载好腾讯会议 APP，准时参加。',
  '具体直播时间可能会根据当月情况具体调整，若有调整，会另行告知。',
]

Page({
  data: {
    productName: '《申论八大卡点·破局刷题营》',
    price: 99,
    priceDesc: '99 元 / 月 —— 跟完 4 次直播即返押金 99 元',
    coreSummary: '先找卡点，再开药方，把刷题、作业、复盘、直播串成一条真正能提分的主线。',
    sellingPoints: SELLING_POINTS,
    processSteps: PROCESS_STEPS,
    rights: RIGHTS,
    scheduleWeeks: SCHEDULE_WEEKS,
    noticeList: NOTICE_LIST,
  },

  onLoad() {
    wx.setNavigationBarTitle({
      title: '课程详情',
    })
  },

  goPayment() {
    const app = getApp()
    if (app && app.globalData) {
      app.globalData.isEnrolled = true
    }

    wx.showToast({
      title: '已生成学习计划',
      icon: 'success',
      duration: 1500,
    })

    setTimeout(() => {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        wx.navigateBack({ delta: 1 })
        return
      }

      wx.redirectTo({
        url: '/pages/trial-experience/trial-experience',
      })
    }, 1500)
  },
})
