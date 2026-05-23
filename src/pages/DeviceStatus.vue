<script setup>
import MetricCard from "../components/MetricCard.vue"
import { useDeviceTelemetry } from "../composables/useDeviceTelemetry"

const {
  usbConnected,
  usbPort,
  packetCount,
  samplingMode,
  samplingRate,
  bufferStatus,
  firmwareVersion,
  sensorStatus,
  motorStatus,
  deviceHealth,
  latency,
  uptimeDisplay,
  connectionLabel,
  toggleConnection,
  resetTelemetry
} = useDeviceTelemetry()
</script>

<template>
  <section class="page">
    <div class="page-head">
      <div>
        <h2>Device Status</h2>
        <p>
          Operational view of USB connection, packet flow, subsystem readiness,
          and runtime health.
        </p>
      </div>

      <div class="action-group">
        <button class="primary" @click="toggleConnection">
          {{ usbConnected ? "Disconnect USB" : "Connect USB" }}
        </button>
        <button class="secondary" @click="resetTelemetry">Reset Counters</button>
      </div>
    </div>

    <section class="metrics-grid">
      <MetricCard
        title="Connection"
        :value="connectionLabel"
        subtitle="Current hardware link state"
      />
      <MetricCard
        title="USB Port"
        :value="usbPort"
        subtitle="Configured input port"
      />
      <MetricCard
        title="Packet Count"
        :value="packetCount"
        subtitle="Packets received in this session"
      />
      <MetricCard
        title="Latency"
        :value="`${latency} ms`"
        subtitle="Estimated device response delay"
      />
    </section>

    <section class="grid-two">
      <article class="panel">
        <div class="panel-header">
          <h3>Connection and Transfer</h3>
          <span class="panel-tag">USB Telemetry</span>
        </div>

        <div class="status-list">
          <div class="status-item">
            <span>Sampling Mode</span>
            <strong>{{ samplingMode }}</strong>
          </div>
          <div class="status-item">
            <span>Sampling Rate</span>
            <strong>{{ samplingRate }}</strong>
          </div>
          <div class="status-item">
            <span>Buffer Status</span>
            <strong>{{ bufferStatus }}</strong>
          </div>
          <div class="status-item">
            <span>Uptime</span>
            <strong>{{ uptimeDisplay }}</strong>
          </div>
        </div>
      </article>

      <article class="panel">
        <div class="panel-header">
          <h3>Subsystem Health</h3>
          <span class="panel-tag">Hardware Readiness</span>
        </div>

        <div class="status-list">
          <div class="status-item">
            <span>Sensor Status</span>
            <strong>{{ sensorStatus }}</strong>
          </div>
          <div class="status-item">
            <span>Motor Status</span>
            <strong>{{ motorStatus }}</strong>
          </div>
          <div class="status-item">
            <span>Firmware Version</span>
            <strong>{{ firmwareVersion }}</strong>
          </div>
          <div class="status-item">
            <span>Device Health</span>
            <strong>{{ deviceHealth }}</strong>
          </div>
        </div>
      </article>
    </section>

    <section class="panel">
      <div class="panel-header">
        <h3>System Notes</h3>
        <span class="panel-tag">Operational Notes</span>
      </div>

      <ul class="note-list">
        <li>USB is prepared as the primary transfer path for future real sensor input.</li>
        <li>Packet count and latency are currently simulated for interface testing.</li>
        <li>Sensor and motor subsystems are marked ready for stabilisation demos.</li>
        <li>Later, this page can read actual port and packet information from the USB data layer.</li>
      </ul>
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

.grid-two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 28px;
}

.panel {
  background: white;
  border-radius: 22px;
  padding: 24px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
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

.status-list {
  display: grid;
  gap: 14px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  padding: 16px 18px;
  border-radius: 14px;
}

.status-item span {
  color: #475569;
}

.status-item strong {
  color: #0f172a;
}

.note-list {
  margin: 0;
  padding-left: 18px;
  color: #334155;
  line-height: 1.9;
}

@media (max-width: 1100px) {
  .metrics-grid,
  .grid-two {
    grid-template-columns: 1fr;
  }
}
</style>