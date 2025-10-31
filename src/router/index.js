import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import DepositAccount from '../views/DepositAccountView.vue'
import DepositAccountAdd from '../views/DepositAccountAdd.vue'
import LenderAccount from '../views/LenderAccountView.vue'
import LenderAccountAdd from '@/views/LenderAccountAdd.vue'
import BorrowerAccount from '../views/BorrowerAccountView.vue'
import BorrowerAccountAdd from '@/views/BorrowerAccountAdd.vue'
import BondView from '../views/BondView.vue'
import LOBView from '../views/LOBView.vue'
import InterestAccount from '../views/InterestAccountView.vue'
import InterestAccountAdd from '../views/InterestAccountAdd.vue'
import ExBondAccount from '@/views/ExBondAccountView.vue'
import ExBondAccountAdd from '../views/ExBondAccountAdd.vue'
import AdjustIntAccount from '../views/AdjustIntAccountView.vue'
import AdjustIntAccountAdd from '../views/AdjustIntAccountAdd.vue'
import NotFoundView from '../views/NotFoundView.vue'
import LogoutView from '../views/LogoutView.vue'
import ChangePassView from '../views/ChangePassView.vue'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'lob',
    component: LOBView 
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: function () {
      return import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
    }
  },
  {
    path: '/login',
    name: '/login',
    component: LoginView
  },
  {
    path: '/deposit',
    name: '/deposit',
    component: DepositAccount
  },
  {
    path: '/deposit/add',
    name: '/deposit/add',
    component: DepositAccountAdd
  },
  {
    path: '/borrower/:id',
    name: '/borrower',
    component: BorrowerAccount
  },
  {
    path: '/borrower/add/:id',
    name: '/borrower/add',
    component: BorrowerAccountAdd
  },
  {
    path: '/lender/:id',
    name: '/lender',
    component: LenderAccount
  },
  {
    path: '/lender/add/:id',
    name: '/lender/add',
    component: LenderAccountAdd
  },
  {
    path: '/bond/detail',
    name: '/bond/detail',
    component: BondView
  },
   {
    path: '/interest',
    name: '/interest',
    component: InterestAccount
  },
  {
    path: '/interest/add',
    name: '/interest/add',
    component: InterestAccountAdd
  },
  {
    path: '/expbond',
    name: '/expbond',
    component: ExBondAccount
  },
  {
    path: '/expbond/update',
    name: '/expbond/update',
    component: ExBondAccountAdd
  },
  {
    path: '/interest/adjust',
    name: '/interest/adjust',
    component: AdjustIntAccount
  },
  {
    path: '/interest/adjust/add',
    name: '/interest/adjust/add',
    component: AdjustIntAccountAdd
  },
  {
    path: '/lob',
    name: '/lob',
    component: LOBView
  },
  {
    path: '/logout',
    name: '/logout',
    component:LogoutView
  },
  
  {
    path: '/changepass',
    name: '/changepass',
    component: ChangePassView
  },
  // {
  //   path: '/usermanual',
  //   name: '/usermanual',
  //   component: ChangePassView
  // },
  {
    path: '/404',
    alias: '/:pathMatch(.*)*',
    name: 'NotFound',
    component:NotFoundView
  },
  // {
  //   path: '/logout',
  //   name: '/logout',
  //   component: LogoutView
  // },

  // {
  //   path: '/bond/detail/show',
  //   name: '/bond/detail',
  //   component: BondDetail
  // },
]

const router = new VueRouter({
  mode: 'history',
  routes
})

router.beforeEach((to, from, next) => {
  if (to.name !== '/login' && !localStorage.lob) next({ name: '/login' })
  else next()
})

export default router
