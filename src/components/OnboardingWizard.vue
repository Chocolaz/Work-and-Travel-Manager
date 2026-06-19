<template>
  <div class="auth-container" style="max-width: 600px; margin: 0 auto; width: 100%;">
    <div class="auth-card" style="max-width: 100%; transform: none;">
      <div class="auth-header">
        <span class="sticker" style="font-size: 2.5rem; width: 70px; height: 70px; background-color: var(--color-accent); color: black;">🗺️</span>
        <h1 class="heading-font" style="margin-top: 16px; font-size: 1.5rem;">SETUP YOUR JOURNEY!</h1>
        <p style="font-weight: 700; font-size: 0.85rem; color: var(--color-muted); margin-top: 4px;">
          ตั้งค่าข้อมูลเริ่มต้นสำหรับบัญชี Work & Travel ของคุณ
        </p>
      </div>

      <!-- Step Indicators -->
      <div class="neo-tabs onboarding-steps-tabs" style="justify-content: center; margin-bottom: 24px;">
        <div 
          v-for="s in 5" 
          :key="s" 
          :class="['neo-tab-btn', step === s ? 'active' : '']"
          style="cursor: default; pointer-events: none; border-width: 2px; padding: 6px 12px; font-size: 0.75rem;"
        >
          STEP {{ s }}
        </div>
      </div>

      <!-- Step Indicator Mobile Compact -->
      <div class="onboarding-step-mobile-indicator" style="margin-bottom: 20px; text-align: center;">
        <div style="font-family: var(--font-display); font-weight: 800; font-size: 0.85rem; margin-bottom: 8px; text-transform: uppercase;">
          ขั้นตอนที่ {{ step }} / 5
        </div>
        <div class="neo-progress-container" style="height: 12px; margin: 0; background-color: #FFFFFF;">
          <div 
            class="neo-progress-bar" 
            :style="{ width: `${(step / 5) * 100}%` }"
            style="height: 100%; background-color: var(--color-accent);"
          ></div>
        </div>
      </div>

      <!-- STEP 1: Exchange Rate & Base Currency -->
      <div v-if="step === 1" class="step-content">
        <h2 class="heading-font" style="font-size: 1rem; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          <span class="sticker" style="font-size: 0.9rem; width: 24px; height: 24px; background-color: white;">💱</span>
          <span>1. ตั้งค่าอัตราแลกเปลี่ยนและสกุลเงิน</span>
        </h2>
        <p style="font-size: 0.85rem; font-weight: 700; margin-bottom: 16px; color: var(--color-muted);">
          ระบุอัตราแลกเปลี่ยนเริ่มต้นและสกุลเงินหลักที่คุณต้องการใช้แสดงผลบนแดชบอร์ด
        </p>

        <div class="form-group">
          <label>อัตราแลกเปลี่ยนอ้างอิง (1 USD = ? THB)</label>
          <div style="display: flex; gap: 12px; align-items: center;">
            <input 
              type="number" 
              v-model.number="rate" 
              step="0.01" 
              min="1" 
              required
            />
            <button 
              type="button" 
              class="neo-btn secondary-btn"
              style="padding: 10px 14px; font-size: 0.8rem; white-space: nowrap;"
              @click="fetchLiveRate"
              :disabled="isFetchingRate"
            >
              {{ isFetchingRate ? 'กำลังดึงข้อมูล...' : 'ดึงค่าเงินล่าสุด 🔄' }}
            </button>
          </div>
          <small v-if="errors.rate" style="color: var(--color-error); font-weight: 800; font-size: 0.72rem; margin-top: 4px; display: block;">{{ errors.rate }}</small>
        </div>

        <div class="form-group" style="margin-top: 20px;">
          <label>สกุลเงินหลักที่ใช้แสดงผล</label>
          <div style="display: flex; gap: 12px;">
            <button 
              type="button" 
              :class="['neo-btn', activeCurrency === 'USD' ? 'balance-btn' : 'secondary-btn']"
              style="flex: 1; padding: 12px; font-size: 0.9rem;"
              @click="activeCurrency = 'USD'"
            >
              USD ($) - ดอลลาร์สหรัฐ
            </button>
            <button 
              type="button" 
              :class="['neo-btn', activeCurrency === 'THB' ? 'balance-btn' : 'secondary-btn']"
              style="flex: 1; padding: 12px; font-size: 0.9rem;"
              @click="activeCurrency = 'THB'"
            >
              THB (฿) - เงินบาทไทย
            </button>
          </div>
        </div>
      </div>

      <!-- STEP 2: J-1 Jobs Settings -->
      <div v-if="step === 2" class="step-content">
        <h2 class="heading-font" style="font-size: 1rem; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          <span class="sticker" style="font-size: 0.9rem; width: 24px; height: 24px; background-color: white;">💼</span>
          <span>2. ตั้งค่าข้อมูลงาน J-1 และเวลาทำงาน</span>
        </h2>
        <p style="font-size: 0.85rem; font-weight: 700; margin-bottom: 16px; color: var(--color-muted);">
          ระบุอัตราค่าจ้างและจำนวนชั่วโมงทำงานโดยเฉลี่ย เพื่อคำนวณวันคืนทุนบนแดชบอร์ด
        </p>

        <!-- Main Job -->
        <h3 class="heading-font" style="font-size: 0.8rem; color: var(--color-muted); margin-bottom: 8px;">💼 งานหลัก (Main Job)</h3>
        <div class="form-group">
          <label>ชื่อตำแหน่งงานหลัก</label>
          <input type="text" v-model="mainJobTitle" placeholder="เช่น Server, Lifeguard" required style="padding: 8px 12px; border-width: 2px;" />
          <small v-if="errors.mainJobTitle" style="color: var(--color-error); font-weight: 800; font-size: 0.72rem; margin-top: 4px; display: block;">{{ errors.mainJobTitle }}</small>
        </div>
        <div class="form-row job-form-row" style="margin-bottom: 16px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="font-size: 0.65rem;">ค่าจ้างต่อชั่วโมง (USD)</label>
            <input type="number" v-model.number="mainJobRate" min="0" step="0.01" required style="padding: 6px 10px; border-width: 2px;" />
            <small v-if="errors.mainJobRate" style="color: var(--color-error); font-weight: 800; font-size: 0.65rem; margin-top: 4px; display: block;">{{ errors.mainJobRate }}</small>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label style="font-size: 0.65rem;">ชั่วโมงเฉลี่ย / สัปดาห์</label>
            <input type="number" v-model.number="mainJobHours" min="0" step="1" required style="padding: 6px 10px; border-width: 2px;" />
            <small v-if="errors.mainJobHours" style="color: var(--color-error); font-weight: 800; font-size: 0.65rem; margin-top: 4px; display: block;">{{ errors.mainJobHours }}</small>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label style="font-size: 0.65rem;">ภาษี (%)</label>
            <input type="number" v-model.number="mainJobTax" min="0" max="100" required style="padding: 6px 10px; border-width: 2px;" />
            <small v-if="errors.mainJobTax" style="color: var(--color-error); font-weight: 800; font-size: 0.65rem; margin-top: 4px; display: block;">{{ errors.mainJobTax }}</small>
          </div>
        </div>

        <!-- Second Job Option -->
        <div style="margin-top: 16px; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" id="check-second-job" v-model="hasSecondJob" style="cursor: pointer; width: 18px; height: 18px;" />
          <label for="check-second-job" style="font-size: 0.8rem; font-weight: 800; cursor: pointer;">มีงานที่สอง (Second Job)</label>
        </div>

        <div v-if="hasSecondJob" class="neo-card" style="padding: 12px; margin-bottom: 16px; border-width: 2px; box-shadow: 2px 2px 0px #000;">
          <div class="form-group">
            <label>ชื่อตำแหน่งงานที่สอง</label>
            <input type="text" v-model="secondJobTitle" placeholder="เช่น Kitchen Help, Cashier" style="padding: 8px 12px; border-width: 2px;" />
            <small v-if="errors.secondJobTitle" style="color: var(--color-error); font-weight: 800; font-size: 0.72rem; margin-top: 4px; display: block;">{{ errors.secondJobTitle }}</small>
          </div>
          <div class="form-row job-form-row" style="margin-bottom: 0;">
            <div class="form-group" style="margin-bottom: 0;">
              <label style="font-size: 0.65rem;">ค่าจ้างต่อชั่วโมง (USD)</label>
              <input type="number" v-model.number="secondJobRate" min="0" step="0.01" style="padding: 6px 10px; border-width: 2px;" />
              <small v-if="errors.secondJobRate" style="color: var(--color-error); font-weight: 800; font-size: 0.65rem; margin-top: 4px; display: block;">{{ errors.secondJobRate }}</small>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label style="font-size: 0.65rem;">ชั่วโมงเฉลี่ย / สัปดาห์</label>
              <input type="number" v-model.number="secondJobHours" min="0" step="1" style="padding: 6px 10px; border-width: 2px;" />
              <small v-if="errors.secondJobHours" style="color: var(--color-error); font-weight: 800; font-size: 0.65rem; margin-top: 4px; display: block;">{{ errors.secondJobHours }}</small>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label style="font-size: 0.65rem;">ภาษี (%)</label>
              <input type="number" v-model.number="secondJobTax" min="0" max="100" style="padding: 6px 10px; border-width: 2px;" />
              <small v-if="errors.secondJobTax" style="color: var(--color-error); font-weight: 800; font-size: 0.65rem; margin-top: 4px; display: block;">{{ errors.secondJobTax }}</small>
            </div>
          </div>
        </div>

        <!-- Third Job Option -->
        <div style="margin-top: 16px; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" id="check-third-job" v-model="hasThirdJob" style="cursor: pointer; width: 18px; height: 18px;" />
          <label for="check-third-job" style="font-size: 0.8rem; font-weight: 800; cursor: pointer;">มีงานที่สาม (Third Job)</label>
        </div>

        <div v-if="hasThirdJob" class="neo-card" style="padding: 12px; margin-bottom: 16px; border-width: 2px; box-shadow: 2px 2px 0px #000;">
          <div class="form-group">
            <label>ชื่อตำแหน่งงานที่สาม</label>
            <input type="text" v-model="thirdJobTitle" placeholder="เช่น Housekeeper, Fast Food" style="padding: 8px 12px; border-width: 2px;" />
            <small v-if="errors.thirdJobTitle" style="color: var(--color-error); font-weight: 800; font-size: 0.72rem; margin-top: 4px; display: block;">{{ errors.thirdJobTitle }}</small>
          </div>
          <div class="form-row job-form-row" style="margin-bottom: 0;">
            <div class="form-group" style="margin-bottom: 0;">
              <label style="font-size: 0.65rem;">ค่าจ้างต่อชั่วโมง (USD)</label>
              <input type="number" v-model.number="thirdJobRate" min="0" step="0.01" style="padding: 6px 10px; border-width: 2px;" />
              <small v-if="errors.thirdJobRate" style="color: var(--color-error); font-weight: 800; font-size: 0.65rem; margin-top: 4px; display: block;">{{ errors.thirdJobRate }}</small>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label style="font-size: 0.65rem;">ชั่วโมงเฉลี่ย / สัปดาห์</label>
              <input type="number" v-model.number="thirdJobHours" min="0" step="1" style="padding: 6px 10px; border-width: 2px;" />
              <small v-if="errors.thirdJobHours" style="color: var(--color-error); font-weight: 800; font-size: 0.65rem; margin-top: 4px; display: block;">{{ errors.thirdJobHours }}</small>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label style="font-size: 0.65rem;">ภาษี (%)</label>
              <input type="number" v-model.number="thirdJobTax" min="0" max="100" style="padding: 6px 10px; border-width: 2px;" />
              <small v-if="errors.thirdJobTax" style="color: var(--color-error); font-weight: 800; font-size: 0.65rem; margin-top: 4px; display: block;">{{ errors.thirdJobTax }}</small>
            </div>
          </div>
        </div>
      </div>

      <!-- STEP 3: Savings Goal Settings -->
      <div v-if="step === 3" class="step-content">
        <h2 class="heading-font" style="font-size: 1rem; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          <span class="sticker" style="font-size: 0.9rem; width: 24px; height: 24px; background-color: white;">🎯</span>
          <span>3. เป้าหมายการออมเงิน (Savings Goal)</span>
        </h2>
        <p style="font-size: 0.85rem; font-weight: 700; margin-bottom: 16px; color: var(--color-muted);">
          ตั้งเป้าหมายสำหรับการออมเงินหลังจากที่เริ่มได้กำไร (คืนทุนค่าโครงการเรียบร้อยแล้ว) เช่น ไปเที่ยวต่างรัฐ ช้อปปิ้ง หรือซื้อของกลับไทย
        </p>

        <div class="form-group">
          <label>ชื่อเป้าหมาย</label>
          <input 
            type="text" 
            v-model="goalTitle" 
            placeholder="เช่น Road Trip to Grand Canyon! 🏞️" 
            required
            style="padding: 8px 12px; border-width: 2px;"
          />
          <small v-if="errors.goalTitle" style="color: var(--color-error); font-weight: 800; font-size: 0.72rem; margin-top: 4px; display: block;">{{ errors.goalTitle }}</small>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>จำนวนเงินเป้าหมาย</label>
            <input 
              type="number" 
              v-model.number="goalAmount" 
              min="0" 
              placeholder="เช่น 2500" 
              required
              style="padding: 8px 12px; border-width: 2px;"
            />
            <small v-if="errors.goalAmount" style="color: var(--color-error); font-weight: 800; font-size: 0.72rem; margin-top: 4px; display: block;">{{ errors.goalAmount }}</small>
          </div>
          <div class="form-group">
            <label>สกุลเงิน</label>
            <select v-model="goalCurrency" style="padding: 8px 12px; border-width: 2px;">
              <option value="USD">USD ($)</option>
              <option value="THB">THB (฿)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- STEP 4: Project Costs Input -->
      <div v-if="step === 4" class="step-content">
        <h2 class="heading-font" style="font-size: 1rem; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          <span class="sticker" style="font-size: 0.9rem; width: 24px; height: 24px; background-color: white;">💵</span>
          <span>4. บันทึกค่าใช้จ่ายโครงการ</span>
        </h2>
        <p style="font-size: 0.85rem; font-weight: 700; margin-bottom: 16px; color: var(--color-muted);">
          กรอกค่าใช้จ่ายก้อนใหญ่ทั้งหมดที่เสียไปก่อนหน้านี้เพื่อนำไปรวมคำนวณการหาจุดคุ้มทุน
        </p>

        <div 
          v-for="(cost, index) in initialCosts" 
          :key="cost.id" 
          class="neo-card" 
          style="padding: 12px; margin-bottom: 16px; border-width: 2px; position: relative; box-shadow: 2px 2px 0px #000;"
        >
          <button 
            type="button" 
            style="position: absolute; top: -6px; right: -6px; background-color: var(--color-error); border: 2px solid #000; font-size: 0.7rem; width: 22px; height: 22px; cursor: pointer; border-radius: 4px;"
            @click="removeCostItem(index)"
            title="ลบรายการ"
          >
            ❌
          </button>
          
          <div class="form-group" style="margin-bottom: 8px;">
            <label style="font-size: 0.65rem;">ชื่อรายการค่าใช้จ่าย</label>
            <input type="text" v-model="cost.name" required style="padding: 6px; font-size: 0.8rem; border-width: 2px;" />
            <small v-if="errors.costs && errors.costs[index] && errors.costs[index].name" style="color: var(--color-error); font-weight: 800; font-size: 0.65rem; margin-top: 4px; display: block;">{{ errors.costs[index].name }}</small>
          </div>

          <div class="form-row" style="margin-bottom: 0;">
            <div class="form-group" style="margin-bottom: 0;">
              <label style="font-size: 0.65rem;">จำนวนเงิน</label>
              <input type="number" v-model.number="cost.amount" min="1" required style="padding: 6px; font-size: 0.8rem; border-width: 2px;" />
              <small v-if="errors.costs && errors.costs[index] && errors.costs[index].amount" style="color: var(--color-error); font-weight: 800; font-size: 0.65rem; margin-top: 4px; display: block;">{{ errors.costs[index].amount }}</small>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label style="font-size: 0.65rem;">สกุลเงิน</label>
              <select :value="cost.currency" @change="changeCostCurrency(cost, $event.target.value)" style="padding: 6px; font-size: 0.8rem; border-width: 2px;">
                <option value="USD">USD ($)</option>
                <option value="THB">THB (฿)</option>
              </select>
            </div>
          </div>
        </div>
        <small v-if="errors.costsGlobal" style="color: var(--color-error); font-weight: 800; font-size: 0.72rem; margin-top: 4px; display: block; margin-bottom: 12px;">{{ errors.costsGlobal }}</small>

        <button 
          type="button" 
          class="neo-btn secondary-btn" 
          style="width: 100%; padding: 10px; font-size: 0.85rem; border-width: 2px;" 
          @click="addCostItem"
        >
          เพิ่มค่าใช้จ่ายโครงการใหม่ ➕
        </button>
      </div>

      <!-- STEP 5: Timelines & Weekly Budget Config -->
      <div v-if="step === 5" class="step-content">
        <h2 class="heading-font" style="font-size: 1rem; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          <span class="sticker" style="font-size: 0.9rem; width: 24px; height: 24px; background-color: white;">⏰</span>
          <span>5. ตั้งค่าระยะเวลาโครงการและการเงิน</span>
        </h2>
        <p style="font-size: 0.85rem; font-weight: 700; margin-bottom: 16px; color: var(--color-muted);">
          กำหนดกรอบเวลาระยะเวลาโครงการ J-1 วันจ่ายเงิน และงบเป้าหมายรายสัปดาห์
        </p>

        <!-- Project Duration Config -->
        <h3 class="heading-font" style="font-size: 0.8rem; color: var(--color-muted); margin-bottom: 8px;">✈️ ช่วงเวลาโครงการ J-1</h3>
        <div class="form-row" style="margin-bottom: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="font-size: 0.65rem;">วันเริ่มโครงการ</label>
            <input type="date" v-model="projectStartDate" style="padding: 6px 10px; border-width: 2px; width: 100%; box-sizing: border-box;" />
            <small v-if="errors.projectStartDate" style="color: var(--color-error); font-weight: 800; font-size: 0.65rem; margin-top: 4px; display: block;">{{ errors.projectStartDate }}</small>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label style="font-size: 0.65rem;">วันจบโครงการ</label>
            <input type="date" v-model="projectEndDate" style="padding: 6px 10px; border-width: 2px; width: 100%; box-sizing: border-box;" />
            <small v-if="errors.projectEndDate" style="color: var(--color-error); font-weight: 800; font-size: 0.65rem; margin-top: 4px; display: block;">{{ errors.projectEndDate }}</small>
          </div>
        </div>

        <!-- Payday settings -->
        <h3 class="heading-font" style="font-size: 0.8rem; color: var(--color-muted); margin-bottom: 8px; margin-top: 16px;">💵 วันรับเงินเดือน</h3>
        <div class="form-row" style="margin-bottom: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="font-size: 0.65rem;">วันรับเงินครั้งถัดไป</label>
            <input type="date" v-model="nextPayday" :min="minDate" style="padding: 6px 10px; border-width: 2px; width: 100%; box-sizing: border-box;" />
            <small v-if="errors.nextPayday" style="color: var(--color-error); font-weight: 800; font-size: 0.65rem; margin-top: 4px; display: block;">{{ errors.nextPayday }}</small>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label style="font-size: 0.65rem;">รอบการจ่ายเงิน</label>
            <select v-model="payCycle" style="padding: 6px 10px; border-width: 2px; width: 100%; box-sizing: border-box;">
              <option value="weekly">ทุกสัปดาห์ (Weekly)</option>
              <option value="bi-weekly">ทุก 2 สัปดาห์ (Bi-weekly)</option>
              <option value="monthly">รายเดือน (Monthly)</option>
            </select>
          </div>
        </div>

        <!-- Rent settings -->
        <h3 class="heading-font" style="font-size: 0.8rem; color: var(--color-muted); margin-bottom: 8px; margin-top: 16px;">🏠 กำหนดชำระค่าเช่าบ้าน</h3>
        <div class="form-row" style="margin-bottom: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="font-size: 0.65rem;">วันจ่ายค่าเช่าครั้งถัดไป</label>
            <input type="date" v-model="nextRentDay" :min="minDate" style="padding: 6px 10px; border-width: 2px; width: 100%; box-sizing: border-box;" />
            <small v-if="errors.nextRentDay" style="color: var(--color-error); font-weight: 800; font-size: 0.65rem; margin-top: 4px; display: block;">{{ errors.nextRentDay }}</small>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label style="font-size: 0.65rem;">ค่าเช่าบ้านรายสัปดาห์ ({{ activeCurrency }})</label>
            <input type="number" v-model.number="rentAmount" min="0" style="padding: 6px 10px; border-width: 2px; width: 100%; box-sizing: border-box;" />
            <small v-if="errors.rentAmount" style="color: var(--color-error); font-weight: 800; font-size: 0.65rem; margin-top: 4px; display: block;">{{ errors.rentAmount }}</small>
          </div>
        </div>

        <!-- Weekly Expense Target Config -->
        <h3 class="heading-font" style="font-size: 0.8rem; color: var(--color-muted); margin-bottom: 8px; margin-top: 16px;">🎯 งบประมาณค่าใช้จ่ายรายสัปดาห์</h3>
        <div class="form-group" style="margin-bottom: 0;">
          <label style="font-size: 0.65rem; display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>เป้าหมายค่าใช้จ่ายต่อสัปดาห์ ({{ activeCurrency }})</span>
            <span style="font-weight: 800; color: var(--color-muted);">ขีดจำกัด: 0 - {{ maxLimit }}</span>
          </label>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <input 
              type="range" 
              v-model.number="weeklyExpenseTarget" 
              min="0" 
              :max="maxLimit" 
              step="1"
              style="width: 100%; accent-color: var(--color-accent); cursor: pointer;"
            />
            <input 
              type="number" 
              v-model.number="weeklyExpenseTarget" 
              min="0" 
              :max="maxLimit" 
              required 
              style="padding: 6px 10px; border-width: 2px; width: 100%; box-sizing: border-box;" 
              placeholder="0" 
              step="any"
            />
          </div>
          <small v-if="errors.weeklyExpenseTarget" style="color: var(--color-error); font-weight: 800; font-size: 0.72rem; margin-top: 4px; display: block;">{{ errors.weeklyExpenseTarget }}</small>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="comic-separator"></div>

      <div style="display: flex; gap: 12px; margin-top: 16px;">
        <button 
          v-if="step > 1"
          type="button" 
          class="neo-btn secondary-btn tilted-left"
          style="flex: 1; padding: 12px;"
          @click="prevStep"
        >
          ⬅️ ย้อนกลับ
        </button>
        
        <button 
          v-if="step < 5"
          type="button" 
          class="neo-btn tilted-right"
          style="flex: 1.5; padding: 12px;"
          @click="nextStep"
        >
          ถัดไป ➡️
        </button>
        
        <button 
          v-else
          type="button" 
          class="neo-btn income-btn tilted-right"
          style="flex: 1.5; padding: 12px;"
          @click="finishSetup"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'กำลังบันทึกข้อมูล...' : 'เสร็จสิ้นการตั้งค่า 🚀' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue';

