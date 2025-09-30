<template>
    <div
        class="animate-fade-in bg-gray-800 bg-opacity-80 p-8 rounded-xl shadow-custom border border-gray-700 backdrop-blur-sm w-full max-w-md">
        <div class="text-center mb-8">
            <div class="inline-block p-2 bg-gradient rounded-full mb-2 shadow-lg">
                <img src="../../assets/logo.png" alt="Machine Learning Icon" class="w-40 h-40" />
            </div>
            <h1 class="text-3xl font-bold text-white">Machine Learning</h1>
            <small class="text-xs text-white">with prophet algorithm</small>
        </div>

        <form v-on:submit.prevent="handleSubmit">
            <div class="text-center">
                <p class="text-gray-300 mt-2">Sign in to your account</p>
            </div>
            <div class="mb-5">
                <label for="username" class="block text-gray-300 text-sm font-medium mb-2">Username</label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fas fa-user text-gray-500"></i>
                    </div>
                    <input type="text" id="username" name="username"
                        class="w-full pl-10 pr-3 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="Enter your username" required v-model="user.username">
                </div>
            </div>

            <div class="mb-6">
                <label for="password" class="block text-gray-300 text-sm font-medium mb-2">Password</label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fas fa-lock text-gray-500"></i>
                    </div>
                    <input type="password" id="password" name="password"
                        class="w-full pl-10 pr-3 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="Enter your password" required v-model="user.password">
                </div>
            </div>

            <div class="mb-6">
                <button type="submit"
                    class="w-full bg-gradient text-white py-3 px-4 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 font-medium shadow-lg transform hover:-translate-y-0.5">
                    <i class="fas fa-sign-in-alt mr-2"></i> Sign In
                </button>
            </div>

            <!-- <div class="text-center text-sm text-gray-400">
                Don't have an account?
                <RouterLink to="/register"
                    class="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200">Sign up
                </RouterLink>
            </div> -->
        </form>
    </div>
</template>

<script setup>
import { useLocalStorage } from '@vueuse/core';
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { UserLogin } from '../../lib/api/UserApi';
import { alertError, alertSuccess } from '../../lib/alert';

const token = useLocalStorage("token", "")
const user = reactive({
    username: "",
    password: "",
})

const router = useRouter()

async function handleSubmit() {
    const response = await UserLogin(user)
    const responseBody = await response.json()
    console.log(responseBody)
    if(response.status === 200){
        token.value = responseBody.token;
        await alertSuccess("Anda berhasil masuk!")
        await router.push({
            path:"/dashboard/main"
        })
    }else{
        await alertError(responseBody.msg)
    }
}
</script>

<style lang="scss" scoped></style>