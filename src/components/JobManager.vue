<template>
  <div class="job-manager">

    <!-- ===== JOB SETTINGS SECTION ===== -->
    <section class="neo-card jm-section">
      <h2 class="heading-font jm-section-title">
        ⚙️ ตั้งค่างาน (Job Settings)
      </h2>
      <p class="jm-hint">เพิ่ม ลบ หรือแก้ไขชื่องาน เรตค่าจ้าง ($/hr) และ % ภาษีหัก ณ ที่จ่าย</p>
      
      <div class="jm-jobs-grid">
        <div v-for="(job, index) in editableJobs" :key="job.job_type || index" class="jm-job-row">
          <!-- Color Badge based on index rotation -->
          <div class="jm-job-type-badge" :class="getBadgeClass(index)">
            งานที่ {{ index + 1 }}
          </div>
          
          <input
            v-model="job.title"
            class="neo-input jm-title-input"
            :placeholder="`ชื่องาน เช่น เสิร์ฟอาหาร, ล้างจาน…`"
          />
          
          <div class="jm-rate-wrap">
            <span class="jm-rate-prefix">$</span>
            <input
              v-model.number="job.hourly_rate"
              type="number"
              min="0"
              step="0.25"
              class="neo-input jm-rate-input"
              placeholder="15.00"
            />
            <span class="jm-rate-suffix">/hr</span>
          </div>

          <div class="jm-rate-wrap jm-tax-wrap">
            <span class="jm-rate-prefix">%</span>
            <input
              v-model.number="job.tax_rate"
              type="number"
              min="0"
              max="100"
              step="1"
              class="neo-input jm-rate-input"
              placeholder="0"
            />
            <span class="jm-rate-suffix">tax</span>
          </div>

          <!-- Delete Job Button -->
          <button 
            class="neo-btn danger-btn jm-remove-job-btn" 
            @click="removeJob(index)"
            title="ลบงานนี้"
            :disabled="editableJobs.length <= 1"
          >
            ✖
          </button>
        </div>
      </div>

      <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-top: 18px;">
        <button
          class="neo-btn jm-add-btn"
          style="padding: 10px 20px; font-size: 0.9rem; box-shadow: 3px 3px 0px #000; background: #00E5FF;"
          @click="addJob"
        >
          ➕ เพิ่มงานใหม่ (Add Job)
        </button>

        <button
  class="neo-btn income-btn jm-save-btn"
  :disabled="savingJobs"
  @click="saveJobs"
>
  {{ savingJobs ? '⏳ กำลังบันทึก…' : '💾 บันทึกการตั้งค่าทั้งหมด' }}
