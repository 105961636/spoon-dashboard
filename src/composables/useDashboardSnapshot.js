import { ref } from "vue"

const STORAGE_KEY = "smart-spoon-dashboard-snapshot"

const defaultSnapshot = {
  mode: "mock",
  connectionState: "Idle",
  packetCount: 0,
  lastUpdate: "-",
  source: "Mock Stream",
  ip: "",
  websocketUrl: "",
  currentX: 0,
  currentY: 0,
  currentZ: 0,
  currentMagnitude: 0,
  smoothedMagnitude: 0,
  derivedStatus: "Stable",
  derivedRisk: "Low",
  lastPacket: null,
  minX: null,
  maxX: null,
  minY: null,
  maxY: null,
  minZ: null,
  maxZ: null,
  finding:
    "Dashboard is ready for ESP32 testing. Real-time packets can be monitored and interpreted here.",
  updatedAt: "-"
}

function loadSnapshot() {
  if (typeof window === "undefined") {
    return { ...defaultSnapshot }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? { ...defaultSnapshot, ...JSON.parse(stored) } : { ...defaultSnapshot }
  } catch {
    return { ...defaultSnapshot }
  }
}

const snapshot = ref(loadSnapshot())

function persistSnapshot() {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot.value))
}

export function useDashboardSnapshot() {
  const updateSnapshot = (patch) => {
    snapshot.value = {
      ...snapshot.value,
      ...patch,
      updatedAt: new Date().toLocaleTimeString()
    }
    persistSnapshot()
  }

  const resetSnapshot = () => {
    snapshot.value = { ...defaultSnapshot }
    persistSnapshot()
  }

  return {
    snapshot,
    updateSnapshot,
    resetSnapshot
  }
}
