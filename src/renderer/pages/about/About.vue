<template>
  <div class="about">
    <div class="about-close" @click="onClose">
      <SvgIcon :size="24" :src="require('../../assets/icons/close-btn.svg')" />
    </div>
    <div class="about-logo">
      <SvgIcon :width="151" :height="48" :src="require('../../assets/icons/product-logo.svg')" />
    </div>
    <div class="about-content">
      <div class="about-content--release">
        <div class="about-content--release-version">
          <span>{{ t('软件版本') }}：</span>
          <span>{{ clientInfo.version }}</span>
        </div>
        <div class="about-content--release-time">
          <span>{{ t('发布时间') }}：</span>
          <span>{{ clientInfo.time }}</span>
        </div>
      </div>
      <div class="about-content--client">
        <div class="about-content--client-version">
          <span>{{ t('客户端版本') }}：</span>
          <span>{{ releaseInfo.version }}</span>
        </div>
        <div class="about-content--client-time">
          <span>{{ t('发布时间') }}：</span>
          <span>{{ releaseInfo.time }}</span>
        </div>
      </div>
      <div class="about-content--text">
        <p>
          {{ t('公司简介') }}
        </p>
        <br />
        <p>{{ t('了解更多') }}</p>
        <p>
          <a :href="homePage" target="_blank" class="about-content--link"> {{ t('公司官网') }} </a>
        </p>
      </div>
    </div>
    <div class="about-footer">
      <div class="about-footer--text">{{ t('版权信息') }}</div>
      <div class="about-footer--img">
        <img src="../../assets/images/company-logo.png" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { onBeforeMount, reactive } from 'vue';
import { useI18n } from '../../hooks/useI18n';
import SvgIcon from '../../components/SvgIcon.vue';

onBeforeMount(() => {
  initSystemLang();
  initVersionInfo();
});

const { t, locale } = useI18n();

const boardDomain = process.env.DEFINE_APP_DOMAIN;
const homePage = `https://${boardDomain}/`;
const clientInfo = reactive({ time: '', version: '' });
const releaseInfo = reactive({ time: '', version: '' });

function onClose() {
  appManagerAPI.closeAbout();
}

async function initSystemLang() {
  const lang = await appManagerAPI.getSystemLang();
  locale.value = lang as 'zh-CN' | 'en-US';
}

async function initVersionInfo() {
  const versionInfo = await appManagerAPI.getVersionInfo();
  clientInfo.time = dayjs(versionInfo.webTime).format('YYYY-MM-DD');
  releaseInfo.time = dayjs(versionInfo.buildTime).format('YYYY-MM-DD');
  clientInfo.version = versionInfo.webVersion;
  releaseInfo.version = versionInfo.buildVersion;
}
</script>

<style lang="scss" scoped>
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-thumb {
  background: #e8e8ef;
  background-clip: padding-box;
  border: 1.5px solid transparent;
  border-radius: 4px;
}

::-webkit-scrollbar-track-piece {
  background-color: transparent;
  border-radius: 0;
}
.about {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 40px;
  overflow: auto;
  background-color: #ffffff;
  box-shadow:
    0 0 15px rgba(0, 0, 0, 0.2),
    0px 15px 25px rgba(0, 0, 0, 0.28);
  -webkit-app-region: drag;

  * {
    -webkit-app-region: no-drag;
  }

  .about-logo {
    margin-bottom: 10px;
  }

  .about-content {
    flex: 1;
    line-height: 24px;
  }

  .about-content--release {
    margin-bottom: 5px;
    line-height: 24px;
    font-weight: 700;
    font-size: 18px;

    .about-content--release-version {
      display: inline-block;
      margin-right: 20px;
    }

    .about-content--release-time {
      display: inline-block;
    }
  }

  .about-content--client {
    margin-bottom: 16px;
    line-height: 24px;
    font-weight: 500;
    font-size: 14px;

    .about-content--client-version {
      display: inline-block;
      margin-right: 28px;
    }

    .about-content--client-time {
      display: inline-block;
    }
  }

  .about-content--text {
    font-size: 14px;
    line-height: 20px;
  }

  .about-content--link {
    color: #409cff;
    text-decoration: none;
  }

  .about-close {
    position: fixed;
    right: 20px;
    top: 20px;
    font-size: 0px;
    cursor: pointer;
  }

  .about-footer {
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }

  .about-footer--text {
    font-size: 12px;
    line-height: 24px;
    color: rgba(0, 0, 0, 0.48);
  }

  .about-footer--img {
    width: 271px;
  }
}
</style>