</button>
        
        <span v-if="jobSaveSuccess" class="jm-success-flash">✅ บันทึกการตั้งค่าแล้ว!</span>
      </div>
    </section>

    <!-- ===== LOG WORK HOURS SECTION ===== -->
    <section class="neo-card jm-section">
      <h2 class="heading-font jm-section-title">
        🕐 บันทึกชั่วโมงงาน (Log Hours)
      </h2>

      <div class="jm-log-grid">
        <!-- Job Selection -->
        <div class="jm-field">
          <label class="jm-label">งาน</label>
          <select v-model="logForm.job_type" class="neo-input jm-select">
            <option value="" disabled>-- เลือกงาน --</option>
            <option v-for="(job, index) in props.jobs" :key="job.job_type" :value="job.job_type">
              {{ job.title }} (${{ job.hourly_rate }}/hr)
            </option>
          </select>
        </div>

        <!-- Date -->
        <div class="jm-field">
          <label class="jm-label">วันที่</label>
          <input v-model="logForm.date" type="date" class="neo-input" />
        </div>

        <!-- Start Time -->
        <div class="jm-field">
          <label class="jm-label">เข้างาน</label>
          <input v-model="logForm.start_time" type="time" class="neo-input" />
        </div>

        <!-- End Time -->
        <div class="jm-field">
          <label class="jm-label">เลิกงาน</label>
          <input v-model="logForm.end_time" type="time" class="neo-input" />
        </div>

        <!-- Break -->
        <div class="jm-field">
          <label class="jm-label">พักกี่นาที</label>
          <div class="jm-break-wrap">
            <select v-model.number="logForm.break_minutes" class="neo-input jm-select-sm">
              <option :value="0">ไม่มีพัก</option>
              <option :value="15">15 นาที</option>
              <option :value="30">30 นาที</option>
              <option :value="45">45 นาที</option>
              <option :value="60">60 นาที</option>
              <option :value="90">90 นาที</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Preview -->
      <div v-if="logPreview.hours !== null" class="jm-preview-bar" :class="logPreview.hours > 0 ? 'preview-ok' : 'preview-warn'">
        <span v-if="logPreview.hours > 0">
          ⏱ <strong>{{ logPreview.hours.toFixed(2) }} ชั่วโมง</strong>
          <template v-if="logPreview.taxPct > 0">
            — gross <strong>${{ logPreview.grossEarnings.toFixed(2) }}</strong>
            หักภาษี {{ logPreview.taxPct }}% → net <strong>${{ logPreview.earnings.toFixed(2) }}</strong>
          </template>
          <template v-else>
            ≈ <strong>${{ logPreview.earnings.toFixed(2) }}</strong>
          </template>
          ({{ logPreview.jobTitle }}, ${{ logPreview.rate }}/hr)
        </span>
        <span v-else>⚠️ เวลาเลิกงานต้องมากกว่าเวลาเข้างานหลังหักพัก</span>
      </div>

      <button
        class="neo-btn income-btn jm-save-btn"
        :disabled="loggingWork || !canLog"
        @click="logWork"
      >
        {{ loggingWork ? '⏳ กำลังบันทึก…' : '➕ บันทึกชั่วโมง' }}
      </button>
    </section>

    <!-- ===== WORK HISTORY TABLE ===== -->
    <section class="neo-card jm-section">
      <h2 class="heading-font jm-section-title">
        📋 ประวัติการทำงาน (Work History)
      </h2>

      <div v-if="props.workLogs.length === 0" class="jm-empty">
        ยังไม่มีบันทึก เริ่มบันทึกชั่วโมงงานด้านบนได้เลย! 💪
      </div>

      <div v-else class="jm-table-wrap">
        <table class="jm-table">
          <thead>
            <tr>
              <th>วันที่</th>
              <th>งาน</th>
              <th>เข้า–เลิก</th>
              <th>พัก</th>
              <th>ชั่วโมง</th>
              <th>รายได้สุทธิ (after tax)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in props.workLogs" :key="log.id" class="jm-table-row">
              <td class="jm-td-date">{{ formatDate(log.date) }}</td>
              <td>
                <span class="jm-job-badge-sm" :class="getBadgeClass(getJobIndex(log.job_type))">
                  {{ getJobTitle(log.job_type) }}
                </span>
              </td>
              <td class="jm-td-mono">{{ log.start_time }} – {{ log.end_time }}</td>
              <td class="jm-td-mono">{{ log.break_minutes }} นาที</td>
              <td class="jm-td-bold">{{ calcHours(log).toFixed(2) }} hr</td>
              <td class="jm-td-green">${{ calcEarnings(log).toFixed(2) }}</td>
              <td>
                <button class="neo-btn danger-btn jm-del-btn" @click="deleteLog(log.id)" title="ลบ">✖</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue';

const props = defineProps({
  jobs: { type: Array, default: () => [] },
  workLogs: { type: Array, default: () => [] },
});

const emit = defineEmits(['update-jobs', 'add-work-log', 'delete-work-log']);

const showAlert = inject('showAlert');
const showConfirm = inject('showConfirm');

// ---- Color styling lists ----
const BADGE_CLASSES = ['badge-main', 'badge-second', 'badge-third', 'badge-other'];
const getBadgeClass = (index) => {
  if (index < 0) return 'badge-other';
  return BADGE_CLASSES[index % BADGE_CLASSES.length];
};

const getJobIndex = (jobType) => {
  return props.jobs.findIndex(j => j.job_type === jobType);
};

const getJobTitle = (jobType) => {
  const job = props.jobs.find(j => j.job_type === jobType);
  return job ? job.title : 'งานที่ถูกลบ';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
};

// ---- Job Settings ----
const editableJobs = ref([]);
const savingJobs = ref(false);
const jobSaveSuccess = ref(false);
let saveSuccessTimer = null;

// Track if initial load has been done
const jobsLoaded = ref(false);

watch(() => props.jobs, (newJobs) => {
  // Only sync from server if we haven't loaded yet, or if currently saving (to pick up new IDs)
  if (!jobsLoaded.value) {
    if (newJobs && newJobs.length > 0) {
      editableJobs.value = newJobs.map(j => ({ ...j }));
    } else {
      editableJobs.value = [{
        id: null,
        job_type: 'main',
        title: 'งานหลัก (Main Job)',
        hourly_rate: 15.0
      }];
    }
    jobsLoaded.value = true;
  } else if (savingJobs.value) {
    // After save: only update IDs for newly created jobs (match by job_type)
    if (newJobs && newJobs.length > 0) {
      editableJobs.value = editableJobs.value.map(ej => {
        const matched = newJobs.find(j => j.job_type === ej.job_type);
        if (matched) return { ...ej, id: matched.id };
        return ej;
      });
    }
  }
}, { immediate: true, deep: true });


