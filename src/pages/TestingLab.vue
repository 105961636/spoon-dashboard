<script setup>
import { computed } from "vue"
import MetricCard from "../components/MetricCard.vue"
import { useGyroStream } from "../composables/useGyroStream"

const stream = useGyroStream()

const {
  mode,
  mockScenario,
  availableScenarios,
  connectionState,
  packetCount,
  alertLevel,
  currentScenarioLabel,
  validPacketCount,
  invalidPacketCount,
  reconnectCount,
  estimatedPacketRateHz,
  avgPacketIntervalMs,
  lastPacketAgeMs,
  streamHealthStatus,
  jsonValidationStatus,
  realTimeUpdateStatus,
  derivedMetricsStatus,
  alertEngineStatus,
  testResults,
  baselineMagnitude,
  driftAmount,
  driftStatus,
  averageMagnitude,
  maxMagnitude,
  sessionDurationText,
  totalAlertsTriggered,
  deteriorationTrend,
  dominantAxis,
  motionScore,
  stabilityIndex,
  peakToPeakText,
  savedSnapshot,
  snapshotComparison,
  captureSnapshot,
  clearSnapshot,
  setMockScenario
} = stream

const selectedScenario = computed({
  get: () => mockScenario.value,
  set: (value) => setMockScenario(value)
})

const formatMs = (value) => {
  return value ? `${value.toFixed(0)} ms` : "-"
}

const formatHz = (value) => {
  return value ? `${value.toFixed(2)} Hz` : "-"
}

const statusClass = (status) => {
  if (status === "PASS") return "pass"
  if (status === "FAIL") return "fail"
  return "warn"
}
</script>

