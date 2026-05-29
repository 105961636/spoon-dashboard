<script setup>
import { computed } from "vue"
import MetricCard from "../components/MetricCard.vue"
import { useGyroStream } from "../composables/useGyroStream"

const {
  ip,
  mode,
  connectionState,
  packetCount,
  lastUpdate,
  lastPacket,
  finding,
  connectionBadge,
  formattedPacket
} = (() => {
  const stream = useGyroStream()

  return {
    ip: computed(() => stream.esp32Ip.value.trim()),
    mode: stream.mode,
    connectionState: stream.connectionState,
    packetCount: stream.packetCount,
    lastUpdate: stream.lastUpdate,
    lastPacket: stream.lastPacket,
    finding: stream.finding,
    connectionBadge: stream.connectionBadge,
    formattedPacket: stream.formattedPacket
  }
})()

const deviceMetrics = computed(() => [
  {
    title: "Primary Device",
    value: "ESP32",
    subtitle: "Current target hardware platform"
  },
  {
    title: "Transport",
    value: "Wi-Fi",
    subtitle: "Board acts as network stream source"
  },
  {
    title: "Endpoint",
    value: "/ws",
    subtitle: "WebSocket stream path"
  },
  {
    title: "Packet Format",
    value: "x / y / z",
    subtitle: "Current JSON fields from hardware"
  }
])

const httpUrl = computed(() => (ip.value ? `http://${ip.value}` : "-"))
const wsUrl = computed(() => (ip.value ? `ws://${ip.value}/ws` : "-"))

const checklist = computed(() => [
  ip.value ? "ESP32 local IP has been entered." : "ESP32 local IP still needs to be entered.",
  connectionState.value === "Connected"
    ? "Dashboard has connected successfully to the live stream."
    : "Live dashboard connection has not yet been confirmed.",
  packetCount.value > 0
    ? "Packets have been received and processed by the dashboard."
    : "No packets have been recorded yet.",
  lastPacket.value
    ? "Current packet example is available for verification."
    : "No live packet sample is available yet."
])
</script>

<template>
  <section class="page">
    <div class="page-head">
      <div>
        <h2>Device Status</h2>
        <p>
          Current ESP32 connection details, target addresses, and hardware-side
          validation notes for real dashboard integration.
        </p>
      </div>
    </div>

    <section class="metrics-grid">
      <MetricCard
        v-for="item in deviceMetrics"
        :key="item.title"
        :title="item.title"
        :value="item.value"
        :subtitle="item.subtitle"
      />
    </section>

    <section class="full-width-row">
      <article class="panel">
        <div class="panel-header">
          <h3>Current Validation Result</h3>
          <span class="panel-tag">Status</span>
        </div>

        <div class="status-box">
          <strong>{{ connectionBadge }}</strong>
          <p>{{ finding }}</p>
        </div>
      </article>
    </section>

    <section class="device-main">
      <article class="panel left-tall">
        <div class="panel-header">
          <h3>Connection Details</h3>
          <span class="panel-tag">ESP32 Target</span>
        </div>

        <div class="detail-list">
          <div class="detail-item">
            <span>ESP32 Local IP</span>
            <strong>{{ ip || "-" }}</strong>
          </div>
          <div class="detail-item">
            <span>HTTP URL</span>
            <strong>{{ httpUrl }}</strong>
          </div>
          <div class="detail-item">
            <span>WebSocket URL</span>
            <strong>{{ wsUrl }}</strong>
          </div>
          <div class="detail-item">
            <span>Current Mode</span>
            <strong>{{ mode === "mock" ? "Mock" : "ESP32" }}</strong>
          </div>
          <div class="detail-item">
            <span>Connection State</span>
            <strong>{{ connectionState }}</strong>
          </div>
          <div class="detail-item">
            <span>Packet Count</span>
            <strong>{{ packetCount }}</strong>
          </div>
          <div class="detail-item">
            <span>Last Update</span>
            <strong>{{ lastUpdate }}</strong>
          </div>
        </div>
      </article>

      <div class="column-stack right-tall">
        <article class="panel grow-panel">
          <div class="panel-header">
            <h3>Packet Example</h3>
            <span class="panel-tag">Current JSON</span>
          </div>

          <pre class="packet-box">{{ formattedPacket }}</pre>
        </article>

        <article class="panel grow-panel">
          <div class="panel-header">
            <h3>System Notes</h3>
            <span class="panel-tag">Current State</span>
          </div>

          <ul class="content-list">
            <li>Dashboard and ESP32 are linked through Wi-Fi and the /ws WebSocket endpoint.</li>
            <li>Live Data page remains the main testing and demonstration page.</li>
            <li>Device Status provides the current address, packet, and validation context for troubleshooting.</li>
          </ul>
        </article>
      </div>
    </section>

    <section class="full-width-row">
      <article class="panel">
        <div class="panel-header">
          <h3>Validation Checklist</h3>
          <span class="panel-tag">Before Real Mode</span>
        </div>

        <ul class="content-list">
          <li v-for="item in checklist" :key="item">
            {{ item }}
          </li>
        </ul>
      </article>
    </section>
  </section>
</template>

<style scoped>
.page {
  display: grid;
  gap: 16px;
}

.page-head {
  margin-bottom: 2px;
}

.page-head h2 {
  margin: 0 0 6px;
  font-size: 30px;
}

.page-head p {
  margin: 0;
  color: #64748b;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.full-width-row {
  display: block;
}

.device-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: stretch;
}

.left-tall,
.right-tall {
  height: 100%;
}

.column-stack {
  display: grid;
  gap: 26px;
}

.grow-panel {
  flex: 1;
}

.panel {
  background: white;
  border-radius: 20px;
  padding: 18px;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
  height: fit-content;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.panel-header h3 {
  margin: 0;
  color: #1e3a8a;
  font-size: 20px;
}

.panel-tag {
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
  padding: 7px 11px;
  border-radius: 999px;
}

.detail-list {
  display: grid;
  gap: 8px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;
  background: #f8fafc;
  padding: 12px 14px;
  border-radius: 14px;
}

.detail-item span {
  color: #475569;
  font-size: 14px;
}

.detail-item strong {
  color: #0f172a;
  text-align: right;
  word-break: break-all;
  font-size: 15px;
}

.status-box {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 14px;
  padding: 12px 14px;
}

.status-box strong {
  display: block;
  color: #1d4ed8;
  margin-bottom: 6px;
}

.status-box p {
  margin: 0;
  color: #334155;
  line-height: 1.5;
  font-size: 14px;
}

.packet-box {
  margin: 0;
  background: #0f172a;
  color: #e2e8f0;
  padding: 12px;
  border-radius: 16px;
  font-family: Consolas, monospace;
  font-size: 12px;
  line-height: 1.55;
  overflow-x: auto;
  max-height: 140px;
}

.content-list {
  margin: 0;
  padding-left: 18px;
  color: #334155;
  line-height: 1.75;
}

@media (max-width: 1200px) {
  .metrics-grid,
  .device-main {
    grid-template-columns: 1fr;
  }
}
</style>
