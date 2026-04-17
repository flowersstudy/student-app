function normalizeNumber(value) {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : null
}

function splitPointName(pointName = '') {
  const safeName = String(pointName || '').trim()
  if (!safeName) {
    return {
      shortTop: '',
      shortBottom: '',
    }
  }

  if (safeName.length <= 4) {
    return {
      shortTop: safeName,
      shortBottom: '',
    }
  }

  return {
    shortTop: safeName.slice(0, safeName.length - 2),
    shortBottom: safeName.slice(-2),
  }
}

function normalizeProgressPayload(payload = {}) {
  return {
    entryScore: normalizeNumber(payload.entryScore),
    currentScore: normalizeNumber(payload.currentScore),
    targetScore: normalizeNumber(payload.targetScore),
  }
}

function normalizePointRateItems(items = [], pointMeta = {}) {
  if (!Array.isArray(items)) {
    return []
  }

  return items.map((item, index) => {
    const pointName = String(item.pointName || item.name || '').trim()
    const meta = pointMeta[pointName] || splitPointName(pointName)

    return {
      id: Number(item.id || meta.id || index + 1),
      name: pointName || `\u5361\u70b9${index + 1}`,
      shortTop: meta.shortTop || '',
      shortBottom: meta.shortBottom || '',
      currentRate: normalizeNumber(item.currentRate),
      targetRate: normalizeNumber(item.targetRate),
    }
  })
}

function normalizeStudyTimeMap(items = []) {
  if (!Array.isArray(items)) {
    return {}
  }

  return items.reduce((result, item, index) => {
    const cycleType = String(item.cycleType || 'week').trim() || 'week'
    if (!result[cycleType]) {
      result[cycleType] = []
    }

    result[cycleType].push({
      key: String(item.key || `${cycleType}${index + 1}`),
      label: String(item.label || `\u7b2c${index + 1}\u9879`),
      hours: normalizeNumber(item.hours),
      sortOrder: Number(item.sortOrder || index + 1),
    })

    return result
  }, {})
}

function sortStudyTimeGroups(groupMap = {}) {
  return Object.keys(groupMap).reduce((result, key) => {
    result[key] = (groupMap[key] || [])
      .slice()
      .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
      .map((item) => ({
        key: item.key,
        label: item.label,
        hours: item.hours,
      }))
    return result
  }, {})
}

module.exports = {
  normalizePointRateItems,
  normalizeProgressPayload,
  normalizeStudyTimeMap,
  sortStudyTimeGroups,
  splitPointName,
}
