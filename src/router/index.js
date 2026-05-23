import { createRouter, createWebHistory } from "vue-router"
import Home from "../pages/Home.vue"
import LiveData from "../pages/LiveData.vue"
import Summary from "../pages/Summary.vue"
import DeviceStatus from "../pages/DeviceStatus.vue"

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "home", component: Home },
    { path: "/live-data", name: "live-data", component: LiveData },
    { path: "/summary", name: "summary", component: Summary },
    { path: "/device-status", name: "device-status", component: DeviceStatus }
  ]
})

export default router