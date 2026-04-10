const PATH_STEPS = [
  {
    id: 'task',
    title: '完成刷题任务',
    desc: '先完成当期卡点对应的刷题任务，明确自己卡在哪里。',
  },
  {
    id: 'submit',
    title: '提交刷题作业',
    desc: '按要求提交当天作业，系统先做 AI 批改，老师再重点看问题。',
  },
  {
    id: 'review',
    title: '完成并反馈复盘',
    desc: '根据指导完成复盘，把“为什么错”真正说清楚、写明白。',
  },
  {
    id: 'live',
    title: '直播学习',
    desc: '进入直播课，针对共性卡点集中拆解方法和提分路径。',
  },
]

const SCHEDULE_WEEKS = [
  {
    label: '第 1 周',
    days: [
      { date: '4/13', weekday: '日', title: '完成 1 道游走式找点 + 提炼转述错误的刷题', type: 'task' },
      { date: '4/14', weekday: '一', title: '提交刷题作业', note: 'AI 批改', type: 'submit' },
      { date: '4/15', weekday: '二', title: '根据指导完成刷题复盘', type: 'review' },
      { date: '4/16', weekday: '三', title: '提交刷题复盘', type: 'submit' },
      { date: '4/17', weekday: '四', title: '直播 1：讲解精准找点的方法', note: '19:00-20:30', type: 'live' },
      { date: '4/18', weekday: '五', title: '休息', type: 'rest' },
      { date: '4/19', weekday: '六', title: '休息', type: 'rest' },
    ],
  },
  {
    label: '第 2 周',
    days: [
      { date: '4/20', weekday: '日', title: '完成 1 道对策推导错误的刷题', type: 'task' },
      { date: '4/21', weekday: '一', title: '提交刷题作业', note: 'AI 批改', type: 'submit' },
      { date: '4/22', weekday: '二', title: '根据指导完成刷题复盘', type: 'review' },
      { date: '4/23', weekday: '三', title: '提交刷题复盘', type: 'submit' },
      { date: '4/24', weekday: '四', title: '直播 2：分享对策精准可行的思路', note: '19:00-20:30', type: 'live' },
      { date: '4/25', weekday: '五', title: '休息', type: 'rest' },
      { date: '4/26', weekday: '六', title: '休息', type: 'rest' },
    ],
  },
  {
    label: '第 3 周',
    days: [
      { date: '4/27', weekday: '日', title: '完成 1 道分析结构错误的刷题', type: 'task' },
      { date: '4/28', weekday: '一', title: '完成 1 道公文结构错误的刷题 + 提交作业', note: 'AI 批改', type: 'submit' },
      { date: '4/30', weekday: '三', title: '根据指导完成刷题复盘并提交', type: 'review' },
      { date: '4/30', weekday: '三', title: '直播 3：讲解结构正确的方法', note: '19:00-20:30', type: 'live' },
      { date: '5/1', weekday: '四', title: '休息', note: '劳动节', type: 'rest' },
      { date: '5/2', weekday: '五', title: '休息', type: 'rest' },
      { date: '5/3', weekday: '六', title: '休息', type: 'rest' },
    ],
  },
  {
    label: '第 4 周',
    days: [
      { date: '5/4', weekday: '日', title: '完成 1 道作文立意错误的刷题', note: '完成立意', type: 'task' },
      { date: '5/5', weekday: '一', title: '完成 1 道作文逻辑不清晰 + 表达不流畅的刷题', note: '完成开头 + 1 个分论点论证 + 结尾', type: 'task' },
      { date: '5/6', weekday: '二', title: '提交刷题作业', note: 'AI 批改', type: 'submit' },
      { date: '5/7', weekday: '三', title: '根据指导完成刷题复盘并提交', type: 'review' },
      { date: '5/8', weekday: '四', title: '直播 4：探讨写好作文的技巧', note: '19:00-21:00', type: 'live' },
      { date: '5/9', weekday: '五', title: '休息', type: 'rest' },
      { date: '5/10', weekday: '六', title: '休息', type: 'rest' },
    ],
  },
]

const NOTICE_LIST = [
  '所有任务需要当天按时提交。',
  '本次直播在腾讯会议 APP 中进行，无回放，请提前下载好腾讯会议 APP 并准时参加。',
  '具体直播时间可能会根据当月情况调整，若有变化会另行通知。',
]

Page({
  data: {
    isEnrolled: false,
    productName: '《申论八大卡点·破局刷题营》',
    depositText: '99 元 / 月，4 次直播全勤返还 99 元',
    pathSteps: PATH_STEPS,
    scheduleWeeks: SCHEDULE_WEEKS,
    noticeList: NOTICE_LIST,
  },

  onShow() {
    const app = getApp()
    this.setData({
      isEnrolled: !!(app && app.globalData && app.globalData.isEnrolled),
    })
  },

  goToPurchase() {
    wx.navigateTo({
      url: '/pages/purchase/purchase',
    })
  },
})
