import { createApp } from 'vue';

import { createI18n } from 'vue-i18n';

import './styles/index.scss';
import './styles/variable.scss';

import App from './App.vue';
import enUS from './locales/en-US.json';
import jaJP from './locales/ja-JP.json';
import koKR from './locales/ko-KR.json';
import zhCN from './locales/zh-CN.json';
import { router } from './router';

const messages = {
  'en-US': enUS,
  'ja-JP': jaJP,
  'ko-KR': koKR,
  'zh-CN': zhCN,
};

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages,
});

createApp(App).use(router).use(i18n).mount('#app');
