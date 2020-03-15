import Vue from 'vue'
import VueRouter from 'vue-router'
// import Login from '../components/login.vue'
const Login = () =>
  import(/* webpackChunkName: "login_home_welcome" */ '../components/login.vue')
// import Home from '../components/Home.vue'
const Home = () =>
  import(/* webpackChunkName: "login_home_welcome" */ '../components/Home.vue')
// import Welcome from '../components/Welcome.vue'
const Welcome = () =>
  import(
    /* webpackChunkName: "login_home_welcome" */ '../components/Welcome.vue'
  )
// import Users from '../components/user/Users.vue'
const Users = () =>
  import(
    /* webpackChunkName: "users_rights_roles" */ '../components/user/Users.vue'
  )
// import Rights from '../components/power/Rights.vue'
const Rights = () =>
  import(
    /* webpackChunkName: "users_rights_roles" */ '../components/power/Rights.vue'
  )
// import Roles from '../components/power/Roles.vue'
const Roles = () =>
  import(
    /* webpackChunkName: "users_rights_roles" */ '../components/power/Roles.vue'
  )
// imSport Cate from '../components/goods/Cate.vue'
const Cate = () =>
  import(/* webpackChunkName: "cate_params" */ '../components/goods/Cate.vue')
// import Params from '../components/goods/Params.vue'
const Params = () =>
  import(/* webpackChunkName: "cate_params" */ '../components/goods/Params.vue')

// import Goods from '../components/goods/goods_list.vue'
const Goods = () =>
  import(
    /* webpackChunkName: "goods_add" */ '../components/goods/goods_list.vue'
  )
// import Add from '../components/goods/Add.vue'
const Add = () =>
  import(/* webpackChunkName: "goods_add" */ '../components/goods/Add.vue')

// import Order from '../components/order/order_list.vue'
const Order = () =>
  import(
    /* webpackChunkName: "order_report" */ '../components/order/order_list.vue'
  )
// import Report from '../components/report/reports.vue'
const Report = () =>
  import(
    /* webpackChunkName: "order_report" */ '../components/report/reports.vue'
  )
Vue.use(VueRouter)

// const routes = [
//   { path: '/', redirect: '/login', component: Login },
//   // { path: '/login', component: Login },
//   {
//     path: '/home',
//     redirect: '/welcome',
//     component: Home,
//     children: [
//       { path: '/welcome', component: Welcome },
//       { path: '/users', component: Users },
//       { path: '/rights', component: Rights },
//       { path: '/roles', component: Roles },
//       { path: '/categories', component: Cate },
//       { path: '/params', component: Params },
//       { path: '/goods', component: Goods },
//       { path: '/goods/add', component: Add },
//       { path: '/orders', component: Order },
//       { path: '/reports', component: Report }
//     ]
//   }
// ]

const router = new VueRouter({
  routes: [
    // { path: '/', redirect: '/login', component: Login },
    { path: '/login', component: Login },
    {
      path: '/home',
      redirect: '/welcome',
      component: Home,
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users },
        { path: '/rights', component: Rights },
        { path: '/roles', component: Roles },
        { path: '/categories', component: Cate },
        { path: '/params', component: Params },
        { path: '/goods', component: Goods },
        { path: '/goods/add', component: Add },
        { path: '/orders', component: Order },
        { path: '/reports', component: Report }
      ]
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/') next('/login')
  // to是用户将要访问的页面
  if (to.path === '/login') next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
