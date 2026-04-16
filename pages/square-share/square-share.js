const { uiIcons } = require('../../utils/ui-icons')
const {
  featuredPostId,
  shareCategories,
  sharePosts,
} = require('../../utils/share-posts')

function formatCount(value) {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}w`
  }
  return `${value}`
}

function getPostsByCategory(categoryKey) {
  if (categoryKey === 'all') {
    return sharePosts.slice()
  }
  return sharePosts.filter((item) => item.category === categoryKey)
}

function buildCategoryChips(activeCategory) {
  return shareCategories.map((item) => ({
    ...item,
    active: item.key === activeCategory,
  }))
}

function buildHeroStats() {
  const totalViews = sharePosts.reduce((sum, item) => sum + item.views, 0)
  const totalLikes = sharePosts.reduce((sum, item) => sum + item.likes, 0)

  return [
    { label: '本周更新', value: `${sharePosts.length} 篇` },
    { label: '累计阅读', value: formatCount(totalViews) },
    { label: '收藏点赞', value: formatCount(totalLikes) },
  ]
}

function buildPostCards(list, selectedPostId) {
  return list.map((item) => ({
    id: item.id,
    title: item.title,
    summary: item.summary,
    authorName: item.authorName,
    authorRole: item.authorRole,
    avatarText: item.avatarText,
    publishDate: item.publishDate,
    readTime: item.readTime,
    examLabel: item.examLabel,
    resultText: item.resultText,
    tagText: item.tagText,
    problemTags: item.problemTags || [],
    viewsText: formatCount(item.views),
    likesText: formatCount(item.likes),
    commentsText: formatCount(item.comments),
    active: item.id === selectedPostId,
  }))
}

Page({
  data: {
    uiIcons,
    heroStats: buildHeroStats(),
    categoryChips: [],
    activeCategory: 'all',
    featuredPost: null,
    postCards: [],
  },

  onLoad() {
    const featuredPost = sharePosts.find((item) => item.id === featuredPostId) || sharePosts[0] || null

    this.setData({
      featuredPost: featuredPost
        ? {
            ...featuredPost,
            viewsText: formatCount(featuredPost.views),
            likesText: formatCount(featuredPost.likes),
            commentsText: formatCount(featuredPost.comments),
          }
        : null,
    })

    this.syncPageState('all', featuredPost ? featuredPost.id : '')
  },

  syncPageState(activeCategory, selectedPostId) {
    const filteredPosts = getPostsByCategory(activeCategory)
    const selectedPost = filteredPosts.find((item) => item.id === selectedPostId) || filteredPosts[0] || null

    this.setData({
      activeCategory,
      categoryChips: buildCategoryChips(activeCategory),
      postCards: buildPostCards(filteredPosts, selectedPost ? selectedPost.id : ''),
    })
  },

  handleCategoryTap(e) {
    const { key } = e.currentTarget.dataset
    if (!key || key === this.data.activeCategory) return
    this.syncPageState(key, '')
  },

  handlePostTap(e) {
    const { id } = e.currentTarget.dataset
    if (!id) return
    wx.navigateTo({
      url: `/pages/share-detail/share-detail?id=${id}`,
    })
  },

  handleFeaturedTap() {
    const featuredPost = this.data.featuredPost
    if (!featuredPost) return

    wx.navigateTo({
      url: `/pages/share-detail/share-detail?id=${featuredPost.id}`,
    })
  },
})
