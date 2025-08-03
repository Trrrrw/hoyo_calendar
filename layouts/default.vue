<script setup lang="ts">
</script>

<template>
    <a-layout style="background-color: #ffffff;">
        <a-layout-content style="min-height: 100vh;">
            <slot />
        </a-layout-content>
        <a-layout-footer style="background-color: #fafafa;">
            <Footer />
        </a-layout-footer>
    </a-layout>
</template>
