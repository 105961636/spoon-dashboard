import { baseMotionData } from "../data/motionData"

function buildSpillRisk(raw) {
  if (raw >= 6.8) return "High"
  if (raw >= 6.0) return "Medium"
  return "Low"
}

function buildStatus(raw) {
  if (raw >= 6.8) return "Unstable"
  if (raw >= 6.0) return "Monitoring"
  return "Stable"
}

function createPacket(index, previousRaw = 6.2) {
  const drift = (Math.random() - 0.5) * 0.5
  const wave = Math.sin(index / 2) * 0.4
  const raw = Number(Math.max(4.8, previousRaw + drift + wave).toFixed(2))
  const stabilised = Number(Math.max(3.2, raw - (1.2 + Math.random() * 0.6)).toFixed(2))
  const tremorFrequency = Number((4.2 + Math.random() * 0.9).toFixed(2))
  const spillRisk = buildSpillRisk(raw)
  const status = buildStatus(raw)

  return {
    time: index,
    raw,
    stabilised,
    tremorFrequency,
    spillRisk,
    status,
    timestamp: new Date().toLocaleTimeString()
  }
}

export function createMockLiveDataProvider() {
  let timer = null
  let currentIndex = baseMotionData.length
  let previousRaw = baseMotionData[baseMotionData.length - 1]?.raw ?? 6.2

  return {
    start(onPacket) {
      if (timer) return

      timer = setInterval(() => {
        const packet = createPacket(currentIndex, previousRaw)
        currentIndex += 1
        previousRaw = packet.raw
        onPacket(packet)
      }, 1000)
    },

    stop() {
      if (timer) {
        clearInterval(timer)
        timer = null
      }
    },

    reset() {
      this.stop()
      currentIndex = baseMotionData.length
      previousRaw = baseMotionData[baseMotionData.length - 1]?.raw ?? 6.2
    }
  }
}