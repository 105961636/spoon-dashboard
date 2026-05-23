export function parseCsvPacket(line) {
  if (!line) return null

  const trimmed = line.trim()
  if (!trimmed) return null

  if (trimmed.toLowerCase().startsWith("time,")) {
    return null
  }

  const parts = trimmed.split(",")

  if (parts.length !== 6) {
    console.warn("Invalid packet length:", trimmed)
    return null
  }

  const [time, raw, stabilised, tremorFrequency, spillRisk, status] = parts

  const packet = {
    time: Number(time),
    raw: Number(raw),
    stabilised: Number(stabilised),
    tremorFrequency: Number(tremorFrequency),
    spillRisk: spillRisk.trim(),
    status: status.trim(),
    timestamp: new Date().toLocaleTimeString()
  }

  const hasInvalidNumber =
    Number.isNaN(packet.time) ||
    Number.isNaN(packet.raw) ||
    Number.isNaN(packet.stabilised) ||
    Number.isNaN(packet.tremorFrequency)

  if (hasInvalidNumber) {
    console.warn("Invalid numeric values:", trimmed)
    return null
  }

  return packet
}