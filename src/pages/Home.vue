<script setup>
import { RouterLink } from "vue-router"
import MetricCard from "../components/MetricCard.vue"

const overviewMetrics = [
  {
    title: "Live Stream Schema",
    value: "x / y / z",
    subtitle: "Current incoming packet structure"
  },
  {
    title: "Connection Method",
    value: "Wi-Fi + /ws",
    subtitle: "ESP32 WebSocket streaming path"
  },
  {
    title: "Dashboard Modes",
    value: "Mock + Real",
    subtitle: "Testing mode and hardware mode"
  },
  {
    title: "Client Analysis",
    value: "Magnitude / Risk",
    subtitle: "Derived indicators from live gyro data"
  }
]

const systemModules = [
  {
    title: "Live Monitoring",
    text: "Real-time x, y, z packet visualisation with stream state, packet count, and last update."
  },
  {
    title: "Device Connection",
    text: "ESP32, Wi-Fi, HTTP, and WebSocket endpoint details prepared for direct local network testing."
  },
  {
    title: "Client-side Analysis",
    text: "Magnitude, smoothed magnitude, status, and risk are derived directly in the dashboard."
  }
]

const dataFlow = [
  "ESP32 generates gyroscope packets as x, y, z JSON data.",
  "Packets are streamed through Wi-Fi using the /ws WebSocket endpoint.",
  "The dashboard receives, visualises, and analyses the incoming stream.",
  "Mock mode remains available for testing when the board is not physically available."
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
          <strong>x / y / z JSON</strong>
        </div>
        <div class="status-card">
          <span class="status-label">Monitoring Mode</span>
          <strong>Mock and Real</strong>
        </div>
      </div>
    </section>

    <section class="metrics-grid">
      <MetricCard
        v-for="item in overviewMetrics"
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
          <li v-for="step in dataFlow" :key="step">
            {{ step }}
          </li>
        </ol>
      </article>

      <article class="side-column">
        <div class="panel compact">
          <div class="panel-header">
            <h3>System Modules</h3>
            <span class="panel-tag">Overview</span>
          </div>

          <div class="module-list">
            <div v-for="item in systemModules" :key="item.title" class="module-item">
              <strong>{{ item.title }}</strong>
              <p>{{ item.text }}</p>
            </div>
          </div>
        </div>

        <div class="panel compact">
          <div class="panel-header">
            <h3>Quick Navigation</h3>
            <span class="panel-tag">Dashboard</span>
          </div>

          <div class="quick-links">
            <RouterLink to="/live-data" class="quick-link-card">
              <span>Live Data</span>
              <strong>Monitor x / y / z packets, stream state, and derived indicators</strong>
            </RouterLink>

            <RouterLink to="/summary" class="quick-link-card">
              <span>Summary</span>
              <strong>Review current monitoring interpretation and stream context</strong>
            </RouterLink>

            <RouterLink to="/device-status" class="quick-link-card">
              <span>Device Status</span>
              <strong>Check target IP, HTTP URL, WebSocket URL, and packet format</strong>
            </RouterLink>
          </div>
        </div>
      </article>
    </section>
  </section>
</template>

<style scoped>
.page {
  display: grid;
  gap: 28px;
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
  grid-template-columns: 1.55fr 1fr;
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

.step-list {
  margin: 0;
  padding-left: 20px;
  color: #334155;
  line-height: 1.85;
}

.module-list,
.quick-links {
  display: grid;
  gap: 14px;
}

.module-item {
  background: #f8fafc;
  border-radius: 16px;
  padding: 16px 18px;
}

.module-item strong {
  display: block;
  color: #0f172a;
  margin-bottom: 6px;
}

.module-item p {
  margin: 0;
  color: #475569;
  line-height: 1.6;
  font-size: 14px;
}

.quick-link-card {
  display: block;
  background: #f8fafc;
  border-radius: 16px;
  padding: 16px 18px;
  transition: 0.2s ease;
}

.quick-link-card span {
  display: block;
  color: #1d4ed8;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 8px;
}

.quick-link-card strong {
  color: #0f172a;
  line-height: 1.5;
}

.quick-link-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.08);
}

@media (max-width: 1200px) {
  .hero-panel,
  .metrics-grid,
  .grid-main {
    grid-template-columns: 1fr;
  }
}
</style>