const showAlert = inject('showAlert');

const props = defineProps({
  token: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['onboarding-complete', 'change-currency']);

const step = ref(1);
const isFetchingRate = ref(false);
const isSubmitting = ref(false);
const errors = ref({});

// Step 1: Exchange Rate & Display currency
const rate = ref(35.00);
const activeCurrency = ref('USD');

// Step 2: Jobs settings (Main, Second, Third)
const mainJobTitle = ref('Server');
const mainJobRate = ref(15);
const mainJobTax = ref(12);
const mainJobHours = ref(32);

const hasSecondJob = ref(false);
const secondJobTitle = ref('Kitchen Help');
const secondJobRate = ref(15);
const secondJobTax = ref(12);
const secondJobHours = ref(20);

const hasThirdJob = ref(false);
const thirdJobTitle = ref('Housekeeper');
const thirdJobRate = ref(15);
const thirdJobTax = ref(12);
const thirdJobHours = ref(15);

// Step 3: Goal settings
const goalTitle = ref('เก็บเงินเที่ยว Road Trip! 🏞️');
const goalAmount = ref(1500);
const goalCurrency = ref('USD');

watch(goalCurrency, (newVal, oldVal) => {
  if (goalAmount.value && goalAmount.value > 0) {
    if (oldVal === 'USD' && newVal === 'THB') {
      goalAmount.value = parseFloat((goalAmount.value * rate.value).toFixed(2));
    } else if (oldVal === 'THB' && newVal === 'USD') {
      goalAmount.value = parseFloat((goalAmount.value / rate.value).toFixed(2));
    }
  }
});

// Step 4: Project Costs setup (custom checkbox seeding)
const initialCosts = ref([
  { id: `pc-0-${Math.random().toString(36).substring(2, 6)}`, name: 'ค่าธรรมเนียมโครงการ', amount: 68000.0, currency: 'THB' },
  { id: `pc-1-${Math.random().toString(36).substring(2, 6)}`, name: 'ค่าตั๋วเครื่องบิน', amount: 42000.0, currency: 'THB' }
]);

const changeCostCurrency = (cost, newCurrency) => {
  const oldCurrency = cost.currency;
  if (oldCurrency !== newCurrency) {
    if (cost.amount && cost.amount > 0) {
      if (oldCurrency === 'USD' && newCurrency === 'THB') {
        cost.amount = parseFloat((cost.amount * rate.value).toFixed(2));
      } else if (oldCurrency === 'THB' && newCurrency === 'USD') {
        cost.amount = parseFloat((cost.amount / rate.value).toFixed(2));
      }
    }
    cost.currency = newCurrency;
  }
};

const addCostItem = () => {
  initialCosts.value.push({
    id: `pc-${Math.random().toString(36).substring(2, 6)}`,
    name: 'ค่าใช้จ่ายโครงการใหม่',
    amount: 0,
    currency: 'THB'
  });
};

const removeCostItem = (index) => {
  initialCosts.value.splice(index, 1);
};

// Step 5: Timelines & Weekly Budget Config
const projectStartDate = ref('');
const projectEndDate = ref('');
const nextPayday = ref('');
const payCycle = ref('weekly');
const nextRentDay = ref('');
const rentAmount = ref(150);
const weeklyExpenseTarget = ref(150);

// Calculate dynamic maximum budget limit (1000 USD converted to activeCurrency)
const maxLimit = computed(() => {
  if (activeCurrency.value === 'USD') return 1000;
  return Math.round(1000 * rate.value);
});

// Watch activeCurrency to convert rentAmount and weeklyExpenseTarget values
watch(activeCurrency, (newCurrency, oldCurrency) => {
  if (newCurrency !== oldCurrency) {
    if (newCurrency === 'THB') {
      rentAmount.value = parseFloat((rentAmount.value * rate.value).toFixed(2));
      weeklyExpenseTarget.value = parseFloat((weeklyExpenseTarget.value * rate.value).toFixed(2));
    } else {
      rentAmount.value = parseFloat((rentAmount.value / rate.value).toFixed(2));
      weeklyExpenseTarget.value = parseFloat((weeklyExpenseTarget.value / rate.value).toFixed(2));
    }
  }
});

// Get tomorrow's date formatted as YYYY-MM-DD for min attribute validation
const getTomorrowDateString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};
const minDate = ref(getTomorrowDateString());

