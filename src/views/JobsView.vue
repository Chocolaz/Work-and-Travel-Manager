<template>
  <div>
    <!-- Work Hours Summary Dashboard -->
    <div class="neo-card" style="margin-bottom: 24px; padding: 24px;">
      <h2 class="heading-font" style="font-size: 1.1rem; margin-bottom: 16px;">📈 สรุปชั่วโมงงานสะสม (Cumulative Summary)</h2>
      <div class="wh-summary-grid">
        <div v-for="(job, idx) in jobs" :key="job.job_type" class="wh-summary-card" :class="`wh-card-${idx < 3 ? ['main','second','third'][idx] : 'other'}`">
          <div class="wh-type-label">{{ jobTypeLabel(job.job_type) }}</div>
          <div class="wh-card-title">{{ job.title }}</div>
          <div class="wh-stat-row">
            <span class="wh-stat-label">ชั่วโมงสะสม</span>
            <span class="wh-stat-value">{{ cumulativeStats[job.job_type]?.hours.toFixed(2) ?? '0.00' }} hr</span>
          </div>
          <div class="wh-stat-row">
            <span class="wh-stat-label">รายได้ (est.)</span>
            <span class="wh-stat-value wh-green">${{ cumulativeStats[job.job_type]?.earnings.toFixed(2) ?? '0.00' }}</span>
          </div>
          <div class="wh-stat-row">
            <span class="wh-stat-label">เรต</span>
            <span class="wh-stat-value">${{ job.hourly_rate.toFixed(2) }}/hr</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Weekly Breakdown -->
    <div class="neo-card" style="margin-bottom: 24px; padding: 24px;">
      <h2 class="heading-font" style="font-size: 1.1rem; margin-bottom: 4px;">📅 สรุปรายสัปดาห์ (Weekly Breakdown)</h2>
      <p style="font-size: 0.78rem; font-weight: 700; color: var(--color-muted); margin-bottom: 16px;">
        สัปดาห์ = จันทร์ – อาทิตย์ · คำนวณแบบประมาณการณ์เท่านั้น ไม่ได้บันทึกรายได้
      </p>
      <div v-if="weeklyRows.length === 0" style="text-align: center; padding: 24px; font-weight: 700; color: var(--color-muted);">
        ยังไม่มีข้อมูล เริ่มบันทึกชั่วโมงงานด้านล่างได้เลย!
      </div>
      <div v-else class="wh-weekly-table-wrap">
        <table class="wh-weekly-table">
          <thead>
            <tr>
              <th>สัปดาห์</th>
              <th v-for="(job, idx) in jobs" :key="job.job_type">{{ jobTypeLabel(job.job_type) }}</th>
              <th>รวมชั่วโมง</th>
              <th>รายได้ (est.)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in weeklyRows" :key="row.week" class="wh-weekly-row">
              <td class="wh-week-label">{{ row.week }}</td>
              <td v-for="(job, idx) in jobs" :key="job.job_type" class="wh-weekly-cell">
                <span v-if="row.byJob[job.job_type]">{{ row.byJob[job.job_type].hours.toFixed(1) }}hr</span>
                <span v-else class="wh-dash">–</span>
              </td>
              <td class="wh-td-bold">{{ row.totalHours.toFixed(2) }} hr</td>
              <td class="wh-td-green">${{ row.totalEarnings.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Job Manager Component -->
    <JobManager
      :jobs="jobs"
      :work-logs="workLogs"
      @update-jobs="handleUpdateJobs"
      @add-work-log="handleAddWorkLog"
      @delete-work-log="handleDeleteWorkLog"
    />
  </div>
</template>

<script setup>
import JobManager from '../components/JobManager.vue';
import { useFinancials } from '../composables/useFinancials';

const {
  jobs,
  workLogs,
  jobTypeLabel,
  cumulativeStats,
  weeklyRows,
  handleUpdateJobs,
  handleAddWorkLog,
  handleDeleteWorkLog
} = useFinancials();
</script>
