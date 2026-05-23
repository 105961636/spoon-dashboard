<script setup>
import { onMounted } from "vue"
import MetricCard from "../components/MetricCard.vue"
import GyroChart from "../components/GyroChart.vue"
import { useEsp32Stream } from "../composables/useEsp32Stream"

const {
  isConnected,
  connectionLabel,
  packetCount,
  lastUpdate,
  currentX,
  currentY,
  currentZ,
  history,
  connect,
  disconnect
} = useEsp32Stream()

onMounted(() => {
  connect()
})
</script>

<template>
  <section class="page">
    <div class="page-head">
      <div>
        <h2>Live Data</h2>
        <p>Real-time gyroscope stream from ESP32 via WebSocket.</p>
      </div>

      <div class="action-group">
        <button class="primary" @click="connect" :disabled="isConnected">Connect</button>
        <button class="secondary" @click="disconnect" :disabled="!isConnected">Disconnect</button>
      </div>
    </div>

    <section class="metrics-grid">
      <MetricCard
        title="Connection"
        :value="connectionLabel"
        subtitle="ESP32 WebSocket status"
      />
      <MetricCard
        title="Packet Count"
        :value="packetCount"
        subtitle="Received JSON packets"
      />
      <MetricCard
        title="Last Update"
        :value="lastUpdate"
        subtitle="Latest packet timestamp"
      />
      <MetricCard
        title="WebSocket Path"
        value="/ws"
        subtitle="ESP32 streaming endpoint"
      />
    </section>

    <section class="grid-main">
      <article class="panel">
        <div class="panel-header">
          <h3>Gyroscope Live Stream</h3>
          <span class="panel-tag">{{ connectionLabel }}</span>
        </div>

        <GyroChart :chart-data="history" :height="420" />
      </article>

      <article class="side-column">
        <div class="panel compact">
          <div class="panel-header">
            <h3>Current Values</h3>
            <span class="panel-tag">x / y / z</span>
          </div>

          <div class="value-list">
            <div class="value-item">
              <span>X</span>
              <strong>{{ currentX.toFixed(2) }}</strong>
            </div>
            <div class="value-item">
              <span>Y</span>
              <strong>{{ currentY.toFixed(2) }}</strong>
            </div>
            <div class="value-item">
              <span>Z</span>
              <strong>{{ currentZ.toFixed(2) }}</strong>
            </div>
          </div>
        </div>

        <div class="panel compact">
          <div class="panel-header">
            <h3>Stream Notes</h3>
            <span class="panel-tag">Phase 1</span>
          </div>

          <ul class="note-list">
            <li>Current ESP32 stream sends gyroscope x, y, z values.</li>
            <li>This page is used to verify real-time Wi-Fi and WebSocket integration.</li>
            <li>Higher-level metrics can be added after the real stream is stable.</li>
          </ul>
        </div>
      </article>
    </section>
  </section>
</template>

<style scoped>
.page-head {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.page-head h2 {
  margin: 0 0 8px;
  font-size: 30px;
}

.page-head p {
  margin: 0;
  color: #64748b;
}

.action-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

button {
  border: none;
  border-radius: 12px;
  padding: 11px 18px;
  font-weight: 700;
  cursor: pointer;
}

button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.primary {
  background: #1d4ed8;
  color: white;
}

.secondary {
  background: #e2e8f0;
  color: #0f172a;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 28px;
}

.grid-main {
  display: grid;
  grid-template-columns: 1.7fr 1fr;
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

.value-list {
  display: grid;
  gap: 14px;
}

.value-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  padding: 16px 18px;
  border-radius: 14px;
}

.value-item span {
  color: #475569;
}

.value-item strong {
  color: #0f172a;
  font-size: 20px;
}

.note-list {
  margin: 0;
  padding-left: 18px;
  color: #334155;
  line-height: 1.8;
}

@media (max-width: 1200px) {
  .metrics-grid,
  .grid-main {
    grid-template-columns: 1fr;
  }
}
</style>