<script setup>
import { computed } from "vue"
import MetricCard from "../components/MetricCard.vue"
import GyroChart from "../components/GyroChart.vue"
import { useGyroStream } from "../composables/useGyroStream"

const stream = useGyroStream()

const {
  mode,
  esp32Ip,
  connectionState,
  packetCount,
  lastUpdate,
  packetSource,
  history,
  errorMessage,
  alertLevel,
  dominantAxis,
  motionScore,
  stabilityIndex,
  xRangeText,
  yRangeText,
  zRangeText,
  peakToPeakText,
  smoothedMagnitude,
  motionBand,
  derivedStatus,
  derivedRisk,
  finding,
  currentX,
  currentY,
  currentZ,
  currentMagnitude,
  formattedPacket,
  websocketUrl,
  startStream,
  stopStream,
  resetStream,
  changeMode
} = stream

const selectedMode = computed({
  get: () => mode.value,
  set: (value) => changeMode(value)
})
</script>

<template>
  <section class="page">
    <div class="page-head">
      <div>
        <h2>Live Data</h2>
        <p>
          Real-time monitoring of ESP32 packets with charts, current values,
          analysis status, and core alert summary.
        </p>
      </div>

      <div class="action-group">
        <select v-model="selectedMode" class="mode-select">
          <option value="mock">Mock Mode</option>
          <option value="real">ESP32 Mode</option>
        </select>

        <input
          v-if="selectedMode === 'real'"
          v-model="esp32Ip"
          class="ip-input"
          type="text"
          placeholder="ESP32 local IP, e.g. 192.168.1.45"
        />

        <button class="primary" @click="startStream">Start</button>
        <button class="secondary" @click="stopStream">Stop</button>
        <button class="ghost" @click="resetStream">Reset</button>
      </div>
    </div>

    <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

    <section class="metrics-grid">
      <MetricCard title="Connection" :value="connectionState" subtitle="Current stream state" />
      <MetricCard title="Packet Count" :value="packetCount" subtitle="Received gyro packets" />
      <MetricCard title="Last Update" :value="lastUpdate" subtitle="Latest packet timestamp" />
      <MetricCard title="Alert Level" :value="alertLevel" subtitle="Current abnormal motion status" />
    </section>

    <section class="summary-strip">
      <article class="panel compact-panel">
        <div class="panel-header">
          <h3>Current Alert Summary</h3>
          <span class="alert-level" :class="alertLevel.toLowerCase()">{{ alertLevel }}</span>
        </div>

        <div class="value-list">
          <div class="value-item"><span>Dominant Axis</span><strong>{{ dominantAxis }}</strong></div>
          <div class="value-item"><span>Motion Score</span><strong>{{ motionScore }}/100</strong></div>
          <div class="value-item"><span>Stability Index</span><strong>{{ stabilityIndex }}/100</strong></div>
          <div class="value-item"><span>Peak-to-Peak</span><strong>{{ peakToPeakText }}</strong></div>
        </div>

        <div class="finding-box">
          <strong>Current Finding</strong>
          <p>{{ finding }}</p>
        </div>
      </article>
    </section>

    <div class="section-head">
      <h3>Gyroscope Charts</h3>
      <span class="panel-tag">{{ selectedMode === "mock" ? "Mock Testing" : "ESP32 Live" }}</span>
    </div>

    <section class="paired-grid">
      <article class="panel row-tall">
        <div class="subhead">
          <span>X / Y Live Stream</span>
          <small>Separated for clearer comparison</small>
        </div>
        <GyroChart :chart-data="history" mode="xy" :height="175" />
      </article>

      <article class="panel row-tall">
        <div class="panel-header">
          <h3>Testing Indicators</h3>
          <span class="panel-tag">Derived</span>
        </div>

        <div class="value-list">
          <div class="value-item"><span>X Range</span><strong>{{ xRangeText }}</strong></div>
          <div class="value-item"><span>Y Range</span><strong>{{ yRangeText }}</strong></div>
          <div class="value-item"><span>Z Range</span><strong>{{ zRangeText }}</strong></div>
          <div class="value-item"><span>Peak-to-Peak Motion</span><strong>{{ peakToPeakText }}</strong></div>
        </div>
      </article>

      <article class="panel row-tall">
        <div class="subhead">
          <span>Z / Magnitude Stream</span>
          <small>Shown separately due to scale difference</small>
        </div>
        <GyroChart :chart-data="history" mode="zm" :height="175" />
      </article>

      <article class="panel row-tall">
        <div class="panel-header">
          <h3>Debug Panel</h3>
          <span class="panel-tag">JSON</span>
        </div>

        <div class="value-list">
          <div class="value-item">
            <span>WebSocket URL</span>
            <strong class="small-strong">{{ selectedMode === "mock" ? "Local mock stream" : websocketUrl }}</strong>
          </div>
        </div>

        <pre class="packet-box">{{ formattedPacket }}</pre>
      </article>
    </section>

    <section class="bottom-grid">
      <article class="panel bottom-tall">
        <div class="panel-header">
          <h3>Analysis Status</h3>
          <span class="panel-tag">Client-side</span>
        </div>

        <div class="value-list">
          <div class="value-item"><span>Smoothed Magnitude</span><strong>{{ smoothedMagnitude.toFixed(2) }}</strong></div>
          <div class="value-item"><span>Dominant Axis</span><strong>{{ dominantAxis }}</strong></div>
          <div class="value-item"><span>Motion Score</span><strong>{{ motionScore }}/100</strong></div>
          <div class="value-item"><span>Stability Index</span><strong>{{ stabilityIndex }}/100</strong></div>
          <div class="value-item"><span>Motion Band</span><strong>{{ motionBand }}</strong></div>
          <div class="value-item"><span>Status</span><strong>{{ derivedStatus }}</strong></div>
          <div class="value-item"><span>Risk</span><strong>{{ derivedRisk }}</strong></div>
        </div>

        <div class="finding-box">
          <strong>Key Finding</strong>
          <p>{{ finding }}</p>
        </div>
      </article>

      <article class="panel bottom-tall current-values-panel">
        <div class="panel-header">
          <h3>Current Values</h3>
          <span class="panel-tag">Live</span>
        </div>

        <div class="value-list current-values-list">
          <div class="value-item"><span>X</span><strong>{{ currentX.toFixed(2) }}</strong></div>
          <div class="value-item"><span>Y</span><strong>{{ currentY.toFixed(2) }}</strong></div>
          <div class="value-item"><span>Z</span><strong>{{ currentZ.toFixed(2) }}</strong></div>
          <div class="value-item"><span>Magnitude</span><strong>{{ currentMagnitude.toFixed(2) }}</strong></div>
          <div class="value-item"><span>Dominant Axis</span><strong>{{ dominantAxis }}</strong></div>
          <div class="value-item"><span>Alert Level</span><strong>{{ alertLevel }}</strong></div>
          <div class="value-item"><span>Packet Count</span><strong>{{ packetCount }}</strong></div>
          <div class="value-item"><span>Last Update</span><strong>{{ lastUpdate }}</strong></div>
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
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 2px;
  flex-wrap: wrap;
}

