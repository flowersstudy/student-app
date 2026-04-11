const { uiIcons } = require('../../utils/ui-icons')

const stations = [
  {
    key: 'activity',
    title: '活动发布',
    icon: uiIcons.oceanSeagull,
    position: 'activity',
    size: 'normal',
    tone: 'sky',
    action: { type: 'navigateTo', url: '/pages/square-activity/square-activity' },
  },
  {
    key: 'team',
    title: '组队学习',
    icon: uiIcons.oceanDolphin,
    position: 'team',
    size: 'normal',
    tone: 'blue',
    action: { type: 'navigateTo', url: '/pages/square-team/square-team' },
  },
  {
    key: 'drill',
    title: '刷题',
    badge: '主岛',
    icon: uiIcons.drill,
    position: 'drill',
    size: 'primary',
    tone: 'gold',
    action: { type: 'navigateTo', url: '/pages/square-drill/square-drill' },
  },
  {
    key: 'comment',
    title: '用户评论',
    icon: uiIcons.oceanStarfish,
    position: 'comment',
    size: 'normal',
    tone: 'green',
    action: { type: 'navigateTo', url: '/pages/square-comment/square-comment' },
  },
  {
    key: 'case',
    title: '学生案例',
    icon: uiIcons.oceanTurtle,
    position: 'case',
    size: 'normal',
    tone: 'teal',
    action: { type: 'navigateTo', url: '/pages/square-case/square-case' },
  },
  {
    key: 'points',
    title: '积分兑换',
    icon: uiIcons.oceanShell,
    position: 'points',
    size: 'normal',
    tone: 'amber',
    action: { type: 'navigateTo', url: '/pages/square-points/square-points' },
  },
  {
    key: 'share',
    title: '经验分享',
    icon: uiIcons.oceanJellyfish,
    position: 'share',
    size: 'normal',
    tone: 'purple',
    action: { type: 'navigateTo', url: '/pages/square-share/square-share' },
  },
]

Page({
  data: {
    stations,
    landingGuideText: '在海上坚持，一座一座岛地靠近上岸。',
  },

  handleStationTap(e) {
    const { key } = e.currentTarget.dataset
    const station = stations.find((item) => item.key === key)
    if (!station) return

    wx.navigateTo({ url: station.action.url })
  },
})
