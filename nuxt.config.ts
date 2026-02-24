// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    modules: ['@ant-design-vue/nuxt'],
    css: ['~/assets/css/custon.scss'],
    routeRules: {
        '/api/**/*.ics': {
            ssr: false,
            headers: { 'x-skip-nuxt': 'true' }
        }
    }
})