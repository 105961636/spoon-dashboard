<script setup>
import { computed } from "vue"
import MetricCard from "../components/MetricCard.vue"
import { useDashboardSnapshot } from "../composables/useDashboardSnapshot"

const { snapshot } = useDashboardSnapshot()

const summaryMetrics = computed(() => [
  {
    title: "Packet Format",
    value: "JSON",
    subtitle: "Current stream uses x / y / z fields"
  },
  {
    title: "Live Axes",
    value: "x / y / z",
    subtitle: "Real-time gyroscope input channels"
  },
  {
    title: "Derived Indicators",
    value: "3",
    subtitle: "Magnitude, status, and risk"
  },
  {
    title: "Connection Method",
    value: "Wi-Fi + /ws",
    subtitle: "ESP32 WebSocket monitoring path"
  }
])

const outputs = computed(() => [
  {
    label: "Raw Input",
    value: "x / y / z"
  },
  {
    label: "Calculated Magnitude",
    value: "Enabled"
  },
  {
    label: "Status Layer",
    value: "Stable / Monitoring / Unstable"
  },
  {
    label: "Risk Layer",
    value: "Low / Medium / High"
  }
])

const currentFindings = computed(() => [
  "Dashboard can receive and visualise real-time ESP32 packets through WebSocket.",
  "Packet count, raw packet output, and current values support testing and troubleshooting.",
  snapshot.value.finding
])

const limitations = computed(() => [
  "Current data stream is limited to x / y / z fields.",
  "Higher-level corrected or stabilised output is not yet integrated.",
  "Interpretation quality depends on consistency of incoming sensor units and scale."
])
</script>

<template>
  <section class="page">
    <div class="page-head">
      <div>
        <h2>Summary</h2>
        <p>
          Monitoring summary for the current dashboard capabilities, available
          outputs, and real-time data interpretation layer.
        </p>
      </div>
    </div>

    <section class="metrics-grid">
      <MetricCard
        v-for="item in summaryMetrics"
        :key="item.title"
        :title="item.title"
        :value="item.value"
        :subtitle="item.subtitle"
      />
    </section>

    <section class="grid-main">
      <article class="panel">
        <div class="panel-header">
          <h3>Current Monitoring Findings</h3>
          <span class="panel-tag">Testing Summary</span>
        </div>

        <ul class="content-list">
          <li v-for="item in currentFindings" :key="item">
            {{ item }}
          </li>
        </ul>
      </article>

      <article class="side-column">
        <div class="panel compact">
          <div class="panel-header">
            <h3>Available Outputs</h3>
            <span class="panel-tag">Dashboard Layer</span>
          </div>

          <div class="output-list">
            <div class="output-item" v-for="item in outputs" :key="item.label">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
          </div>
        </div>

        <div class="panel compact">
          <div class="panel-header">
            <h3>Current Limitations</h3>
            <span class="panel-tag">Current State</span>
          </div>

          <ul class="content-list">
            <li v-for="item in limitations" :key="item">
              {{ item }}
            </li>
          </ul>
        </div>
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
  grid-template-columns: 1.45fr 1fr;
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

.content-list {
  margin: 0;
  padding-left: 20px;
  color: #334155;
  line-height: 1.85;
}

.output-list {
  display: grid;
  gap: 12px;
}

.output-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  background: #f8fafc;
  padding: 14px 16px;
  border-radius: 14px;
}

.output-item span {
  color: #475569;
}

.output-item strong {
  color: #0f172a;
  font-size: 16px;
  text-align: right;
}

@media (max-width: 1200px) {
  .metrics-grid,
  .grid-main {
    grid-template-columns: 1fr;
  }
}
</style>
