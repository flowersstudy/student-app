const MAX_TIMER_HOURS = 8

function createTimerPickerHours(maxHours = MAX_TIMER_HOURS) {
  return Array.from({ length: Math.max(1, maxHours) + 1 }, (_, index) => `${String(index).padStart(2, '0')} 时`)
}

function createTimerPickerMinutes() {
  return Array.from({ length: 60 }, (_, index) => `${String(index).padStart(2, '0')} 分`)
}

function normalizePickerMinutes(totalMinutes = 0) {
  const safeMinutes = Math.max(1, Math.round(Number(totalMinutes) || 0))
  return safeMinutes
}

function minutesToPickerValue(totalMinutes = 0, maxHours = MAX_TIMER_HOURS) {
  const safeMinutes = normalizePickerMinutes(totalMinutes)
  const maxTotalMinutes = Math.max(1, maxHours) * 60 + 59
  const boundedMinutes = Math.min(safeMinutes, maxTotalMinutes)
  const hour = Math.min(maxHours, Math.floor(boundedMinutes / 60))
  const minute = hour === maxHours ? Math.min(59, boundedMinutes - hour * 60) : boundedMinutes % 60

  return [hour, minute]
}

function pickerValueToMinutes(pickerValue = []) {
  const hour = Math.max(0, parseInt(pickerValue[0], 10) || 0)
  const minute = Math.max(0, parseInt(pickerValue[1], 10) || 0)
  return normalizePickerMinutes(hour * 60 + minute)
}

module.exports = {
  MAX_TIMER_HOURS,
  createTimerPickerHours,
  createTimerPickerMinutes,
  minutesToPickerValue,
  pickerValueToMinutes,
}
