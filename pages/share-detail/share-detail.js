const { uiIcons } = require('../../utils/ui-icons')
const { sharePosts } = require('../../utils/share-posts')

function formatCount(value) {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}w`
  }
  return `${value}`
}

function getPostById(id) {
  return sharePosts.find((item) => item.id === id) || sharePosts[0] || null
}

Page({
  data: {
    uiIcons,
    post: null,
  },

  onLoad(options) {
    const post = getPostById(options.id)

    if (!post) {
      return
    }

    this.setData({
      post: {
        ...post,
        viewsText: formatCount(post.views),
        likesText: formatCount(post.likes),
        commentsText: formatCount(post.comments),
      },
    })

    wx.setNavigationBarTitle({
      title: '帖子详情',
    })
  },
})
