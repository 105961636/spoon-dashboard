<script setup>
import { computed } from "vue"
import MetricCard from "../components/MetricCard.vue"
import { useDashboardSnapshot } from "../composables/useDashboardSnapshot"

const { snapshot } = useDashboardSnapshot()

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

const httpUrl = computed(() => (snapshot.value.ip ? `http://${snapshot.value.ip}` : "-"))
const wsUrl = computed(() => (snapshot.value.ip ? `ws://${snapshot.value.ip}/ws` : "-"))

const checklist = computed(() => [
  snapshot.value.ip ? "ESP32 local IP has been entered." : "ESP32 local IP still needs to be entered.",
  snapshot.value.connectionState === "Connected"
    ? "Dashboard has connected successfully to the live stream."
    : "Live dashboard connection has not yet been confirmed.",
  snapshot.value.packetCount > 0
    ? "Packets have been received and processed by the dashboard."
    : "No packets have been recorded yet.",
  snapshot.value.lastPacket
    ? "Current packet example is available for verification."
    : "No live packet sample is available yet."
])

const packetExample = computed(() => {
  if (!snapshot.value.lastPacket) {
    return `{
  "x": 12.3,
  "y": -4.5,
  "z": 7.8
}`
  }

  return JSON.stringify(snapshot.value.lastPacket, null, 2)
})
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

    <section class="grid-main">
      <article class="panel">
        <div class="panel-header">
          <h3>Connection Details</h3>
          <span class="panel-tag">ESP32 Target</span>
        </div>

        <div class="detail-list">
          <div class="detail-item">
            <span>ESP32 Local IP</span>
            <strong>{{ snapshot.ip || "-" }}</strong>
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
            <strong>{{ snapshot.mode === "mock" ? "Mock" : "ESP32" }}</strong>
          </div>
          <div class="detail-item">
            <span>Connection State</span>
            <strong>{{ snapshot.connectionState }}</strong>
          </div>
          <div class="detail-item">
            <span>Packet Count</span>
            <strong>{{ snapshot.packetCount }}</strong>
          </div>
          <div class="detail-item">
            <span>Last Update</span>
            <strong>{{ snapshot.lastUpdate }}</strong>
          </div>
        </div>
      </article>

      <article class="panel">
        <div class="panel-header">
          <h3>Packet Example</h3>
          <span class="panel-tag">Current JSON</span>
        </div>

        <pre class="packet-box">{{ packetExample }}</pre>
      </article>
    </section>

    <section class="grid-main bottom-grid">
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

      <article class="panel">
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
    </section>
  </section>
</template>

<style scoped>
.page-head {
  margin-bottom: 24px;
}

.page-head h2 {
  margin: 0 0 8px;
  font-size: 30px;
}

.page-head p {
  margin: 0;
  color: #64748b;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 28px;
}

.grid-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
  margin-bottom: 22px;
}

.panel {
  background: white;
  border-radius: 22px;
  padding: 22px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
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

.detail-list {
  display: grid;
  gap: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  background: #f8fafc;
  padding: 14px 16px;
  border-radius: 14px;
}

.detail-item span {
  color: #475569;
}

.detail-item strong {
  color: #0f172a;
  text-align: right;
  word-break: break-all;
}

.packet-box {
  margin: 0;
  background: #0f172a;
  color: #e2e8f0;
  padding: 16px;
  border-radius: 16px;
  font-family: Consolas, monospace;
  font-size: 14px;
  line-height: 1.7;
  overflow-x: auto;
}

.content-list {
  margin: 0;
  padding-left: 20px;
  color: #334155;
  line-height: 1.85;
}

@media (max-width: 1200px) {
  .metrics-grid,
  .grid-main {
    grid-template-columns: 1fr;
  }
}
</style>
