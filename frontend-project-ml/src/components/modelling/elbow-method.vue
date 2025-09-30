<template>
    <div class="flex flex-col justify-center items-center min-h-screen bg-gray-900 p-6">
        <!-- Card Elbow Chart + Form -->
        <div class="bg-gray-800 bg-opacity-90 rounded-xl shadow-custom border border-gray-700 
               overflow-hidden card-hover animate-fade-in p-7 w-full max-w-5xl h-[750px] flex flex-col">

            <!-- Judul -->
            <h2 class="text-2xl text-white font-bold mb-6">
                📉 Elbow Method
            </h2>

            <!-- Form Select Cluster -->
            <form @submit.prevent="submitCluster" class="flex items-center gap-4 mb-6">
                <label for="cluster" class="form-control text-white">Pilih jumlah cluster :</label>
                <select v-model="selectedK" class="form-select px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 
      focus:outline-none">
                    <option disabled value="">-- Pilih Jumlah Cluster --</option>
                    <option v-for="k in 10" :key="k" :value="k">
                        {{ k }} Cluster
                    </option>
                </select>

                <button type="submit"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white shadow transition flex items-center gap-2">
                    <i class="fas fa-gear"></i>
                    <span>Pilih Cluster</span>
                </button>
            </form>
            <hr>

            <!-- Chart Area -->
            <div class="flex-1 flex items-center justify-center">
                <canvas ref="lineChartRef" class="w-full h-full"></canvas>
            </div>
        </div>
    </div>
</template>



<script setup>
import { ref, onMounted, nextTick, onBeforeMount } from "vue";
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Legend } from "chart.js";
import { useLocalStorage } from "@vueuse/core";
import { getElbow } from "../../lib/api/ModellingApi";
import { alertClose, alertError, alertLoading } from "../../lib/alert";
import { useRouter } from "vue-router";

Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Legend);

const lineChartRef = ref(null);
let chartInstance = null;
const selectedK = ref("");
const token = useLocalStorage("token", "")
const router = useRouter()
const valueFetch = ref([])
// Dummy fetch data WCSS
async function fetchElbowData() {
    // YG simulasi
    // let base = 200;
    // let data = [];
    // for (let k = 1; k <= 10; k++) {
    //     base -= Math.floor(Math.random() * 15 + 10);
    //     data.push(base > 20 ? base : 20);
    // }
    // return data;

    // pake api
    try {
        alertLoading("Mengolah dataset", "Sedang mengolah data untuk elbow plot...");
        const response = await getElbow(token.value)
        const responseBody = await response.json()
        console.log(responseBody)

        if (response.status === 200) {
            alertClose();
            valueFetch.value = responseBody.data;
            await renderChart(); // <-- rerender chart setelah data masuk
        } else {
            alertClose();
            await alertError(responseBody.msg);
            await router.push({
                path: "/dashboard/datasets-management"
            })
        }
    } catch (err) {
        alertClose();
        await alertError(err.message || "Gagal mengambil data");
    }


}

// Render chart
async function renderChart() {
    await nextTick();

    if (!valueFetch.value) {
        console.warn("Belum ada data WCSS untuk ditampilkan.");
        return;
    }

    const wcss = valueFetch.value.wcss;
    const labels = valueFetch.value.labels;

    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(lineChartRef.value, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "WCSS",
                    data: wcss,
                    borderColor: "#3b82f6",
                    backgroundColor: "rgba(59,130,246,0.3)",
                    fill: true,
                    tension: 0.3,
                    pointBackgroundColor: "#f59e0b",
                    pointRadius: 6,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: "#fff" } },
                title: {
                    display: true,
                    text: "Elbow Method (1-10)",
                    color: "#fff",
                    font: { size: 16 },
                },
            },
            scales: {
                x: {
                    title: { display: true, text: "Jumlah Cluster (k)", color: "#fff" },
                    ticks: { color: "#fff" },
                    grid: { color: "rgba(255,255,255,0.1)" },
                },
                y: {
                    title: { display: true, text: "WCSS", color: "#fff" },
                    ticks: { color: "#fff" },
                    grid: { color: "rgba(255,255,255,0.1)" },
                },
            },
        },
    });
}



// Submit pilihan cluster ke backend
async function submitCluster() {
    if (!selectedK.value) return
    router.push(`/dashboard/modelling/${selectedK.value}`)
}

onBeforeMount(async () => {
    await fetchElbowData()
})

</script>