Component({
  properties: {
    selected: {
      type: String,
      value: 'home',
    },
  },

  data: {
    list: [
      {
        key: 'home',
        text: '首页',
        pagePath: '/pages/home/home',
        iconPath: '/assets/tabbar/home-normal-hd.png',
        selectedIconPath: '/assets/tabbar/home-active-hd.png',
      },
      {
        key: 'chat',
        text: '找老师',
        pagePath: '/pages/chat/chat',
        iconPath: '/assets/tabbar/teacher-normal-hd.png',
        selectedIconPath: '/assets/tabbar/teacher-active-hd.png',
      },
      {
        key: 'results',
        text: '复盘',
        pagePath: '/pages/results/results',
        iconPath: '/assets/tabbar/review-normal-hd.png',
        selectedIconPath: '/assets/tabbar/review-active-hd.png',
      },
    ],
  },

  methods: {
    onTabTap(e) {
      const { path, key } = e.currentTarget.dataset
      if (!path || key === this.data.selected) return

      wx.switchTab({ url: path })
    },
  },
})
