<template>
  <div class="comic-panel mascot-panel" :class="panelClass" style="margin-top: 20px; text-align: center; position: relative;">
    <h2 class="heading-font" style="font-size: 1.1rem; display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 12px;">
      <span class="sticker animate-sticker" style="font-size: 1.1rem; width: 28px; height: 28px; background-color: var(--color-accent); color: black;">🇺🇸</span>
      <span>เพื่อนร่วมเดินทาง J-1</span>
    </h2>

    <!-- Mascot Panel Subtitle -->
    <div class="mascot-status-tag font-display">
      อารมณ์ J-1: <span class="bold" :style="{ color: moodColor }">{{ moodText }}</span>
    </div>

    <!-- SVG Mascot Container -->
    <div class="mascot-svg-wrapper" @click="handleMascotClick" title="จิ้มแก้ม J-1 Mascot เพื่อทักทายกันได้น้า 🔄">
      <svg viewBox="0 0 200 230" width="100%" height="230px" xmlns="http://www.w3.org/2000/svg">
        <!-- Floating Sparkles (Level 3 - Happy) -->
        <g v-if="happinessLevel === 3" class="sparkles-group">
          <!-- Sparkle 1 -->
          <polygon class="sparkle" points="25,75 28,83 36,83 30,88 32,96 25,91 18,96 20,88 14,83 22,83" fill="#FCD34D" stroke="#000" stroke-width="1.5"/>
          <!-- Sparkle 2 -->
          <polygon class="sparkle" points="175,85 178,93 186,93 180,98 182,106 175,101 168,106 170,98 164,93 172,93" fill="#FCD34D" stroke="#000" stroke-width="1.5"/>
          <!-- Sparkle 3 -->
          <polygon class="sparkle" points="160,25 162,31 168,31 163,35 165,41 160,37 155,41 157,35 152,31 158,31" fill="#FDE047" stroke="#000" stroke-width="1.5"/>
        </g>

        <!-- Main Character Group -->
        <g id="j1-mascot-group">
          
          <!-- Hair (Back Layer) -->
          <path d="M 68 85 C 60 70, 70 55, 100 55 C 130 55, 140 70, 132 85 Z" fill="#451A03" stroke="#000" stroke-width="3.5"/>

          <!-- Flagpole & Wavy US Flag (Held by Mascot's Left Hand) -->
          <g id="flag-group">
            <!-- Flagpole -->
            <line x1="35" y1="40" x2="35" y2="190" stroke="#000" stroke-width="5" stroke-linecap="round"/>
            <!-- Flag Tip (Gold Ball) -->
            <circle cx="35" cy="37" r="4.5" fill="#FCD34D" stroke="#000" stroke-width="2"/>
            
            <!-- Wavy US Flag Cloth -->
            <g id="us-flag" :class="flagClass">
              <!-- Background Red Wave -->
              <path d="M 35 48 Q 50 43 65 48 Q 80 53 95 48 L 95 83 Q 80 88 65 83 Q 50 78 35 83 Z" fill="#EF4444" stroke="#000" stroke-width="3"/>
              
              <!-- White Wave Stripes -->
              <path d="M 35 53 Q 50 48 65 53 Q 80 58 95 53 L 95 58 Q 80 63 65 58 Q 50 53 35 58 Z" fill="#FFF" stroke="#000" stroke-width="1.5"/>
              <path d="M 35 63 Q 50 58 65 63 Q 80 68 95 63 L 95 68 Q 80 73 65 68 Q 50 63 35 68 Z" fill="#FFF" stroke="#000" stroke-width="1.5"/>
              <path d="M 35 73 Q 50 68 65 73 Q 80 78 95 73 L 95 78 Q 80 83 65 78 Q 50 73 35 78 Z" fill="#FFF" stroke="#000" stroke-width="1.5"/>
              
              <!-- Blue Canton Wave -->
              <path d="M 35 48 Q 50 43 62 47 L 62 67 Q 50 63 35 68 Z" fill="#2563EB" stroke="#000" stroke-width="2.5"/>
              
              <!-- Stars (Simplified white dots inside Canton) -->
              <circle cx="41" cy="54" r="0.8" fill="#FFF"/>
              <circle cx="47" cy="53" r="0.8" fill="#FFF"/>
              <circle cx="53" cy="54" r="0.8" fill="#FFF"/>
              <circle cx="44" cy="59" r="0.8" fill="#FFF"/>
              <circle cx="50" cy="58" r="0.8" fill="#FFF"/>
              <circle cx="56" cy="59" r="0.8" fill="#FFF"/>
              <circle cx="41" cy="64" r="0.8" fill="#FFF"/>
              <circle cx="47" cy="63" r="0.8" fill="#FFF"/>
              <circle cx="53" cy="64" r="0.8" fill="#FFF"/>
            </g>
          </g>

          <!-- Right Arm holding Pizza (If earned) -->
          <g v-if="accessories.hasPizza" id="pizza-arm-group">
            <path d="M 130 150 Q 155 150 160 140" fill="none" stroke="#000" stroke-width="7.5" stroke-linecap="round"/>
            <circle cx="160" cy="140" r="7" fill="#FFE4E6" stroke="#000" stroke-width="3"/>
            
            <!-- Pizza Slice -->
            <g id="pizza-slice">
              <polygon points="155,128 185,116 172,150" fill="#FBBF24" stroke="#000" stroke-width="3"/>
              <!-- Pizza Crust -->
              <path d="M 155 128 Q 170 121 185 116" fill="none" stroke="#B45309" stroke-width="5" stroke-linecap="round"/>
              <!-- Melting Cheese dripping -->
              <path d="M 160 138 Q 165 146 168 139" fill="#FBBF24" stroke="#000" stroke-width="2" stroke-linecap="round"/>
              <!-- Pepperoni dots -->
              <circle cx="162" cy="133" r="3" fill="#EF4444" stroke="#000" stroke-width="1"/>
              <circle cx="174" cy="128" r="3" fill="#EF4444" stroke="#000" stroke-width="1"/>
              <circle cx="169" cy="142" r="2.5" fill="#EF4444" stroke="#000" stroke-width="1"/>
            </g>
          </g>

          <!-- Right Arm Default (Not holding anything) -->
          <path v-else d="M 130 150 Q 152 162 157 178" fill="none" stroke="#000" stroke-width="8" stroke-linecap="round"/>

          <!-- Left Arm holding Flag -->
          <path d="M 70 150 Q 48 147 42 135" fill="none" stroke="#000" stroke-width="8" stroke-linecap="round"/>
          <circle cx="42" cy="135" r="7.5" fill="#FFE4E6" stroke="#000" stroke-width="3.5"/>

          <!-- Hoodie Hood behind neck -->
          <path d="M 72 132 C 72 118, 128 118, 128 132 Z" :fill="shirtColor" stroke="#000" stroke-width="3.5"/>

          <!-- Torso / Detailed Hoodie Jacket -->
          <rect x="65" y="138" width="70" height="62" rx="15" ry="15" :fill="shirtColor" stroke="#000" stroke-width="4"/>
          <!-- Hoodie Zipper line -->
          <line x1="100" y1="138" x2="100" y2="200" stroke="#000" stroke-width="3.5"/>
          <!-- Hoodie Drawstrings -->
          <line x1="88" y1="145" x2="88" y2="170" stroke="#000" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="88" cy="170" r="3.5" fill="#FDE047" stroke="#000" stroke-width="1.5"/>
          <line x1="112" y1="145" x2="112" y2="167" stroke="#000" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="112" cy="167" r="3.5" fill="#FDE047" stroke="#000" stroke-width="1.5"/>
          
          <!-- Shirt Text "J-1" Badge -->
          <rect x="80" y="172" width="40" height="18" rx="4" ry="4" fill="#000" stroke="#FFF" stroke-width="2"/>
          <text x="100" y="185" font-family="'Lexend Mega', sans-serif" font-weight="900" font-size="0.75rem" fill="#FFF" text-anchor="middle">J-1</text>

          <!-- Neck -->
          <rect x="91" y="115" width="18" height="24" fill="#FFE4E6" stroke="#000" stroke-width="3.5"/>
          <!-- Neck Shading -->
          <rect x="91" y="115" width="18" height="7" fill="#FCA5A5"/>

          <!-- Ears -->
          <circle cx="67" cy="88" r="8" fill="#FFE4E6" stroke="#000" stroke-width="3.5"/>
          <circle cx="67" cy="88" r="3.5" fill="#FCA5A5"/>
          <circle cx="133" cy="88" r="8" fill="#FFE4E6" stroke="#000" stroke-width="3.5"/>
          <circle cx="133" cy="88" r="3.5" fill="#FCA5A5"/>

          <!-- Head -->
          <circle id="j1-head" cx="100" cy="88" r="33" fill="#FFE4E6" stroke="#000" stroke-width="3.5"/>

          <!-- Hair (Front curls & sideburns) -->
          <g id="hair-front">
            <!-- Left sideburn -->
            <path d="M 69 78 Q 72 88 75 92 L 72 75 Z" fill="#451A03" stroke="#000" stroke-width="1.5"/>
            <!-- Right sideburn -->
            <path d="M 131 78 Q 128 88 125 92 L 128 75 Z" fill="#451A03" stroke="#000" stroke-width="1.5"/>
            <!-- Forehead hair locks -->
            <path d="M 70 70 Q 82 58 92 70 Q 100 58 112 68 Q 120 58 130 70 L 125 58 Q 100 50 75 58 Z" fill="#451A03" stroke="#000" stroke-width="3"/>
          </g>

          <!-- Eyebrows -->
          <line id="eyebrow-left" x1="77" y1="75" x2="91" y2="75" stroke="#000" stroke-width="3" stroke-linecap="round"/>
          <line id="eyebrow-right" x1="109" y1="75" x2="123" y2="75" stroke="#000" stroke-width="3" stroke-linecap="round"/>

          <!-- Eyes -->
          <g id="eyes-group">
            <!-- Left Eye -->
            <circle v-if="happinessLevel !== 1" cx="84" cy="83" r="4.5" fill="#000"/>
            <path v-else d="M 80 86 Q 84 80 88 86" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round"/>
            
            <!-- Right Eye -->
            <circle v-if="happinessLevel !== 1" cx="116" cy="83" r="4.5" fill="#000"/>
            <path v-else d="M 112 86 Q 116 80 120 86" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round"/>
          </g>

          <!-- Cheeks (Blushing when happy) -->
          <g v-if="happinessLevel === 3" class="blush-group">
            <ellipse cx="78" cy="91" rx="6" ry="4" fill="#FCA5A5"/>
            <ellipse cx="122" cy="91" rx="6" ry="4" fill="#FCA5A5"/>
          </g>

          <!-- Mouth (Animated / Morphed) -->
          <path id="j1-mouth" :d="mouthPath" fill="none" stroke="#000" stroke-width="4" stroke-linecap="round"/>

          <!-- Student Cap (Default Hat) -->
          <g v-if="!accessories.hasWanderlust" id="student-cap">
            <!-- Cap Dome -->
            <path d="M 68 70 A 32 32 0 0 1 132 70 Z" fill="#FF007F" stroke="#000" stroke-width="3.5"/>
            <!-- Cap visor drop shadow on forehead -->
            <path d="M 68 70 Q 100 77 132 70 Z" fill="rgba(0, 0, 0, 0.15)"/>
            <!-- Cap Brim / Visor -->
            <path d="M 62 70 Q 48 78 35 72 L 68 70" fill="none" stroke="#000" stroke-width="3.5" stroke-linecap="round"/>
            <!-- Cap Button on Top -->
            <circle cx="100" cy="38" r="4.5" fill="#FDE047" stroke="#000" stroke-width="2.5"/>
          </g>

          <!-- Pilot Hat (Wanderlust Badge Accessory) -->
          <g v-else id="pilot-hat">
            <!-- Cap Dome -->
            <path d="M 62 68 C 62 40, 138 40, 138 68 Z" fill="#1E3A8A" stroke="#000" stroke-width="3.5"/>
            <!-- Gold Badge Emblem -->
            <g transform="translate(100, 52) scale(0.8)">
              <polygon points="0,-10 3,-3 10,-3 5,1 7,8 0,4 -7,8 -5,1 -10,-3 -3,-3" fill="#FBBF24" stroke="#000" stroke-width="1.5"/>
            </g>
            <!-- Visor -->
            <path d="M 56 66 C 56 79, 144 79, 144 66" fill="#111" stroke="#000" stroke-width="3.5" stroke-linecap="round"/>
            <!-- Gold Strap -->
            <rect x="66" y="61" width="68" height="4.5" fill="#FBBF24" stroke="#000" stroke-width="1.5"/>
          </g>

          <!-- Sunglasses (Goal Achieved Accessory) -->
          <g v-if="accessories.hasSunglasses" id="sunglasses" style="transform-origin: 100px 84px;">
            <!-- Left Lens -->
            <polygon points="70,80 94,80 91,95 73,95" fill="#111" stroke="#000" stroke-width="2.5"/>
            <!-- Right Lens -->
            <polygon points="106,80 130,80 127,95 109,95" fill="#111" stroke="#000" stroke-width="2.5"/>
            <!-- White glare lines for sunglasses -->
            <line x1="74" y1="83" x2="82" y2="91" stroke="#FFF" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="110" y1="83" x2="118" y2="91" stroke="#FFF" stroke-width="1.5" stroke-linecap="round"/>
            <!-- Bridge -->
            <line x1="94" y1="84" x2="106" y2="84" stroke="#000" stroke-width="3.5"/>
          </g>

          <!-- Golden Crown with Jewels (Break-Even Hero Accessory) -->
          <g v-if="accessories.hasCrown" id="crown" style="transform: translate(0, -13px);">
            <!-- Crown Body -->
            <polygon points="75,32 83,48 100,30 117,48 125,32 125,54 75,54" fill="#FBBF24" stroke="#000" stroke-width="3.5"/>
            <!-- Jewel red/blue/green tips -->
            <circle cx="75" cy="28" r="3.5" fill="#EF4444" stroke="#000" stroke-width="1.5"/>
            <circle cx="100" cy="26" r="3.5" fill="#3B82F6" stroke="#000" stroke-width="1.5"/>
            <circle cx="125" cy="28" r="3.5" fill="#EF4444" stroke="#000" stroke-width="1.5"/>
            <!-- Inlaid Jewels on band -->
            <rect x="85" y="47" width="5" height="5" fill="#10B981" stroke="#000" stroke-width="1"/>
            <rect x="100" y="47" width="5" height="5" fill="#EF4444" stroke="#000" stroke-width="1"/>
            <rect x="110" y="47" width="5" height="5" fill="#3B82F6" stroke="#000" stroke-width="1"/>
          </g>

          <!-- Teardrops (Crying animation - Level 1) -->
          <g v-if="happinessLevel === 1" class="tears-group">
            <path class="teardrop tear-left" d="M 82,94 C 82,94 79,99 82,102 C 85,99 82,94 82,94 Z" fill="#60A5FA" stroke="#000" stroke-width="1.5"/>
            <path class="teardrop tear-right" d="M 118,94 C 118,94 115,99 118,102 C 121,99 118,94 118,94 Z" fill="#60A5FA" stroke="#000" stroke-width="1.5"/>
          </g>
        </g>
      </svg>
    </div>

    <!-- Motivational J-1 Quote based on mood and custom goal -->
    <div class="mascot-quote-box" @click="handleMascotClick" title="คลิกสุ่มฟังคำพูดเพิ่มเติม 🔄">
      <span class="quote-sign font-display">💬</span>
      <p class="quote-text font-body">{{ clickedQuote || quoteText }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import gsap from 'gsap';

const props = defineProps({
  transactions: {
    type: Array,
    required: true
  },
  netBalance: {
    type: Number,
    required: true
  },
  savingsGoal: {
    type: Object,
    required: true
  },
  exchangeRate: {
    type: Object,
    required: true
  },
  activeCurrency: {
    type: String,
    required: true
  },
  roi: {
    type: Number,
    required: true
  }
});

const clickedQuote = ref(null);
let clickedQuoteTimer = null;

const handleMascotClick = () => {
  // Trigger elastic bounce animation
  gsap.killTweensOf('#j1-mascot-group');
  gsap.fromTo('#j1-mascot-group', 
    { scaleY: 0.8 },
    { scaleY: 1, duration: 0.65, ease: 'elastic.out(1, 0.3)' }
  );

  const quotes = [
    "วันนี้กินข้าวหรือยังนาย? อย่าลืมกินข้าวให้ตรงเวลาน้า ทำงานเหนื่อยแย่เลย! 🍛",
    "สัญชาติเด็ก J-1 หักค่าเช่าแค่ไหนก็บดขยี้ได้หมด! สู้ๆ นะนาย! 💪",
    "เหนื่อยนักก็พักก่อนน้าาา แต่อย่าเพิ่งช้อปปิ้งออนไลน์ล่ะ เดี๋ยวเงินหมดดด! 🛍️",
    "การออมเงินที่ดีคือการเริ่มตั้งแต่วันนี้! ท่องไว้เพื่อ Road Trip ปลายปี! 🗽",
    "น้ำดื่มฟรีที่ทำงานคือสวรรค์! ช่วยประหยัดค่าเครื่องดื่มไปได้เยอะเลยล่ะเพื่อน J-1! 🥤",
    "รู้ไหมว่าการทำงานจ๊อบสองช่วยเพิ่มอัตราการคืนทุนได้ดีสุดๆ เลยนะ! แต่ดูแลสุขภาพด้วยน้า 💼",
    "ถ้าคืนทุนเมื่อไหร่ เราจะไปจิ้มแฮมเบอร์เกอร์ชิ้นใหญ่ๆ ฉลองกันเลย! 🍔",
    "เย้! ดีใจที่มีคุณคอยบันทึกรายจ่ายด้วยกันทุกวันน้าาา~ 😊",
    "คิดถึงส้มตำ ไก่ย่าง ของกินที่ไทยขึ้นมาเลยเนอะ คืนทุนแล้วค่อยบินกลับไปกินให้หายคิดถึงนะ! ✈️"
  ];

  let randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  if (randomQuote === clickedQuote.value) {
    randomQuote = quotes[(quotes.indexOf(randomQuote) + 1) % quotes.length];
  }

  clickedQuote.value = randomQuote;

  if (clickedQuoteTimer) clearTimeout(clickedQuoteTimer);
  clickedQuoteTimer = setTimeout(() => {
    clickedQuote.value = null;
  }, 5000);
};

// Helper: Convert to USD
const getAmountInUSD = (amount, currency) => {
  const amt = parseFloat(amount) || 0;
  if (currency === 'USD') return amt;
  const rate = parseFloat(props.exchangeRate?.rate) || 35.0;
  return amt / rate;
};

// Compute accessories based on existing badge definitions
const accessories = computed(() => {
  // 1. Crown: ROI >= 100% (Break-even Hero)
  const hasCrown = props.roi >= 100;

  // 2. Sunglasses: Savings Goal met (Goal Achieved)
  const goalAmount = parseFloat(props.savingsGoal?.targetAmount ?? props.savingsGoal?.target_amount) || 0;
  const rate = parseFloat(props.exchangeRate?.rate) || 35.0;
  const goalInUSD = props.savingsGoal?.currency === 'USD' ? goalAmount : goalAmount / rate;
  const balance = parseFloat(props.netBalance) || 0;
  const balanceUSD = props.activeCurrency === 'USD' ? balance : balance / rate;
  const hasSunglasses = goalInUSD > 0 && balanceUSD >= goalInUSD;

  // 3. Pizza: Food expenses in last 7 days < $50 (Thrifty Eater)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  let foodUSD = 0;
  props.transactions.forEach(tx => {
    if (tx.type === 'expense' && tx.category === 'food') {
      const txDate = new Date(tx.date);
      if (txDate >= sevenDaysAgo) {
        foodUSD += getAmountInUSD(tx.amount, tx.currency);
      }
    }
  });
  const hasFoodTx = props.transactions.some(tx => tx.category === 'food');
  const hasPizza = hasFoodTx && foodUSD < 50 && foodUSD > 0;

  // 4. Pilot Hat: Travel transactions >= 3 (Wanderlust)
  const travelTxCount = props.transactions.filter(tx => tx.type === 'expense' && tx.category === 'travel').length;
  const hasWanderlust = travelTxCount >= 3;

  return { hasCrown, hasSunglasses, hasPizza, hasWanderlust };
});

// Goal Details computed reactively in the active display currency
const goalTitle = computed(() => props.savingsGoal?.title || 'เป้าหมายของฉัน');
const goalAmountActive = computed(() => {
  const amount = parseFloat(props.savingsGoal?.targetAmount ?? props.savingsGoal?.target_amount) || 0;
  const originalCurrency = props.savingsGoal?.currency || 'USD';
  if (originalCurrency === props.activeCurrency) return amount;
  
  const rate = parseFloat(props.exchangeRate?.rate) || 35.0;
  if (originalCurrency === 'USD' && props.activeCurrency === 'THB') {
    return amount * rate;
  } else if (originalCurrency === 'THB' && props.activeCurrency === 'USD') {
    return amount / rate;
  }
  return amount;
});

const formattedGoalAmount = computed(() => {
  const decimals = props.activeCurrency === 'THB' ? 0 : 2;
  const currencySymbol = props.activeCurrency === 'THB' ? 'บาท' : '$';
  const valText = goalAmountActive.value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  
  return props.activeCurrency === 'THB' ? `${valText} ${currencySymbol}` : `${currencySymbol}${valText}`;
});

// Happiness Level: 1 (Sad/Stressed), 2 (Neutral), 3 (Happy/Success)
const happinessLevel = computed(() => {
  if (props.netBalance < 0 || props.roi < 50) {
    return 1; // Sad
  } else if (props.roi >= 100) {
    return 3; // Happy (Break-even achieved)
  }
  return 2; // Neutral
});

// Panel background and typography classes
const panelClass = computed(() => {
  if (happinessLevel.value === 1) return 'mascot-sad';
  if (happinessLevel.value === 3) return 'mascot-happy';
  return 'mascot-neutral';
});

const moodText = computed(() => {
  if (happinessLevel.value === 1) return 'ตึงเครียดมาก 💸';
  if (happinessLevel.value === 3) return 'แฮปปี้สุดๆ! 🇺🇸✨';
  return 'มีความหวัง 😐';
});

const moodColor = computed(() => {
  if (happinessLevel.value === 1) return '#FF007F'; // Hot Pink
  if (happinessLevel.value === 3) return '#16A34A'; // Dark Green
  return '#2563EB'; // Electric Blue
});

const shirtColor = computed(() => {
  if (happinessLevel.value === 1) return '#FF007F'; // Red/Pink hoodie
  if (happinessLevel.value === 3) return '#A3E635'; // Neon Lime hoodie
  return '#2563EB'; // Blue hoodie
});

// Flag Class (Waving or Drooped)
const flagClass = computed(() => {
  if (happinessLevel.value === 1) return 'flag-droop';
  if (happinessLevel.value === 3) return 'flag-wave-fast';
  return 'flag-wave-normal';
});

// Dynamic mouth SVG path definition
const mouthPath = computed(() => {
  if (happinessLevel.value === 1) {
    // Sad curve
    return 'M 88 110 Q 100 97 112 110';
  } else if (happinessLevel.value === 3) {
    // Wide happy curve
    return 'M 88 104 Q 100 117 112 104';
  }
  // Neutral straight line
  return 'M 88 107 L 112 107';
});

// J-1 Quotes dynamically referencing the user's custom goal
const quoteText = computed(() => {
  const goalName = goalTitle.value;
  const goalTarget = formattedGoalAmount.value;

  if (happinessLevel.value === 1) {
    if (props.netBalance < 0) {
      return `ยอดคงเหลือ\u200Bติดลบ\u200Bแล้วนะนาย! หากยัง\u200Bคุมรายจ่าย\u200Bไม่อยู่ เดี๋ยวจะ\u200Bเก็บเงิน\u200Bไปทำ\u200Bเป้าหมาย "${goalName}" (${goalTarget}) ไม่สำเร็จ\u200Bเอานะ 😢 รีบ\u200Bงด\u200Bช้อปปิ้ง\u200Bแล้ว\u200Bหา\u200Bจ๊อบเสริม\u200Bด่วนเลย!`;
    }
    return `รายจ่าย\u200Bสะสม\u200Bยังท่วม\u200Bยอดรายรับ\u200Bอยู่นะ\u200Bเพื่อน J-1! สู้เขาหน่อย ประหยัด\u200Bค่ากิน\u200Bอีกนิด เพื่อ\u200Bเป้าหมาย "${goalName}" ของเรา ใกล้\u200Bคืนทุน\u200Bแล้วนาย!`;
  } else if (happinessLevel.value === 3) {
    if (accessories.value.hasSunglasses) {
      return `สุดยอด\u200Bขั้นสุด! คืนทุน\u200Bค่าโครงการ 100% และ\u200Bสะสม\u200Bเงินออม\u200Bสำเร็จ\u200Bทะลุ\u200Bเป้าหมาย "${goalName}" (${goalTarget}) เรียบร้อย\u200Bแล้ว! สวมแว่นดำ\u200Bแล้ว\u200Bลุย\u200Bโรดทริป\u200Bอเมริกา\u200Bแบบราชา\u200Bได้เลยจ้า! 👑🇺🇸🗽`;
    }
    return `ยินดีด้วยจ้า! คืนทุน\u200Bค่าโครงการ 100% เรียบร้อย! เงินหลังจากนี้\u200Bคือกำไร\u200Bตรงๆ สะสม\u200Bเข้าเป้าหมาย "${goalName}" (${goalTarget}) ได้แบบ\u200Bเต็มเหนี่ยว\u200Bเลย! ✈️💰`;
  } else {
    if (accessories.value.hasSunglasses) {
      return `เย้! เก็บเงินออม\u200Bสุทธิ\u200Bถึงยอด\u200Bเป้าหมาย "${goalName}" (${goalTarget}) เรียบร้อย\u200Bแล้ว! (ใส่แว่นกันแดด\u200Bสุดเท่\u200Bรอเลย 😎) แต่ยังเหลือ\u200Bระยะทาง\u200Bอีกนิดหน่อย\u200Bเพื่อให้\u200Bยอดรายรับ\u200Bครอบคลุม\u200Bค่าโครงการ\u200Bนะ สู้ๆ!`;
    }
    return `ตอนนี้\u200Bทำงาน\u200Bเก็บชั่วโมง\u200Bเก็บเงิน\u200Bได้ดีเลย! สู้ต่อ\u200Bเพื่อสะสม\u200Bงวดถัดไป\u200Bเข้าเป้าหมาย "${goalName}" (${goalTarget}) สัญชาติ\u200Bเด็ก J-1 หักค่าเช่าบ้าน\u200Bแค่ไหน\u200Bก็บดขยี้\u200Bได้หมด! 💪`;
  }
});

// GSAP Animations setup
const runGsapAnimations = () => {
  // 1. Mascot breathing loop
  gsap.to('#j1-mascot-group', {
    y: -4,
    duration: 1.6,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  });

  // 2. Head bobbing offset
  gsap.to('#j1-head, #student-cap, #pilot-hat, #eyes-group, #j1-mouth, #sunglasses, #crown, .blush-group, #hair-front, #eyebrow-left, #eyebrow-right', {
    y: -1.5,
    duration: 1.6,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
    delay: 0.2
  });

  // 3. Flag waving (oscillate rotation from flagpole mount)
  gsap.to('#us-flag', {
    rotation: 6,
    skewX: 4,
    transformOrigin: '0% 50%',
    duration: 0.65,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  });

  // 4. Pizza slight hover float
  if (document.getElementById('pizza-slice')) {
    gsap.to('#pizza-slice', {
      rotation: 8,
      y: -3,
      transformOrigin: '50% 50%',
      duration: 0.9,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }
};

// Re-run setup on mounted
onMounted(() => {
  runGsapAnimations();
});

// Watch for changes in accessories or happiness level to trigger micro-animations
watch([happinessLevel, accessories], () => {
  // Let DOM update then trigger animations
  setTimeout(() => {
    // Clean any old timelines if conflicting
    gsap.killTweensOf('#j1-mascot-group');
    gsap.killTweensOf('#j1-head');
    gsap.killTweensOf('#us-flag');
    gsap.killTweensOf('#pizza-slice');
    
    runGsapAnimations();

    // Trigger state transition pop animation
    gsap.fromTo('#j1-mascot-group', 
      { scale: 0.94 },
      { scale: 1, duration: 0.55, ease: 'elastic.out(1, 0.4)' }
    );
  }, 100);
});
</script>

<style scoped>
.mascot-panel {
  transition: background-color 0.4s ease, border-color 0.4s ease;
  min-height: 390px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-width: 4.5px !important;
}

/* Neo-Brutalism Theme color variants based on J1 mood */
.mascot-sad {
  background-color: #FCA5A5 !important; /* Soft Red/Pink */
  box-shadow: var(--shadow-hard) !important;
}

.mascot-neutral {
  background-color: #FFFFFF !important;
  box-shadow: var(--shadow-hard) !important;
}

.mascot-happy {
  background-color: var(--color-income) !important; /* Neon Lime */
  box-shadow: var(--shadow-hard-large) !important;
}

.mascot-status-tag {
  background-color: #000;
  color: #FFF;
  padding: 4px 12px;
  border-radius: 0;
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 700;
  margin-bottom: 12px;
  border: var(--border-medium);
  box-shadow: 2px 2px 0px rgba(255,255,255,0.2);
}

.mascot-svg-wrapper {
  margin: 10px 0;
  filter: drop-shadow(4px 4px 0px rgba(0,0,0,0.18));
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.mascot-svg-wrapper:hover {
  transform: scale(1.05);
}

.mascot-quote-box {
  background-color: #FFF;
  border: var(--border-thick);
  box-shadow: var(--shadow-hard);
  padding: 12px 14px;
  margin-top: 10px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 90px;
  overflow-y: auto;
}
.mascot-quote-box:hover {
  transform: translateY(-2px);
  box-shadow: 6px 6px 0px #000;
}

.quote-sign {
  font-size: 1.25rem;
  line-height: 1;
}

.quote-text {
  font-size: 0.75rem;
  font-weight: 700;
  color: #000;
  line-height: 1.5;
  margin: 0;
  flex: 1;
  word-break: keep-all;
  overflow-wrap: break-word;
  line-break: loose;
}

/* Crying animation */
.teardrop {
  transform-origin: 50% 0%;
  animation: fallTears 1.2s infinite ease-in;
}

.tear-right {
  animation-delay: 0.6s;
}

@keyframes fallTears {
  0% {
    transform: translateY(0) scale(0.6);
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
  100% {
    transform: translateY(26px) scale(1);
    opacity: 0;
  }
}

/* Winking/Sparkle animation for Happy mood */
.sparkle {
  transform-origin: 50% 50%;
  animation: pulseSparkle 1.1s infinite alternate ease-in-out;
}
.sparkles-group polygon:nth-child(2) {
  animation-delay: 0.3s;
}
.sparkles-group polygon:nth-child(3) {
  animation-delay: 0.6s;
}

@keyframes pulseSparkle {
  from {
    transform: scale(0.7) rotate(0deg);
    opacity: 0.4;
  }
  to {
    transform: scale(1.2) rotate(45deg);
    opacity: 1;
  }
}

/* Dynamic flag drooping in Level 1 */
.flag-droop {
  transform: rotate(18deg) translateY(4px);
  transform-origin: 35px 48px;
  transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.animate-sticker {
  animation: rotateSticker 3s infinite linear;
}

@keyframes rotateSticker {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
