<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import MetricCard from "../components/MetricCard.vue"
import GyroChart from "../components/GyroChart.vue"
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

const modeTag = computed(() => {
  return mode.value === "mock" ? "Testing" : "ESP32 Ready"
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

const createProvider = () => {
  if (mode.value === "mock") {
    return createMockGyroProvider()
  }

  return createWebSocketGyroProvider(websocketUrl.value, {
    reconnectDelay: 2000,
    maxRetries: 5
  })
}

const startStream = () => {
  stopStream()
  errorMessage.value = ""

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
  if (provider) {
    provider.stop()
    provider = null
  }

  if (mode.value === "mock") {
    connectionState.value = "Stopped"
  } else if (connectionState.value !== "No IP") {
    connectionState.value = "Disconnected"
  }
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
  connectionState.value = "Idle"
}

watch(mode, () => {
  resetStream()
  startStream()
})

onMounted(() => {
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
          Real-time gyroscope monitoring with mock testing and ESP32-ready
          WebSocket integration.
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

    <p v-if="errorMessage" class="error-text">
      {{ errorMessage }}
    </p>

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
      <article class="panel">
        <div class="panel-header">
          <h3>Gyroscope Live Stream</h3>
          <span class="panel-tag">{{ modeTag }}</span>
        </div>

        <GyroChart :chart-data="history" :height="430" />
      </article>

      <article class="side-column">
        <div class="panel compact">
          <div class="panel-header">
            <h3>Current Values</h3>
            <span class="panel-tag">x / y / z</span>
          </div>

          <div class="value-list">
            <div class="value-item">
              <span>X</span>
              <strong>{{ currentX.toFixed(2) }}</strong>
            </div>
            <div class="value-item">
              <span>Y</span>
              <strong>{{ currentY.toFixed(2) }}</strong>
            </div>
            <div class="value-item">
              <span>Z</span>
              <strong>{{ currentZ.toFixed(2) }}</strong>
            </div>
            <div class="value-item">
              <span>Magnitude</span>
              <strong>{{ currentMagnitude.toFixed(2) }}</strong>
            </div>
          </div>
        </div>

        <div class="panel compact">
          <div class="panel-header">
            <h3>Derived Indicators</h3>
            <span class="panel-tag">Client-side</span>
          </div>

          <div class="value-list">
            <div class="value-item">
              <span>Smoothed Magnitude</span>
              <strong>{{ smoothedMagnitude.toFixed(2) }}</strong>
            </div>
            <div class="value-item">
              <span>Status</span>
              <strong>{{ derivedStatus }}</strong>
            </div>
            <div class="value-item">
              <span>Risk</span>
              <strong>{{ derivedRisk }}</strong>
            </div>
          </div>
        </div>

        <div class="panel compact">
          <div class="panel-header">
            <h3>Connection Debug</h3>
            <span class="panel-tag">Target</span>
          </div>

          <div class="value-list">
            <div class="value-item">
              <span>Mode</span>
              <strong>{{ mode === "mock" ? "Mock" : "ESP32" }}</strong>
            </div>
            <div class="value-item">
              <span>WebSocket URL</span>
              <strong class="small-strong">
                {{ mode === "mock" ? "Local mock stream" : websocketUrl }}
              </strong>
            </div>
          </div>
        </div>

        <div class="panel compact">
          <div class="panel-header">
            <h3>Last Raw Packet</h3>
            <span class="panel-tag">JSON</span>
          </div>

          <pre class="packet-box">{{ formattedPacket }}</pre>
        </div>

        <div class="panel compact">
          <div class="panel-header">
            <h3>Stream Notes</h3>
            <span class="panel-tag">Current Scope</span>
          </div>

          <ul class="note-list">
            <li>Current hardware packet format is x, y, z JSON over WebSocket.</li>
            <li>Mock mode is used to validate the dashboard before board-side testing.</li>
            <li>Real mode automatically retries the connection if the stream drops.</li>
          </ul>
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
  margin-bottom: 28px;
}

.grid-main {
  display: grid;
  grid-template-columns: 1.7fr 1fr;
  gap: 24px;
}

.side-column {
  display: grid;
  gap: 24px;
}

.panel {
  background: white;
  border-radius: 22px;
  padding: 24px;
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
  margin-bottom: 18px;
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
  gap: 14px;
}

.value-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  background: #f8fafc;
  padding: 16px 18px;
  border-radius: 14px;
}

.value-item span {
  color: #475569;
}

.value-item strong {
  color: #0f172a;
  font-size: 18px;
}

.small-strong {
  font-size: 14px !important;
  text-align: right;
  word-break: break-all;
}

.packet-box {
  margin: 0;
  background: #0f172a;
  color: #e2e8f0;
  padding: 18px;
  border-radius: 16px;
  font-family: Consolas, monospace;
  font-size: 14px;
  line-height: 1.7;
  overflow-x: auto;
}

.note-list {
  margin: 0;
  padding-left: 18px;
  color: #334155;
  line-height: 1.8;
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
