<script setup>
import { computed } from "vue"
import MetricCard from "../components/MetricCard.vue"
import ComparisonBarChart from "../components/ComparisonBarChart.vue"
import { summaryData } from "../data/summaryData"

const beforeValue = computed(() => Number.parseFloat(summaryData.averageBefore))
const afterValue = computed(() => Number.parseFloat(summaryData.averageAfter))
const reductionValue = computed(() =>
  Number((beforeValue.value - afterValue.value).toFixed(1))
)

const comparisonLabels = ["Before Stabilisation", "After Stabilisation"]
const comparisonValues = [beforeValue.value, afterValue.value]

const progressStyle = computed(() => ({
  width: `${summaryData.stabilityImprovement}%`
}))
</script>

<template>
  <section class="page">
    <div class="page-head">
      <div>
        <h2>Summary</h2>
        <p>End-of-session review for evaluating overall spoon performance.</p>
      </div>
    </div>

    <section class="metrics-grid">
      <MetricCard
        title="Meal Duration"
        :value="summaryData.mealDuration"
        subtitle="Recorded session length"
      />
      <MetricCard
        title="Average Before"
        :value="summaryData.averageBefore"
        subtitle="Before stabilisation"
      />
      <MetricCard
        title="Average After"
        :value="summaryData.averageAfter"
        subtitle="After stabilisation"
      />
      <MetricCard
        title="Peak Tremor"
        :value="summaryData.peakTremor"
        subtitle="Maximum observed value"
      />
    </section>

    <section class="grid-main">
      <article class="panel">
        <div class="panel-header">
          <h3>Tremor Comparison</h3>
          <span class="panel-tag">Before vs After</span>
        </div>

        <ComparisonBarChart
          :labels="comparisonLabels"
          :values="comparisonValues"
          :height="360"
          chart-label="Average Tremor"
        />

        <div class="comparison-meta">
          <div class="meta-card">
            <span>Absolute Reduction</span>
            <strong>{{ reductionValue }} Hz</strong>
          </div>
          <div class="meta-card">
            <span>Spill Risk</span>
            <strong>{{ summaryData.spillRisk }}</strong>
          </div>
        </div>
      </article>

      <article class="side-column">
        <div class="panel compact">
          <div class="panel-header">
            <h3>Outcome Review</h3>
            <span class="panel-tag">Session Result</span>
          </div>

          <div class="review-list">
            <div class="review-item">
              <span>Stability Improvement</span>
              <strong>{{ summaryData.stabilityImprovement }}%</strong>
            </div>
            <div class="review-item">
              <span>Average Before</span>
              <strong>{{ summaryData.averageBefore }}</strong>
            </div>
            <div class="review-item">
              <span>Average After</span>
              <strong>{{ summaryData.averageAfter }}</strong>
            </div>
            <div class="review-item">
              <span>Peak Tremor</span>
              <strong>{{ summaryData.peakTremor }}</strong>
            </div>
          </div>

          <div class="progress-block">
            <div class="progress-meta">
              <span>Stabilisation Effectiveness</span>
              <strong>{{ summaryData.stabilityImprovement }}%</strong>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="progressStyle"></div>
            </div>
          </div>
        </div>

        <div class="panel compact">
          <div class="panel-header">
            <h3>Interpretation</h3>
            <span class="panel-tag">Analysis</span>
          </div>

          <p class="result-text">{{ summaryData.sessionResult }}</p>

          <ul class="insight-list">
            <li>Lower motion amplitude after stabilisation</li>
            <li>Improved spoon control during the eating task</li>
            <li>Reduced likelihood of spill-related events</li>
          </ul>
        </div>
      </article>
    </section>
  </section>
</template>

<style scoped>
.page-head {
  margin-bottom: 24px;
}

.page-head h2 {
  margin: 0 0 8px;
  font-size: 30px;
}

.page-head p {
  margin: 0;
  color: #64748b;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 28px;
}

.grid-main {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 24px;
}

.side-column {
  display: grid;
  gap: 24px;
}

.panel {
  background: white;
  border-radius: 22px;
  padding: 24px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

.panel.compact {
  height: fit-content;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}

.panel-header h3 {
  margin: 0;
  color: #1e3a8a;
  font-size: 22px;
}

.panel-tag {
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 13px;
  font-weight: 700;
  padding: 8px 12px;
  border-radius: 999px;
}

.comparison-meta {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 20px;
}

.meta-card,
.review-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  padding: 16px 18px;
  border-radius: 14px;
}

.meta-card span,
.review-item span {
  color: #475569;
}

.meta-card strong,
.review-item strong {
  color: #0f172a;
  font-size: 18px;
}

.review-list {
  display: grid;
  gap: 14px;
  margin-bottom: 20px;
}

.progress-block {
  margin-top: 6px;
}

.progress-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  color: #334155;
  font-weight: 600;
}

.progress-bar {
  height: 14px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #2563eb, #60a5fa);
  border-radius: 999px;
}

.result-text {
  margin: 0 0 18px;
  color: #334155;
  line-height: 1.7;
}

.insight-list {
  margin: 0;
  padding-left: 18px;
  color: #334155;
  line-height: 1.8;
}

@media (max-width: 1200px) {
  .metrics-grid,
  .grid-main,
  .comparison-meta {
    grid-template-columns: 1fr;
  }
}
</style>