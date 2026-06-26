<template>
  <div>
    <!-- Quick Statistics Summary cards -->
    <DashboardCard 
      :total-income="totalIncome"
      :total-expenses="totalExpenses"
      :daily-expenses="dailyExpenses"
      :net-balance="netBalance"
      :roi="roi"
      :project-costs-total="projectCostsTotal"
      :active-currency="activeCurrency"
      :rent-and-deposit-total="rentAndDepositTotal"
      :other-expenses-total="otherExpensesTotal"
    />

    <div class="main-grid">
      <!-- Left Column: Goals and Countdowns -->
      <div>
        <GoalTracker 
          :savings-goal="savingsGoal"
          :net-balance="netBalance"
          :exchange-rate="exchangeRate"
          :active-currency="activeCurrency"
          @update-goal="handleUpdateGoal"
        />

        <CountdownCards 
          :countdowns="countdowns"
          :exchange-rate="exchangeRate"
          :active-currency="activeCurrency"
          :actual-weekly-expense-total="actualWeeklyExpenseTotal"
          @update-countdowns="handleUpdateCountdowns"
        />

        <WeeklyBudgetCard 
          :countdowns="countdowns"
          :exchange-rate="exchangeRate"
          :active-currency="activeCurrency"
          :actual-weekly-expense-total="actualWeeklyExpenseTotal"
          :current-week-expense-total="currentWeekExpenseTotal"
          :current-week-range-text="currentWeekRangeText"
          :transactions="transactions"
          @update-countdowns="handleUpdateCountdowns"
        />
      </div>

      <!-- Right Column: Badges & J-1 Mascot -->
      <div>
        <BadgesContainer 
          :transactions="transactions"
          :net-balance="netBalance"
          :savings-goal="savingsGoal"
          :exchange-rate="exchangeRate"
          :active-currency="activeCurrency"
          :roi="roi"
        />
        <J1Mascot 
          :transactions="transactions"
          :net-balance="netBalance"
          :savings-goal="savingsGoal"
          :exchange-rate="exchangeRate"
          :active-currency="activeCurrency"
          :roi="roi"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import DashboardCard from '../components/DashboardCard.vue';
import GoalTracker from '../components/GoalTracker.vue';
import CountdownCards from '../components/CountdownCards.vue';
import WeeklyBudgetCard from '../components/WeeklyBudgetCard.vue';
import BadgesContainer from '../components/BadgesContainer.vue';
import J1Mascot from '../components/J1Mascot.vue';
import { useFinancials } from '../composables/useFinancials';

const {
  totalIncome,
  totalExpenses,
  dailyExpenses,
  netBalance,
  roi,
  projectCostsTotal,
  activeCurrency,
  rentAndDepositTotal,
  otherExpensesTotal,
  savingsGoal,
  exchangeRate,
  countdowns,
  actualWeeklyExpenseTotal,
  currentWeekExpenseTotal,
  currentWeekRangeText,
  transactions,
  handleUpdateGoal,
  handleUpdateCountdowns
} = useFinancials();
</script>
