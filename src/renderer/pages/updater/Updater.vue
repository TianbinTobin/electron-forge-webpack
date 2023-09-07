<template>
  <div ref="updaterRef" class="app-updater">
    <div class="app-updater-close" @click="onClose">
      <SvgIcon :size="24" :src="require('../../assets/icons/close-btn.svg')" />
    </div>
    <div class="app-updater-title">{{ t('版本更新') }}</div>
    <div v-if="updateStatus > Status.Checking" class="app-updater-version">
      <span>{{ t('boardmix版本号') }}: </span>
      <span>{{ version }}</span>
    </div>
    <div class="app-update-body">
      <div v-if="updateStatus > Status.Checking" class="app-updater-notes">
        <template v-if="releaseNotes.length">
          <div class="app-updater-notes-label">{{ t('本次更新') }}</div>
          <div class="app-updater-notes-content">
            <ul class="app-updater-notes-content-ul">
              <li v-for="(item, index) in releaseNotes" :key="index" class="app-updater-notes-content-li">
                {{ item }}
              </li>
            </ul>
          </div>
        </template>
      </div>
      <div class="app-updater-download">
        <div v-if="updateStatus === Status.Checking" class="app-updater-latest">
          <span>{{ t('正在检查更新...') }}</span>
        </div>
        <div v-if="updateStatus === Status.IsLatest" class="app-updater-latest">
          <span>{{ t('已经是最新版本，无需升级') }}</span>
        </div>
        <template v-if="updateStatus === Status.NeedUpdate">
          <div class="app-updater-download-container">
            <span>{{ t('检测到可用更新') }}</span>
          </div>
          <div class="ed-button__primary app-updater-download-button-text" @click="startToDownload">
            {{ t('开始下载') }}
          </div>
        </template>
        <template v-if="updateStatus === Status.Downloading">
          <div class="app-updater-download-container">
            <SvgIcon class="app-updater-download-loading" :size="22" :src="require('../../assets/icons/loading.svg')" />
            <span>{{ t('下载进度') }}</span>
            <span>{{ percent }}</span>
          </div>
          <div class="ed-button__primary app-updater-download-button-base" @click="cancelToDownload">
            {{ t('取消下载') }}
          </div>
        </template>
        <template v-if="updateStatus === Status.Downloaded">
          <div class="app-updater-download-container">
            <span>{{ t('下载完成') }}</span>
          </div>
          <div class="ed-button__primary app-updater-download-button-base" @click="startToSetup">
            {{ t('开始安装') }}
          </div>
        </template>
        <template v-if="updateStatus === Status.DownloadFailed">
          <div class="app-updater-download-container">
            <span>{{ t('下载失败，请重新下载') }}</span>
          </div>
          <div class="ed-button__primary app-updater-download-button-base" @click="restartToDownload">
            {{ t('重新下载') }}
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onBeforeMount } from 'vue';
import { useI18n } from '../../hooks/useI18n';
import SvgIcon from '../../components/SvgIcon.vue';

enum Status {
  None,
  Checking,
  IsLatest,
  NeedUpdate,
  Downloading,
  Downloaded,
  DownloadFailed,
}

onBeforeMount(() => {
  appManagerAPI.autoUpdaterRun('init-updater');
  appManagerAPI.getSystemLang().then((lang: 'zh-CN' | 'en-US') => {
    locale.value = lang;
  });
});

const { t, locale } = useI18n();

const version = ref('');
const percent = ref('0%');
const updateStatus = ref(Status.None);
const releaseNotes = ref<string[]>([]);
const updaterRef = ref<HTMLDivElement>();

window.addEventListener('message', (event) => {
  if (!event.data.message || event.data.message !== 'update-for-client') {
    return;
  }
  const status: Status = event.data.data.status;

  updateStatus.value = status;

  // if (updateInfo) {
  //   updateReleaseNotes(updateInfo);
  // }

  // if (progressInfo) {
  //   percent.value = progressInfo.percent.toFixed(2) + '%';
  // }

  resetWindowSize();
});

function onClose() {
  appManagerAPI.closeUpdater();
}

function startToDownload() {
  appManagerAPI.autoUpdaterRun('start-to-download');
}
function cancelToDownload() {
  appManagerAPI.autoUpdaterRun('cancel-to-download');
}
function startToSetup() {
  appManagerAPI.autoUpdaterRun('start-to-setup');
}
function restartToDownload() {
  appManagerAPI.autoUpdaterRun('restart-to-download');
}

function resetWindowSize() {
  nextTick(() => {
    if (updaterRef.value) {
      const { clientWidth, clientHeight } = updaterRef.value;
      appManagerAPI.autoUpdaterRun('reset-window-size', { width: clientWidth, height: clientHeight });
    }
  });
}

// function updateReleaseNotes() {
//   version.value = updateInfo.version;
//   if (!updateInfo.releaseNotes) {
//     return;
//   }
//   if (typeof updateInfo.releaseNotes === 'string') {
//     releaseNotes.value = updateInfo.releaseNotes.split('\n').filter((item) => !!item);
//   } else {
//     releaseNotes.value = updateInfo.releaseNotes.map((item) => item.note || '');
//   }
// }
</script>

<style lang="scss" scoped>
.ed-button__primary {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  min-width: 56px;
  height: 32px;
  padding: 0 12px;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  user-select: none;
  border-radius: 6px;
  background-color: #565dff;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
}

.app-updater {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 298px;
  padding: 24px 24px 24px;
  overflow: hidden;
  background-color: #ffffff;
  box-shadow: 0px 5px 15px 25px rgba(0, 0, 0, 0.1);
  -webkit-app-region: drag;
}

.app-updater * {
  -webkit-app-region: no-drag;
}

.app-updater-close {
  position: absolute;
  right: 20px;
  top: 20px;
  cursor: pointer;
}

.app-updater-title {
  font-size: 16px;
  font-weight: 600;
  line-height: 22px;
}

.app-updater-version {
  margin-top: 24px;
  color: rgba(0, 0, 0, 0.5);
  font-size: 14px;
  line-height: 20px;
}

.app-update-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.app-updater-notes {
  flex: 1;
  margin-top: 12px;
  color: #000;
  font-size: 14px;
  line-height: 20px;
}

.app-updater-notes-content {
  margin-top: 10px;
  white-space: pre-wrap;
}

.app-updater-notes-content-ul {
  margin-left: 15px;
  list-style: none;
}

.app-updater-notes-content-li {
  line-height: 24px;
}

.app-updater-download {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 24px;
}

.app-updater-download-container {
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(0, 0, 0, 0.5);
  font-size: 12px;
}

.app-updater-download-button-text {
  border-radius: 6px;
}

.app-updater-download-button-base {
  color: #000;
  border-radius: 6px;
  background-color: #fff;
  border: 1px solid rgba(6, 6, 31, 0.1);
}

.app-updater-latest {
  color: #000;
  font-size: 14px;
  text-align: center;
}

@keyframes animation_rotate_clockwise {
  0% {
    transform: rotate(0);
  }

  100% {
    transform: rotate(360deg);
  }
}

.app-updater-download-loading {
  margin-right: 5px;
  transform: rotate(0);
  animation: animation_rotate_clockwise 1.5s linear infinite;
}
</style>
