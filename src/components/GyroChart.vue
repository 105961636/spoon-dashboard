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
    default: 230
  },
  mode: {
    type: String,
    default: "xy"
  }
})

const canvasRef = ref(null)
let chartInstance = null

const visibleData = computed(() => {
  return props.chartData.slice(-100)
})

const labels = computed(() => visibleData.value.map((_, index) => index + 1))

const datasets = computed(() => {
  if (props.mode === "zm") {
    return [
      {
        label: "Z Axis",
        data: visibleData.value.map((item) => item.z),
        borderColor: "#16a34a",
        tension: 0.25,
        pointRadius: 1.2,
        borderWidth: 2.5
      },
      {
        label: "Magnitude",
        data: visibleData.value.map((item) => item.magnitude),
        borderColor: "#7c3aed",
        tension: 0.25,
        pointRadius: 1.2,
        borderWidth: 2.5,
        borderDash: [6, 4]
      }
    ]
  }

  return [
    {
      label: "X Axis",
      data: visibleData.value.map((item) => item.x),
      borderColor: "#ef4444",
      tension: 0.25,
      pointRadius: 1.2,
      borderWidth: 2.5
    },
    {
      label: "Y Axis",
      data: visibleData.value.map((item) => item.y),
      borderColor: "#2563eb",
      tension: 0.25,
      pointRadius: 1.2,
      borderWidth: 2.5
    }
  ]
})

const yAxisTitle = computed(() => {
  return props.mode === "zm"
    ? "Raw Sensor Value (Z / Magnitude)"
    : "Sensor Value (X / Y)"
})

const buildAxisBounds = (values, fallbackMin, fallbackMax) => {
  const numericValues = values.filter((value) => Number.isFinite(value))

  if (!numericValues.length) {
    return {
      min: fallbackMin,
      max: fallbackMax
    }
  }

  const minValue = Math.min(...numericValues)
  const maxValue = Math.max(...numericValues)

  if (minValue === maxValue) {
    const singlePadding = Math.max(Math.abs(minValue) * 0.15, 10)
    return {
      min: minValue - singlePadding,
      max: maxValue + singlePadding
    }
  }

  const range = maxValue - minValue
  const padding = Math.max(range * 0.15, 10)

  return {
    min: minValue - padding,
    max: maxValue + padding
  }
}

const yScaleConfig = computed(() => {
  const allValues =
    props.mode === "xy"
      ? visibleData.value.flatMap((item) => [item.x, item.y])
      : visibleData.value.flatMap((item) => [item.z, item.magnitude])

  const bounds =
    props.mode === "xy"
      ? buildAxisBounds(allValues, -120, 120)
      : buildAxisBounds(allValues, -60, 160)

  return {
    min: bounds.min,
    max: bounds.max,
    title: {
      display: true,
      text: yAxisTitle.value
    },
    grid: {
      color: "rgba(148, 163, 184, 0.18)"
    },
    ticks: {
      color: "#64748b"
    }
  }
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
      interaction: {
        mode: "index",
        intersect: false
      },
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: "#475569",
            boxWidth: 32,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          callbacks: {
            label(context) {
              const value = context.parsed.y
              return `${context.dataset.label}: ${Number(value).toFixed(2)}`
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: "rgba(148, 163, 184, 0.18)"
          },
          ticks: {
            color: "#64748b",
            maxRotation: 45,
            minRotation: 45
          },
          title: {
            display: true,
            text: "Packet Index"
          }
        },
        y: yScaleConfig.value
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
