import { WebSocketServer } from "ws"

const PORT = 8080
const PATH = "/ws"

const wss = new WebSocketServer({ port: PORT, path: PATH })

let t = 0

wss.on("connection", (ws) => {
  console.log("Client connected")

  const timer = setInterval(() => {
    const x = Math.sin(t) * 100
    const y = Math.cos(t) * 100
    const z = Math.sin(t * 0.5) * 50

    t += 0.1

    const packet = {
      x,
      y,
      z
    }

    ws.send(JSON.stringify(packet))
  }, 20)

  ws.on("close", () => {
    clearInterval(timer)
    console.log("Client disconnected")
  })
})

console.log(`Mock ESP32 WebSocket running at ws://127.0.0.1:${PORT}${PATH}`)