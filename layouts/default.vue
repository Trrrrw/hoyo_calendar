<script setup lang="ts">
</script>

<template>

    <Head>
        <Title>米哈游游戏日历订阅</Title>
        <Meta name="description" content="自动同步《原神》《星穹铁道》《绝区零》的官方活动日程到您的日历应用" />
    </Head>
    <a-layout style="background-color: #ffffff;">
        <a-layout-content style="min-height: 100vh;">
            <slot />
        </a-layout-content>
        <a-layout-footer style="background-color: #fafafa;">
            <Footer />
        </a-layout-footer>
    </a-layout>
</template>
