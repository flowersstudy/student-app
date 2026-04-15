function syncCustomTabBar(pageInstance, selected) {
  if (!pageInstance || typeof pageInstance.getTabBar !== 'function') {
    return
  }

  const tabBar = pageInstance.getTabBar()
  if (!tabBar || typeof tabBar.setData !== 'function') {
    return
  }

  tabBar.setData({ selected })
}

module.exports = {
  syncCustomTabBar,
}