<template>
  <section class="page">
    <div class="page-head">
      <div>
        <h2>Testing Lab</h2>
        <p>
          Validation, scenario-based testing, session analytics, and snapshot comparison
          for the dashboard.
        </p>
      </div>
    </div>

    <section class="metrics-grid">
      <MetricCard title="Connection" :value="connectionState" subtitle="Current stream state" />
      <MetricCard title="Packet Count" :value="packetCount" subtitle="Packets received so far" />
      <MetricCard title="Alert Level" :value="alertLevel" subtitle="Current abnormal motion level" />
      <MetricCard title="Scenario" :value="currentScenarioLabel" subtitle="Current mock test scenario" />
    </section>

    <section class="module-grid">
      <article class="panel stretch-panel">
        <div class="panel-header">
          <h3>Scenario Lab</h3>
          <span class="panel-tag">Demo Control</span>
        </div>

        <p class="panel-text">
          Use mock scenarios to trigger predictable dashboard behaviour for testing and presentation.
        </p>

        <select v-if="mode === 'mock'" v-model="selectedScenario" class="scenario-select">
          <option v-for="item in availableScenarios" :key="item.key" :value="item.key">
            {{ item.label }}
          </option>
        </select>

        <div class="scenario-grid">
          <button
            v-for="item in availableScenarios"
            :key="item.key"
            class="scenario-chip"
            :class="{ active: selectedScenario === item.key }"
            @click="setMockScenario(item.key)"
          >
            {{ item.label }}
          </button>
        </div>

        <div class="value-list top-gap">
          <div class="value-item"><span>Current Scenario</span><strong>{{ currentScenarioLabel }}</strong></div>
          <div class="value-item"><span>Mode</span><strong>{{ mode === "mock" ? "Mock" : "ESP32" }}</strong></div>
        </div>
      </article>

      <article class="panel stretch-panel">
        <div class="panel-header">
          <h3>Snapshot Compare</h3>
          <span class="panel-tag">Before / After</span>
        </div>

        <p class="panel-text">
          Capture a reference state, then compare current metrics against that snapshot.
        </p>

        <div class="button-row">
          <button class="primary" @click="captureSnapshot">Capture Snapshot</button>
          <button class="ghost" @click="clearSnapshot">Clear Snapshot</button>
        </div>

        <div class="snapshot-meta-grid top-gap">
          <div class="mini-item">
            <span>Captured At</span>
            <strong>{{ savedSnapshot ? savedSnapshot.capturedAt : "—" }}</strong>
          </div>
          <div class="mini-item">
            <span>Saved Alert Level</span>
            <strong>{{ savedSnapshot ? savedSnapshot.alertLevel : "—" }}</strong>
          </div>
        </div>

        <div class="compare-grid top-gap">
          <div class="mini-item">
            <span>Motion Δ</span>
            <strong>{{ snapshotComparison ? `${snapshotComparison.motionDelta > 0 ? "+" : ""}${snapshotComparison.motionDelta}` : "—" }}</strong>
          </div>
          <div class="mini-item">
            <span>Stability Δ</span>
            <strong>{{ snapshotComparison ? `${snapshotComparison.stabilityDelta > 0 ? "+" : ""}${snapshotComparison.stabilityDelta}` : "—" }}</strong>
          </div>
          <div class="mini-item">
            <span>Magnitude Δ</span>
            <strong>{{ snapshotComparison ? `${snapshotComparison.magnitudeDelta > 0 ? "+" : ""}${snapshotComparison.magnitudeDelta}` : "—" }}</strong>
          </div>
          <div class="mini-item">
            <span>Peak Δ</span>
            <strong>{{ snapshotComparison ? `${snapshotComparison.peakDelta > 0 ? "+" : ""}${snapshotComparison.peakDelta}` : "—" }}</strong>
          </div>
          <div class="mini-item wide">
            <span>Dominant Axis Change</span>
            <strong>
              {{
                snapshotComparison
                  ? (
                      snapshotComparison.dominantAxisChanged
                        ? `${snapshotComparison.previousDominantAxis} → ${dominantAxis}`
                        : `No change (${dominantAxis})`
                    )
                  : "Capture a snapshot first"
              }}
            </strong>
          </div>
        </div>
      </article>
    </section>

    <section class="module-grid">
      <article class="panel stretch-panel">
        <div class="panel-header">
          <h3>Stream Validation</h3>
          <span class="panel-tag">System Test</span>
        </div>

        <div class="mini-grid">
          <div class="mini-item">
            <span>Stream Health</span>
            <strong :class="statusClass(streamHealthStatus)">{{ streamHealthStatus }}</strong>
          </div>
          <div class="mini-item">
            <span>JSON Validation</span>
            <strong :class="statusClass(jsonValidationStatus)">{{ jsonValidationStatus }}</strong>
          </div>
          <div class="mini-item">
            <span>Live Update</span>
            <strong :class="statusClass(realTimeUpdateStatus)">{{ realTimeUpdateStatus }}</strong>
          </div>
          <div class="mini-item">
            <span>Derived Metrics</span>
            <strong :class="statusClass(derivedMetricsStatus)">{{ derivedMetricsStatus }}</strong>
          </div>
          <div class="mini-item">
            <span>Alert Engine</span>
            <strong :class="statusClass(alertEngineStatus)">{{ alertEngineStatus }}</strong>
          </div>
          <div class="mini-item">
            <span>Reconnect Count</span>
            <strong>{{ reconnectCount }}</strong>
          </div>
        </div>

        <div class="value-list top-gap">
          <div class="value-item"><span>Estimated Packet Rate</span><strong>{{ formatHz(estimatedPacketRateHz) }}</strong></div>
          <div class="value-item"><span>Average Packet Interval</span><strong>{{ formatMs(avgPacketIntervalMs) }}</strong></div>
          <div class="value-item"><span>Last Packet Age</span><strong>{{ formatMs(lastPacketAgeMs) }}</strong></div>
          <div class="value-item"><span>Valid Packets</span><strong>{{ validPacketCount }}</strong></div>
          <div class="value-item"><span>Invalid Packets</span><strong>{{ invalidPacketCount }}</strong></div>
        </div>
      </article>

      <article class="panel stretch-panel">
        <div class="panel-header">
          <h3>Test Result Panel</h3>
          <span class="panel-tag">PASS / WARN / FAIL</span>
        </div>

        <div class="test-list">
          <div
            v-for="test in testResults"
            :key="test.title"
            class="test-card"
            :class="statusClass(test.status)"
          >
            <div class="test-top">
              <strong>{{ test.title }}</strong>
              <span class="test-pill" :class="statusClass(test.status)">{{ test.status }}</span>
            </div>
            <p>{{ test.detail }}</p>
          </div>
        </div>
      </article>
    </section>

    <section class="module-grid">
      <article class="panel stretch-panel">
        <div class="panel-header">
          <h3>Motion Analytics</h3>
          <span class="panel-tag">Baseline / Drift</span>
        </div>

        <div class="mini-grid">
          <div class="mini-item">
            <span>Baseline Magnitude</span>
            <strong>{{ baselineMagnitude.toFixed(2) }}</strong>
          </div>
          <div class="mini-item">
            <span>Trend</span>
            <strong>{{ deteriorationTrend }}</strong>
          </div>
          <div class="mini-item">
            <span>Drift Amount</span>
            <strong>{{ driftAmount > 0 ? "+" : "" }}{{ driftAmount.toFixed(2) }}</strong>
          </div>
          <div class="mini-item">
            <span>Drift Status</span>
            <strong>{{ driftStatus }}</strong>
          </div>
          <div class="mini-item">
            <span>Dominant Axis</span>
            <strong>{{ dominantAxis }}</strong>
          </div>
          <div class="mini-item">
            <span>Motion Score</span>
            <strong>{{ motionScore }}/100</strong>
          </div>
        </div>
      </article>

      <article class="panel stretch-panel">
        <div class="panel-header">
          <h3>Session Statistics</h3>
          <span class="panel-tag">Runtime</span>
        </div>

        <div class="value-list">
          <div class="value-item"><span>Session Duration</span><strong>{{ sessionDurationText }}</strong></div>
          <div class="value-item"><span>Average Magnitude</span><strong>{{ averageMagnitude.toFixed(2) }}</strong></div>
          <div class="value-item"><span>Max Magnitude</span><strong>{{ maxMagnitude.toFixed(2) }}</strong></div>
          <div class="value-item"><span>Peak-to-Peak Motion</span><strong>{{ peakToPeakText }}</strong></div>
          <div class="value-item"><span>Total Alerts Triggered</span><strong>{{ totalAlertsTriggered }}</strong></div>
          <div class="value-item"><span>Stability Index</span><strong>{{ stabilityIndex }}/100</strong></div>
        </div>
      </article>
    </section>
  </section>
