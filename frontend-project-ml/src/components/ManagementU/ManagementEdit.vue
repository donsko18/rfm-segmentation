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
            <form v-on:submit.prevent="handleChange">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <div class="flex items-center mb-4">
                        <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3 shadow-md">
                            <i class="fas fa-user-edit text-white"></i>
                        </div>
                        <h2 class="text-xl font-semibold text-white">Edit Profile {{ detail.username }}</h2>
                    </div>

                </div>
                <div class="mb-5">
                    <label for="last_name" class="block text-gray-300 text-sm font-medium mb-2">Nama</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fas fa-user-tag text-gray-500"></i>
                        </div>
                        <input type="text" id="last_name" name="last_name"
                            class="w-full pl-10 pr-3 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            placeholder="Enter last name" required v-model="detail.name">
                    </div>
                </div>
                <div class="mb-5">
                    <label for="email" class="block text-gray-300 text-sm font-medium mb-2">New Password</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fas fa-key text-gray-500"></i>
                        </div>
                        <input type="password" id="password" name="password"
                            class="w-full pl-10 pr-3 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            placeholder="Enter new password" v-model="password.password">
                    </div>
                </div>

                <div class="mb-6">
                    <label for="phone" class="block text-gray-300 text-sm font-medium mb-2">Confirm Password</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fas fa-key text-gray-500"></i>
                        </div>
                        <input type="password" id="confirm_password" name="confirm_password"
                            class="w-full pl-10 pr-3 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            placeholder="Enter confirm password" v-model="password.confirm_password">
                    </div>
                </div>

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
import { useLocalStorage } from '@vueuse/core';
import { MngUpdate, MngUpdateName, UserDetailMng } from '../../lib/api/UserApi';
import { onBeforeMount, reactive, ref } from 'vue';
import { alertError, alertSuccess } from '../../lib/alert';
import { useRoute } from 'vue-router';

const detail = reactive({
    username: "",
    name: "",
})

const password = reactive({
    password: "",
    confirm_password: ""
})
const route = useRoute()
const { username } = route.params
const token = useLocalStorage("token", "")

async function handleChange() {
    if (password.password === "" || password.confirm_password === "") {
        const response = await MngUpdateName(token.value, username, {
            name: detail.name
        })
        const responseBody = await response.json()
        console.log(responseBody)
        if (response.status === 200) {
            alertSuccess("Nama user berhasil di perbaharui")
        } else {
            await alertError(responseBody.msg)
        }
    } else if (password.confirm_password !== password.password) {
        await alertError("Password baru tidak sama dengan password konfirmasinya!")
    } else {
        const response = await MngUpdate(token.value, username, {
            name: detail.name,
            password: password.password
        })
        const responseBody = await response.json()
        console.log(responseBody)

        if (response.status === 200) {
            alertSuccess("Nama dan password user berhasil di perbaharui!")
            password.password = ""
            password.confirm_password = ""
        } else {
            await alertError(responseBody.msg)
        }
    }
}

async function fetchData() {
    const response = await UserDetailMng(token.value, username)
    const responseBody = await response.json()
    console.log(responseBody)

    if (response.status === 200) {
        detail.username = responseBody.username
        detail.name = responseBody.name
    } else {
        await alertError(responseBody.msg)
    }
}
onBeforeMount(async () => {
    await fetchData()
})
</script>

<style lang="scss" scoped></style>