const TAB_ROUTE_MAP = {
  home: '/pages/home/home',
  chat: '/pages/chat/chat',
  results: '/pages/results/results',
}

function resolveTabPath(key = '', fallbackPath = '') {
  return TAB_ROUTE_MAP[key] || fallbackPath || ''
}

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
        pagePath: TAB_ROUTE_MAP.home,
        iconPath: '/assets/tabbar/home-normal-hd.png',
        selectedIconPath: '/assets/tabbar/home-active-hd.png',
      },
      {
        key: 'chat',
        text: '找老师',
        pagePath: TAB_ROUTE_MAP.chat,
        iconPath: '/assets/tabbar/teacher-normal-hd.png',
        selectedIconPath: '/assets/tabbar/teacher-active-hd.png',
      },
      {
        key: 'results',
        text: '复盘',
        pagePath: TAB_ROUTE_MAP.results,
        iconPath: '/assets/tabbar/review-normal-hd.png',
        selectedIconPath: '/assets/tabbar/review-active-hd.png',
      },
    ],
  },

  methods: {
    onTabTap(e) {
      const { path, key } = e.currentTarget.dataset
      const targetPath = resolveTabPath(key, path)
      if (!targetPath || key === this.data.selected) return

      wx.switchTab({
        url: targetPath,
        fail: () => {
          wx.reLaunch({ url: targetPath })
        },
      })
    },
  },
})
