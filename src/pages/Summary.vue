<script setup>
import { computed } from "vue"
import MetricCard from "../components/MetricCard.vue"
import { useGyroStream } from "../composables/useGyroStream"

const stream = useGyroStream()

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
    value: "5+",
    subtitle: "Magnitude, axis, score, stability, risk, alerts"
  },
  {
    title: "Connection Method",
    value: "Wi-Fi + /ws",
    subtitle: "ESP32 WebSocket monitoring path"
  }
])

const outputs = computed(() => [
  { label: "Raw Input", value: "x / y / z" },
  { label: "Calculated Magnitude", value: "Enabled" },
  { label: "Dominant Axis", value: "Enabled" },
  { label: "Peak-to-Peak Motion", value: "Enabled" },
  { label: "Motion Score", value: "0 - 100" },
  { label: "Stability Index", value: "0 - 100" },
  { label: "Trend Detection", value: "Enabled" },
  { label: "Alert Level", value: "Normal / Medium / High" }
])

const testingSnapshot = computed(() => [
  { label: "Connection", value: stream.connectionState.value },
  { label: "Packet Count", value: String(stream.packetCount.value) },
  { label: "Last Update", value: stream.lastUpdate.value },
  { label: "Dominant Axis", value: stream.dominantAxis.value },
  { label: "Motion Score", value: `${stream.motionScore.value}/100` },
  { label: "Stability Index", value: `${stream.stabilityIndex.value}/100` },
  { label: "Trend", value: stream.deteriorationTrend.value },
  { label: "Alert Level", value: stream.alertLevel.value },
  { label: "X Range", value: stream.xRangeText.value },
  { label: "Y Range", value: stream.yRangeText.value },
  { label: "Z Range", value: stream.zRangeText.value },
  { label: "Peak-to-Peak", value: stream.peakToPeakText.value }
])

const currentFindings = computed(() => [
  "Dashboard can receive and visualise real-time ESP32 packets through WebSocket.",
  "Raw x / y / z values are converted into dominant axis, motion score, stability index, and motion range.",
  "Abnormal motion warnings can be triggered from software without requiring extra hardware-side fields.",
  stream.finding.value
])

const limitations = computed(() => [
  "Current data stream is limited to x / y / z fields.",
  "Derived indicators and alerts are software-side interpretations, not medical diagnosis outputs.",
  "Higher-level corrected or stabilised output is not yet integrated."
])
</script>

<template>
  <section class="page">
    <div class="page-head">
      <div>
        <h2>Summary</h2>
        <p>
          Monitoring summary for the current dashboard capabilities, available
          outputs, and abnormal motion alert detection built from raw x / y / z.
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

    <section class="summary-grid">
      <article class="panel wider-panel">
        <div class="panel-header">
          <h3>Current Monitoring Findings</h3>
          <span class="panel-tag">Testing Summary</span>
        </div>

        <ul class="content-list">
          <li v-for="item in currentFindings" :key="item">
            {{ item }}
          </li>
        </ul>

        <div class="snapshot-grid">
          <div class="snapshot-item" v-for="item in testingSnapshot" :key="item.label">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </div>
        </div>
      </article>

      <article class="panel outputs-panel">
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
      </article>
    </section>

    <section class="full-width-row">
      <article class="panel">
        <div class="panel-header">
          <h3>Current Limitations</h3>
          <span class="panel-tag">Current State</span>
        </div>

        <ul class="content-list">
          <li v-for="item in limitations" :key="item">
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

.summary-grid {
  display: grid;
  grid-template-columns: 1.45fr 1fr;
  gap: 16px;
  align-items: stretch;
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

.outputs-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.wider-panel {
  height: 100%;
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

.content-list {
  margin: 0 0 12px;
  padding-left: 18px;
  color: #334155;
  line-height: 1.75;
}

.snapshot-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.snapshot-item,
.output-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  background: #f8fafc;
  padding: 12px 14px;
  border-radius: 14px;
}

.snapshot-item span,
.output-item span {
  color: #475569;
  font-size: 14px;
}

.snapshot-item strong,
.output-item strong {
  color: #0f172a;
  font-size: 14px;
  text-align: right;
}

.output-list {
  display: grid;
  gap: 10px;
  flex: 1;
}

@media (max-width: 1200px) {
  .metrics-grid,
  .summary-grid,
  .snapshot-grid {
    grid-template-columns: 1fr;
  }

  .outputs-panel,
  .wider-panel {
    height: fit-content;
  }
}
</style>

