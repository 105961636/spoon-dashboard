import { computed, onBeforeUnmount, ref } from "vue"
import { baseMotionData } from "../data/motionData"
import { initialLiveEvents } from "../data/liveEvents"
import { createMockLiveDataProvider } from "../services/liveDataProvider"
import { parseCsvPacket } from "../utils/parseCsvPacket"

const cloneBaseData = () => baseMotionData.map((point) => ({ ...point }))

export function useLiveSession() {
  const provider = createMockLiveDataProvider()

  const chartData = ref(cloneBaseData())
  const isRunning = ref(false)

  const currentTremor = ref("4.80 Hz")
  const lastUpdate = ref(new Date().toLocaleTimeString())
  const systemState = ref("Idle")
  const motionStatus = computed(() => (isRunning.value ? "Monitoring" : "Paused"))
  const liveEvents = ref([...initialLiveEvents])

  const batteryLevel = ref(78)
  const transferMode = ref("USB")
  const sampleRate = ref("1 Hz")
  const csvError = ref("")

  const stabilityScore = computed(() => {
    const latest = chartData.value.at(-1)
    if (!latest) return 0

    const reduction = ((latest.raw - latest.stabilised) / latest.raw) * 100
    return Math.max(70, Math.min(95, Math.round(reduction + 55)))
  })

  const latestSpillRisk = computed(() => {
    const raw = chartData.value.at(-1)?.raw ?? 0
    if (raw >= 6.8) return "Elevated"
    if (raw >= 6.0) return "Moderate"
    return "Low"
  })

  const averageRaw = computed(() => {
    const values = chartData.value.map((item) => item.raw)
    const avg = values.reduce((sum, value) => sum + value, 0) / values.length
    return `${avg.toFixed(2)} Hz`
  })

  const averageStabilised = computed(() => {
    const values = chartData.value.map((item) => item.stabilised)
    const avg = values.reduce((sum, value) => sum + value, 0) / values.length
    return `${avg.toFixed(2)} Hz`
  })

  const pushEvent = (message) => {
    liveEvents.value = [message, ...liveEvents.value].slice(0, 8)
  }

  const handlePacket = (packet) => {
    chartData.value = [...chartData.value.slice(-19), packet]

    currentTremor.value = `${packet.tremorFrequency.toFixed(2)} Hz`
    lastUpdate.value = packet.timestamp
    batteryLevel.value = Math.max(58, Number((batteryLevel.value - 0.05).toFixed(2)))
    systemState.value = packet.status

    if (packet.spillRisk === "High") {
      pushEvent(
        `High spill risk detected at ${packet.timestamp}. Stabilisation response increased.`
      )
    } else {
      pushEvent(
        `Packet received at ${packet.timestamp}. Status: ${packet.status}, spill risk: ${packet.spillRisk}.`
      )
    }
  }

  const startDemo = () => {
    if (isRunning.value) return
    isRunning.value = true
    systemState.value = "Monitoring"
    csvError.value = ""
    pushEvent("Live session started.")
    provider.start(handlePacket)
  }

  const pauseDemo = () => {
    if (!isRunning.value) return
    isRunning.value = false
    systemState.value = "Paused"
    pushEvent("Live session paused.")
    provider.stop()
  }

  const resetDemo = () => {
    provider.reset()
    chartData.value = cloneBaseData()
    currentTremor.value = "4.80 Hz"
    lastUpdate.value = new Date().toLocaleTimeString()
    systemState.value = "Idle"
    liveEvents.value = [...initialLiveEvents]
    batteryLevel.value = 78
    isRunning.value = false
    csvError.value = ""
  }

  const simulateCsvText = (text) => {
    csvError.value = ""

    if (!text || !text.trim()) {
      csvError.value = "No CSV input provided."
      return
    }

    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)

    let validCount = 0

    for (const line of lines) {
      const packet = parseCsvPacket(line)
      if (!packet) continue
      handlePacket(packet)
      validCount += 1
    }

    if (validCount === 0) {
      csvError.value =
        "No valid CSV packets were found. Use: time,raw,stabilised,tremorFrequency,spillRisk,status"
      return
    }

    pushEvent(`Simulated ${validCount} CSV packet(s) into the dashboard.`)
  }

  onBeforeUnmount(() => {
    provider.stop()
  })

  return {
    chartData,
    isRunning,
    currentTremor,
    lastUpdate,
    systemState,
    motionStatus,
    liveEvents,
    batteryLevel,
    transferMode,
    sampleRate,
    stabilityScore,
    latestSpillRisk,
    averageRaw,
    averageStabilised,
    csvError,
    startDemo,
    pauseDemo,
    resetDemo,
    simulateCsvText
  }
}