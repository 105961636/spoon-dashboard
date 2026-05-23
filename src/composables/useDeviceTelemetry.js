import { computed, onBeforeUnmount, ref } from "vue"

export function useDeviceTelemetry() {
  const usbConnected = ref(true)
  const usbPort = ref("COM4")
  const packetCount = ref(1284)
  const samplingMode = ref("Continuous")
  const samplingRate = ref("1 Hz")
  const bufferStatus = ref("Normal")
  const firmwareVersion = ref("v1.4.2")
  const sensorStatus = ref("Online")
  const motorStatus = ref("Ready")
  const deviceHealth = ref("Nominal")
  const latency = ref(42)
  const uptimeSeconds = ref(0)

  let timerId = null

  const uptimeDisplay = computed(() => {
    const minutes = Math.floor(uptimeSeconds.value / 60)
    const seconds = uptimeSeconds.value % 60
    return `${minutes}m ${seconds}s`
  })

  const connectionLabel = computed(() =>
    usbConnected.value ? "USB Connected" : "Disconnected"
  )

  const startTelemetry = () => {
    if (timerId) return

    timerId = setInterval(() => {
      uptimeSeconds.value += 1

      if (usbConnected.value) {
        packetCount.value += Math.floor(Math.random() * 3) + 1
        latency.value = 38 + Math.floor(Math.random() * 12)
      }
    }, 1000)
  }

  const stopTelemetry = () => {
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    }
  }

  const toggleConnection = () => {
    usbConnected.value = !usbConnected.value

    if (!usbConnected.value) {
      bufferStatus.value = "Stopped"
    } else {
      bufferStatus.value = "Normal"
    }
  }

  const resetTelemetry = () => {
    packetCount.value = 0
    uptimeSeconds.value = 0
    latency.value = 42
    bufferStatus.value = usbConnected.value ? "Normal" : "Stopped"
  }

  startTelemetry()

  onBeforeUnmount(() => {
    stopTelemetry()
  })

  return {
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
  }
}