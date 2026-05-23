export function createMockGyroProvider() {
  let timer = null
  let t = 0

  return {
    start(onPacket) {
      if (timer) return

      timer = setInterval(() => {
        const x = Math.sin(t) * 100
        const y = Math.cos(t) * 100
        const z = Math.sin(t * 0.5) * 50

        t += 0.1

        onPacket({
          x,
          y,
          z,
          timestamp: new Date().toLocaleTimeString()
        })
      }, 20)
    },

    stop() {
      if (timer) {
        clearInterval(timer)
        timer = null
      }
    },

    reset() {
      this.stop()
      t = 0
    }
  }
}

export function createWebSocketGyroProvider(
  url,
  { reconnectDelay = 2000, maxRetries = 5 } = {}
) {
  let socket = null
  let reconnectTimer = null
  let manuallyStopped = false
  let retryCount = 0

  const clearReconnectTimer = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  }

  const safeClose = () => {
    if (socket) {
      socket.onopen = null
      socket.onmessage = null
      socket.onerror = null
      socket.onclose = null
      socket.close()
      socket = null
    }
  }

  return {
    start(onPacket, onStateChange) {
      if (socket || reconnectTimer) return

      manuallyStopped = false
      retryCount = 0

      const connect = () => {
        if (manuallyStopped) return

        onStateChange?.(retryCount === 0 ? "Connecting" : "Reconnecting")
        socket = new WebSocket(url)

        socket.onopen = () => {
          retryCount = 0
          clearReconnectTimer()
          onStateChange?.("Connected")
        }

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)

            if (
              typeof data.x !== "number" ||
              typeof data.y !== "number" ||
              typeof data.z !== "number"
            ) {
              return
            }

            onPacket({
              x: data.x,
              y: data.y,
              z: data.z,
              timestamp: new Date().toLocaleTimeString()
            })
          } catch (error) {
            console.error("Invalid ESP32 JSON:", error)
          }
        }

        socket.onerror = () => {
          onStateChange?.("Error")
        }

        socket.onclose = () => {
          socket = null

          if (manuallyStopped) {
            onStateChange?.("Disconnected")
            return
          }

          if (retryCount < maxRetries) {
            retryCount += 1
            onStateChange?.("Reconnecting")

            clearReconnectTimer()
            reconnectTimer = setTimeout(() => {
              reconnectTimer = null
              connect()
            }, reconnectDelay)
          } else {
            onStateChange?.("Disconnected")
          }
        }
      }

      connect()
    },

    stop() {
      manuallyStopped = true
      clearReconnectTimer()
      safeClose()
    },

    reset() {
      retryCount = 0
      this.stop()
    }
  }
}

