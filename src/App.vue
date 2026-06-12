<script setup>
import { RouterLink, RouterView } from "vue-router"
</script>

<template>
  <div class="shell">
    <header class="app-header">
      <div>
        <h1>Smart Spoon Dashboard</h1>
        <p>Parkinson’s tremor monitoring, stabilisation, and session analysis</p>
      </div>

      <nav class="nav">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/live-data">Live Data</RouterLink>
        <RouterLink to="/testing-lab">Testing Lab</RouterLink>
        <RouterLink to="/summary">Summary</RouterLink>
        <RouterLink to="/device-status">Device Status</RouterLink>

      </nav>
    </header>

    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<style>
:root {
  color-scheme: light;
  --bg: #f4f7fb;
  --text: #0f172a;
  --muted: #64748b;
  --primary: #1d4ed8;
}

* {
  box-sizing: border-box;
}

html,
body,
#app {
  margin: 0;
  min-height: 100%;
}

body {
  font-family: Arial, sans-serif;
  background: linear-gradient(180deg, #eef4ff 0%, #f8fbff 100%);
  color: var(--text);
}

a {
  text-decoration: none;
}

.shell {
  min-height: 100vh;
  padding: 28px;
}

.app-header {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(191, 219, 254, 0.5);
  border-radius: 24px;
  padding: 24px 28px;
  margin-bottom: 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
}

.app-header h1 {
  margin: 0 0 8px;
  font-size: 34px;
}

.app-header p {
  margin: 0;
  color: var(--muted);
}

.nav {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.nav a {
  padding: 11px 16px;
  border-radius: 12px;
  font-weight: 700;
  color: #1e3a8a;
  background: #eff6ff;
  transition: all 0.2s ease;
}

.nav a.router-link-active {
  background: var(--primary);
  color: white;
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.25);
}

.app-main {
  display: block;
}

@media (max-width: 900px) {
  .shell {
    padding: 18px;
  }

  .app-header {
    padding: 20px;
  }

  .app-header h1 {
    font-size: 28px;
  }
}
</style>