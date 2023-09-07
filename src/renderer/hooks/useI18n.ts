import { useI18n as vueUseI18n } from 'vue-i18n';

import type enUS from '../locales/en-US.json';
import type zhCN from '../locales/zh-CN.json';

interface I18nOptions {
  messages: {
    'zh-CN': typeof zhCN;
    'en-US': typeof enUS;
  };
}

export function useI18n() {
  return vueUseI18n<I18nOptions>();
}
