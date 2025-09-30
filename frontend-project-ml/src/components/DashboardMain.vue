<template>
    <!-- Profile Card -->
    <div
        class="bg-gray-800 bg-opacity-80 rounded-xl shadow-custom border border-gray-700 overflow-hidden card-hover animate-fade-in p-7 flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-white">Halo, {{ name }}</h1>
        <RouterLink to="/dashboard/users/profile"
            class="text-white px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition">
            <i class="fas fa-user-circle mr-2"></i> Lihat Profil
        </RouterLink>
    </div>
    <br>

    <!-- Wrapper Chart -->
    <div class="grid md:grid-cols-2 gap-6">
        <!-- Line Chart Card -->
        <div
            class="bg-gray-800 bg-opacity-80 rounded-xl shadow-custom border border-gray-700 overflow-hidden card-hover animate-fade-in  p-7">
            <h2 class="text-lg text-white font-semibold mb-4">
                Perbandingan Data Prediksi dan Data Asli
            </h2>
            <div class="flex items-center justify-center h-60">
                <canvas ref="lineChartRef" class="w-full h-full"></canvas>
            </div>
        </div>

        <!-- Donut Chart Card -->
        <div
            class="bg-gray-800 bg-opacity-80 rounded-xl shadow-custom border border-gray-700 overflow-hidden card-hover animate-fade-in p-7">
            <h2 class="text-lg text-white font-semibold mb-4">Skala Produk</h2>
            <div class="flex items-center justify-center h-60">
                <canvas ref="donutChartRef" class="w-full h-full"></canvas>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onBeforeMount } from 'vue'
import {
    Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale,
    DoughnutController, ArcElement, Legend
} from 'chart.js'
import { useLocalStorage } from '@vueuse/core'
import { RouterLink, useRouter } from 'vue-router'
import { UserDetail } from '../lib/api/UserApi'
import { alertError } from '../lib/alert'

// Daftarin komponen Chart.js yang diperlukan
Chart.register(
    LineController, LineElement, PointElement, LinearScale, Title, CategoryScale,
    DoughnutController, ArcElement, Legend
)

const lineChartRef = ref(null)
const donutChartRef = ref(null)

onMounted(async () => {
    await nextTick()

    // === LINE CHART ===
    new Chart(lineChartRef.value, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
            datasets: [
                {
                    label: 'Prediksi',
                    data: [12, 15, 14, 18, 20, 22, 25, 23, 26, 28, 30, 32],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59,130,246,0.2)',
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Asli',
                    data: [10, 14, 13, 17, 19, 21, 24, 22, 25, 27, 29, 31],
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245,158,11,0.2)',
                    fill: true,
                    tension: 0.3
                }
            ]
        },
        options: {
            maintainAspectRatio: true,
            responsive: true,
            plugins: { legend: { labels: { color: '#fff' } } },
            scales: {
                x: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                y: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } }
            }
        }
    })

    // === DONUT CHART ===
    new Chart(donutChartRef.value, {
        type: 'doughnut',
        data: {
            labels: ['Produk A', 'Produk B', 'Produk C', 'Produk D'],
            datasets: [{
                data: [40, 25, 20, 15],
                backgroundColor: ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'],
                borderWidth: 0
            }]
        },
        options: {
            maintainAspectRatio: true,
            responsive: true,
            cutout: '50%',   // default ±50%, makin besar angkanya makin tipis cincin
            radius: '100%',  // default 100%, makin kecil makin mungil donatnya
            plugins: {
                legend: { labels: { color: '#fff' } }
            }
        }
    })
})

// backend

const token = useLocalStorage("token", "")
const router = useRouter()
const name = ref("")

async function fetchData() {
    const response = await UserDetail(token.value)
    const responseBody = await response.json()
    console.log(responseBody)

    if (response.status === 200) {
        name.value = responseBody.name
    } else {
        await alertError(responseBody.msg)
    }
}
onBeforeMount(async () => {
    await fetchData()
})
</script>

<style lang="scss" scoped>
.bg-gradient {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1e40af 100%);
}

.card-hover {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    border-radius: 12px;
    background-color: rgba(255, 255, 255, 0.02);
}

.card-hover:hover {
    transform: translateY(-4px) scale(1.01);
    box-shadow: 0 20px 40px -8px rgba(30, 64, 175, 0.5);
}
</style>