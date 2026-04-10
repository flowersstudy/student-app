const { uiIcons } = require('../../utils/ui-icons')

const stations = [
  {
    key: 'activity',
    title: '活动发布',
    badge: '',
    icon: uiIcons.oceanSeagull,
    position: 'activity',
    tone: 'blue',
    action: { type: 'navigateTo', url: '/pages/notifications/notifications' },
  },
  {
    key: 'team',
    title: '组队学习',
    badge: '',
    icon: uiIcons.oceanDolphin,
    position: 'team',
    tone: 'cyan',
    action: { type: 'switchTab', url: '/pages/chat/chat' },
  },
  {
    key: 'sync',
    title: '信息同步',
    badge: '',
    icon: uiIcons.oceanWhale,
    position: 'sync',
    tone: 'blue',
    action: { type: 'navigateTo', url: '/pages/notifications/notifications' },
  },
  {
    key: 'comment',
    title: '用户评论',
    badge: '',
    icon: uiIcons.oceanStarfish,
    position: 'comment',
    tone: 'pink',
    action: { type: 'switchTab', url: '/pages/chat/chat' },
  },
  {
    key: 'case',
    title: '学生案例',
    badge: '',
    icon: uiIcons.oceanTurtle,
    position: 'case',
    tone: 'teal',
    action: { type: 'switchTab', url: '/pages/results/results' },
  },
  {
    key: 'points',
    title: '积分兑换',
    badge: '',
    icon: uiIcons.oceanShell,
    position: 'points',
    tone: 'gold',
    action: { type: 'navigateTo', url: '/pages/purchase/purchase' },
  },
  {
    key: 'share',
    title: '经验分享',
    badge: '',
    icon: uiIcons.oceanJellyfish,
    position: 'share',
    tone: 'purple',
    action: { type: 'navigateTo', url: '/pages/review/review' },
  },
]

const routeGuides = [
  { id: 'g1', icon: uiIcons.oceanDolphin, position: 'a' },
  { id: 'g2', icon: uiIcons.oceanSeagull, position: 'b' },
  { id: 'g3', icon: uiIcons.oceanTurtle, position: 'c' },
  { id: 'g4', icon: uiIcons.oceanJellyfish, position: 'd' },
]

Page({
  data: {
    uiIcons,
    stations,
    routeGuides,
  },

  handleStationTap(e) {
    const { key } = e.currentTarget.dataset
    const station = stations.find((item) => item.key === key)
    if (!station) return
    this.navigateByAction(station.action)
  },

  navigateByAction(action) {
    if (!action || !action.url) return

    if (action.type === 'switchTab') {
      wx.switchTab({ url: action.url })
      return
    }

    wx.navigateTo({ url: action.url })
  },
})
