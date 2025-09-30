import { createApp } from "vue";
import App from "./App.vue";
import { createRouter, createWebHistory } from "vue-router";
import UserLogin from "./components/User/UserLogin.vue";
import Layout from "./components/Layout.vue";
import UserLogout from "./components/User/UserLogout.vue";
import DashboardLayout from "./components/DashboardLayout.vue";
import UserManagement from "./components/ManagementU/UserManagement.vue";
import DashboardMain from "./components/DashboardMain.vue";
import UserProfile from "./components/User/UserProfile.vue";
import ManagementEdit from "./components/ManagementU/ManagementEdit.vue";
import ManagementCreate from "./components/ManagementU/ManagementCreate.vue";
import DatasetMain from "./components/DatasetMng/DatasetMain.vue";
import ElbowMethod from "./components/modelling/elbow-method.vue";
import KMeans from "./components/modelling/kmeans-method.vue";
import VueApexCharts from "vue3-apexcharts";
import EasyDataTable from 'vue3-easy-data-table'
import 'vue3-easy-data-table/dist/style.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      component: Layout,
      children: [
        {
          path: "/login",
          component: UserLogin,
        },
        {
          path: "/logout",
          component: UserLogout,
        },
      ],
    },
    {
      component: DashboardLayout,
      path: "/dashboard",
      children: [
        {
          path: "main",
          component: DashboardMain,
        },
        {
          path: "management-user",
          component: UserManagement,
        },
        {
          path: "management-user/update/:username",
          component: ManagementEdit,
        },
        {
          path: "management-user/create",
          component: ManagementCreate,
        },
        {
          path: "datasets-management",
          component: DatasetMain,
        },
        {
          path: "modelling",
          component: ElbowMethod,
        },
        {
          path: "modelling/:k",
          component: KMeans,
        },
        {
          path: "users/profile",
          component: UserProfile,
        },
      ],
    },
  ],
});


export default router;
createApp(App).use(router).use(VueApexCharts).use(EasyDataTable).mount("#app");
