import { ref, onMounted, onUnmounted } from 'vue';

/**
 * 监听系统主题变化
 */
export function useDarkTheme() {
    const isDark = ref(false);

    function updateTheme() {
        isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    onMounted(() => {
        updateTheme();
        window.matchMedia('(prefers-color-scheme: dark)').addListener(updateTheme);
    });

    onUnmounted(() => {
        window.matchMedia('(prefers-color-scheme: dark)').removeListener(updateTheme);
    });

    return {
        isDark
    };
}