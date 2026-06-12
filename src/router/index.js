import { createRouter, createWebHistory } from "vue-router"
import Home from "../pages/Home.vue"
import LiveData from "../pages/LiveData.vue"
import Summary from "../pages/Summary.vue"
import DeviceStatus from "../pages/DeviceStatus.vue"
import TestingLab from "../pages/TestingLab.vue"

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/live-data",
    name: "LiveData",
    component: LiveData
  },
  {
    path: "/testing-lab",
    name: "TestingLab",
    component: TestingLab
  },
  {
    path: "/summary",
    name: "Summary",
    component: Summary
  },
  {
    path: "/device-status",
    name: "DeviceStatus",
    component: DeviceStatus
  }
  
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router