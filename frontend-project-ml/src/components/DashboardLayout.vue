<template>
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen flex flex-col">
        <!-- Header with right-aligned menu -->
        <header class="bg-gradient shadow-lg">
            <div class="container mx-auto px-4 py-4 flex justify-between items-center">
                <RouterLink to="/dashboard/main"
                    class="flex items-center hover:opacity-90 transition-opacity duration-200">
                    <img src="../assets/logo.png" alt="Machine Learning Icon" class="w-10 h-10" />
                    <div class="text-white font-bold text-xl">Machine Learning</div>
                </RouterLink>
                <nav>
                    <ul class="flex space-x-6">
                        <li>
                            <RouterLink to="/dashboard/datasets-management"
                                class="text-gray-100 hover:text-white flex items-center transition-colors duration-200">
                                <i class="fas fa-database mr-2"></i>
                                <span>Manajemen Dataset</span>
                            </RouterLink>
                        </li>
                        <li>
                            <RouterLink to="/dashboard/modelling"
                                class="text-gray-100 hover:text-white flex items-center transition-colors duration-200">
                                <i class="fas fa-gear mr-2"></i>
                                <span>Modelling</span>
                            </RouterLink>
                        </li>
                        <li>
                            <RouterLink to="/dashboard/management-user"
                                class="text-gray-100 hover:text-white flex items-center transition-colors duration-200">
                                <i class="fas fa-user-cog mr-2"></i>
                                <span>Management User</span>
                            </RouterLink>
                        </li>
                        <li>
                            <RouterLink to="/dashboard/users/profile"
                                class="text-gray-100 hover:text-white flex items-center transition-colors duration-200">
                                <i class="fas fa-user-circle mr-2"></i>
                                <span>Profile</span>
                            </RouterLink>
                        </li>
                        <li>
                            <RouterLink to="/logout"
                                class="text-gray-100 hover:text-white flex items-center transition-colors duration-200">
                                <i class="fas fa-sign-out-alt mr-2"></i>
                                <span>Logout</span>
                            </RouterLink>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>

        <!-- Main content -->
        <main class="container mx-auto px-4 py-8 flex-grow">

            <RouterView />
            <!-- Footer -->
            <div class="mt-10 mb-6 text-center text-gray-400 text-sm animate-fade-in">
                <p>© 2025 Donnie Varyasetya Prastowo. All rights reserved.</p>
            </div>
        </main>
    </div>
</template>

<script setup>
</script>

<style lang="scss" scoped></style>