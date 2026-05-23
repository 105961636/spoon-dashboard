import { computed, onBeforeUnmount, ref } from "vue"

const ESP32_WS_URL = "ws://192.168.1.45/ws"
// 把上面这个 IP 改成你们 ESP32 串口里打印出来的 localIP

export function useEsp32Stream() {
  const socket = ref(null)

  const isConnected = ref(false)
  const packetCount = ref(0)
  const lastUpdate = ref("-")

  const currentX = ref(0)
  const currentY = ref(0)
  const currentZ = ref(0)

  const history = ref([])

  const connectionLabel = computed(() =>
    isConnected.value ? "Connected" : "Disconnected"
  )

  const connect = () => {
    if (socket.value) return

    const ws = new WebSocket(ESP32_WS_URL)
    socket.value = ws

    ws.onopen = () => {
      isConnected.value = true
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (
          typeof data.x !== "number" ||
          typeof data.y !== "number" ||
          typeof data.z !== "number"
        ) {
          return
        }

        currentX.value = data.x
        currentY.value = data.y
        currentZ.value = data.z
        packetCount.value += 1
        lastUpdate.value = new Date().toLocaleTimeString()

        const nextPoint = {
          time: packetCount.value,
          x: data.x,
          y: data.y,
          z: data.z
        }

        history.value = [...history.value.slice(-39), nextPoint]
      } catch (error) {
        console.error("Invalid WebSocket JSON:", error)
      }
    }

    ws.onclose = () => {
      isConnected.value = false
      socket.value = null
    }

    ws.onerror = () => {
      isConnected.value = false
    }
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.close()
      socket.value = null
    }
    isConnected.value = false
  }

  onBeforeUnmount(() => {
    disconnect()
  })

  return {
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
  }
}