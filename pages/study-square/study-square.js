const { uiIcons } = require('../../utils/ui-icons')

const stations = [
  {
    key: 'activity',
    title: '活动发布',
    badge: '新',
    icon: uiIcons.oceanSeagull,
    position: 'activity',
    size: 'normal',
    tone: 'sky',
    action: { type: 'navigateTo', url: '/pages/notifications/notifications' },
  },
  {
    key: 'team',
    title: '组队学习',
    badge: '搭子',
    icon: uiIcons.oceanDolphin,
    position: 'team',
    size: 'normal',
    tone: 'blue',
    action: { type: 'switchTab', url: '/pages/chat/chat' },
  },
  {
    key: 'drill',
    title: '刷题',
    badge: '主岛',
    icon: uiIcons.drill,
    position: 'drill',
    size: 'primary',
    tone: 'gold',
    action: { type: 'navigateTo', url: '/pages/lesson-drill/lesson-drill' },
  },
  {
    key: 'comment',
    title: '用户评论',
    badge: '评论',
    icon: uiIcons.oceanStarfish,
    position: 'comment',
    size: 'normal',
    tone: 'green',
    action: { type: 'switchTab', url: '/pages/chat/chat' },
  },
  {
    key: 'case',
    title: '学生案例',
    badge: '案例',
    icon: uiIcons.oceanTurtle,
    position: 'case',
    size: 'normal',
    tone: 'teal',
    action: { type: 'switchTab', url: '/pages/results/results' },
  },
  {
    key: 'points',
    title: '积分兑换',
    badge: '奖励',
    icon: uiIcons.oceanShell,
    position: 'points',
    size: 'small',
    tone: 'amber',
    action: { type: 'navigateTo', url: '/pages/purchase/purchase' },
  },
  {
    key: 'share',
    title: '经验分享',
    badge: '分享',
    icon: uiIcons.oceanJellyfish,
    position: 'share',
    size: 'small',
    tone: 'purple',
    action: { type: 'navigateTo', url: '/pages/review/review' },
  },
]

Page({
  data: {
    stations,
    mapTips: ['中心主岛：刷题', '其余入口围绕学习展开'],
  },

  handleStationTap(e) {
    const { key } = e.currentTarget.dataset
    const station = stations.find((item) => item.key === key)
    if (!station) return

    if (station.action.type === 'switchTab') {
      wx.switchTab({ url: station.action.url })
      return
    }

    wx.navigateTo({ url: station.action.url })
  },
})
