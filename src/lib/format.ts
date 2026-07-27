export function parseDuration(value: string): number | null {
  const parts = value.trim().split(':').map(Number)
  if ((parts.length !== 2 && parts.length !== 3) || parts.some(Number.isNaN)) return null
  const [hours, minutes, seconds] = parts.length === 3 ? parts : [0, parts[0], parts[1]]
  if (hours < 0 || minutes < 0 || seconds < 0 || minutes > 59 || seconds > 59) return null
  const total = hours * 3600 + minutes * 60 + seconds
  return total > 0 ? total : null
}

export function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.round(totalSeconds % 60)
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function paceSeconds(durationSeconds: number, distanceKm: number) {
  return Math.round(durationSeconds / distanceKm)
}

export function formatPace(secondsPerKm: number) {
  const minutes = Math.floor(secondsPerKm / 60)
  const seconds = Math.round(secondsPerKm % 60)
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function formatKm(value: number, digits = 1) {
  return `${value.toFixed(digits)} KM`
}
