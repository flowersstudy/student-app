Component({
  options: {
    addGlobalClass: true,
  },

  data: {
    selected: 'home',
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

  lifetimes: {
    attached() {
      this.syncByRoute()
    },
  },

  methods: {
    syncByRoute() {
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      const currentRoute = currentPage && currentPage.route ? `/${currentPage.route}` : ''
      const currentItem = this.data.list.find((item) => item.pagePath === currentRoute)

      if (currentItem && currentItem.key !== this.data.selected) {
        this.setData({ selected: currentItem.key })
      }
    },

    onTabTap(e) {
      const { path, key } = e.currentTarget.dataset
      if (!path) return

      if (key !== this.data.selected) {
        this.setData({ selected: key })
      }

      wx.switchTab({ url: path })
    },
  },
})