const prevStep = () => {
  if (step.value > 1) step.value--;
};

const validateStep = (s) => {
  if (s === 1) {
    if (!rate.value || rate.value <= 0) {
      errors.value.rate = 'กรุณากรอกอัตราแลกเปลี่ยนอ้างอิงให้มากกว่า 0';
      return false;
    } else {
      delete errors.value.rate;
    }
  } else if (s === 2) {
    let hasError = false;
    if (!mainJobTitle.value || mainJobTitle.value.trim() === '') {
      errors.value.mainJobTitle = 'กรุณากรอกชื่อตำแหน่งงานหลัก';
      hasError = true;
    } else {
      delete errors.value.mainJobTitle;
    }
    if (mainJobRate.value === null || mainJobRate.value === undefined || mainJobRate.value < 0) {
      errors.value.mainJobRate = 'ค่าจ้างต่อชั่วโมงต้องไม่ต่ำกว่า 0';
      hasError = true;
    } else {
      delete errors.value.mainJobRate;
    }
    if (mainJobHours.value === null || mainJobHours.value === undefined || mainJobHours.value < 0) {
      errors.value.mainJobHours = 'กรุณากรอกชั่วโมงทำงานเฉลี่ย';
      hasError = true;
    } else {
      delete errors.value.mainJobHours;
    }
    if (mainJobTax.value === null || mainJobTax.value === undefined || mainJobTax.value < 0 || mainJobTax.value > 100) {
      errors.value.mainJobTax = 'กรุณากรอกอัตราภาษี 0 - 100%';
      hasError = true;
    } else {
      delete errors.value.mainJobTax;
    }

    if (hasSecondJob.value) {
      if (!secondJobTitle.value || secondJobTitle.value.trim() === '') {
        errors.value.secondJobTitle = 'กรุณากรอกชื่อตำแหน่งงานที่สอง';
        hasError = true;
      } else {
        delete errors.value.secondJobTitle;
      }
      if (secondJobRate.value === null || secondJobRate.value === undefined || secondJobRate.value < 0) {
        errors.value.secondJobRate = 'ค่าจ้างต่อชั่วโมงต้องไม่ต่ำกว่า 0';
        hasError = true;
      } else {
        delete errors.value.secondJobRate;
      }
      if (secondJobHours.value === null || secondJobHours.value === undefined || secondJobHours.value < 0) {
        errors.value.secondJobHours = 'กรุณากรอกชั่วโมงทำงานเฉลี่ย';
        hasError = true;
      } else {
        delete errors.value.secondJobHours;
      }
      if (secondJobTax.value === null || secondJobTax.value === undefined || secondJobTax.value < 0 || secondJobTax.value > 100) {
        errors.value.secondJobTax = 'กรุณากรอกอัตราภาษี 0 - 100%';
        hasError = true;
      } else {
        delete errors.value.secondJobTax;
      }
    } else {
      delete errors.value.secondJobTitle;
      delete errors.value.secondJobRate;
      delete errors.value.secondJobHours;
      delete errors.value.secondJobTax;
    }

    if (hasThirdJob.value) {
      if (!thirdJobTitle.value || thirdJobTitle.value.trim() === '') {
        errors.value.thirdJobTitle = 'กรุณากรอกชื่อตำแหน่งงานที่สาม';
        hasError = true;
      } else {
        delete errors.value.thirdJobTitle;
      }
      if (thirdJobRate.value === null || thirdJobRate.value === undefined || thirdJobRate.value < 0) {
        errors.value.thirdJobRate = 'ค่าจ้างต่อชั่วโมงต้องไม่ต่ำกว่า 0';
        hasError = true;
      } else {
        delete errors.value.thirdJobRate;
      }
      if (thirdJobHours.value === null || thirdJobHours.value === undefined || thirdJobHours.value < 0) {
        errors.value.thirdJobHours = 'กรุณากรอกชั่วโมงทำงานเฉลี่ย';
        hasError = true;
      } else {
        delete errors.value.thirdJobHours;
      }
      if (thirdJobTax.value === null || thirdJobTax.value === undefined || thirdJobTax.value < 0 || thirdJobTax.value > 100) {
        errors.value.thirdJobTax = 'กรุณากรอกอัตราภาษี 0 - 100%';
        hasError = true;
      } else {
        delete errors.value.thirdJobTax;
      }
    } else {
      delete errors.value.thirdJobTitle;
      delete errors.value.thirdJobRate;
      delete errors.value.thirdJobHours;
      delete errors.value.thirdJobTax;
    }

    if (hasError) return false;
  } else if (s === 3) {
    let hasError = false;
    if (!goalTitle.value || goalTitle.value.trim() === '') {
      errors.value.goalTitle = 'กรุณากรอกชื่อเป้าหมายการออมเงิน';
      hasError = true;
    } else {
      delete errors.value.goalTitle;
    }
    if (!goalAmount.value || goalAmount.value <= 0) {
      errors.value.goalAmount = 'กรุณากรอกจำนวนเงินเป้าหมายให้มากกว่า 0';
      hasError = true;
    } else {
      delete errors.value.goalAmount;
    }
    if (hasError) return false;
  } else if (s === 4) {
    if (initialCosts.value.length === 0) {
      errors.value.costsGlobal = 'กรุณากรอกค่าใช้จ่ายโครงการอย่างน้อย 1 รายการ';
      return false;
    } else {
      delete errors.value.costsGlobal;
    }
    
    let hasError = false;
    errors.value.costs = [];
    for (let i = 0; i < initialCosts.value.length; i++) {
      const cost = initialCosts.value[i];
      errors.value.costs[i] = {};
      if (!cost.name || cost.name.trim() === '') {
        errors.value.costs[i].name = 'กรุณากรอกชื่อรายการ';
        hasError = true;
      }
      if (cost.amount === null || cost.amount === undefined || cost.amount <= 0) {
        errors.value.costs[i].amount = 'จำนวนเงินต้องมากกว่า 0';
        hasError = true;
      }
    }
    if (hasError) return false;
    else delete errors.value.costs;
  } else if (s === 5) {
    let hasError = false;
    if (!projectStartDate.value) {
      errors.value.projectStartDate = 'กรุณาเลือกวันเริ่มโครงการ';
      hasError = true;
    } else {
      delete errors.value.projectStartDate;
    }
    if (!projectEndDate.value) {
      errors.value.projectEndDate = 'กรุณาเลือกวันจบโครงการ';
      hasError = true;
    } else {
      delete errors.value.projectEndDate;
    }
    if (!nextPayday.value) {
      errors.value.nextPayday = 'กรุณาเลือกวันรับเงินครั้งถัดไป';
      hasError = true;
    } else {
      delete errors.value.nextPayday;
    }
    if (!nextRentDay.value) {
      errors.value.nextRentDay = 'กรุณาเลือกวันจ่ายค่าเช่าครั้งถัดไป';
      hasError = true;
    } else {
      delete errors.value.nextRentDay;
    }
    if (rentAmount.value === null || rentAmount.value === undefined || rentAmount.value < 0) {
      errors.value.rentAmount = 'ค่าเช่าบ้านต้องไม่ต่ำกว่า 0';
      hasError = true;
    } else {
      delete errors.value.rentAmount;
    }
    if (weeklyExpenseTarget.value === null || weeklyExpenseTarget.value === undefined || weeklyExpenseTarget.value < 0) {
      errors.value.weeklyExpenseTarget = 'เป้าหมายค่าใช้จ่ายต้องไม่ต่ำกว่า 0';
      hasError = true;
    } else {
      delete errors.value.weeklyExpenseTarget;
    }

    // Date boundary rules
    const todayStr = new Date().toISOString().split('T')[0];
    if (nextPayday.value && nextPayday.value <= todayStr) {
      errors.value.nextPayday = 'วันรับเงินถัดไปต้องมากกว่าวันปัจจุบัน';
      hasError = true;
    }
    if (nextRentDay.value && nextRentDay.value <= todayStr) {
      errors.value.nextRentDay = 'วันจ่ายค่าเช่าถัดไปต้องมากกว่าวันปัจจุบัน';
      hasError = true;
    }
    if (projectStartDate.value && projectEndDate.value && projectStartDate.value >= projectEndDate.value) {
      errors.value.projectEndDate = 'วันจบโครงการต้องเกิดหลังวันเริ่มโครงการ';
      hasError = true;
    }
    const maxVal = maxLimit.value;
    if (weeklyExpenseTarget.value !== null && (weeklyExpenseTarget.value < 0 || weeklyExpenseTarget.value > maxVal)) {
      errors.value.weeklyExpenseTarget = `ต้องอยู่ในช่วง 0 ถึง ${maxVal.toLocaleString()}`;
      hasError = true;
    }

    if (hasError) return false;
  }
  return true;
};

