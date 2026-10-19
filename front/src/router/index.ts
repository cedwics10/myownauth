import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import { menuItems } from '../menu'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
  }
}

const routes: RouteRecordRaw[] = menuItems
  .filter((item) => item.component)
  .map((item) => ({ path: item.path, component: item.component!, meta: { title: item.label } }))

routes.push({ path: '/:pathMatch(.*)*', redirect: '/' })

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} // Batcave` : 'Batcave'
})

export default router
