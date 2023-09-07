import { app } from 'electron';

import i18next from 'i18next';
import type { LanguageDetectorModule, Resource } from 'i18next';

import en_US from './en-US/translation.json';
import ja_JP from './ja-JP/translation.json';
import ko_KR from './ko-KR/translation.json';
import zh_CN from './zh-CN/translation.json';
import setting from '../setting';
import { AppEnv } from '../utils/env';
import log from '../utils/logger';

const logger = log.scope('Locales');

const resources: Resource = AppEnv.IS_INTERNATIONAL_EDITION
  ? {
      'zh-CN': {
        translation: zh_CN,
      },
      'en-US': {
        translation: en_US,
      },
      'ko-KR': {
        translation: ko_KR,
      },
      'ja-JP': {
        translation: ja_JP,
      },
    }
  : {
      'zh-CN': {
        translation: zh_CN,
      },
      'en-US': {
        translation: en_US,
      },
    };

function getPreferredSystemLanguage() {
  if (AppEnv.IS_INTERNATIONAL_EDITION) {
    return 'en-US';
  } else if (setting.store.language) {
    return setting.store.language;
  } else {
    const preferLanguage = app.getPreferredSystemLanguages()[0] || '';
    if (preferLanguage.includes('zh')) {
      return 'zh-CN';
    } else if (preferLanguage.includes('en')) {
      return 'en-US';
    } else {
      return 'en-US';
    }
  }
}

const languageDetectorPlugin: LanguageDetectorModule = {
  type: 'languageDetector',
  init: () => {
    logger.info(`LocalSettingLanguage: ${setting.store.language}`);
    logger.info(`PreferredSystemLanguages: ${app.getPreferredSystemLanguages()}`);
  },
  detect: () => {
    logger.info(`IsInternationalEdition: ${AppEnv.IS_INTERNATIONAL_EDITION}`);
    logger.info(`PreferredSystemLanguage: ${getPreferredSystemLanguage()}`);
    return setting.store.language || getPreferredSystemLanguage();
  },
  cacheUserLanguage: (lng) => {
    if (langList.includes(lng)) {
      setting.set('language', lng);
    } else if (i18next.resolvedLanguage) {
      setting.set('language', i18next.resolvedLanguage);
    }
  },
};

export const defaultNS = 'translation';

export const langList = Object.keys(resources);

export function initLocales() {
  return i18next.use(languageDetectorPlugin).init({
    debug: AppEnv.ENABLE_DEVTOOLS,
    defaultNS,
    resources,
  });
}
