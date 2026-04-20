const { getPointKnowledgeDetail } = require('../../utils/point-knowledge')

const POINT_THEME_MAP = {
  1: { accent: '#FE4A4C', accentDeep: '#CD3B3F', soft: '#FFF4F4', softBorder: '#FFD5D6', pageTop: '#FFF8F8', pageBottom: '#FFF3F3' },
  2: { accent: '#FE4A4C', accentDeep: '#CD3B3F', soft: '#FFF4F4', softBorder: '#FFD5D6', pageTop: '#FFF8F8', pageBottom: '#FFF3F3' },
  3: { accent: '#1FB0F5', accentDeep: '#0D8EC9', soft: '#F1FAFF', softBorder: '#CFEFFF', pageTop: '#F7FCFF', pageBottom: '#EEF8FF' },
  4: { accent: '#1FB0F5', accentDeep: '#0D8EC9', soft: '#F1FAFF', softBorder: '#CFEFFF', pageTop: '#F7FCFF', pageBottom: '#EEF8FF' },
  5: { accent: '#1FB0F5', accentDeep: '#0D8EC9', soft: '#F1FAFF', softBorder: '#CFEFFF', pageTop: '#F7FCFF', pageBottom: '#EEF8FF' },
  6: { accent: '#FF9601', accentDeep: '#CA790B', soft: '#FFF7EB', softBorder: '#FFE0B3', pageTop: '#FFFDF7', pageBottom: '#FFF7EB' },
  7: { accent: '#FF9601', accentDeep: '#CA790B', soft: '#FFF7EB', softBorder: '#FFE0B3', pageTop: '#FFFDF7', pageBottom: '#FFF7EB' },
  8: { accent: '#FF9601', accentDeep: '#CA790B', soft: '#FFF7EB', softBorder: '#FFE0B3', pageTop: '#FFFDF7', pageBottom: '#FFF7EB' },
}

function buildThemeStyle(pointId = 0) {
  const theme = POINT_THEME_MAP[Number(pointId)] || POINT_THEME_MAP[3]
  return [
    `--knowledge-accent:${theme.accent}`,
    `--knowledge-accent-deep:${theme.accentDeep}`,
    `--knowledge-soft:${theme.soft}`,
    `--knowledge-soft-border:${theme.softBorder}`,
    `--knowledge-page-top:${theme.pageTop}`,
    `--knowledge-page-bottom:${theme.pageBottom}`,
  ].join(';')
}

Page({
  data: {
    detail: null,
    themeStyle: '',
  },

  onLoad(options = {}) {
    const pointId = Number(options.pointId || 0)
    const detail = getPointKnowledgeDetail(pointId)

    if (!detail) {
      wx.showToast({
        title: '未找到知识点内容',
        icon: 'none',
      })
      return
    }

    wx.setNavigationBarTitle({
      title: detail.title,
    })

    this.setData({
      detail,
      themeStyle: buildThemeStyle(pointId),
    })
  },
})