const addJob = () => {
  const nextIndex = editableJobs.value.length + 1;
  // Generate random safe string for job_type
  const jobType = `job_${Math.random().toString(36).substring(2, 10)}`;
  editableJobs.value.push({
    id: null,
    job_type: jobType,
    title: `งานใหม่ที่ {{ nextIndex }}`.replace('{{ nextIndex }}', nextIndex),
    hourly_rate: 15.0
  });
};

const removeJob = async (index) => {
  if (editableJobs.value.length <= 1) {
    await showAlert('ต้องมีงานลงทะเบียนไว้ใช้งานอย่างน้อย 1 งานน้า!', 'แจ้งเตือน ⚠️');
    return;
  }
  
  const job = editableJobs.value[index];
  
  // If the job already has an ID (saved in DB), verify if there are work logs
  if (job.id) {
    const hasLogs = props.workLogs.some(log => log.job_type === job.job_type);
    if (hasLogs) {
      const confirmDelete = await showConfirm(
        `งาน "${job.title}" มีประวัติการทำงานบันทึกไว้แล้ว หากลบงานนี้ ประวัติชั่วโมงทำงานทั้งหมดของงานนี้จะถูกลบไปด้วย คุณยืนยันที่จะลบหรือไม่?`,
        'คำเตือน ⚠️'
      );
      if (!confirmDelete) return;
    }
  }
  
  editableJobs.value.splice(index, 1);
};

const saveJobs = async () => {
  // Validate titles
  const emptyTitle = editableJobs.value.some(j => !j.title || !j.title.trim());
  if (emptyTitle) {
    await showAlert('กรุณากรอกชื่อสำหรับทุกงานก่อนบันทึก!', 'ข้อผิดพลาด ❌');
    return;
  }

  savingJobs.value = true;
  try {
    await emit('update-jobs', editableJobs.value.map(j => ({
      id: j.id,
      job_type: j.job_type,
      title: j.title.trim(),
      hourly_rate: parseFloat(j.hourly_rate) || 0,
      tax_rate: Math.min(100, Math.max(0, parseFloat(j.tax_rate) || 0))
    })));
    jobSaveSuccess.value = true;
    clearTimeout(saveSuccessTimer);
    saveSuccessTimer = setTimeout(() => { jobSaveSuccess.value = false; }, 2500);
  } finally {
    savingJobs.value = false;
  }
};

// ---- Log Work ----
const today = new Date().toISOString().slice(0, 10);
const logForm = ref({
  job_type: '',
  date: today,
  start_time: '08:00',
  end_time: '16:00',
  break_minutes: 30,
});
const loggingWork = ref(false);

// No auto-select: user must choose a job each time they log

const calcHoursFromForm = (start, end, breakMin) => {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const totalMin = (eh * 60 + em) - (sh * 60 + sm) - (breakMin || 0);
  return Math.max(0, totalMin / 60);
};

const logPreview = computed(() => {
  const { job_type, start_time, end_time, break_minutes } = logForm.value;
  if (!start_time || !end_time) return { hours: null };
  const hours = calcHoursFromForm(start_time, end_time, break_minutes);
  const job = props.jobs.find(j => j.job_type === job_type);
  const rate = job ? job.hourly_rate : 0;
  const taxPct = job ? (job.tax_rate || 0) : 0;
  const gross = hours * rate;
  const net = gross * (1 - taxPct / 100);
  return {
    hours,
    earnings: net,
    grossEarnings: gross,
    taxPct,
    rate,
    jobTitle: job ? job.title : '',
  };
});

const canLog = computed(() => {
  const { job_type, date, start_time, end_time } = logForm.value;
  return job_type && date && start_time && end_time && logPreview.value.hours > 0;
});

const logWork = async () => {
  if (!canLog.value) return;
  loggingWork.value = true;
  try {
    await emit('add-work-log', { ...logForm.value });
    logForm.value = { 
      job_type: '',
      date: today, 
      start_time: '08:00', 
      end_time: '16:00', 
      break_minutes: 30 
    };
  } finally {
    loggingWork.value = false;
  }
};

// ---- Work Log Calculations ----
const calcHours = (log) => calcHoursFromForm(log.start_time, log.end_time, log.break_minutes);

const calcEarnings = (log) => {
  const job = props.jobs.find(j => j.job_type === log.job_type);
  if (!job) return 0;
  const gross = calcHours(log) * job.hourly_rate;
  const taxPct = job.tax_rate || 0;
  return gross * (1 - taxPct / 100);
};

const calcGrossEarnings = (log) => {
  const job = props.jobs.find(j => j.job_type === log.job_type);
  return calcHours(log) * (job ? job.hourly_rate : 0);
};

