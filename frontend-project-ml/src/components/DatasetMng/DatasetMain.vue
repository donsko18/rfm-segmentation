<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Upload Dataset Card -->
    <div class="bg-gray-800 bg-opacity-80 rounded-2xl shadow-lg border border-gray-700 p-6">
      <h2 class="text-xl font-semibold text-white mb-4">📤 Upload Dataset</h2>
      <form @submit.prevent="handleUpload" class="flex items-center gap-4">
        <input ref="fileInput" type="file" accept=".csv" @change="onFileChange" class="block w-full text-sm text-gray-300
         file:mr-4 file:py-2 file:px-4
         file:rounded-lg file:border-0
         file:text-sm file:font-semibold
         file:bg-blue-600 file:text-white
         hover:file:bg-blue-700 cursor-pointer" />
        <button type="submit" :disabled="!file"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg text-white shadow transition">
          <i class="fas fa-upload"></i>
          <span>Upload</span>
        </button>
      </form>
    </div>

    <!-- Dataset Table Card -->
    <div class="bg-gray-800 bg-opacity-80 rounded-2xl shadow-lg border border-gray-700 p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-white tracking-wide">
          📊 Dataset Management
        </h2>
        <!-- Hapus semua -->
        <button @click="handleDeleteAll"
          class="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white shadow transition flex items-center gap-2">
          <i class="fas fa-trash"></i>
          <span>Hapus Semua</span>
        </button>
      </div>

      <!-- Search Bar -->
      <div class="flex justify-between items-center mb-5">
        <input v-model="search" type="text" placeholder="🔍 Cari customer name..."
          class="px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-1/3" />
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
            <tr v-for="row in paginatedData" :key="row.id"
              class="border-b border-gray-700 hover:bg-gray-700/40 transition">
              <td class="px-4 py-3 text-gray-400">{{ row.no }}</td>
              <td class="px-4 py-3 font-mono">{{ row.customer_id }}</td>
              <td class="px-4 py-3 font-medium text-white">{{ row.customer_name }}</td>
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
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg text-white transition">
          ⬅ Prev
        </button>
        <span class="text-gray-300">
          Halaman <span class="font-semibold text-white">{{ page }}</span>
          dari <span class="font-semibold text-white">{{ totalPages }}</span>
        </span>
        <button @click="nextPage" :disabled="page === totalPages"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg text-white transition">
          Next ➡
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeMount, computed, ref } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { datasetList, deleteDataset, UploadDataset } from "../../lib/api/DatasetApi";
import { alertSuccess, alertError, alertLoading, alertClose, alertConfirm } from "../../lib/alert";


const file = ref(null);
const fileInput = ref(null);
const token = useLocalStorage("token", "");

const onFileChange = (e) => {
  file.value = e.target.files[0];
};


const handleUpload = async () => {
  if (!file.value) return;

  try {
    alertLoading("Upload Dataset", "Sedang mengupload dataset...");
    const body = await UploadDataset(file.value, token.value);

    alertClose(); // ✅ tutup loading dulu
    await alertSuccess(`Berhasil upload dataset (${body.data.length} baris disimpan).`);

    file.value = null;
    fileInput.value.value = "";
    await fetchData();
  } catch (err) {
    alertClose(); // ✅ tutup loading dulu
    await alertError(err.message || "Terjadi kesalahan saat upload.");
  }
};

// Head table
const columns = [
  { key: "no", label: "No" },
  { key: "customer_id", label: "Customer ID" },
  { key: "customer_name", label: "Customer Name" },
  { key: "recency", label: "Recency" },
  { key: "frequency", label: "Frequency" },
  { key: "monetary", label: "Monetary" },
];
// Untuk frontend tabel
const search = ref("");
const page = ref(1);
const perPage = 5;
const sortKey = ref("id");
const sortOrder = ref("asc");

// Isi dari tabel
const datasets = ref([])

// Ambil data
async function fetchData() {
  try {
    alertLoading("Memuat Data", "Mengambil dataset dari server...");
    const response = await datasetList(token.value);
    const responseBody = await response.json();

    if (response.status == 200) {
      datasets.value = responseBody.data;
      alertClose(); // ✅ tutup loading dulu
    } else {
      alertClose(); // ✅ tutup loading dulu
      await alertError(responseBody.msg);
    }
  } catch (err) {
    alertClose(); // ✅ tutup loading dulu
    await alertError(err.message || "Gagal mengambil data");
  }
}

// Delete all dataset
async function handleDeleteAll() {
  if (! await alertConfirm("Apakah kamu yakin untuk menghapus semua dataset?")) {
    return
  }
  const response = await deleteDataset(token.value)
  const responseBody = await response.json()
  console.log(responseBody)

  if (response.status === 200) {
    await alertSuccess("Berhasil menghapus semua dataset!")
    await fetchData()
  } else {
    await alertError(responseBody.msg)
  }
}
// Tambahkan nomor urut
const datasetsWithIndex = computed(() =>
  datasets.value.map((u, i) => ({
    ...u,
    no: i + 1
  }))
);

// Filtering
const filteredData = computed(() =>
  datasetsWithIndex.value.filter((u) =>
    u.customer_name.toLowerCase().includes(search.value.toLowerCase())
  )
);

// Sorting
const sortedData = computed(() =>
  [...filteredData.value].sort((a, b) => {
    let res = 0;
    if (a[sortKey.value] < b[sortKey.value]) res = -1;
    if (a[sortKey.value] > b[sortKey.value]) res = 1;
    return sortOrder.value === "asc" ? res : -res;
  })
);

// Pagination
const totalPages = computed(() =>
  Math.ceil(sortedData.value.length / perPage)
);

const paginatedData = computed(() => {
  const start = (page.value - 1) * perPage;
  return sortedData.value.slice(start, start + perPage);
});

// Functions
function sortBy(key) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortOrder.value = "asc";
  }
}
function prevPage() {
  if (page.value > 1) page.value--;
}
function nextPage() {
  if (page.value < totalPages.value) page.value++;
}
onBeforeMount(async () => {
  await fetchData()
})
</script>
