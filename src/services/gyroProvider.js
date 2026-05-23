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

export function createWebSocketGyroProvider(url) {
  let socket = null

  return {
    start(onPacket, onStateChange) {
      if (socket) return

      socket = new WebSocket(url)

      socket.onopen = () => {
        onStateChange?.('Connected')
      }

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (
            typeof data.x !== 'number' ||
            typeof data.y !== 'number' ||
            typeof data.z !== 'number'
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
          console.error('Invalid ESP32 JSON:', error)
        }
      }

      socket.onerror = () => {
        onStateChange?.('Error')
      }

      socket.onclose = () => {
        onStateChange?.('Disconnected')
        socket = null
      }
    },

    stop() {
      if (socket) {
        socket.close()
        socket = null
      }
    },

    reset() {
      this.stop()
    }
  }
}