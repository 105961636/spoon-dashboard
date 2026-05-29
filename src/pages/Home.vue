<script setup>
import { computed } from "vue"
import { RouterLink } from "vue-router"
import MetricCard from "../components/MetricCard.vue"
import { useDashboardSnapshot } from "../composables/useDashboardSnapshot"

const { snapshot } = useDashboardSnapshot()

const quickMetrics = computed(() => [
  {
    title: "Connection",
    value: snapshot.value.connectionState,
    subtitle: "Current stream status"
  },
  {
    title: "Mode",
    value: snapshot.value.mode === "mock" ? "Mock" : "ESP32",
    subtitle: "Current monitoring mode"
  },
  {
    title: "Packet Count",
    value: snapshot.value.packetCount,
    subtitle: "Packets received so far"
  },
  {
    title: "Risk",
    value: snapshot.value.derivedRisk,
    subtitle: "Current interpretation"
  }
])

const streamSummary = computed(() => {
  return snapshot.value.lastPacket
    ? `${snapshot.value.currentX.toFixed(2)} / ${snapshot.value.currentY.toFixed(2)} / ${snapshot.value.currentZ.toFixed(2)}`
    : "Waiting for stream"
})

const systemModules = [
  {
    title: "Live Monitoring",
    text: "Real-time x, y, z packet visualisation with chart-based testing support."
  },
  {
    title: "Device Connection",
    text: "ESP32 IP, WebSocket target address, and endpoint validation for live integration."
  },
  {
    title: "Client-side Analysis",
    text: "Magnitude, status, and risk are derived locally for fast interpretation."
  }
]
</script>

<template>
  <section class="page">
    <section class="hero-panel">
      <div class="hero-copy">
        <span class="hero-badge">Smart Assistive Feeding System</span>
        <h2>System Overview</h2>
        <p>
          A monitoring dashboard for viewing live gyroscope data, validating ESP32
          connectivity, and presenting derived indicators for the smart spoon system.
        </p>

        <div class="hero-actions">
          <RouterLink to="/live-data" class="primary-link">Open Live Data</RouterLink>
          <RouterLink to="/device-status" class="secondary-link">Check Device Status</RouterLink>
        </div>
      </div>

      <div class="hero-status">
        <div class="status-card">
          <span class="status-label">Primary Device</span>
          <strong>ESP32</strong>
        </div>
        <div class="status-card">
          <span class="status-label">Current Stream</span>
          <strong>{{ snapshot.lastPacket ? "x / y / z JSON" : "No live packet yet" }}</strong>
        </div>
        <div class="status-card">
          <span class="status-label">Monitoring Mode</span>
          <strong>Mock and Real</strong>
        </div>
      </div>
    </section>

    <section class="metrics-grid">
      <MetricCard
        v-for="item in quickMetrics"
        :key="item.title"
        :title="item.title"
        :value="item.value"
        :subtitle="item.subtitle"
      />
    </section>

    <section class="grid-main">
      <article class="panel">
        <div class="panel-header">
          <h3>Data Flow</h3>
          <span class="panel-tag">Current Architecture</span>
        </div>

        <ol class="step-list">
          <li>ESP32 generates gyroscope packets as x, y, z JSON data.</li>
          <li>Packets are streamed through Wi-Fi using the /ws WebSocket endpoint.</li>
          <li>The dashboard receives, visualises, and analyses the incoming stream.</li>
          <li>Mock mode remains available for testing when the board is not physically available.</li>
        </ol>
      </article>

      <article class="side-column">
        <div class="panel compact">
          <div class="panel-header">
            <h3>Current Snapshot</h3>
            <span class="panel-tag">Live Summary</span>
          </div>

          <div class="value-list">
            <div class="value-item">
              <span>Current XYZ</span>
              <strong class="small-strong">{{ streamSummary }}</strong>
            </div>
            <div class="value-item">
              <span>Last Update</span>
              <strong>{{ snapshot.lastUpdate }}</strong>
            </div>
            <div class="value-item">
              <span>Current Finding</span>
              <strong class="small-strong">{{ snapshot.finding }}</strong>
            </div>
          </div>
        </div>

        <div class="panel compact">
          <div class="panel-header">
            <h3>System Modules</h3>
            <span class="panel-tag">Overview</span>
          </div>

          <div class="module-list">
            <div class="module-card" v-for="item in systemModules" :key="item.title">
              <strong>{{ item.title }}</strong>
              <p>{{ item.text }}</p>
            </div>
          </div>
        </div>
      </article>
    </section>
  </section>
</template>

<style scoped>
.page {
  display: grid;
  gap: 26px;
}

.hero-panel {
  background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 45%, #ffffff 100%);
  border-radius: 26px;
  padding: 30px;
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 24px;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
}

.hero-copy h2 {
  margin: 10px 0 12px;
  font-size: 34px;
  color: #0f172a;
}

.hero-copy p {
  margin: 0;
  color: #334155;
  line-height: 1.7;
  max-width: 720px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  background: #1d4ed8;
  color: white;
  font-size: 13px;
  font-weight: 700;
}

.hero-actions {
  display: flex;
  gap: 12px;
  margin-top: 22px;
  flex-wrap: wrap;
}

.primary-link,
.secondary-link {
  border-radius: 12px;
  padding: 12px 18px;
  font-weight: 700;
  text-decoration: none;
}

.primary-link {
  background: #1d4ed8;
  color: white;
}

.secondary-link {
  background: white;
  color: #1d4ed8;
  box-shadow: inset 0 0 0 1px #bfdbfe;
}

.hero-status {
  display: grid;
  gap: 16px;
  align-content: start;
}

.status-card {
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(191, 219, 254, 0.75);
  border-radius: 18px;
  padding: 18px 20px;
}

.status-label {
  display: block;
  color: #64748b;
  font-size: 14px;
  margin-bottom: 8px;
}

.status-card strong {
  font-size: 22px;
  color: #0f172a;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.grid-main {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 22px;
}

.side-column {
  display: grid;
  gap: 22px;
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

.step-list {
  margin: 0;
  padding-left: 22px;
  color: #334155;
  line-height: 1.9;
}

.value-list,
.module-list {
  display: grid;
  gap: 12px;
}

.value-item,
.module-card {
  background: #f8fafc;
  border-radius: 14px;
  padding: 14px 16px;
}

.value-item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
}

.value-item span {
  color: #475569;
}

.value-item strong {
  color: #0f172a;
  text-align: right;
}

.small-strong {
  font-size: 14px;
  line-height: 1.5;
}

.module-card strong {
  display: block;
  margin-bottom: 8px;
  color: #0f172a;
}

.module-card p {
  margin: 0;
  color: #475569;
  line-height: 1.6;
}

@media (max-width: 1200px) {
  .hero-panel,
  .metrics-grid,
  .grid-main {
    grid-template-columns: 1fr;
  }
}
</style>
