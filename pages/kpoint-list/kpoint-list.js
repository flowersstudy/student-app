const NODE_LAYOUT = [
  {
    id: 'red-1',
    courseId: 1,
    tier: 'red',
    name: '游走式找点',
    top: '11%',
    left: '50%',
    x: 500,
    y: 120,
    cardTop: '6%',
    cardLeft: '56%',
    summary:
      '这是整条路径最上游的底层问题。如果找点方式本身就不稳定，后面再学再多方法，也很容易学偏、写偏。',
    focusPoints: [
      '先建立稳定的找点顺序，而不是边读边猜',
      '学会区分主信息、次信息和干扰信息',
      '避免材料读完只记住细节，却抓不到真正核心'
    ]
  },
  {
    id: 'yellow-1',
    courseId: 2,
    tier: 'yellow',
    name: '总结转述难',
    top: '24%',
    left: '50%',
    x: 528,
    y: 255,
    cardTop: '18%',
    cardLeft: '57%',
    summary:
      '材料看懂了，但一写就跑偏，本质上是提炼和转述没有形成稳定结构，导致“知道意思”却不会落笔。',
    focusPoints: [
      '从材料中抽主旨，而不是照抄原句',
      '建立“概括—转述—落笔”的稳定流程',
      '减少口语化和碎片化表达'
    ]
  },
  {
    id: 'yellow-2',
    courseId: 5,
    tier: 'yellow',
    name: '对策推导难',
    top: '37%',
    left: '50%',
    x: 472,
    y: 395,
    cardTop: '30%',
    cardLeft: '20%',
    summary:
      '提对策时容易空泛、套话多，说明还不会从材料问题倒推出有效措施，也不会把措施写成得分表达。',
    focusPoints: [
      '从问题和原因反推可执行对策',
      '训练“主体—措施—目标”的表达结构',
      '避免没有依据的泛泛建议'
    ]
  },
  {
    id: 'yellow-3',
    courseId: 3,
    tier: 'yellow',
    name: '分析结构不清',
    top: '50%',
    left: '50%',
    x: 530,
    y: 535,
    cardTop: '43%',
    cardLeft: '57%',
    summary:
      '分析题常常只有材料堆砌，没有层次和递进，说明分析框架还没有真正建立起来。',
    focusPoints: [
      '先分清现象、本质、原因和影响',
      '学会在不同材料之间建立逻辑连接',
      '让分析过程有层次、有推进'
    ]
  },
  {
    id: 'yellow-4',
    courseId: 4,
    tier: 'yellow',
    name: '公文结构不清',
    top: '63%',
    left: '50%',
    x: 470,
    y: 670,
    cardTop: '56%',
    cardLeft: '20%',
    summary:
      '不是不会背格式，而是面对不同文种时，缺少稳定的结构判断方法，所以一换场景就容易乱。',
    focusPoints: [
      '先判断文种和写作目标',
      '明确结构、内容、语气之间的对应关系',
      '学会按题目要求灵活调整格式'
    ]
  },
  {
    id: 'blue-1',
    courseId: 6,
    tier: 'blue',
    name: '作文立意不准',
    top: '76%',
    left: '50%',
    x: 526,
    y: 800,
    cardTop: '68%',
    cardLeft: '57%',
    summary:
      '到了冲刺阶段，作文最先拼的是立意方向准不准。方向一旦选错，后面写再多也很难拉回来。',
    focusPoints: [
      '先定材料中心和题干要求',
      '避免模板化导致的跑题偏题',
      '把立意控制在可展开、可论证的范围内'
    ]
  },
  {
    id: 'blue-2',
    courseId: 7,
    tier: 'blue',
    name: '作文逻辑不清',
    top: '86%',
    left: '50%',
    x: 474,
    y: 885,
    cardTop: '77%',
    cardLeft: '20%',
    summary:
      '论点、论据、论证之间衔接混乱，是作文冲刺阶段最常见的第二层失分点。',
    focusPoints: [
      '搭好总分递进结构',
      '让每一段都围绕中心展开',
      '避免观点堆砌和论证跳步'
    ]
  },
  {
    id: 'blue-3',
    courseId: 8,
    tier: 'blue',
    name: '作文表达不畅',
    top: '94%',
    left: '50%',
    x: 500,
    y: 955,
    cardTop: '81%',
    cardLeft: '57%',
    summary:
      '内容已经有了，但语言不够顺、不够书面，最后会直接影响作文整体质感和完成度。',
    focusPoints: [
      '提升句子衔接和书面表达',
      '减少口语化和重复表述',
      '形成更稳定的作文语言节奏'
    ]
  }
]

function buildSvg(nodes) {
  const pathData = nodes.reduce((result, node, index) => {
    if (index === 0) return `M ${node.x} ${node.y}`
    const prev = nodes[index - 1]
    const controlY = Math.round((prev.y + node.y) / 2)
    return `${result} C ${prev.x} ${controlY}, ${node.x} ${controlY}, ${node.x} ${node.y}`
  }, '')

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" preserveAspectRatio="none">
      <defs>
        <linearGradient id="pathGradient" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stop-color="#FF6B6B"/>
          <stop offset="48%" stop-color="#FFD93D"/>
          <stop offset="100%" stop-color="#4ECDC4"/>
        </linearGradient>
      </defs>
      <path
        d="${pathData}"
        fill="none"
        stroke="url(#pathGradient)"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

Page({
  data: {
    nodes: NODE_LAYOUT,
    pathSvg: '',
    activeNode: null
  },

  onLoad() {
    this.setData({ pathSvg: buildSvg(NODE_LAYOUT) })
  },

  openNode(e) {
    const { id } = e.currentTarget.dataset
    const activeNode = this.data.nodes.find((node) => node.id === id)
    if (!activeNode) return
    if (this.data.activeNode && this.data.activeNode.id === id) {
      this.setData({ activeNode: null })
      return
    }
    this.setData({ activeNode })
  },

  closeNode() {
    this.setData({ activeNode: null })
  },

  noop() {},

  goCourseDetail(e) {
    const courseId = e.currentTarget.dataset.courseId
    if (!courseId) return
    wx.navigateTo({
      url: `/pages/course-intro/course-intro?id=${courseId}`
    })
  }
})
