import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '../views/DashboardView.vue';
import PlannerView from '../views/PlannerView.vue';
import TransactionsView from '../views/TransactionsView.vue';
import JobsView from '../views/JobsView.vue';

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: DashboardView
  },
  {
    path: '/planner',
    name: 'planner',
    component: PlannerView
  },
  {
    path: '/transactions',
    name: 'transactions',
    component: TransactionsView
  },
  {
    path: '/jobs',
    name: 'jobs',
    component: JobsView
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
