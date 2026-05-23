<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue"
import Chart from "chart.js/auto"

const props = defineProps({
  chartData: {
    type: Array,
    required: true
  },
  height: {
    type: Number,
    default: 340
  },
  titleY: {
    type: String,
    default: "Motion Level"
  }
})

const canvasRef = ref(null)
let chartInstance = null

const buildChart = () => {
  if (!canvasRef.value) return

  chartInstance = new Chart(canvasRef.value, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Raw Tremor",
          data: [],
          borderColor: "#ef4444",
          backgroundColor: "rgba(239, 68, 68, 0.14)",
          borderWidth: 3,
          pointRadius: 2,
          tension: 0.35
        },
        {
          label: "Stabilised Motion",
          data: [],
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.14)",
          borderWidth: 3,
          pointRadius: 2,
          tension: 0.35
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: "index"
      },
      plugins: {
        legend: {
          position: "top"
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Time"
          },
          grid: {
            color: "rgba(148, 163, 184, 0.18)"
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: props.titleY
          },
          grid: {
            color: "rgba(148, 163, 184, 0.18)"
          }
        }
      }
    }
  })

  updateChart()
}

const updateChart = () => {
  if (!chartInstance) return

  chartInstance.data.labels = props.chartData.map((item) => `${item.time}s`)
  chartInstance.data.datasets[0].data = props.chartData.map((item) => item.raw)
  chartInstance.data.datasets[1].data = props.chartData.map((item) => item.stabilised)
  chartInstance.update()
}

onMounted(buildChart)

watch(
  () => props.chartData,
  () => {
    updateChart()
  },
  { deep: true }
)

onBeforeUnmount(() => {
  if (chartInstance) chartInstance.destroy()
})
</script>

<template>
  <div class="chart-container" :style="{ height: `${height}px` }">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<style scoped>
.chart-container {
  width: 100%;
}
</style>