<script setup lang="ts">
import Footer from './components/Footer.vue'
import { copyText } from './utils/copyText'
import { fetchGameList, fetchEventTypes } from './utils/useData'
import { CopyOutlined } from '@ant-design/icons-vue'
import { h, ref, onMounted } from 'vue'

const activeKey = ref(['1']);

const handleClick = async (event: MouseEvent, game_name: string, data_types: string) => {
  // If you don't want click extra trigger collapse, you can prevent this:
  event.stopPropagation();
  const ics_url = `${window.location.origin}/api/${game_name}/${data_types}.ics`
  await copyText(ics_url, `复制成功：${game_name}${data_types ? ' - ' + data_types : ''}`)
};

const games_data = ref<{ name: string, data_types: string[] }[]>([])
onMounted(async () => {
  const game_list = await fetchGameList();
  for (const game of game_list) {
    const event_types = await fetchEventTypes(game.name);
    game.data_types = event_types.map((item: any) => item.name);
  }
  games_data.value = game_list;
  console.log(game_list)
})
</script>

<template>
  <a-layout style="background-color: #ffffff;">
    <a-layout-content style="min-height: 100vh;">
      <a-flex vertical gap="middle" style="max-width: 800px; margin: 20px auto;">
        <a-card>
          <template #cover>
            <img src="/banner.webp" alt="banner" loading="eager" />
          </template>
          <a-card-meta title="米哈游游戏日历订阅">
            <template #description>自动同步《原神》《星穹铁道》《绝区零》的官方活动日程到您的日历应用</template>
          </a-card-meta>
        </a-card>
        <a-collapse v-model:activeKey="activeKey">
          <a-collapse-panel v-for="game in games_data" :key="game.name" :header="game.name">
            <a-list size="small">
              <a-list-item v-for="data_type in game.data_types">
                <a-list-item-meta :title="data_type"></a-list-item-meta>
                <template #actions>
                  <a-button :icon="h(CopyOutlined)" @click="(event) => handleClick(event, game.name, data_type)" />
                </template>
              </a-list-item>
            </a-list>
          </a-collapse-panel>
        </a-collapse>
      </a-flex>
    </a-layout-content>
    <a-layout-footer style="background-color: #fafafa;">
      <Footer />
    </a-layout-footer>
  </a-layout>
</template>

<style scoped></style>
