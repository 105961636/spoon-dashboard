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

const mode = ref(localStorage.getItem("gyro-mode") || "mock")
const esp32Ip = ref(localStorage.getItem("esp32-ip") || "192.168.1.45")

const connectionState = ref("Idle")
const packetCount = ref(0)
const lastUpdate = ref("-")

const currentX = ref(0)
const currentY = ref(0)
const currentZ = ref(0)
const currentMagnitude = ref(0)

const history = ref([])
const lastPacket = ref(null)
const errorMessage = ref("")

const minX = ref(null)
const maxX = ref(null)
const minY = ref(null)
const maxY = ref(null)
const minZ = ref(null)
const maxZ = ref(null)

let provider = null
let initialized = false

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

const streamLabel = computed(() => {
  return lastPacket.value ? "x / y / z JSON" : "No live packet yet"
})

const smoothedMagnitude = computed(() => {
  const magnitudes = history.value.map((item) => item.magnitude)
  return calculateMovingAverage(magnitudes, 5)
})

const derivedStatus = computed(() => deriveStatus(smoothedMagnitude.value))
const derivedRisk = computed(() => deriveRisk(smoothedMagnitude.value))

const finding = computed(() => {
  const x = Math.abs(currentX.value)
  const y = Math.abs(currentY.value)
  const z = Math.abs(currentZ.value)

  if (z > 1000 && x < 200 && y < 200) {
    return "Z-axis is on a much larger scale than X and Y, suggesting a possible unit or field-mapping inconsistency."
  }

  if (packetCount.value > 0 && connectionState.value === "Connected") {
    return "Dashboard is receiving live packets successfully and visualising the incoming stream in real time."
  }

  if (packetCount.value > 0) {
    return "Packets have been recorded and remain available for dashboard validation."
  }

  return "Dashboard is ready for real-time monitoring and ESP32 integration."
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

const formatRange = (min, max) => {
  if (min === null || max === null) {
    return "-"
  }

  return `${min.toFixed(2)} to ${max.toFixed(2)}`
}

const xRangeText = computed(() => formatRange(minX.value, maxX.value))
const yRangeText = computed(() => formatRange(minY.value, maxY.value))
const zRangeText = computed(() => formatRange(minZ.value, maxZ.value))

const connectionBadge = computed(() => {
  if (connectionState.value === "Connected") return "Live stream verified"
  if (packetCount.value > 0) return "Packets recorded"
  return "Waiting for validation"
})

const clearMeasurements = () => {
  packetCount.value = 0
  lastUpdate.value = "-"
  currentX.value = 0
  currentY.value = 0
  currentZ.value = 0
  currentMagnitude.value = 0
  history.value = []
  lastPacket.value = null
  errorMessage.value = ""

  minX.value = null
  maxX.value = null
  minY.value = null
  maxY.value = null
  minZ.value = null
  maxZ.value = null
}

const updateRanges = (x, y, z) => {
  minX.value = minX.value === null ? x : Math.min(minX.value, x)
  maxX.value = maxX.value === null ? x : Math.max(maxX.value, x)

  minY.value = minY.value === null ? y : Math.min(minY.value, y)
  maxY.value = maxY.value === null ? y : Math.max(maxY.value, y)

  minZ.value = minZ.value === null ? z : Math.min(minZ.value, z)
  maxZ.value = maxZ.value === null ? z : Math.max(maxZ.value, z)
}

const handlePacket = (packet) => {
  const magnitude = calculateMagnitude(packet.x, packet.y, packet.z)

  currentX.value = packet.x
  currentY.value = packet.y
  currentZ.value = packet.z
  currentMagnitude.value = magnitude

  packetCount.value += 1
  lastUpdate.value = packet.timestamp

  lastPacket.value = {
    x: Number(packet.x.toFixed(2)),
    y: Number(packet.y.toFixed(2)),
    z: Number(packet.z.toFixed(2))
  }

  updateRanges(packet.x, packet.y, packet.z)

  history.value = [
    ...history.value.slice(-79),
    {
      x: packet.x,
      y: packet.y,
      z: packet.z,
      magnitude,
      timestamp: packet.timestamp
    }
  ]
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

  localStorage.setItem("gyro-mode", mode.value)

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
  connectionState.value = "Idle"
}

const changeMode = (nextMode) => {
  if (!nextMode || nextMode === mode.value) return

  stopProviderOnly()
  clearMeasurements()

  mode.value = nextMode
  localStorage.setItem("gyro-mode", nextMode)
  connectionState.value = "Idle"

  startStream()
}

const ensureInitialized = () => {
  if (initialized) return
  initialized = true
  startStream()
}

export function useGyroStream() {
  ensureInitialized()

  return {
    mode,
    esp32Ip,
    connectionState,
    packetCount,
    lastUpdate,
    currentX,
    currentY,
    currentZ,
    currentMagnitude,
    history,
    lastPacket,
    errorMessage,
    minX,
    maxX,
    minY,
    maxY,
    minZ,
    maxZ,
    websocketUrl,
    packetSource,
    currentModeLabel,
    streamLabel,
    smoothedMagnitude,
    derivedStatus,
    derivedRisk,
    finding,
    currentXYZText,
    formattedPacket,
    xRangeText,
    yRangeText,
    zRangeText,
    connectionBadge,
    startStream,
    stopStream,
    resetStream,
    changeMode
  }
}
