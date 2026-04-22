const { appendStudyQuery, normalizeStudyOptions } = require('../../../utils/study-route')

Page({
  data: {
    reviewInfo: {
      title: '刷题复盘反馈',
      subtitle: '把“为什么错、下次怎么改”写清楚，老师看你的问题会更快。',
    },
    mistakeOptions: [
      { id: 'point', label: '漏点', selected: true },
      { id: 'logic', label: '逻辑不清', selected: false },
      { id: 'wording', label: '表达不准', selected: false },
      { id: 'timing', label: '时间分配失衡', selected: false },
    ],
    reflection: '',
    nextAction: '',
    questionForTeacher: '',
    checklist: [
      { id: 1, text: '我已经重新看过题干要求', checked: true },
      { id: 2, text: '我已经找到自己最主要的 1 个问题', checked: false },
      { id: 3, text: '我已经写出下次作答的改法', checked: false },
    ],
  },

  onLoad(options) {
    this.studyOptions = normalizeStudyOptions(options, {
      pointName: '对策推导困难',
    })
  },

  toggleMistake(e) {
    const { id } = e.currentTarget.dataset
    this.setData({
      mistakeOptions: this.data.mistakeOptions.map((item) => ({
        ...item,
        selected: item.id === id ? !item.selected : item.selected,
      })),
    })
  },

  toggleChecklist(e) {
    const { id } = e.currentTarget.dataset
    this.setData({
      checklist: this.data.checklist.map((item) => ({
        ...item,
        checked: item.id === id ? !item.checked : item.checked,
      })),
    })
  },

  onReflectionInput(e) {
    this.setData({ reflection: e.detail.value })
  },

  onNextActionInput(e) {
    this.setData({ nextAction: e.detail.value })
  },

  onQuestionInput(e) {
    this.setData({ questionForTeacher: e.detail.value })
  },

  async submitReview() {
    wx.showToast({
      title: '复盘反馈已提交',
      icon: 'success',
    })
  },

  goLive() {
    wx.navigateTo({
      url: appendStudyQuery('/pkg-practice/pages/practice-live/practice-live', this.studyOptions),
    })
  },
})
