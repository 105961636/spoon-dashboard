<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  subtitle: {
    type: String,
    default: ""
  }
})
</script>

<template>
  <article class="metric-card">
    <p class="metric-title">{{ title }}</p>
    <p class="metric-value">{{ value }}</p>
    <p v-if="subtitle" class="metric-subtitle">{{ subtitle }}</p>
  </article>
</template>

<style scoped>
.metric-card {
  background: white;
  border-radius: 18px;
  padding: 22px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  min-height: 138px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.metric-title {
  margin: 0 0 10px;
  color: #475569;
  font-size: 15px;
  font-weight: 600;
}

.metric-value {
  margin: 0;
  font-size: 30px;
  font-weight: 800;
  color: #0f172a;
}

.metric-subtitle {
  margin: 10px 0 0;
  color: #64748b;
  font-size: 14px;
}
</style>