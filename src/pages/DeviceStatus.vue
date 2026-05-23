<script setup>
import { computed, ref, watch } from "vue"
import MetricCard from "../components/MetricCard.vue"

const savedIp = localStorage.getItem("esp32-ip") || "192.168.1.45"
const esp32Ip = ref(savedIp)

watch(esp32Ip, (value) => {
  localStorage.setItem("esp32-ip", value.trim())
})

const httpUrl = computed(() => {
  const ip = esp32Ip.value.trim()
  return ip ? `http://${ip}` : "-"
})

const wsUrl = computed(() => {
  const ip = esp32Ip.value.trim()
  return ip ? `ws://${ip}/ws` : "-"
})

const deviceMetrics = computed(() => [
  {
    title: "Primary Device",
    value: "ESP32",
    subtitle: "Current target hardware platform"
  },
  {
    title: "Transport",
    value: "Wi-Fi",
    subtitle: "Board acts as network stream source"
  },
  {
    title: "Endpoint",
    value: "/ws",
    subtitle: "WebSocket stream path"
  },
  {
    title: "Packet Format",
    value: "x / y / z",
    subtitle: "Current JSON fields from hardware"
  }
])

const checklist = [
  "ESP32 is connected to the same Wi-Fi as the laptop.",
  "Serial monitor shows a valid local IP address.",
  "The browser can open the device test page successfully.",
  "Live Data page is switched to ESP32 Mode.",
  "Incoming packets contain numeric x, y, z values."
]

const notes = [
  "The current hardware stream uses WebSocket over Wi-Fi.",
  "The dashboard is already prepared to switch from mock mode to real mode once the IP is available.",
  "Higher-level fields can be added later after control-layer outputs are defined."
]
</script>

<template>
  <section class="page">
    <div class="page-head">
      <div>
        <h2>Device Status</h2>
        <p>
          Current ESP32 connection details, target addresses, and hardware-side
          validation notes for real dashboard integration.
        </p>
      </div>
    </div>

    <section class="metrics-grid">
      <MetricCard
        v-for="item in deviceMetrics"
        :key="item.title"
        :title="item.title"
        :value="item.value"
        :subtitle="item.subtitle"
      />
    </section>

    <section class="grid-two">
      <article class="panel">
        <div class="panel-header">
          <h3>Connection Details</h3>
          <span class="panel-tag">ESP32 Target</span>
        </div>

        <div class="field-stack">
          <label class="field-label" for="esp32-ip">ESP32 Local IP</label>
          <input
            id="esp32-ip"
            v-model="esp32Ip"
            class="ip-input"
            type="text"
            placeholder="e.g. 192.168.1.45"
          />
        </div>

        <div class="status-list">
          <div class="status-item">
            <span>HTTP URL</span>
            <strong class="break-text">{{ httpUrl }}</strong>
          </div>
          <div class="status-item">
            <span>WebSocket URL</span>
            <strong class="break-text">{{ wsUrl }}</strong>
          </div>
          <div class="status-item">
            <span>Expected Endpoint</span>
            <strong>/ws</strong>
          </div>
          <div class="status-item">
            <span>Expected Port</span>
            <strong>80</strong>
          </div>
        </div>
      </article>

      <article class="panel">
        <div class="panel-header">
          <h3>Packet Example</h3>
          <span class="panel-tag">Current JSON</span>
        </div>

        <pre class="packet-box">{
  "x": 12.3,
  "y": -4.5,
  "z": 7.8
}</pre>
      </article>
    </section>

    <section class="grid-two">
      <article class="panel">
        <div class="panel-header">
          <h3>Validation Checklist</h3>
          <span class="panel-tag">Before Real Mode</span>
        </div>

        <ol class="content-list">
          <li v-for="item in checklist" :key="item">
            {{ item }}
          </li>
        </ol>
      </article>

      <article class="panel">
        <div class="panel-header">
          <h3>System Notes</h3>
          <span class="panel-tag">Current State</span>
        </div>

        <ul class="content-list">
          <li v-for="item in notes" :key="item">
            {{ item }}
          </li>
        </ul>
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

.field-stack {
  margin-bottom: 18px;
}

.field-label {
  display: block;
  margin-bottom: 8px;
  color: #475569;
  font-weight: 600;
}

.ip-input {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 12px 14px;
  background: white;
  color: #0f172a;
  font-weight: 600;
}

.status-list {
  display: grid;
  gap: 14px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
  background: #f8fafc;
  padding: 16px 18px;
  border-radius: 14px;
}

.status-item span {
  color: #475569;
}

.status-item strong {
  color: #0f172a;
  text-align: right;
}

.break-text {
  word-break: break-all;
}

.content-list {
  margin: 0;
  padding-left: 20px;
  color: #334155;
  line-height: 1.9;
}

.packet-box {
  margin: 0;
  background: #0f172a;
  color: #e2e8f0;
  padding: 18px;
  border-radius: 16px;
  font-family: Consolas, monospace;
  font-size: 14px;
  line-height: 1.7;
  overflow-x: auto;
}

@media (max-width: 1100px) {
  .metrics-grid,
  .grid-two {
    grid-template-columns: 1fr;
  }
}
</style>
