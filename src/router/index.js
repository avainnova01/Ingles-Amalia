import { createRouter, createWebHistory } from 'vue-router'
import KidsHomeView from '../views/KidsHomeView.vue'
import CategoryStudyView from '../views/CategoryStudyView.vue'
import QuizView from '../views/QuizView.vue'
import QuizResultView from '../views/QuizResultView.vue'
import AdminDashboardView from '../views/AdminDashboardView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: KidsHomeView
  },
  {
    path: '/study/:categoryId',
    name: 'study',
    component: CategoryStudyView,
    props: true
  },
  {
    path: '/quiz/:categoryId',
    name: 'quiz',
    component: QuizView,
    props: true
  },
  {
    path: '/quiz-result',
    name: 'quiz-result',
    component: QuizResultView
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminDashboardView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
