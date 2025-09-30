<template>
    <!-- Wrapper Card -->
    <div
        class="bg-gray-800 bg-opacity-80 rounded-xl shadow-custom border border-gray-700 overflow-hidden card-hover animate-fade-in p-7">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg text-white font-semibold">
                Data Users
            </h2>
            <RouterLink to="/dashboard/management-user/create"
                class="text-white px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition">
                + Tambah akun baru
            </RouterLink>
        </div>
        <!-- Search -->
        <div class="mb-4 flex justify-between items-center">
            <input v-model="search" type="text" placeholder="Cari username..."
                class="px-3 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-1/3" />
            <span class="text-sm text-gray-400">Menampilkan {{ filteredData.length }} data</span>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto rounded-lg border border-gray-700">
            <table class="min-w-full text-sm text-gray-300">
                <thead class="bg-gray-700 text-gray-200">
                    <tr>
                        <th @click="sortBy('no')" class="px-4 py-3 text-left cursor-pointer hover:text-white">
                            No <i class="fa fa-sort ml-1"></i>
                        </th>
                        <th @click="sortBy('username')" class="px-4 py-3 text-left cursor-pointer hover:text-white">
                            Username <i class="fa fa-sort ml-1"></i>
                        </th>
                        <th @click="sortBy('name')" class="px-4 py-3 text-left cursor-pointer hover:text-white">
                            Nama <i class="fa fa-sort ml-1"></i>
                        </th>
                        <th class="px-4 py-3 text-left cursor-pointer hover:text-white">
                            Aksi
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(user) in paginatedData" :key="user.username"
                        class="border-b border-gray-700 hover:bg-gray-700/50 transition">
                        <td class="px-4 py-3">{{ user.no }}</td>
                        <td class="px-4 py-3">{{ user.username }}</td>
                        <td class="px-4 py-3">{{ user.name }}</td>
                        <td class="px-4 py-3">
                            <div class="flex gap-2">
                                <RouterLink :to="`/dashboard/management-user/update/${user.username}`"
                                    class="text-white px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg shadow-md transition">
                                    <i class="fas fa-pencil mr-2"></i>Edit
                                </RouterLink>
                                <button v-on:click="() => handleDelete(user.username)" type="submit"
                                    class="text-white px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg shadow-md transition">
                                    <i class="fas fa-trash mr-2"></i>Hapus
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div class="mt-4 flex justify-between items-center">
            <button @click="prevPage" :disabled="page === 1"
                class="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg text-white">
                Prev
            </button>
            <span class="text-gray-300">Halaman {{ page }} dari {{ totalPages }}</span>
            <button @click="nextPage" :disabled="page === totalPages"
                class="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg text-white">
                Next
            </button>
        </div>
    </div>
</template>

<script setup>
import { useLocalStorage } from "@vueuse/core";
import { ref, computed, onBeforeMount } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { MngDel, UserDetail, UserList } from "../../lib/api/UserApi";
import { alertConfirm, alertError, alertSuccess } from "../../lib/alert";

const search = ref("");
const page = ref(1);
const perPage = 5;
const sortKey = ref("id");
const sortOrder = ref("asc");

const usersRaw = ref([{ username: "", name: "" }]);
const users = ref([]);
const token = useLocalStorage("token", "");
const currentUser = ref(null)
const router = useRouter();


// ambil data
async function fetchData() {
    const validate = await UserDetail(token.value)
    const validateBody = await validate.json()
    console.log(validateBody)

    if (validate.status === 200) {
        currentUser.value = validateBody.username
    } else {
        await alertError(validateBody.msg)
    }
    const response = await UserList(token.value, {
        username: usersRaw.username,
        name: usersRaw.name,
    });
    const responseBody = await response.json();
    console.log(responseBody);

    if (response.status === 200) {
        users.value = responseBody.filter(
            (u) => u.username !== currentUser.value
        );
    } else {
        await alertError(responseBody.msg);
    }
}

// Tambahkan nomor urut
const usersWithIndex = computed(() =>
    users.value.map((u, i) => ({
        ...u,
        no: i + 1
    }))
);

// Filtering
const filteredData = computed(() =>
    usersWithIndex.value.filter((u) =>
        u.username.toLowerCase().includes(search.value.toLowerCase())
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

async function handleDelete(username) {
    if (! await alertConfirm(`Apakah kamu yakin untuk menghapus user dengan nama ${username}`)) {
        return
    }
    const response = await MngDel(token.value, username)
    const responseBody = await response.json()
    console.log(responseBody)
    if (response.status === 200) {
        await alertSuccess(`Berhasil menghapus user dengan username ${username}`)
        await fetchData()
    } else {
        await alertError(responseBody.msg)
    }
}
onBeforeMount(async () => {
    await fetchData();
});
</script>
