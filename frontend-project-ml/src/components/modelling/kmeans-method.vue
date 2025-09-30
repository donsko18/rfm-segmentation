<template>
    <div class="space-y-6 animate-fade-in">
      <!-- Centroid Card -->
      <div class="bg-gray-800 bg-opacity-80 rounded-2xl shadow-lg border border-gray-700 p-6">
        <h2 class="text-xl font-semibold text-white mb-4">📌 Centroid Tiap Cluster (k = {{ k }})</h2>
        <div class="overflow-x-auto rounded-lg border border-gray-700">
          <table class="min-w-full text-sm text-gray-300">
            <thead class="bg-gray-700 text-gray-200 uppercase text-xs">
              <tr>
                <th class="px-4 py-3 text-left">Cluster</th>
                <th class="px-4 py-3 text-left">Recency</th>
                <th class="px-4 py-3 text-left">Frequency</th>
                <th class="px-4 py-3 text-left">Monetary</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(centroid, idx) in centroids"
                :key="idx"
                class="border-b border-gray-700 hover:bg-gray-700/40 transition"
              >
                <td class="px-4 py-3 font-semibold text-white">Cluster {{ idx + 1 }}</td>
                <td class="px-4 py-3">{{ centroid[0].toFixed(2) }}</td>
                <td class="px-4 py-3">{{ centroid[1].toFixed(2) }}</td>
                <td class="px-4 py-3">{{ centroid[2].toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
  
      <!-- Customer Table Card -->
      <div class="bg-gray-800 bg-opacity-80 rounded-2xl shadow-lg border border-gray-700 p-6">
        <h2 class="text-xl font-semibold text-white mb-6">👥 Daftar Customer per Cluster</h2>
  
        <!-- Search Bar -->
        <div class="flex justify-between items-center mb-5">
          <input v-model="search" type="text" placeholder="🔍 Cari customer name..."
            class="px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 w-1/3" />
          <span class="text-sm text-gray-400">
            Menampilkan
            <span class="font-semibold text-white">{{ filteredData.length }}</span>
            data
          </span>
        </div>
  
        <!-- Table -->
        <div class="overflow-x-auto rounded-lg border border-gray-700">
          <table class="min-w-full text-sm text-gray-300">
            <thead class="bg-gray-700 text-gray-200 uppercase text-xs">
              <tr>
                <th v-for="col in columns" :key="col.key" @click="sortBy(col.key)"
                  class="px-4 py-3 text-left cursor-pointer hover:text-white select-none">
                  {{ col.label }}
                  <i class="fa fa-sort ml-1 opacity-70"></i>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in paginatedData" :key="idx"
                class="border-b border-gray-700 hover:bg-gray-700/40 transition">
                <td class="px-4 py-3 text-gray-400">{{ idx + 1 + (page - 1) * perPage }}</td>
                <td class="px-4 py-3 font-medium text-white">{{ row.customer_name }}</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-1 rounded bg-purple-600/30 text-purple-300 font-semibold">
                    Cluster {{ row.cluster }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span class="px-2 py-1 rounded bg-blue-600/30 text-blue-300 font-semibold">
                    {{ row.recency }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span class="px-2 py-1 rounded bg-green-600/30 text-green-300 font-semibold">
                    {{ row.frequency }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span class="px-2 py-1 rounded bg-yellow-600/30 text-yellow-300 font-semibold">
                    {{ row.monetary }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
  
        <!-- Pagination -->
        <div class="mt-6 flex justify-between items-center">
          <button @click="prevPage" :disabled="page === 1"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 
                   rounded-lg text-white transition">
            ⬅ Prev
          </button>
          <span class="text-gray-300">
            Halaman <span class="font-semibold text-white">{{ page }}</span>
            dari <span class="font-semibold text-white">{{ totalPages }}</span>
          </span>
          <button @click="nextPage" :disabled="page === totalPages"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 
                   rounded-lg text-white transition">
            Next ➡
          </button>
        </div>
      </div>
  
      <!-- Scatter Plot Card -->
      <div class="bg-gray-800 bg-opacity-80 rounded-2xl shadow-lg border border-gray-700 p-6">
        <h2 class="text-xl font-semibold text-white mb-4">📉 Visualisasi Scatter Plot</h2>
        <apexchart type="scatter" height="400" :options="chartOptions" :series="chartSeries" />
      </div>
    </div>
  </template>
  
  <script setup>
  import { useLocalStorage } from '@vueuse/core'
  import { alertClose, alertError, alertLoading } from '../../lib/alert'
  import { getModels } from '../../lib/api/ModellingApi'
  import { useRoute } from 'vue-router'
  import { onBeforeMount, ref, computed } from 'vue'
  import VueApexCharts from 'vue3-apexcharts'
  
  const token = useLocalStorage('token', '')
  const route = useRoute()
  const { k } = route.params
  
  const centroids = ref([])
  const customers = ref([])
  
  // Table config
  const columns = [
    { key: 'no', label: 'No' },
    { key: 'customer_name', label: 'Customer Name' },
    { key: 'cluster', label: 'Cluster' },
    { key: 'recency', label: 'Recency' },
    { key: 'frequency', label: 'Frequency' },
    { key: 'monetary', label: 'Monetary' },
  ]
  
  const search = ref('')
  const page = ref(1)
  const perPage = 10
  const sortKey = ref('customer_name')
  const sortOrder = ref('asc')
  
  const filteredData = computed(() =>
    customers.value.filter((c) =>
      c.customer_name?.toLowerCase().includes(search.value.toLowerCase())
    )
  )
  const sortedData = computed(() =>
    [...filteredData.value].sort((a, b) => {
      let res = 0
      if (a[sortKey.value] < b[sortKey.value]) res = -1
      if (a[sortKey.value] > b[sortKey.value]) res = 1
      return sortOrder.value === 'asc' ? res : -res
    })
  )
  const totalPages = computed(() => Math.ceil(sortedData.value.length / perPage))
  const paginatedData = computed(() => {
    const start = (page.value - 1) * perPage
    return sortedData.value.slice(start, start + perPage)
  })
  
  function sortBy(key) {
    if (sortKey.value === key) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey.value = key
      sortOrder.value = 'asc'
    }
  }
  function prevPage() {
    if (page.value > 1) page.value--
  }
  function nextPage() {
    if (page.value < totalPages.value) page.value++
  }
  
  async function fetchModelling() {
    try {
      alertLoading('Mengolah dataset', 'Sedang mengolah data untuk hasil segmentasi...')
      const response = await getModels(token.value, k)
      const responseBody = await response.json()
      console.log(responseBody)
  
      if (response.status === 200) {
        alertClose()
        const data = responseBody.data
        centroids.value = data.centroids
        customers.value = data.raw || []
      } else {
        alertClose()
        await alertError(responseBody.msg)
      }
    } catch (err) {
      alertClose()
      await alertError(err.message || 'Gagal mengambil data')
    }
  }
  onBeforeMount(fetchModelling)
  
  // Chart options
  const chartOptions = {
    chart: { toolbar: { show: false }, zoom: { enabled: true }, foreColor: '#fff' },
    xaxis: { title: { text: 'Recency', style: { color: '#fff' } } },
    yaxis: { title: { text: 'Frequency', style: { color: '#fff' } } },
    legend: { labels: { colors: '#fff' } },
    tooltip: { theme: 'dark' },
  }
  const chartSeries = computed(() => {
    const grouped = {}
    customers.value.forEach((c) => {
      if (!grouped[c.cluster]) grouped[c.cluster] = []
      grouped[c.cluster].push([c.recency, c.frequency])
    })
    return Object.keys(grouped).map((cluster) => ({
      name: `Cluster ${cluster}`,
      data: grouped[cluster],
    }))
  })
  </script>
  