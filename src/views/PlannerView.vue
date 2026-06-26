<template>
  <div>
    <BreakEvenPlanner
      :project-costs-total="projectCostsTotal"
      :total-income="totalIncome"
      :daily-expenses="dailyExpenses"
      :countdowns="countdowns"
      :jobs="jobs"
      :exchange-rate="exchangeRate"
      :active-currency="activeCurrency"
      :actual-weekly-expense-total="actualWeeklyExpenseTotal"
    />
  </div>
</template>

<script setup>
import BreakEvenPlanner from '../components/BreakEvenPlanner.vue';
import { useFinancials } from '../composables/useFinancials';

const {
  projectCostsTotal,
  totalIncome,
  dailyExpenses,
  countdowns,
  jobs,
  exchangeRate,
  activeCurrency,
  actualWeeklyExpenseTotal
} = useFinancials();
</script>
