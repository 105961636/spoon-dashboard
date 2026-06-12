import { computed, ref } from "vue"
import {
  createMockGyroProvider,
  createWebSocketGyroProvider
} from "../services/gyroProvider"
import {
  calculateMagnitude,
  calculateMovingAverage,
  deriveRisk,
  deriveStatus
} from "../utils/gyroMetrics"

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const average = (values) => {
  if (!values.length) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

const getPeakToPeak = (series, key) => {
  if (!series.length) return 0
  const values = series.map((item) => item[key])
  return Math.max(...values) - Math.min(...values)
}

const getAverageAbs = (series, key) => {
  if (!series.length) return 0
  return average(series.map((item) => Math.abs(item[key])))
}

const getAverageDelta = (values) => {
  if (values.length < 2) return 0
  const deltas = []

  for (let i = 1; i < values.length; i += 1) {
    deltas.push(Math.abs(values[i] - values[i - 1]))
  }

  return average(deltas)
}

const HOLD_MS = 2800

const SCENARIOS = [
  { key: "normal", label: "Normal" },
  { key: "elevated", label: "Elevated Motion" },
  { key: "stability_drop", label: "Stability Drop" },
  { key: "sudden_escalation", label: "Sudden Escalation" },
  { key: "multi_axis", label: "Multi-axis Disturbance" }
]

const mode = ref(localStorage.getItem("gyro-mode") || "mock")
const esp32Ip = ref(localStorage.getItem("esp32-ip") || "192.168.1.45")
const mockScenario = ref(localStorage.getItem("gyro-scenario") || "normal")

const connectionState = ref("Idle")
const packetCount = ref(0)
const validPacketCount = ref(0)
const invalidPacketCount = ref(0)
const reconnectCount = ref(0)

const lastUpdate = ref("-")
const lastPacketReceivedAtMs = ref(0)
const sessionStartMs = ref(0)
const nowMs = ref(Date.now())

const currentX = ref(0)
const currentY = ref(0)
const currentZ = ref(0)
const currentMagnitude = ref(0)

const history = ref([])
const packetIntervals = ref([])
const lastPacket = ref(null)
const errorMessage = ref("")
const totalAlertsTriggered = ref(0)

const minX = ref(null)
const maxX = ref(null)
const minY = ref(null)
const maxY = ref(null)
const minZ = ref(null)
const maxZ = ref(null)

const motionEscalationActive = ref(false)
const sustainedAbnormalActive = ref(false)
const stabilityDropActive = ref(false)
const multiAxisActive = ref(false)

let motionEscalationLastSeen = 0
let sustainedAbnormalLastSeen = 0
let stabilityDropLastSeen = 0
let multiAxisLastSeen = 0

let provider = null
let initialized = false
let clockTimer = null

const websocketUrl = computed(() => {
  const ip = esp32Ip.value.trim()
  return ip ? `ws://${ip}/ws` : ""
})

const packetSource = computed(() => {
  return mode.value === "mock" ? "Mock Stream" : "ESP32 WebSocket"
})

const currentModeLabel = computed(() => {
  return mode.value === "mock" ? "Mock" : "ESP32"
})

const currentScenarioLabel = computed(() => {
  const matched = SCENARIOS.find((item) => item.key === mockScenario.value)
  return matched ? matched.label : "Normal"
})

const streamLabel = computed(() => {
  return lastPacket.value ? "x / y / z JSON" : "No live packet yet"
})

const smoothedMagnitude = computed(() => {
  const magnitudes = history.value.map((item) => item.magnitude)
  return calculateMovingAverage(magnitudes, 5)
})

const derivedStatus = computed(() => deriveStatus(smoothedMagnitude.value))
const derivedRisk = computed(() => deriveRisk(smoothedMagnitude.value))

const peakToPeakX = computed(() => getPeakToPeak(history.value, "x"))
const peakToPeakY = computed(() => getPeakToPeak(history.value, "y"))
const peakToPeakZ = computed(() => getPeakToPeak(history.value, "z"))

const peakToPeakOverall = computed(() => {
  return Math.max(peakToPeakX.value, peakToPeakY.value, peakToPeakZ.value, 0)
})

const avgAbsX = computed(() => getAverageAbs(history.value, "x"))
const avgAbsY = computed(() => getAverageAbs(history.value, "y"))
const avgAbsZ = computed(() => getAverageAbs(history.value, "z"))

const dominantAxis = computed(() => {
  if (!history.value.length) return "None"

  const entries = [
    ["X", avgAbsX.value],
    ["Y", avgAbsY.value],
    ["Z", avgAbsZ.value]
  ].sort((a, b) => b[1] - a[1])

  const [topAxis, topValue] = entries[0]
  const secondValue = entries[1][1]

  if (topValue < 0.001) return "None"
  if (secondValue >= topValue * 0.92) return "Mixed"

  return `${topAxis} Axis`
})

const mixedAxisRatio = computed(() => {
  const values = [avgAbsX.value, avgAbsY.value, avgAbsZ.value].sort((a, b) => b - a)
  const top = values[0]
  const second = values[1]

  if (!top || top < 0.001) return 0
  return second / top
})

const magnitudeDelta = computed(() => {
  return getAverageDelta(history.value.map((item) => item.magnitude))
})

const motionScore = computed(() => {
  const normalizedMagnitude = clamp((smoothedMagnitude.value / 150) * 100, 0, 100)
  const normalizedRange = clamp((peakToPeakOverall.value / 200) * 100, 0, 100)
  const normalizedDelta = clamp((magnitudeDelta.value / 20) * 100, 0, 100)

  return Math.round(
    normalizedMagnitude * 0.45 +
      normalizedRange * 0.35 +
      normalizedDelta * 0.2
  )
})

const stabilityIndex = computed(() => {
  return clamp(100 - motionScore.value, 0, 100)
})

const motionBand = computed(() => {
  if (motionScore.value < 30) return "Low Activity"
  if (motionScore.value < 70) return "Moderate Activity"
  return "High Activity"
})

const recentWindow = computed(() => history.value.slice(-8))
const previousWindow = computed(() => history.value.slice(-16, -8))

const recentAverageMagnitude = computed(() => {
  return average(recentWindow.value.map((item) => item.magnitude))
})

const previousAverageMagnitude = computed(() => {
  return average(previousWindow.value.map((item) => item.magnitude))
})

const deteriorationTrend = computed(() => {
  if (recentWindow.value.length < 4 || previousWindow.value.length < 4) {
    return "Insufficient Data"
  }

  const previous = previousAverageMagnitude.value
  const recent = recentAverageMagnitude.value
  const increase = recent - previous
  const ratio = previous > 0 ? recent / previous : 1

  if (increase > 18 || ratio > 1.5) return "Sharp Increase"
  if (increase > 8 || ratio > 1.2) return "Rising"
  if (increase < -8) return "Decreasing"

  return "Stable"
})

const averageMagnitude = computed(() => {
  return average(history.value.map((item) => item.magnitude))
})

const maxMagnitude = computed(() => {
  if (!history.value.length) return 0
  return Math.max(...history.value.map((item) => item.magnitude))
})

const avgPacketIntervalMs = computed(() => {
  return average(packetIntervals.value)
})

const estimatedPacketRateHz = computed(() => {
  if (!avgPacketIntervalMs.value) return 0
  return 1000 / avgPacketIntervalMs.value
})

const lastPacketAgeMs = computed(() => {
  if (!lastPacketReceivedAtMs.value) return 0
  return nowMs.value - lastPacketReceivedAtMs.value
})

const sessionDurationMs = computed(() => {
  if (!sessionStartMs.value) return 0
  return nowMs.value - sessionStartMs.value
})

const sessionDurationText = computed(() => {
  const totalSeconds = Math.max(0, Math.floor(sessionDurationMs.value / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}m ${seconds}s`
})

const baselineMagnitude = computed(() => {
  if (!history.value.length) return 0
  const baselineWindow = history.value.slice(0, Math.min(20, history.value.length))
  return average(baselineWindow.map((item) => item.magnitude))
})

const driftAmount = computed(() => {
  return smoothedMagnitude.value - baselineMagnitude.value
})

const driftStatus = computed(() => {
  const drift = Math.abs(driftAmount.value)
  if (drift < 8) return "Normal"
  if (drift < 18) return "Moderate Drift"
  return "High Drift"
})

const globalSyncActive = computed(() => true)
const chartUpdateActive = computed(() => history.value.length > 3)

const streamHealthStatus = computed(() => {
  if (connectionState.value !== "Connected") return "WARN"
  if (lastPacketAgeMs.value > 3000) return "FAIL"
  if (estimatedPacketRateHz.value >= 1) return "PASS"
  return "WARN"
})

const jsonValidationStatus = computed(() => {
  if (invalidPacketCount.value > 0) return "FAIL"
  if (validPacketCount.value > 0) return "PASS"
  return "WARN"
})

const realTimeUpdateStatus = computed(() => {
  if (chartUpdateActive.value && lastPacketAgeMs.value < 1500) return "PASS"
  if (packetCount.value > 0) return "WARN"
  return "FAIL"
})

const derivedMetricsStatus = computed(() => {
  if (packetCount.value > 5) return "PASS"
  if (packetCount.value > 0) return "WARN"
  return "FAIL"
})

const alertEngineStatus = computed(() => {
  return packetCount.value > 0 ? "PASS" : "WARN"
})

const testResults = computed(() => [
  {
    title: "Connection Test",
    status: streamHealthStatus.value,
    detail: connectionState.value === "Connected"
      ? "Live stream is connected."
      : "Stream is not fully confirmed."
  },
  {
    title: "Packet Validation",
    status: jsonValidationStatus.value,
    detail: `${validPacketCount.value} valid / ${invalidPacketCount.value} invalid`
  },
  {
    title: "Real-Time Update",
    status: realTimeUpdateStatus.value,
    detail: chartUpdateActive.value
      ? "Chart and current values are updating."
      : "Updates are limited or stale."
  },
  {
    title: "Derived Metrics",
    status: derivedMetricsStatus.value,
    detail: "Motion score, stability, axis, and range calculations are available."
  },
  {
    title: "Alert Engine",
    status: alertEngineStatus.value,
    detail: "Held alerts and hysteresis rules are active."
  }
])

const savedSnapshot = ref(null)

const snapshotComparison = computed(() => {
  if (!savedSnapshot.value) return null

  const motionDelta = motionScore.value - savedSnapshot.value.motionScore
  const stabilityDelta = stabilityIndex.value - savedSnapshot.value.stabilityIndex
  const magnitudeDeltaNow = Number((smoothedMagnitude.value - savedSnapshot.value.smoothedMagnitude).toFixed(2))
  const peakDelta = Number((peakToPeakOverall.value - savedSnapshot.value.peakToPeak).toFixed(2))

  return {
    capturedAt: savedSnapshot.value.capturedAt,
    motionDelta,
    stabilityDelta,
    magnitudeDelta: magnitudeDeltaNow,
    peakDelta,
    dominantAxisChanged: dominantAxis.value !== savedSnapshot.value.dominantAxis,
    previousDominantAxis: savedSnapshot.value.dominantAxis,
    previousAlertLevel: savedSnapshot.value.alertLevel
  }
})

const captureSnapshot = () => {
  savedSnapshot.value = {
    capturedAt: new Date().toLocaleTimeString(),
    motionScore: motionScore.value,
    stabilityIndex: stabilityIndex.value,
    smoothedMagnitude: Number(smoothedMagnitude.value.toFixed(2)),
    peakToPeak: Number(peakToPeakOverall.value.toFixed(2)),
    dominantAxis: dominantAxis.value,
    alertLevel: alertLevel.value
  }
}

const clearSnapshot = () => {
  savedSnapshot.value = null
}

const formatRange = (min, max) => {
  if (min === null || max === null) {
    return "-"
  }

  return `${min.toFixed(2)} to ${max.toFixed(2)}`
}

const xRangeText = computed(() => formatRange(minX.value, maxX.value))
const yRangeText = computed(() => formatRange(minY.value, maxY.value))
const zRangeText = computed(() => formatRange(minZ.value, maxZ.value))

const peakToPeakText = computed(() => {
  return `${peakToPeakOverall.value.toFixed(2)}`
})

const connectionBadge = computed(() => {
  if (connectionState.value === "Connected") return "Live stream verified"
  if (packetCount.value > 0) return "Packets recorded"
  return "Waiting for validation"
})

const currentXYZText = computed(() => {
  return lastPacket.value
    ? `${currentX.value.toFixed(2)} / ${currentY.value.toFixed(2)} / ${currentZ.value.toFixed(2)}`
    : "Waiting for stream"
})

const formattedPacket = computed(() => {
  if (!lastPacket.value) {
    return `{
  "x": 0,
  "y": 0,
  "z": 0
}`
  }

  return JSON.stringify(lastPacket.value, null, 2)
})

const updateHeldAlert = (activeRef, shouldBeActive, timerKey) => {
  const now = Date.now()

  if (shouldBeActive) {
    if (!activeRef.value) {
      totalAlertsTriggered.value += 1
    }

    activeRef.value = true

    if (timerKey === "motionEscalation") motionEscalationLastSeen = now
    if (timerKey === "sustainedAbnormal") sustainedAbnormalLastSeen = now
    if (timerKey === "stabilityDrop") stabilityDropLastSeen = now
    if (timerKey === "multiAxis") multiAxisLastSeen = now

    return
  }

  let lastSeen = 0
  if (timerKey === "motionEscalation") lastSeen = motionEscalationLastSeen
  if (timerKey === "sustainedAbnormal") lastSeen = sustainedAbnormalLastSeen
  if (timerKey === "stabilityDrop") lastSeen = stabilityDropLastSeen
  if (timerKey === "multiAxis") lastSeen = multiAxisLastSeen

  if (activeRef.value && now - lastSeen < HOLD_MS) {
    return
  }

  activeRef.value = false
}

const refreshHeldAlerts = () => {
  const motionEscalationCondition = motionEscalationActive.value
    ? (
        deteriorationTrend.value === "Sharp Increase" ||
        motionScore.value >= 60 ||
        peakToPeakOverall.value >= 105
      )
    : (
        deteriorationTrend.value === "Sharp Increase" ||
        (motionScore.value >= 78 && peakToPeakOverall.value >= 130)
      )

  const sustainedAbnormalCondition = sustainedAbnormalActive.value
    ? (
        motionScore.value >= 58 ||
        stabilityIndex.value <= 50 ||
        peakToPeakOverall.value >= 100
      )
    : (
        motionScore.value >= 72 ||
        stabilityIndex.value <= 35 ||
        peakToPeakOverall.value >= 130
      )

  const stabilityDropCondition = stabilityDropActive.value
    ? stabilityIndex.value <= 55
    : stabilityIndex.value <= 45

  const multiAxisCondition = multiAxisActive.value
    ? (
        mixedAxisRatio.value >= 0.9 &&
        motionScore.value >= 50
      )
    : (
        mixedAxisRatio.value >= 0.97 &&
        motionScore.value >= 60 &&
        peakToPeakOverall.value >= 100
      )

  updateHeldAlert(motionEscalationActive, motionEscalationCondition, "motionEscalation")
  updateHeldAlert(sustainedAbnormalActive, sustainedAbnormalCondition, "sustainedAbnormal")
  updateHeldAlert(stabilityDropActive, stabilityDropCondition, "stabilityDrop")
  updateHeldAlert(multiAxisActive, multiAxisCondition, "multiAxis")
}

const fixedAlertCards = computed(() => {
  const streamLive = connectionState.value === "Connected"

  return [
    {
      key: "stream",
      title: "Stream Status",
      severity: streamLive ? "normal" : "warning",
      active: !streamLive,
      stateLabel: streamLive ? "LIVE" : "CHECK",
      message: streamLive
        ? "Live stream is connected and updating normally."
        : "Live stream is not currently confirmed. Data may be paused or stale."
    },
    {
      key: "motion-escalation",
      title: "Motion Escalation",
      severity: motionEscalationActive.value ? "critical" : "normal",
      active: motionEscalationActive.value,
      stateLabel: motionEscalationActive.value ? "ACTIVE" : "NORMAL",
      message: motionEscalationActive.value
        ? "Movement intensity increased sharply compared with the recent baseline window."
        : "No sudden motion escalation detected."
    },
    {
      key: "sustained-abnormal",
      title: "Sustained Abnormal Motion",
      severity: sustainedAbnormalActive.value ? "critical" : "normal",
      active: sustainedAbnormalActive.value,
      stateLabel: sustainedAbnormalActive.value ? "ACTIVE" : "NORMAL",
      message: sustainedAbnormalActive.value
        ? "High motion or low stability persisted long enough to trigger an abnormal movement warning."
        : "No sustained abnormal motion is currently active."
    },
    {
      key: "stability-drop",
      title: "Stability Drop",
      severity: stabilityDropActive.value ? "warning" : "normal",
      active: stabilityDropActive.value,
      stateLabel: stabilityDropActive.value ? "WARNING" : "NORMAL",
      message: stabilityDropActive.value
        ? `Stability index is reduced at ${stabilityIndex.value}/100.`
        : "Stability remains within the normal dashboard threshold."
    },
    {
      key: "multi-axis",
      title: "Multi-axis Disturbance",
      severity: multiAxisActive.value ? "warning" : "normal",
      active: multiAxisActive.value,
      stateLabel: multiAxisActive.value ? "WARNING" : "NORMAL",
      message: multiAxisActive.value
        ? "Motion is strongly distributed across multiple axes rather than one dominant direction."
        : "No strong multi-axis disturbance is currently detected."
    }
  ]
})

const activeAlerts = computed(() => {
  return fixedAlertCards.value.filter((item) => item.active)
})

const alertLevel = computed(() => {
  if (fixedAlertCards.value.some((item) => item.active && item.severity === "critical")) return "High"
  if (fixedAlertCards.value.some((item) => item.active && item.severity === "warning")) return "Medium"
  return "Normal"
})

const alertSummary = computed(() => {
  const priority = fixedAlertCards.value.find(
    (item) => item.active && item.severity === "critical"
  ) || fixedAlertCards.value.find(
    (item) => item.active && item.severity === "warning"
  )

  return priority ? priority.title : "No abnormal motion alert is currently active."
})

const finding = computed(() => {
  if (activeAlerts.value.length) {
    return `${alertSummary.value}. Dominant axis: ${dominantAxis.value}. Motion score: ${motionScore.value}/100. Stability index: ${stabilityIndex.value}/100.`
  }

  if (packetCount.value > 0 && connectionState.value === "Connected") {
    return `${dominantAxis.value} currently shows the strongest motion pattern. Motion score is ${motionScore.value}/100 and stability index is ${stabilityIndex.value}/100.`
  }

  if (packetCount.value > 0) {
    return `Packets have been recorded successfully. Current dominant axis is ${dominantAxis.value}, with a motion score of ${motionScore.value}/100.`
  }

  return "Dashboard is ready for real-time monitoring and ESP32 integration."
})

const clearMeasurements = () => {
  packetCount.value = 0
  validPacketCount.value = 0
  invalidPacketCount.value = 0
  reconnectCount.value = 0
  lastUpdate.value = "-"
  lastPacketReceivedAtMs.value = 0
  currentX.value = 0
  currentY.value = 0
  currentZ.value = 0
  currentMagnitude.value = 0
  history.value = []
  packetIntervals.value = []
  lastPacket.value = null
  errorMessage.value = ""
  totalAlertsTriggered.value = 0

  minX.value = null
  maxX.value = null
  minY.value = null
  maxY.value = null
  minZ.value = null
  maxZ.value = null
}

const clearHeldAlerts = () => {
  motionEscalationActive.value = false
  sustainedAbnormalActive.value = false
  stabilityDropActive.value = false
  multiAxisActive.value = false

  motionEscalationLastSeen = 0
  sustainedAbnormalLastSeen = 0
  stabilityDropLastSeen = 0
  multiAxisLastSeen = 0
}

const updateRanges = (x, y, z) => {
  minX.value = minX.value === null ? x : Math.min(minX.value, x)
  maxX.value = maxX.value === null ? x : Math.max(maxX.value, x)

  minY.value = minY.value === null ? y : Math.min(minY.value, y)
  maxY.value = maxY.value === null ? y : Math.max(maxY.value, y)

  minZ.value = minZ.value === null ? z : Math.min(minZ.value, z)
  maxZ.value = maxZ.value === null ? z : Math.max(maxZ.value, z)
}

const applyMockScenario = (packet) => {
  if (mode.value !== "mock") return packet

  const t = packetCount.value + validPacketCount.value + 1

  if (mockScenario.value === "normal") {
    return packet
  }

  if (mockScenario.value === "elevated") {
    return {
      ...packet,
      x: packet.x * 2.1,
      y: packet.y * 2.0,
      z: packet.z * 1.9
    }
  }

  if (mockScenario.value === "stability_drop") {
    return {
      ...packet,
      x: packet.x * 1.5 + Math.sin(t / 1.7) * 26,
      y: packet.y * 1.4 + Math.cos(t / 1.9) * 22,
      z: packet.z * 1.2 + Math.sin(t / 2.3) * 18
    }
  }

  if (mockScenario.value === "sudden_escalation") {
    const burst = t % 36 > 20
    return {
      ...packet,
      x: burst ? packet.x * 3.2 + Math.sin(t / 1.1) * 38 : packet.x * 1.1,
      y: burst ? packet.y * 2.9 + Math.cos(t / 1.2) * 34 : packet.y * 1.05,
      z: burst ? packet.z * 2.6 + Math.sin(t / 1.4) * 30 : packet.z * 1.05
    }
  }

  if (mockScenario.value === "multi_axis") {
    return {
      ...packet,
      x: Math.sin(t / 2.1) * 85,
      y: Math.cos(t / 2.25) * 82,
      z: Math.sin(t / 2.5) * 78
    }
  }

  return packet
}

const handlePacket = (rawPacket) => {
  const packet = applyMockScenario(rawPacket)
  const validPacket =
    packet &&
    Number.isFinite(packet.x) &&
    Number.isFinite(packet.y) &&
    Number.isFinite(packet.z)

  if (!validPacket) {
    invalidPacketCount.value += 1
    return
  }

  validPacketCount.value += 1

  const now = Date.now()
  if (lastPacketReceivedAtMs.value) {
    const interval = now - lastPacketReceivedAtMs.value
    packetIntervals.value = [...packetIntervals.value.slice(-39), interval]
  }
  lastPacketReceivedAtMs.value = now

  const magnitude = calculateMagnitude(packet.x, packet.y, packet.z)

  currentX.value = packet.x
  currentY.value = packet.y
  currentZ.value = packet.z
  currentMagnitude.value = magnitude

  packetCount.value += 1
  lastUpdate.value = packet.timestamp || new Date(now).toLocaleTimeString()

  lastPacket.value = {
    x: Number(packet.x.toFixed(2)),
    y: Number(packet.y.toFixed(2)),
    z: Number(packet.z.toFixed(2))
  }

  updateRanges(packet.x, packet.y, packet.z)

  history.value = [
    ...history.value.slice(-99),
    {
      x: packet.x,
      y: packet.y,
      z: packet.z,
      magnitude,
      timestamp: packet.timestamp || new Date(now).toLocaleTimeString()
    }
  ]

  refreshHeldAlerts()
}

const stopProviderOnly = () => {
  if (provider) {
    provider.stop()
    provider = null
  }
}

const createProvider = () => {
  if (mode.value === "mock") {
    return createMockGyroProvider()
  }

  return createWebSocketGyroProvider(websocketUrl.value)
}

const startStream = () => {
  stopProviderOnly()
  errorMessage.value = ""
  sessionStartMs.value = Date.now()
  nowMs.value = Date.now()

  localStorage.setItem("gyro-mode", mode.value)
  localStorage.setItem("gyro-scenario", mockScenario.value)

  if (mode.value === "real" && !esp32Ip.value.trim()) {
    connectionState.value = "No IP"
    errorMessage.value = "Please enter the ESP32 local IP before starting real mode."
    return
  }

  provider = createProvider()

  if (mode.value === "mock") {
    connectionState.value = "Connected"
    provider.start(handlePacket)
    return
  }

  localStorage.setItem("esp32-ip", esp32Ip.value.trim())
  connectionState.value = "Connecting"
  reconnectCount.value += 1

  provider.start(handlePacket, (state) => {
    connectionState.value = state
  })
}

const stopStream = () => {
  stopProviderOnly()
  errorMessage.value = ""

  if (mode.value === "mock") {
    connectionState.value = "Stopped"
  } else if (connectionState.value !== "No IP") {
    connectionState.value = "Disconnected"
  }
}

const resetStream = () => {
  stopProviderOnly()
  clearMeasurements()
  clearHeldAlerts()
  clearSnapshot()
  connectionState.value = "Idle"
  sessionStartMs.value = 0
}

const changeMode = (nextMode) => {
  if (!nextMode || nextMode === mode.value) return

  stopProviderOnly()
  clearMeasurements()
  clearHeldAlerts()
  clearSnapshot()

  mode.value = nextMode
  localStorage.setItem("gyro-mode", nextMode)
  connectionState.value = "Idle"

  startStream()
}

const setMockScenario = (scenarioKey) => {
  mockScenario.value = scenarioKey
  localStorage.setItem("gyro-scenario", scenarioKey)

  if (mode.value === "mock") {
    clearMeasurements()
    clearHeldAlerts()
    clearSnapshot()
    startStream()
  }
}

const startClock = () => {
  if (clockTimer) return

  clockTimer = setInterval(() => {
    nowMs.value = Date.now()
    refreshHeldAlerts()
  }, 500)
}

const ensureInitialized = () => {
  if (initialized) return
  initialized = true
  startClock()
  startStream()
}

export function useGyroStream() {
  ensureInitialized()

  return {
    mode,
    esp32Ip,
    mockScenario,
    availableScenarios: SCENARIOS,
    connectionState,
    packetCount,
    validPacketCount,
    invalidPacketCount,
    reconnectCount,
    lastUpdate,
    lastPacketReceivedAtMs,
    currentX,
    currentY,
    currentZ,
    currentMagnitude,
    history,
    packetIntervals,
    lastPacket,
    errorMessage,
    totalAlertsTriggered,
    minX,
    maxX,
    minY,
    maxY,
    minZ,
    maxZ,
    websocketUrl,
    packetSource,
    currentModeLabel,
    currentScenarioLabel,
    streamLabel,
    smoothedMagnitude,
    derivedStatus,
    derivedRisk,
    peakToPeakX,
    peakToPeakY,
    peakToPeakZ,
    peakToPeakOverall,
    dominantAxis,
    mixedAxisRatio,
    magnitudeDelta,
    motionScore,
    stabilityIndex,
    motionBand,
    deteriorationTrend,
    averageMagnitude,
    maxMagnitude,
    avgPacketIntervalMs,
    estimatedPacketRateHz,
    lastPacketAgeMs,
    sessionDurationText,
    baselineMagnitude,
    driftAmount,
    driftStatus,
    globalSyncActive,
    chartUpdateActive,
    streamHealthStatus,
    jsonValidationStatus,
    realTimeUpdateStatus,
    derivedMetricsStatus,
    alertEngineStatus,
    testResults,
    fixedAlertCards,
    activeAlerts,
    alertLevel,
    alertSummary,
    finding,
    currentXYZText,
    formattedPacket,
    xRangeText,
    yRangeText,
    zRangeText,
    peakToPeakText,
    connectionBadge,
    savedSnapshot,
    snapshotComparison,
    captureSnapshot,
    clearSnapshot,
    startStream,
    stopStream,
    resetStream,
    changeMode,
    setMockScenario
  }
}
