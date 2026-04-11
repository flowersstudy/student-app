const app = getApp()

Page({
  data: {
    student: { name: '张三', exam: '国考行测申论', diagnosisDate: '2026-04-03', teacher: '李老师' },
    diagnosisScore: 108,
    targetScore: 130,
    scoreGap: 22,
    corePoints: [
      { id: 7, name: '作文逻辑不清', priority: '高', desc: '作文论证结构混乱，缺乏清晰的层次感，论据与论点之间缺少衔接分析。' },
      { id: 2, name: '总结转述难',  priority: '高', desc: '材料提炼时容易受次要信息干扰，主旨提炼偏移，归纳段落大意准确率不足。' },
      { id: 4, name: '公文结构不清',  priority: '中', desc: '公文格式背记较熟，但内容组织套路化，缺乏针对题目的灵活调整。' }
    ],
    plan: [
      '第一阶段（1-2周）：优先攻克「作文逻辑不清」和「总结转述难」',
      '第二阶段（3-4周）：解决「公文结构不清」，同步巩固前两个卡点',
      '第三阶段（5-6周）：综合真题实战，稳固提分成果'
    ],
    teacherComment: '同学整体基础不错，逻辑思维能力较强，主要问题在于作文论证结构和答题规范化程度。按上述计划推进，预计6周内可达目标分数，加油！',
    messageExpanded: false
  },

  onLoad() {
    const profile = app.globalData.userProfile
    if (profile) {
      this.setData({ 'student.name': profile.name })
    }
  },

  toggleMessage() {
    this.setData({ messageExpanded: !this.data.messageExpanded })
  }
})
