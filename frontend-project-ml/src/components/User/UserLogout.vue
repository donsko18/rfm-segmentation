<template>
    <div>

    </div>
</template>

<script setup>
import { useLocalStorage } from '@vueuse/core';
import { alertConfirm, alertError, alertSuccess } from '../../lib/alert';
import { UserLogout } from '../../lib/api/UserApi';
import { onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';

const token = useLocalStorage("token", "")
const router = useRouter()
async function handleLogout() {
    if (! await alertConfirm("Apakah kamu yakin untuk keluar dari sistem?")) {
        return await router.push({
            path: "/dashboard"
        })
    }
    const response = await UserLogout(token.value)
    const responseBody = await response.json()
    console.log(responseBody);

    if (response.status === 200) {
        alertSuccess("anda berhasil keluar dari sistem")
        token.value = ""
        await router.push({
            path: "/login"
        })
    } else {
        await alertError(responseBody.msg)
    }
}

onBeforeMount(async () => {
    await handleLogout()
})
</script>

<style lang="scss" scoped></style>