const nextStep = async () => {
  const isValid = validateStep(step.value);
  if (!isValid) return; // Stop if invalid, errors are displayed inline
  if (step.value < 5) step.value++;
};

const fetchLiveRate = async () => {
  isFetchingRate.value = true;
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!response.ok) throw new Error('Failed to fetch rate');
    const data = await response.json();
    const thbRate = data.rates.THB;
    if (thbRate) {
      rate.value = parseFloat(thbRate.toFixed(2));
    }
  } catch (e) {
    await showAlert('Could not fetch live rate. Using manual input.', 'แจ้งเตือน 📢');
  } finally {
    isFetchingRate.value = false;
  }
};

const finishSetup = async () => {
  // Validate all steps 1 to 5 to make sure no step is bypassed
  for (let s = 1; s <= 5; s++) {
    const isValid = validateStep(s);
    if (!isValid) {
      step.value = s; // Switch wizard view to the invalid step tab
      return;
    }
  }

  isSubmitting.value = true;
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${props.token}`
  };

  try {
    // 1. Save Exchange Rate
    await fetch('/api/exchange-rate', {
      method: 'PUT',
      headers,
      body: JSON.stringify({ rate: rate.value })
    });

    // 2. Save J-1 Jobs
    const jobsToSave = [
      {
        id: 'job-main-' + Math.random().toString(36).substring(2, 6),
        job_type: 'main',
        title: mainJobTitle.value || 'งานหลัก',
        hourly_rate: parseFloat(mainJobRate.value) || 0,
        tax_rate: parseFloat(mainJobTax.value) || 0,
        avg_hours_per_week: parseFloat(mainJobHours.value) || 0
      }
    ];

    if (hasSecondJob.value) {
      jobsToSave.push({
        id: 'job-second-' + Math.random().toString(36).substring(2, 6),
        job_type: 'second',
        title: secondJobTitle.value || 'งานสอง',
        hourly_rate: parseFloat(secondJobRate.value) || 0,
        tax_rate: parseFloat(secondJobTax.value) || 0,
        avg_hours_per_week: parseFloat(secondJobHours.value) || 0
      });
    }

    if (hasThirdJob.value) {
      jobsToSave.push({
        id: 'job-third-' + Math.random().toString(36).substring(2, 6),
        job_type: 'third',
        title: thirdJobTitle.value || 'งานสาม',
        hourly_rate: parseFloat(thirdJobRate.value) || 0,
        tax_rate: parseFloat(thirdJobTax.value) || 0,
        avg_hours_per_week: parseFloat(thirdJobHours.value) || 0
      });
    }

    await fetch('/api/jobs', {
      method: 'PUT',
      headers,
      body: JSON.stringify({ jobs: jobsToSave })
    });

    // 3. Save Savings Goal
    await fetch('/api/goals', {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        title: goalTitle.value,
        targetAmount: goalAmount.value,
        currency: goalCurrency.value
      })
    });

    // 4. Save Project Costs
    const preparedCosts = initialCosts.value.map((cost, idx) => ({
      id: cost.id || `pc-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      name: cost.name,
      amount: cost.amount || 0,
      currency: cost.currency
    }));
    
    await fetch('/api/project-costs', {
      method: 'PUT',
      headers,
      body: JSON.stringify(preparedCosts)
    });

    // Convert Weekly Expense Target and Rent Amount to USD if base is THB
    let targetUSD = parseFloat(weeklyExpenseTarget.value) || 0;
    let rentUSD = parseFloat(rentAmount.value) || 0;
    if (activeCurrency.value === 'THB') {
      targetUSD = parseFloat((targetUSD / rate.value).toFixed(2));
      rentUSD = parseFloat((rentUSD / rate.value).toFixed(2));
    }

    // 5. Save Countdowns
    await fetch('/api/countdowns', {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        nextPayday: nextPayday.value,
        payCycle: payCycle.value,
        nextRentDay: nextRentDay.value,
        rentCycle: 'weekly',
        rentAmount: rentUSD,
        weeklyExpenseTarget: targetUSD,
        projectStartDate: projectStartDate.value,
        projectEndDate: projectEndDate.value
      })
    });

    // 6. Update user onboarding status to 1
    const onboardRes = await fetch('/api/auth/onboarded', {
      method: 'PUT',
      headers
    });
    
    if (!onboardRes.ok) throw new Error('Failed to complete onboarding');

    // Notify App.vue of active currency choice
    emit('change-currency', activeCurrency.value);
    
    // Complete onboarding
    emit('onboarding-complete');
  } catch (e) {
    console.error('Onboarding submit error:', e);
    await showAlert(`Error during setup: ${e.message}`, 'เกิดข้อผิดพลาด ❌');
  } finally {
    isSubmitting.value = false;
  }
};
</script>
