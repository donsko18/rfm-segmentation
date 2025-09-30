<template>
    <div class="flex items-center mb-6">
        <RouterLink to="/dashboard/management-user"
            class="text-blue-400 hover:text-blue-300 mr-4 flex items-center transition-colors duration-200">
            <i class="fas fa-arrow-left mr-2"></i> Back to User Management
        </RouterLink>
    </div>

    <div
        class="bg-gray-800 bg-opacity-80 rounded-xl shadow-custom border border-gray-700 overflow-hidden max-w-2xl mx-auto animate-fade-in">
        <div class="p-8">
            <form @submit.prevent="handleChange">
                <!-- Judul -->
                <div class="flex items-center mb-5">
                    <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3 shadow-md">
                        <i class="fas fa-user-edit text-white"></i>
                    </div>
                    <h2 class="text-xl font-semibold text-white">Tambah akun baru</h2>
                </div>

                <!-- Username -->
                <div class="mb-5">
                    <label class="block text-gray-300 text-sm font-medium mb-2">Username</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fas fa-user-circle text-gray-500"></i>
                        </div>
                        <input type="text" id="username" name="username" placeholder="Enter username" required
                            v-model="detail.username"
                            @input="detail.username = detail.username.replace(/\s/g, '').toLowerCase()"
                            class="w-full pl-10 pr-3 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
                    </div>
                </div>

                <!-- Full Name -->
                <div class="mb-5">
                    <label class="block text-gray-300 text-sm font-medium mb-2">Nama</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fas fa-user-tag text-gray-500"></i>
                        </div>
                        <input type="text" id="name" name="name" placeholder="Enter full name" required
                            v-model="detail.name"
                            class="w-full pl-10 pr-3 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
                    </div>
                </div>

                <!-- Password -->
                <div class="mb-5">
                    <label class="block text-gray-300 text-sm font-medium mb-2">Password</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fas fa-key text-gray-500"></i>
                        </div>
                        <input type="password" id="password" name="password" placeholder="Enter password"
                            v-model="password.password" required
                            class="w-full pl-10 pr-3 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
                    </div>
                </div>

                <!-- Tombol -->
                <div class="flex justify-end space-x-4">
                    <RouterLink to="/dashboard/management-user"
                        class="px-5 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 flex items-center shadow-md">
                        <i class="fas fa-times mr-2"></i> Cancel
                    </RouterLink>
                    <button type="submit"
                        class="px-5 py-3 bg-gradient text-white rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 font-medium shadow-lg transform hover:-translate-y-0.5 flex items-center">
                        <i class="fas fa-save mr-2"></i> Save Changes
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { useLocalStorage } from '@vueuse/core'
import { MngCreate } from '../../lib/api/UserApi'
import { reactive } from 'vue'
import { alertError, alertSuccess } from '../../lib/alert'
import { useRouter } from 'vue-router'

const detail = reactive({
    username: '',
    name: ''
})

const password = reactive({
    password: ''
})

const token = useLocalStorage("token", "")
const router = useRouter()
async function handleChange() {
    const response = await MngCreate(token.value, {
        username: detail.username,
        password: password.password,
        name: detail.name,
    })
    const responseBody = await response.json()

    if (response.status === 200) {
        alertSuccess(`Berhasil menambah pengguna baru dengan username ${detail.username}`)
        await router.push({
            path: "/dashboard/management-user"
        })
    } else {
        await alertError(responseBody.msg)
        detail.username = "";
        password.password = "";
        detail.name = "";
    }
}

</script>