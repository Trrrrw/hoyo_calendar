<script lang="ts" setup>
import { CopyOutlined } from '#components';
import games_data from '~/assets/data/data.json'
import { copyText } from '~/utils/copyText';

const switch_checked = ref<boolean>(false);
const activeKey = ref(['1']);

const handleClick = async (event: MouseEvent, game_name: string, ann_type: string = '') => {
    // If you don't want click extra trigger collapse, you can prevent this:
    event.stopPropagation();
    const ics_url = `${window.location.origin}/ics${switch_checked.value ? '/continuous' : ''}/${game_name}${ann_type ? '/' + ann_type : ''}.ics`
    await copyText(ics_url, `复制成功：${game_name}${ann_type ? ' - ' + ann_type : ''}`)
};
</script>

<template>
    <a-flex vertical gap="middle" style="max-width: 800px; margin: 20px auto;">
        <a-card>
            <template #cover>
                <img src="~/assets/img/banner.webp" alt="banner" loading="eager" />
            </template>
            <a-card-meta title=" 米哈游游戏日历订阅">
                <template #description>自动同步《原神》《星穹铁道》《绝区零》的官方活动日程到您的日历应用</template>
            </a-card-meta>
        </a-card>
        <a-list size="small" bordered>
            <a-list-item>
                <template #actions>
                    <a-switch v-model:checked="switch_checked" />
                </template>
                是否使用带结束日期的事件
                <a-tooltip title="默认所有事件都没有结束时间，结束时间会单独创建一个事件">
                    <QuestionCircleOutlined />
                </a-tooltip>
            </a-list-item>
        </a-list>
        <a-collapse v-model:activeKey="activeKey">
            <a-collapse-panel v-for="game in games_data.games" :key="game.weight" :header="game.name">
                <a-list size="small">
                    <a-list-item v-for="ann_type in games_data.ann_types">
                        <a-list-item-meta :title="ann_type"></a-list-item-meta>
                        <template #actions>
                            <a-button :icon="h(CopyOutlined)"
                                @click="(event) => handleClick(event, game.name, ann_type)" />
                        </template>
                    </a-list-item>
                </a-list>
                <template #extra><a-button :icon="h(CopyOutlined)"
                        @click="(event) => handleClick(event, game.name)" /></template>
            </a-collapse-panel>
        </a-collapse>
    </a-flex>
</template>
