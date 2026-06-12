<script setup>
import { computed } from "vue"
import MetricCard from "../components/MetricCard.vue"
import { useGyroStream } from "../composables/useGyroStream"

const stream = useGyroStream()
const ip = computed(() => stream.esp32Ip.value.trim())

const {
  alertLevel,
  connectionBadge,
  finding,
  dominantAxis,
  motionScore,
  stabilityIndex,
  deteriorationTrend,
  alertSummary,
  peakToPeakText,
  formattedPacket,
  mode,
  connectionState,
  packetCount,
  lastUpdate,
  lastPacket
} = stream

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
          <span class="alert-level" :class="alertLevel.toLowerCase()">{{ alertLevel }}</span>
        </div>

        <div class="status-box">
          <strong>{{ connectionBadge }}</strong>
          <p>{{ finding }}</p>
        </div>

        <div class="derived-mini-grid">
          <div class="mini-item">
            <span>Dominant Axis</span>
            <strong>{{ dominantAxis }}</strong>
          </div>
          <div class="mini-item">
            <span>Motion Score</span>
            <strong>{{ motionScore }}/100</strong>
          </div>
          <div class="mini-item">
            <span>Stability Index</span>
            <strong>{{ stabilityIndex }}/100</strong>
          </div>
          <div class="mini-item">
            <span>Trend</span>
            <strong>{{ deteriorationTrend }}</strong>
          </div>
          <div class="mini-item">
            <span>Alert Summary</span>
            <strong>{{ alertSummary }}</strong>
          </div>
          <div class="mini-item">
            <span>Peak-to-Peak</span>
            <strong>{{ peakToPeakText }}</strong>
          </div>
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
            <li>Raw x / y / z packets are further interpreted in software rather than shown only as raw values.</li>
            <li>Device Status combines address validation, packet checking, derived indicators, and alert readiness.</li>
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

.alert-level {
  border-radius: 999px;
  padding: 7px 11px;
  font-size: 12px;
  font-weight: 700;
}

.alert-level.normal {
  background: #dcfce7;
  color: #166534;
}

.alert-level.medium {
  background: #ffedd5;
  color: #c2410c;
}

.alert-level.high {
  background: #fee2e2;
  color: #b91c1c;
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

.derived-mini-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 12px;
}

.mini-item {
  background: #f8fafc;
  border-radius: 14px;
  padding: 12px 14px;
}

.mini-item span {
  display: block;
  color: #475569;
  font-size: 14px;
  margin-bottom: 6px;
}

.mini-item strong {
  color: #0f172a;
  font-size: 15px;
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
  .device-main,
  .derived-mini-grid {
    grid-template-columns: 1fr;
  }
}
</style>
