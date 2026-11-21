import babel from '@rolldown/plugin-babel'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/, priority: 30 },
            { name: 'router', test: /node_modules[\\/]react-router[\\/]/, priority: 25 },
            { name: 'antd-icons', test: /node_modules[\\/]@ant-design[\\/]/, priority: 22 },
            { name: 'rc-vendor', test: /node_modules[\\/]@rc-component[\\/]/, priority: 20 },
            { name: 'antd', test: /node_modules[\\/]antd[\\/]/, priority: 15 },
            { name: 'dayjs', test: /node_modules[\\/]dayjs[\\/]/, priority: 10 },
          ],
        },
      },
    },
  },
})