</template>

<style scoped>
.page {
  display: grid;
  gap: 18px;
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

.panel-text {
  margin: 0;
  color: #475569;
  line-height: 1.55;
  font-size: 14px;
}

.top-gap {
  margin-top: 12px;
}

.scenario-select {
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 9px 13px;
  background: white;
  font-weight: 600;
  color: #0f172a;
}

button {
  border: none;
  border-radius: 12px;
  padding: 10px 16px;
  font-weight: 700;
  cursor: pointer;
}

.primary {
  background: #1d4ed8;
  color: white;
}

.ghost {
  background: white;
  color: #1d4ed8;
  box-shadow: inset 0 0 0 1px #bfdbfe;
}

.button-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.scenario-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 12px;
}

.scenario-chip {
  background: white;
  color: #1d4ed8;
  box-shadow: inset 0 0 0 1px #bfdbfe;
  padding: 9px 12px;
}

.scenario-chip.active {
  background: #dbeafe;
  color: #1d4ed8;
  box-shadow: inset 0 0 0 1px #93c5fd;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.module-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
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

.stretch-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
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

.mini-grid,
.snapshot-meta-grid,
.compare-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.compare-grid .wide {
  grid-column: 1 / -1;
}

.mini-item {
  background: #f8fafc;
  border-radius: 14px;
  padding: 12px 14px;
  min-height: 78px;
  display: flex;
  flex-direction: column;
  justify-content: center;
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

.mini-item strong.pass,
.test-pill.pass {
  background: #dcfce7;
  color: #166534;
}

.mini-item strong.warn,
.test-pill.warn {
  background: #ffedd5;
  color: #c2410c;
}

.mini-item strong.fail,
.test-pill.fail {
  background: #fee2e2;
  color: #b91c1c;
}

.mini-item strong.pass,
.mini-item strong.warn,
.mini-item strong.fail {
  align-self: flex-start;
  padding: 4px 8px;
  border-radius: 999px;
}

.test-list {
  display: grid;
  gap: 10px;
  flex: 1;
}

.test-card {
  border-radius: 14px;
  padding: 12px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  min-height: 88px;
}

.test-card.pass {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.test-card.warn {
  background: #fff7ed;
  border-color: #fdba74;
}

.test-card.fail {
  background: #fef2f2;
  border-color: #fca5a5;
}

.test-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.test-card strong {
  color: #0f172a;
}

.test-card p {
  margin: 0;
  color: #334155;
  line-height: 1.5;
  font-size: 14px;
}

.test-pill {
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 700;
}

.value-list {
  display: grid;
  gap: 8px;
}

.value-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  background: #f8fafc;
  padding: 12px 14px;
  border-radius: 14px;
}

.value-item span {
  color: #475569;
  font-size: 14px;
}

.value-item strong {
  color: #0f172a;
  font-size: 15px;
  text-align: right;
}

@media (max-width: 1200px) {
  .metrics-grid,
  .module-grid,
  .scenario-grid,
  .mini-grid,
  .snapshot-meta-grid,
  .compare-grid {
    grid-template-columns: 1fr;
  }

  .compare-grid .wide {
    grid-column: auto;
  }

  .stretch-panel {
    height: fit-content;
  }
}
</style>
