<script setup>
import { computed } from "vue"
import { RouterLink } from "vue-router"
import MetricCard from "../components/MetricCard.vue"
import MotionChart from "../components/MotionChart.vue"
import { baseMotionData } from "../data/motionData"
import { deviceStatusData } from "../data/deviceData"
import { overviewData } from "../data/overviewData"
import { summaryData } from "../data/summaryData"

const improvementDelta = computed(() => {
  const before = Number.parseFloat(summaryData.averageBefore)
  const after = Number.parseFloat(summaryData.averageAfter)
  return `${(before - after).toFixed(1)} Hz`
})

const liveStatus = computed(() => {
  return overviewData.connectionStatus === "Connected" ? "Ready for monitoring" : "Offline"
})
</script>

<template>
  <section class="page">
    <section class="hero-panel">
      <div class="hero-copy">
        <span class="hero-badge">Smart Assistive Feeding System</span>
        <h2>Home</h2>
        <p>
          A unified dashboard for monitoring tremor behaviour, reviewing
          stabilisation performance, and evaluating session outcomes for the
          smart spoon system.
        </p>

        <div class="hero-actions">
          <RouterLink to="/live-data" class="primary-link">Open Live Data</RouterLink>
          <RouterLink to="/summary" class="secondary-link">View Session Summary</RouterLink>
        </div>
      </div>

      <div class="hero-status">
        <div class="status-card">
          <span class="status-label">System Readiness</span>
          <strong>{{ liveStatus }}</strong>
        </div>
        <div class="status-card">
          <span class="status-label">Device Health</span>
          <strong>{{ deviceStatusData.deviceHealth }}</strong>
        </div>
        <div class="status-card">
          <span class="status-label">Stability Improvement</span>
          <strong>{{ summaryData.stabilityImprovement }}%</strong>
        </div>
      </div>
    </section>

    <section class="metrics-grid">
      <MetricCard
        title="Tremor Level"
        :value="overviewData.tremorLevel"
        subtitle="Current motion classification"
      />
      <MetricCard
        title="Stability Score"
        :value="`${overviewData.stabilityScore}%`"
        subtitle="Estimated control improvement"
      />
      <MetricCard
        title="Connection Status"
        :value="overviewData.connectionStatus"
        subtitle="Dashboard and device link"
      />
      <MetricCard
        title="Average Tremor"
        :value="overviewData.averageTremor"
        subtitle="Current session overview"
      />
    </section>

    <section class="grid-main">
      <article class="panel">
        <div class="panel-header">
          <h3>Motion Overview</h3>
          <span class="panel-tag">System Performance</span>
        </div>

        <MotionChart :chart-data="baseMotionData" :height="360" />

        <div class="comparison-strip">
          <div class="comparison-item">
            <span>Reduction from Before to After</span>
            <strong>{{ improvementDelta }}</strong>
          </div>
          <div class="comparison-item">
            <span>Spill Risk</span>
            <strong>{{ overviewData.spillRisk }}</strong>
          </div>
          <div class="comparison-item">
            <span>Meal Duration</span>
            <strong>{{ overviewData.mealDuration }}</strong>
          </div>
        </div>
      </article>

      <article class="side-column">
        <div class="panel compact">
          <div class="panel-header">
            <h3>System Modules</h3>
            <span class="panel-tag">Overview</span>
          </div>

          <div class="module-list">
            <div class="module-item">
              <div>
                <strong>Physical Support</strong>
                <p>Weighted handle, ergonomic grip, and hand support.</p>
              </div>
            </div>

            <div class="module-item">
              <div>
                <strong>Active Stabilisation</strong>
                <p>Real-time response to tremor-related movement.</p>
              </div>
            </div>

            <div class="module-item">
              <div>
                <strong>Digital Monitoring</strong>
                <p>Web dashboard, live analysis, and session review.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="panel compact">
          <div class="panel-header">
            <h3>Quick Navigation</h3>
            <span class="panel-tag">Workflow</span>
          </div>

          <div class="quick-links">
            <RouterLink to="/live-data" class="quick-link-card">
              <span>Live Data</span>
              <strong>Monitor tremor and stream updates</strong>
            </RouterLink>

            <RouterLink to="/summary" class="quick-link-card">
              <span>Summary</span>
              <strong>Review session outcome and improvement</strong>
            </RouterLink>

            <RouterLink to="/device-status" class="quick-link-card">
              <span>Device Status</span>
              <strong>Check USB, telemetry, and subsystem health</strong>
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

.comparison-strip {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-top: 20px;
}

.comparison-item {
  background: #f8fafc;
  border-radius: 14px;
  padding: 16px 18px;
}

.comparison-item span {
  display: block;
  color: #475569;
  font-size: 14px;
  margin-bottom: 8px;
}

.comparison-item strong {
  color: #0f172a;
  font-size: 20px;
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
  .grid-main,
  .comparison-strip {
    grid-template-columns: 1fr;
  }
}
</style>