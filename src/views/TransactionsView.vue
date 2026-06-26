<template>
  <div>
    <div class="transactions-grid">
      <!-- Left Column: Cost Form (Add daily + edit project costs) -->
      <div>
        <CostForm 
          :project-costs="projectCosts"
          :exchange-rate="exchangeRate"
          @add-transaction="handleAddTransaction"
          @update-project-costs="handleUpdateProjectCosts"
        />
      </div>

      <!-- Right Column: Transactions List -->
      <div>
        <TransactionList 
          :transactions="transactions"
          :exchange-rate="exchangeRate"
          :active-currency="activeCurrency"
          :newly-added-tx-id="newlyAddedTxId"
          @delete-transaction="handleDeleteTransaction"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import CostForm from '../components/CostForm.vue';
import TransactionList from '../components/TransactionList.vue';
import { useFinancials } from '../composables/useFinancials';

const {
  projectCosts,
  exchangeRate,
  activeCurrency,
  transactions,
  newlyAddedTxId,
  handleAddTransaction,
  handleDeleteTransaction,
  handleUpdateProjectCosts
} = useFinancials();
</script>
