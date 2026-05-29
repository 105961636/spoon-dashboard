<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import MetricCard from "../components/MetricCard.vue"
import GyroChart from "../components/GyroChart.vue"
import { useDashboardSnapshot } from "../composables/useDashboardSnapshot"
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

const storedIp = localStorage.getItem("esp32-ip") || "192.168.1.45"

const mode = ref("mock")
const esp32Ip = ref(storedIp)

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

const { updateSnapshot } = useDashboardSnapshot()

let provider = null

const websocketUrl = computed(() => {
  const ip = esp32Ip.value.trim()
  return ip ? `ws://${ip}/ws` : ""
})

const smoothedMagnitude = computed(() => {
  const magnitudes = history.value.map((item) => item.magnitude)
  return calculateMovingAverage(magnitudes, 5)
})

const derivedStatus = computed(() => deriveStatus(smoothedMagnitude.value))
const derivedRisk = computed(() => deriveRisk(smoothedMagnitude.value))

const packetSource = computed(() => {
  return mode.value === "mock" ? "Mock Stream" : "ESP32 WebSocket"
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

const keyFinding = computed(() => {
  const x = Math.abs(currentX.value)
  const y = Math.abs(currentY.value)
  const z = Math.abs(currentZ.value)

  if (z > 1000 && (x < 200 && y < 200)) {
    return "Z-axis is on a much larger scale than X and Y, suggesting a possible unit or field-mapping inconsistency."
  }

  if (packetCount.value > 0 && connectionState.value === "Connected") {
    return "Dashboard is receiving live packets successfully and visualising the incoming stream in real time."
  }

  return "Dashboard is ready for real-time monitoring and ESP32 integration."
})

const updateRanges = (x, y, z) => {
  minX.value = minX.value === null ? x : Math.min(minX.value, x)
  maxX.value = maxX.value === null ? x : Math.max(maxX.value, x)
  minY.value = minY.value === null ? y : Math.min(minY.value, y)
  maxY.value = maxY.value === null ? y : Math.max(maxY.value, y)
  minZ.value = minZ.value === null ? z : Math.min(minZ.value, z)
  maxZ.value = maxZ.value === null ? z : Math.max(maxZ.value, z)
}

const syncSnapshot = () => {
  updateSnapshot({
    mode: mode.value,
    connectionState: connectionState.value,
    packetCount: packetCount.value,
    lastUpdate: lastUpdate.value,
    source: packetSource.value,
    ip: esp32Ip.value.trim(),
    websocketUrl: mode.value === "mock" ? "" : websocketUrl.value,
    currentX: currentX.value,
    currentY: currentY.value,
    currentZ: currentZ.value,
    currentMagnitude: currentMagnitude.value,
    smoothedMagnitude: smoothedMagnitude.value,
    derivedStatus: derivedStatus.value,
    derivedRisk: derivedRisk.value,
    lastPacket: lastPacket.value,
    minX: minX.value,
    maxX: maxX.value,
    minY: minY.value,
    maxY: maxY.value,
    minZ: minZ.value,
    maxZ: maxZ.value,
    finding: keyFinding.value
  })
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

  syncSnapshot()
}

const createProvider = () => {
  if (mode.value === "mock") {
    return createMockGyroProvider()
  }

  return createWebSocketGyroProvider(websocketUrl.value)
}

const startStream = () => {
  stopStream()
  errorMessage.value = ""

  if (mode.value === "real" && !esp32Ip.value.trim()) {
    connectionState.value = "No IP"
    errorMessage.value = "Please enter the ESP32 local IP before starting real mode."
    syncSnapshot()
    return
  }

  provider = createProvider()

  if (mode.value === "mock") {
    connectionState.value = "Connected"
    syncSnapshot()
    provider.start(handlePacket)
    return
  }

  localStorage.setItem("esp32-ip", esp32Ip.value.trim())
  connectionState.value = "Connecting"
  syncSnapshot()

  provider.start(handlePacket, (state) => {
    connectionState.value = state
    syncSnapshot()
  })
}

const stopStream = () => {
  if (provider) {
    provider.stop()
    provider = null
  }

  if (mode.value === "mock") {
    connectionState.value = "Stopped"
  } else if (connectionState.value !== "No IP") {
    connectionState.value = "Disconnected"
  }

  syncSnapshot()
}

const resetStream = () => {
  stopStream()

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
  connectionState.value = "Idle"

  syncSnapshot()
}

watch(mode, () => {
  resetStream()
  startStream()
})

onMounted(() => {
  syncSnapshot()
  startStream()
})

onBeforeUnmount(() => {
  stopStream()
})
</script>

<template>
  <section class="page">
    <div class="page-head">
      <div>
        <h2>Live Data</h2>
        <p>
          Real-time monitoring of ESP32 packets with stream validation, debugging,
          and testing-focused visualisation.
        </p>
      </div>

      <div class="action-group">
        <select v-model="mode" class="mode-select">
          <option value="mock">Mock Mode</option>
          <option value="real">ESP32 Mode</option>
        </select>

        <input
          v-if="mode === 'real'"
          v-model="esp32Ip"
          class="ip-input"
          type="text"
          placeholder="ESP32 local IP, e.g. 192.168.1.45"
        />

        <button class="primary" @click="startStream">Start</button>
        <button class="secondary" @click="stopStream">Stop</button>
        <button class="ghost" @click="resetStream">Reset</button>
      </div>
    </div>

    <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

    <section class="metrics-grid">
      <MetricCard
        title="Connection"
        :value="connectionState"
        subtitle="Current stream state"
      />
      <MetricCard
        title="Packet Count"
        :value="packetCount"
        subtitle="Received gyro packets"
      />
      <MetricCard
        title="Last Update"
        :value="lastUpdate"
        subtitle="Latest packet timestamp"
      />
      <MetricCard
        title="Source"
        :value="packetSource"
        subtitle="Current input provider"
      />
    </section>

    <section class="grid-main">
      <article class="panel chart-panel">
        <div class="panel-header">
          <h3>Gyroscope Charts</h3>
          <span class="panel-tag">{{ mode === "mock" ? "Mock Testing" : "ESP32 Live" }}</span>
        </div>

        <div class="chart-stack">
          <div class="chart-block">
            <div class="subhead">
              <span>X / Y Live Stream</span>
              <small>Separated for clearer comparison</small>
            </div>
            <GyroChart :chart-data="history" mode="xy" :height="210" />
          </div>

          <div class="chart-block">
            <div class="subhead">
              <span>Z / Magnitude Stream</span>
              <small>Shown separately due to scale difference</small>
            </div>
            <GyroChart :chart-data="history" mode="zm" :height="210" />
          </div>
        </div>
      </article>

      <article class="side-column">
        <div class="panel compact">
          <div class="panel-header">
            <h3>Current Values</h3>
            <span class="panel-tag">Live</span>
          </div>

          <div class="value-list">
            <div class="value-item"><span>X</span><strong>{{ currentX.toFixed(2) }}</strong></div>
            <div class="value-item"><span>Y</span><strong>{{ currentY.toFixed(2) }}</strong></div>
            <div class="value-item"><span>Z</span><strong>{{ currentZ.toFixed(2) }}</strong></div>
            <div class="value-item"><span>Magnitude</span><strong>{{ currentMagnitude.toFixed(2) }}</strong></div>
          </div>
        </div>

        <div class="panel compact">
          <div class="panel-header">
            <h3>Testing Indicators</h3>
            <span class="panel-tag">Ranges</span>
          </div>

          <div class="value-list">
            <div class="value-item"><span>X Range</span><strong>{{ minX?.toFixed?.(2) ?? "-" }} to {{ maxX?.toFixed?.(2) ?? "-" }}</strong></div>
            <div class="value-item"><span>Y Range</span><strong>{{ minY?.toFixed?.(2) ?? "-" }} to {{ maxY?.toFixed?.(2) ?? "-" }}</strong></div>
            <div class="value-item"><span>Z Range</span><strong>{{ minZ?.toFixed?.(2) ?? "-" }} to {{ maxZ?.toFixed?.(2) ?? "-" }}</strong></div>
          </div>
        </div>

        <div class="panel compact">
          <div class="panel-header">
            <h3>Analysis Status</h3>
            <span class="panel-tag">Client-side</span>
          </div>

          <div class="value-list">
            <div class="value-item"><span>Smoothed Magnitude</span><strong>{{ smoothedMagnitude.toFixed(2) }}</strong></div>
            <div class="value-item"><span>Status</span><strong>{{ derivedStatus }}</strong></div>
            <div class="value-item"><span>Risk</span><strong>{{ derivedRisk }}</strong></div>
          </div>

          <div class="finding-box">
            <strong>Key Finding</strong>
            <p>{{ keyFinding }}</p>
          </div>
        </div>

        <div class="panel compact">
          <div class="panel-header">
            <h3>Debug Panel</h3>
            <span class="panel-tag">JSON</span>
          </div>

          <div class="value-list">
            <div class="value-item">
              <span>WebSocket URL</span>
              <strong class="small-strong">{{ mode === "mock" ? "Local mock stream" : websocketUrl }}</strong>
            </div>
          </div>

          <pre class="packet-box">{{ formattedPacket }}</pre>
        </div>
      </article>
    </section>
  </section>
</template>

<style scoped>
.page-head {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.page-head h2 {
  margin: 0 0 8px;
  font-size: 30px;
}

.page-head p {
  margin: 0;
  color: #64748b;
}

.action-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.mode-select,
.ip-input {
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 10px 14px;
  background: white;
  font-weight: 600;
  color: #0f172a;
}

.ip-input {
  min-width: 240px;
}

button {
  border: none;
  border-radius: 12px;
  padding: 11px 18px;
  font-weight: 700;
  cursor: pointer;
}

.primary {
  background: #1d4ed8;
  color: white;
}

.secondary {
  background: #e2e8f0;
  color: #0f172a;
}

.ghost {
  background: white;
  color: #1d4ed8;
  box-shadow: inset 0 0 0 1px #bfdbfe;
}

.error-text {
  margin: -8px 0 20px;
  color: #b91c1c;
  font-size: 14px;
  font-weight: 600;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.grid-main {
  display: grid;
  grid-template-columns: 1.55fr 1fr;
  gap: 22px;
}

.side-column {
  display: grid;
  gap: 18px;
}

.chart-panel {
  padding-bottom: 18px;
}

.chart-stack {
  display: grid;
  gap: 16px;
}

.chart-block {
  background: #f8fafc;
  border-radius: 16px;
  padding: 14px 16px;
}

.subhead {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 8px;
  color: #334155;
  font-weight: 700;
}

.subhead small {
  color: #64748b;
  font-weight: 600;
}

.panel {
  background: white;
  border-radius: 22px;
  padding: 22px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

.panel.compact {
  height: fit-content;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.panel-header h3 {
  margin: 0;
  color: #1e3a8a;
  font-size: 22px;
}

.panel-tag {
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 13px;
  font-weight: 700;
  padding: 8px 12px;
  border-radius: 999px;
}

.value-list {
  display: grid;
  gap: 12px;
}

.value-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  background: #f8fafc;
  padding: 14px 16px;
  border-radius: 14px;
}

.value-item span {
  color: #475569;
}

.value-item strong {
  color: #0f172a;
  font-size: 17px;
  text-align: right;
}

.small-strong {
  font-size: 13px !important;
  word-break: break-all;
}

.finding-box {
  margin-top: 14px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 14px;
  padding: 14px 16px;
}

.finding-box strong {
  display: block;
  color: #1d4ed8;
  margin-bottom: 8px;
}

.finding-box p {
  margin: 0;
  color: #334155;
  line-height: 1.6;
}

.packet-box {
  margin: 14px 0 0;
  background: #0f172a;
  color: #e2e8f0;
  padding: 16px;
  border-radius: 16px;
  font-family: Consolas, monospace;
  font-size: 14px;
  line-height: 1.7;
  overflow-x: auto;
}

@media (max-width: 1200px) {
  .metrics-grid,
  .grid-main {
    grid-template-columns: 1fr;
  }

  .ip-input {
    min-width: 100%;
  }
}
</style>
