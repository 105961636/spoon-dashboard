<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue"
import Chart from "chart.js/auto"

const props = defineProps({
  labels: {
    type: Array,
    required: true
  },
  values: {
    type: Array,
    required: true
  },
  height: {
    type: Number,
    default: 320
  },
  chartLabel: {
    type: String,
    default: "Comparison"
  }
})

const canvasRef = ref(null)
let chartInstance = null

const renderChart = () => {
  if (!canvasRef.value) return

  if (chartInstance) {
    chartInstance.destroy()
  }

  chartInstance = new Chart(canvasRef.value, {
    type: "bar",
    data: {
      labels: props.labels,
      datasets: [
        {
          label: props.chartLabel,
          data: props.values,
          backgroundColor: ["#ef4444", "#2563eb"],
          borderRadius: 10,
          maxBarThickness: 70
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Average Tremor (Hz)"
          },
          grid: {
            color: "rgba(148, 163, 184, 0.18)"
          }
        }
      }
    }
  })
}

onMounted(renderChart)

watch(
  () => [props.labels, props.values],
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