export function calculateMagnitude(x, y, z) {
  return Math.sqrt(x * x + y * y + z * z)
}

export function calculateMovingAverage(values, windowSize = 5) {
  if (!values.length) return 0

  const recentValues = values.slice(-windowSize)
  const sum = recentValues.reduce((acc, value) => acc + value, 0)
  return sum / recentValues.length
}

export function deriveStatus(magnitude) {
  if (magnitude >= 120) return 'Unstable'
  if (magnitude >= 70) return 'Monitoring'
  return 'Stable'
}

export function deriveRisk(magnitude) {
  if (magnitude >= 120) return 'High'
  if (magnitude >= 70) return 'Medium'
  return 'Low'
}