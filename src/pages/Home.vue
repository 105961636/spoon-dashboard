<script setup>
import { computed } from "vue"
import { RouterLink } from "vue-router"
import MetricCard from "../components/MetricCard.vue"
import { useGyroStream } from "../composables/useGyroStream"

const {
  connectionState,
  currentModeLabel,
  packetCount,
  derivedRisk,
  streamLabel,
  currentXYZText,
  lastUpdate,
  finding,
  xRangeText,
  yRangeText
} = useGyroStream()

const quickMetrics = computed(() => [
  {
    title: "Connection",
    value: connectionState.value,
    subtitle: "Current stream status"
  },
  {
    title: "Mode",
    value: currentModeLabel.value,
    subtitle: "Current monitoring mode"
  },
  {
    title: "Packet Count",
    value: packetCount.value,
    subtitle: "Packets received so far"
  },
  {
    title: "Risk",
    value: derivedRisk.value,
    subtitle: "Current interpretation"
  }
])

const currentOverview = computed(() => [
  {
    label: "Current XYZ",
    value: currentXYZText.value
  },
  {
    label: "Last Update",
    value: lastUpdate.value
  },
  {
    label: "Packet Count",
    value: String(packetCount.value)
  },
  {
    label: "Current Finding",
    value: finding.value
  },
  {
    label: "X Range",
    value: xRangeText.value
  },
  {
    label: "Y Range",
    value: yRangeText.value
  }
])

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
          <strong>{{ streamLabel }}</strong>
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
          <h3>Current Session Overview</h3>
          <span class="panel-tag">Live Summary</span>
        </div>

        <div class="overview-grid">
          <div class="overview-item" v-for="item in currentOverview" :key="item.label">
            <span>{{ item.label }}</span>
            <strong class="small-strong">{{ item.value }}</strong>
          </div>
        </div>
      </article>

      <article class="panel compact">
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
      </article>
    </section>

    <section class="full-width-row">
      <article class="panel">
        <div class="panel-header">
          <h3>Data Flow</h3>
          <span class="panel-tag">Architecture</span>
        </div>

        <ol class="step-list">
          <li>ESP32 sends x / y / z JSON packets.</li>
          <li>Packets are streamed through the /ws WebSocket endpoint.</li>
          <li>The dashboard receives, visualises, and interprets the stream.</li>
        </ol>
      </article>
    </section>
  </section>
</template>

<style scoped>
.page {
  display: grid;
  gap: 18px;
}

.hero-panel {
  background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 45%, #ffffff 100%);
  border-radius: 22px;
  padding: 20px 24px;
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  gap: 18px;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
}

.hero-copy h2 {
  margin: 8px 0 8px;
  font-size: 30px;
  color: #0f172a;
}

.hero-copy p {
  margin: 0;
  color: #334155;
  line-height: 1.6;
  max-width: 660px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  padding: 7px 12px;
  border-radius: 999px;
  background: #1d4ed8;
  color: white;
  font-size: 12px;
  font-weight: 700;
}

.hero-actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.primary-link,
.secondary-link {
  border-radius: 12px;
  padding: 10px 16px;
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
  gap: 12px;
  align-content: start;
}

.status-card {
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(191, 219, 254, 0.75);
  border-radius: 16px;
  padding: 14px 16px;
}

.status-label {
  display: block;
  color: #64748b;
  font-size: 13px;
  margin-bottom: 6px;
}

.status-card strong {
  font-size: 18px;
  color: #0f172a;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.grid-main {
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  gap: 16px;
  align-items: start;
}

.full-width-row {
  display: block;
}

.panel {
  background: white;
  border-radius: 20px;
  padding: 18px;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
  height: fit-content;
}

.panel.compact {
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

.overview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.overview-item,
.module-card {
  background: #f8fafc;
  border-radius: 14px;
  padding: 12px 14px;
}

.overview-item span {
  display: block;
  color: #475569;
  margin-bottom: 6px;
  font-size: 14px;
}

.overview-item strong {
  color: #0f172a;
}

.small-strong {
  font-size: 14px;
  line-height: 1.45;
  word-break: break-word;
}

.module-list {
  display: grid;
  gap: 10px;
}

.module-card strong {
  display: block;
  margin-bottom: 6px;
  color: #0f172a;
  font-size: 16px;
}

.module-card p {
  margin: 0;
  color: #475569;
  line-height: 1.55;
  font-size: 14px;
}

.step-list {
  margin: 0;
  padding-left: 18px;
  color: #334155;
  line-height: 1.75;
}

@media (max-width: 1200px) {
  .hero-panel,
  .metrics-grid,
  .grid-main,
  .overview-grid {
    grid-template-columns: 1fr;
  }
}
</style>
