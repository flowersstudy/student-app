function normalizeNumber(value) {
  if (value === null || value === undefined || String(value).trim() === '') {
    return null
  }

  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : null
}

function clampPercent(value) {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) {
    return 0
  }

  return Math.max(0, Math.min(100, numericValue))
}

function roundUpBy(value, step = 10) {
  if (!Number.isFinite(value) || value <= 0) {
    return step
  }

  return Math.ceil(value / step) * step
}

function getSeriesX(index, count) {
  if (count <= 1) return 50

  return ((index + 0.5) / count) * 100
}

function getProgressNodePosition(score, minScore, maxScore, fallbackPosition = 50) {
  const numericScore = normalizeNumber(score)
  if (numericScore === null) {
    return fallbackPosition
  }

  const safeMin = Number.isFinite(minScore) ? minScore : numericScore
  const safeMax = Number.isFinite(maxScore) ? maxScore : numericScore
  const span = safeMax - safeMin
  if (span <= 0) {
    return fallbackPosition
  }

  const clampedScore = Math.max(safeMin, Math.min(safeMax, numericScore))
  const ratio = (clampedScore - safeMin) / span
  const edgePadding = 6

  return edgePadding + ratio * (100 - edgePadding * 2)
}

function buildLineSvg(series = [], { strokeColor = '#4b5563' } = {}) {
  const validSeries = series.filter((item) => item && item.value !== null)
  if (validSeries.length < 2) {
    return ''
  }

  const polylinePoints = validSeries
    .map((item) => `${item.x.toFixed(2)},${(100 - item.percent).toFixed(2)}`)
    .join(' ')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="${polylinePoints}" fill="none" stroke="${strokeColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.82"/></svg>`

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function buildLinePoints(series = []) {
  return series
    .filter((item) => item && item.value !== null)
    .map((item, index) => ({
      key: item.key || `line-point-${index}`,
      style: `left:${item.x.toFixed(2)}%; bottom:${item.percent.toFixed(2)}%;`,
    }))
}

function buildStudyTimeTabs(currentRange = 'week', rangeOptions = []) {
  return rangeOptions.map((item) => ({
    ...item,
    active: item.key === currentRange,
  }))
}

function getStudyTimePreset(range = 'week', studyTimePresets = {}) {
  return studyTimePresets[range] || studyTimePresets.week || []
}

function resolvePointRateTone(item = {}) {
  const pointId = Number(item.id)
  if (pointId === 1 || pointId === 2) {
    return 'red'
  }
  if (pointId === 3 || pointId === 4 || pointId === 5) {
    return 'blue'
  }
  if (pointId === 6 || pointId === 7 || pointId === 8) {
    return 'yellow'
  }
  return 'orange'
}

function buildProgressChart(progressData = {}, copy = {}) {
  const {
    title = '',
    emptyHint = '',
    entryLabel = '',
    currentLabel = '',
    targetLabel = '',
  } = copy
  const entryScore = normalizeNumber(progressData.entryScore)
  const currentScore = normalizeNumber(progressData.currentScore)
  const targetScore = normalizeNumber(progressData.targetScore)
  const isEmpty = entryScore === null && currentScore === null && targetScore === null
  const fallbackScores = [entryScore, currentScore, targetScore].filter((item) => item !== null)
  const axisMin = entryScore !== null
    ? entryScore
    : fallbackScores.length
      ? Math.min(...fallbackScores)
      : null
  const axisMax = targetScore !== null
    ? targetScore
    : fallbackScores.length
      ? Math.max(...fallbackScores)
      : null
  const rawNodes = [
    { key: 'entry', label: entryLabel, value: entryScore, hidden: false },
    { key: 'current', label: currentLabel, value: currentScore, hidden: !isEmpty && entryScore !== null && currentScore === null },
    { key: 'target', label: targetLabel, value: targetScore, hidden: false },
  ]
  const visibleRawNodes = rawNodes.filter((item) => !item.hidden)
  const fallbackPositions = visibleRawNodes.length <= 1
    ? [50]
    : visibleRawNodes.map((item, index) => (index / (visibleRawNodes.length - 1)) * 100)
  const visibleNodes = visibleRawNodes.map((item, index) => {
    const position = getProgressNodePosition(item.value, axisMin, axisMax, fallbackPositions[index])
    const align = index === 0
      ? 'start'
      : index === visibleRawNodes.length - 1
        ? 'end'
        : 'center'

    return {
      ...item,
      active: item.value !== null && !isEmpty,
      valueText: item.value === null ? '--' : `${item.value}`,
      position,
      align,
      style: `left:${position}%;`,
    }
  })
  const activeNodes = visibleNodes.filter((item) => item.active)

  return {
    title,
    hint: isEmpty ? emptyHint : '',
    isEmpty,
    axisMinText: axisMin === null ? '--' : `${axisMin}`,
    axisMaxText: axisMax === null ? '--' : `${axisMax}`,
    nodes: visibleNodes,
    activeLineStyle: activeNodes.length >= 2
      ? `left:${activeNodes[0].position}%; width:${activeNodes[activeNodes.length - 1].position - activeNodes[0].position}%;`
      : '',
  }
}

const POINT_RATE_PLACEHOLDER_HEIGHTS = [72, 48, 85, 55, 68, 40, 78, 52]

function buildPointRateChart(pointItems = [], copy = {}) {
  const {
    title = '',
    legendBar = '',
    legendLine = '',
    emptyHint = '',
    partialHint = '',
  } = copy
  const normalizedItems = pointItems.map((item) => {
    const currentRate = normalizeNumber(item.currentRate)
    const targetRate = normalizeNumber(item.targetRate)

    return {
      ...item,
      currentRate,
      targetRate,
    }
  })
  const hasAnyData = normalizedItems.some((item) => item.currentRate !== null)
  const hasMissingData = hasAnyData && normalizedItems.some((item) => item.currentRate === null)
  const targetSeries = normalizedItems.map((item, index) => ({
    key: `target-${item.id || index}`,
    value: item.targetRate,
    percent: clampPercent(item.targetRate),
    x: getSeriesX(index, normalizedItems.length),
  }))

  const displayItems = hasAnyData
    ? normalizedItems.map((item, index) => ({
        tone: resolvePointRateTone(item),
        ...item,
        indexLabel: `${index + 1}`,
        valueText: item.currentRate === null ? '--' : `${item.currentRate}%`,
        targetText: item.targetRate === null ? '--' : `${item.targetRate}%`,
        barHeight: item.currentRate === null ? 12 : clampPercent(item.currentRate),
        isMissing: item.currentRate === null,
      }))
    : POINT_RATE_PLACEHOLDER_HEIGHTS.map((h, index) => ({
        id: index + 1,
        tone: 'empty',
        indexLabel: `${index + 1}`,
        valueText: '--',
        targetText: '--',
        barHeight: h,
        isMissing: false,
        isPlaceholder: true,
      }))

  return {
    title,
    legendBar,
    legendLine,
    hint: !hasAnyData
      ? emptyHint
      : hasMissingData
        ? partialHint
        : '',
    isEmpty: !hasAnyData,
    yAxis: [100, 80, 60, 40, 20, 0].map((value) => ({
      value,
      label: `${value}%`,
      bottom: `${value}%`,
    })),
    lineSvg: hasAnyData
      ? buildLineSvg(targetSeries, { strokeColor: '#8f9baa' })
      : '',
    linePoints: hasAnyData ? buildLinePoints(targetSeries) : [],
    items: displayItems,
  }
}

const STUDY_TIME_PLACEHOLDER = {
  day: [
    { key: 'ph-d1', label: '周一', barHeight: 35 },
    { key: 'ph-d2', label: '周二', barHeight: 60 },
    { key: 'ph-d3', label: '周三', barHeight: 45 },
    { key: 'ph-d4', label: '周四', barHeight: 80 },
    { key: 'ph-d5', label: '周五', barHeight: 55 },
    { key: 'ph-d6', label: '周六', barHeight: 70 },
    { key: 'ph-d7', label: '周日', barHeight: 50 },
  ],
  week: [
    { key: 'ph-w1', label: '第1周', barHeight: 45 },
    { key: 'ph-w2', label: '第2周', barHeight: 65 },
    { key: 'ph-w3', label: '第3周', barHeight: 30 },
    { key: 'ph-w4', label: '第4周', barHeight: 75 },
  ],
  month: [
    { key: 'ph-m1', label: '1月', barHeight: 40 },
    { key: 'ph-m2', label: '2月', barHeight: 55 },
    { key: 'ph-m3', label: '3月', barHeight: 70 },
    { key: 'ph-m4', label: '4月', barHeight: 85 },
    { key: 'ph-m5', label: '5月', barHeight: 60 },
    { key: 'ph-m6', label: '6月', barHeight: 75 },
  ],
}

function buildStudyTimeChart(studyItems = [], range = 'week', options = {}) {
  const {
    rangeOptions = [],
    title = '',
    fallbackRangeLabel = '',
    legendBar = '',
    legendLine = '',
    emptyHint = '',
    partialHint = '',
  } = options
  const normalizedItems = studyItems.map((item) => ({
    ...item,
    hours: normalizeNumber(item.hours),
  }))
  const validHours = normalizedItems
    .map((item) => item.hours)
    .filter((item) => item !== null)
  const hasAnyData = validHours.length > 0
  const hasMissingData = hasAnyData && normalizedItems.some((item) => item.hours === null)
  const maxHours = hasAnyData ? roundUpBy(Math.max(...validHours), 10) : 50
  const hourSeries = normalizedItems.map((item, index) => ({
    key: item.key || `hour-${index}`,
    value: item.hours,
    percent: item.hours === null ? 0 : clampPercent((item.hours / maxHours) * 100),
    x: getSeriesX(index, normalizedItems.length),
  }))

  const placeholderItems = (STUDY_TIME_PLACEHOLDER[range] || STUDY_TIME_PLACEHOLDER.week).map((item) => ({
    ...item,
    valueText: '--',
    isMissing: false,
    isPlaceholder: true,
  }))

  return {
    title,
    rangeLabel: (rangeOptions.find((item) => item.key === range) || {}).label || fallbackRangeLabel,
    legendBar,
    legendLine,
    hint: !hasAnyData
      ? emptyHint
      : hasMissingData
        ? partialHint
        : '',
    isEmpty: !hasAnyData,
    lineSvg: hasAnyData
      ? buildLineSvg(hourSeries, { strokeColor: '#ff7375' })
      : '',
    linePoints: hasAnyData ? buildLinePoints(hourSeries) : [],
    items: hasAnyData
      ? normalizedItems.map((item) => ({
          ...item,
          valueText: item.hours === null ? '--' : `${item.hours}`,
          barHeight: item.hours === null ? 12 : clampPercent((item.hours / maxHours) * 100),
          isMissing: item.hours === null,
        }))
      : placeholderItems,
  }
}

module.exports = {
  buildPointRateChart,
  buildProgressChart,
  buildStudyTimeChart,
  buildStudyTimeTabs,
  getStudyTimePreset,
}