// ---- Delete ----
const deleteLog = async (id) => {
  const ok = await showConfirm('ลบรายการนี้ออกจากประวัติ?', 'ยืนยันการลบ 🗑️');
  if (!ok) return;
  emit('delete-work-log', id);
};
</script>

<style scoped>
.job-manager {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.jm-section {
  padding: 24px;
}

.jm-section-title {
  font-size: 1.2rem;
  margin-bottom: 6px;
  color: var(--color-text);
}

.jm-hint {
  font-size: 0.8rem;
  color: var(--color-muted);
  font-weight: 700;
  margin-bottom: 16px;
}

/* Job settings grid */
.jm-jobs-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.jm-job-row {
  display: grid;
  grid-template-columns: 90px 1fr auto auto auto;
  gap: 10px;
  align-items: center;
}

.jm-tax-wrap {
  background: #FFF9E6;
}

.jm-job-type-badge {
  text-align: center;
  font-weight: 900;
  font-size: 0.72rem;
  padding: 6px 8px;
  border: 2px solid #000;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}
.badge-main   { background: #FFE135; color: #000; }
.badge-second { background: #00E5FF; color: #000; }
.badge-third  { background: #B9F7CA; color: #000; }
.badge-other  { background: #FFB3C6; color: #000; }

.jm-title-input { flex: 1; min-width: 0; }

.jm-rate-wrap {
  display: flex;
  align-items: center;
  gap: 4px;
  border: 2.5px solid #000;
  border-radius: 8px;
  padding: 0 8px;
  background: var(--color-card-bg);
  box-shadow: 2px 2px 0px #000;
}

.jm-rate-prefix, .jm-rate-suffix {
  font-weight: 900;
  font-size: 0.85rem;
  color: var(--color-text);
  white-space: nowrap;
}

.jm-rate-input {
  border: none !important;
  box-shadow: none !important;
  width: 64px;
  text-align: right;
  background: transparent;
  padding: 6px 4px;
}
.jm-rate-input:focus { outline: none; }

.jm-remove-job-btn {
  padding: 6px 10px;
  font-size: 0.75rem;
  border-width: 2px;
  box-shadow: 2px 2px 0px #000;
}

/* Log form grid */
.jm-log-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.jm-field { display: flex; flex-direction: column; gap: 4px; }

.jm-label {
  font-size: 0.75rem;
  font-weight: 900;
  text-transform: uppercase;
  color: var(--color-text);
  letter-spacing: 0.5px;
}

.jm-select, .jm-select-sm { cursor: pointer; }

.jm-break-wrap { display: flex; gap: 8px; align-items: center; }

/* Preview bar */
.jm-preview-bar {
  padding: 10px 14px;
  border: 2.5px solid #000;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.88rem;
  margin-bottom: 12px;
  box-shadow: 3px 3px 0px #000;
}
.preview-ok   { background: #B9F7CA; }
.preview-warn { background: #FFE135; }

.jm-save-btn {
  padding: 10px 22px;
  font-size: 0.9rem;
  box-shadow: 3px 3px 0px #000;
}

.jm-success-flash {
  font-weight: 900;
  font-size: 0.85rem;
  color: #0a7c2e;
  animation: fadeIn 0.3s ease;
}

/* Table */
.jm-table-wrap {
  overflow-x: auto;
  border: 2.5px solid #000;
  border-radius: 10px;
  box-shadow: 4px 4px 0px #000;
}

.jm-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.83rem;
}

.jm-table thead tr {
  background: #000;
  color: #FFE135;
}

.jm-table th {
  padding: 10px 12px;
  text-align: left;
  font-weight: 900;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.jm-table-row {
  border-bottom: 1.5px solid #000;
  transition: background 0.15s;
}
.jm-table-row:hover { background: rgba(255, 225, 53, 0.12); }
.jm-table-row:last-child { border-bottom: none; }

.jm-table td {
  padding: 9px 12px;
  vertical-align: middle;
}

.jm-td-date  { color: var(--color-muted); font-weight: 700; white-space: nowrap; }
.jm-td-mono  { font-family: monospace; font-weight: 700; white-space: nowrap; }
.jm-td-bold  { font-weight: 900; }
.jm-td-green { font-weight: 900; color: #0a7c2e; }

.jm-job-badge-sm {
  font-size: 0.68rem;
  font-weight: 900;
  padding: 3px 7px;
  border: 1.5px solid #000;
  border-radius: 4px;
  text-transform: uppercase;
  white-space: nowrap;
}

.jm-del-btn {
  padding: 4px 8px;
  font-size: 0.7rem;
  border-width: 2px;
  box-shadow: 1px 1px 0px #000;
}

.jm-empty {
  text-align: center;
  padding: 32px;
  font-weight: 700;
  color: var(--color-muted);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