.page-head h2 {
  margin: 0 0 6px;
  font-size: 30px;
}

.page-head p {
  margin: 0;
  color: #64748b;
}

.action-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.mode-select,
.ip-input {
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 9px 13px;
  background: white;
  font-weight: 600;
  color: #0f172a;
}

.ip-input {
  min-width: 230px;
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

.secondary {
  background: #e2e8f0;
  color: #0f172a;
}

.ghost {
  background: white;
  color: #1d4ed8;
  box-shadow: inset 0 0 0 1px #bfdbfe;
}

.error-text {
  margin: -6px 0 4px;
  color: #b91c1c;
  font-size: 14px;
  font-weight: 600;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.summary-strip {
  display: block;
}

.compact-panel {
  border: 1px solid #dbeafe;
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

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.section-head h3 {
  margin: 0;
  color: #1e3a8a;
  font-size: 20px;
}

.paired-grid,
.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: stretch;
}

.panel {
  background: white;
  border-radius: 20px;
  padding: 18px;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
  height: fit-content;
}

.row-tall,
.bottom-tall {
  height: 100%;
}

.current-values-panel {
  display: flex;
  flex-direction: column;
}

.current-values-list {
  grid-template-rows: repeat(8, 1fr);
  flex: 1;
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

.subhead {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 6px;
  color: #334155;
  font-weight: 700;
}

.subhead small {
  color: #64748b;
  font-weight: 600;
  font-size: 12px;
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

.small-strong {
  font-size: 12px !important;
  word-break: break-all;
}

.finding-box {
  margin-top: 10px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 14px;
  padding: 11px 13px;
}

.finding-box strong {
  display: block;
  color: #1d4ed8;
  margin-bottom: 6px;
}

.finding-box p {
  margin: 0;
  color: #334155;
  line-height: 1.5;
  font-size: 14px;
}

.packet-box {
  margin: 10px 0 0;
  background: #0f172a;
  color: #e2e8f0;
  padding: 12px;
  border-radius: 16px;
  font-family: Consolas, monospace;
  font-size: 12px;
  line-height: 1.55;
  overflow-x: auto;
  max-height: 150px;
}

@media (max-width: 1200px) {
  .metrics-grid,
  .paired-grid,
  .bottom-grid {
    grid-template-columns: 1fr;
  }

  .ip-input {
    min-width: 100%;
  }

  .current-values-list {
    grid-template-rows: none;
  }
}
</style>







