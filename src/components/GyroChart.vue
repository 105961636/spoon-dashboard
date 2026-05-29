<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import Chart from "chart.js/auto"

const props = defineProps({
  chartData: {
    type: Array,
    required: true
  },
  height: {
    type: Number,
    default: 320
  },
  mode: {
    type: String,
    default: "xy" // xy | zm
  }
})

const canvasRef = ref(null)
let chartInstance = null

const labels = computed(() => props.chartData.map((_, index) => index + 1))

const datasets = computed(() => {
  if (props.mode === "zm") {
    return [
      {
        label: "Z Axis",
        data: props.chartData.map((item) => item.z),
        borderColor: "#16a34a",
        tension: 0.3,
        pointRadius: 1.5
      },
      {
        label: "Magnitude",
        data: props.chartData.map((item) => item.magnitude),
        borderColor: "#7c3aed",
        tension: 0.3,
        pointRadius: 1.5,
        borderDash: [6, 4]
      }
    ]
  }

  return [
    {
      label: "X Axis",
      data: props.chartData.map((item) => item.x),
      borderColor: "#ef4444",
      tension: 0.3,
      pointRadius: 1.5
    },
    {
      label: "Y Axis",
      data: props.chartData.map((item) => item.y),
      borderColor: "#2563eb",
      tension: 0.3,
      pointRadius: 1.5
    }
  ]
})

const yAxisTitle = computed(() => {
  return props.mode === "zm" ? "Z / Magnitude Value" : "X / Y Value"
})

const renderChart = () => {
  if (!canvasRef.value) return

  if (chartInstance) {
    chartInstance.destroy()
  }

  chartInstance = new Chart(canvasRef.value, {
    type: "line",
    data: {
      labels: labels.value,
      datasets: datasets.value
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: {
          position: "top"
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Packet Index"
          }
        },
        y: {
          title: {
            display: true,
            text: yAxisTitle.value
          }
        }
      }
    }
  })
}

onMounted(renderChart)

watch(
  () => [props.chartData, props.mode],
  () => {
    renderChart()
  },
  { deep: true }
)

onBeforeUnmount(() => {
  if (chartInstance) chartInstance.destroy()
})
</script>

<template>
  <div class="chart-box" :style="{ height: `${height}px` }">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<style scoped>
.chart-box {
  width: 100%;
}
</style>
