export const phaseOneOverview = {
  title: 'Phase 1 Monitoring Dashboard',
  subtitle:
    'A dashboard-first integration stage focused on real-time gyroscope streaming, client-side analysis, and ESP32-ready WebSocket connectivity.',
  metrics: [
    {
      title: 'Live Stream Schema',
      value: 'x / y / z',
      subtitle: 'Current JSON packet fields'
    },
    {
      title: 'Transport Layer',
      value: 'Wi-Fi + WS',
      subtitle: 'WebSocket-ready integration path'
    },
    {
      title: 'Dashboard Mode',
      value: 'Mock + Real',
      subtitle: 'Supports testing and future ESP32 input'
    },
    {
      title: 'Client Analysis',
      value: 'Magnitude / Risk',
      subtitle: 'Derived indicators from gyro stream'
    }
  ],
  workflow: [
    'ESP32 sensor stream generates x, y, z packets',
    'Packets are sent through Wi-Fi using WebSocket /ws',
    'Dashboard receives and visualises live gyro data',
    'Client-side logic derives magnitude, status, and risk',
    'Summary and device pages present monitoring context'
  ],
  scope: [
    'Real-time x / y / z live chart',
    'Packet count, connection state, and last update',
    'Mock mode for testing without hardware in hand',
    'ESP32 mode ready for local IP connection',
    'Client-side derived indicators for phase 1 analysis'
  ]
}

export const phaseOneSummary = {
  metrics: [
    {
      title: 'Packet Format',
      value: 'JSON',
      subtitle: 'Current stream is x / y / z based'
    },
    {
      title: 'Derived Metrics',
      value: '3',
      subtitle: 'Magnitude, status, and risk'
    },
    {
      title: 'Integration State',
      value: 'Ready',
      subtitle: 'Front-end prepared for ESP32 WebSocket'
    },
    {
      title: 'Current Goal',
      value: 'Phase 1',
      subtitle: 'Live dashboard validation before full control integration'
    }
  ],
  completed: [
    'Built a multi-page monitoring dashboard structure',
    'Implemented Live Data page with mock and ESP32-ready modes',
    'Added real-time style x / y / z visualisation',
    'Added client-side magnitude, status, and risk analysis',
    'Prepared the dashboard for direct WebSocket integration'
  ],
  limitations: [
    'Current real hardware packet structure is limited to x / y / z',
    'Higher-level fields such as stabilised output are not yet available',
    'Real board validation depends on hardware-side availability',
    'Control-layer outputs are not yet integrated into the dashboard'
  ],
  nextSteps: [
    'Connect to the real ESP32 local IP through /ws',
    'Validate packet timing and stability with physical hardware',
    'Expand packet fields if control or correction outputs become available',
    'Refine summary metrics using true sensor data'
  ]
}

export const phaseOneDevice = {
  metrics: [
    {
      title: 'Primary Device',
      value: 'ESP32',
      subtitle: 'Current target hardware platform'
    },
    {
      title: 'Transport',
      value: 'Wi-Fi',
      subtitle: 'Board acts as network stream source'
    },
    {
      title: 'Endpoint',
      value: '/ws',
      subtitle: 'WebSocket stream path'
    },
    {
      title: 'HTTP Port',
      value: '80',
      subtitle: 'Default local device access port'
    }
  ],
  checklist: [
    'ESP32 flashed and connected to the same Wi-Fi as the laptop',
    'Serial monitor confirms the board local IP',
    'Browser can open http://ESP32_IP successfully',
    'Dashboard real mode points to ws://ESP32_IP/ws',
    'Incoming JSON packets contain numeric x, y, z fields'
  ],
  notes: [
    'Current fake and real-test code paths both use x / y / z JSON packets.',
    'The dashboard is already prepared to switch from mock mode to real mode once the local IP is available.',
    'Packet parsing and live display are now front-end ready for hardware-side validation.'
  ]
}