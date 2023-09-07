<template>
  <div class="header-container" :class="{ 'header-mac': isMac }">
    <div class="header-tabs">
      <div class="header-tabs--wrap">
        <div class="header-tabs--drag"></div>
        <ul ref="sortableRef" class="header-tabs--ul">
          <li
            class="tab-item--home"
            :class="{ 'tab-item__active': appMainStatus.isHomeActive }"
            @click="showHomepage"
            @contextmenu="showHomepageContextMenu"
          >
            <SvgIcon class="tab_item--left" :size="8" :src="require('../../assets/icons/icon_tab_left.svg')" />
            <a class="tab_item--link">
              <div class="tab_item--menu">
                <SvgIcon class="tab_item--icon" :size="24" :src="require('../../assets/icons/icon_home.svg')" />
              </div>
            </a>
            <SvgIcon class="tab_item--right" :size="8" :src="require('../../assets/icons/icon_tab_right.svg')" />
          </li>
          <HeaderSortTab
            v-for="item in tabList"
            :id="item.id"
            :key="item.id"
            :title="item.title"
            :data-id="item.id"
            :is-active="item.isActive"
            @click="handleShowTab(item.id)"
            @on-close="handleCloseTab(item.id)"
            @contextmenu="handleShowTabContextMenu(item.id)"
          />
          <div class="tab-item--plus" @click="handleOpenNewTab">
            <SvgIcon class="tab_item--icon" :size="28" :src="require('../../assets/icons/icon_add.svg')" />
          </div>
        </ul>
      </div>
    </div>
    <div class="header-fill" @dblclick="handleHeaderDbClick"></div>
    <div class="header-menu">
      <div class="header-menu--btn" @click="handleAppRefresh">
        <SvgIcon :size="28" :src="require('../../assets/icons/icon_refresh.svg')" />
      </div>
      <div
        class="header-menu--list"
        :class="{ 'menu-hover': menuHovered }"
        @click="handleAppMenu"
        @mouseenter="onMenuMouseenter"
        @mouseleave="onMenuMouseleave"
      >
        <SvgIcon :size="28" :src="require('../../assets/icons/icon_menu.svg')" />
      </div>
      <template v-if="!isMac">
        <div class="header-menu--btn" @click="handleToggleMinimize">
          <SvgIcon :size="28" :src="require('../../assets/icons/icon_minimize.svg')" />
        </div>
        <div class="header-menu--btn" @click="handleToggleMaximize">
          <SvgIcon v-if="appMainStatus.isMaximized" :size="28" :src="require('../../assets/icons/icon_window.svg')" />
          <SvgIcon v-else :size="28" :src="require('../../assets/icons/icon_maximize.svg')" />
        </div>
        <div class="header-menu--btn header-menu--close" @click="handleClose">
          <SvgIcon :size="28" :src="require('../../assets/icons/icon_close.svg')" />
        </div>
      </template>
    </div>
  </div>
  <div v-if="showError" class="loading-body">
    <Error />
  </div>
  <div v-else-if="showLoading" class="loading-body">
    <Loading />
  </div>
</template>

<script setup lang="ts">
import SortableJS from 'sortablejs';
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue';
import Error from '../../components/Error.vue';
import Loading from '../../components/Loading.vue';
import SvgIcon from '../../components/SvgIcon.vue';
import { useTabSize } from '../../hooks/useTabSize';
import HeaderSortTab from './HeaderSortTab.vue';

const { initAutoResizeTab } = useTabSize();

const showError = ref(false);
const showLoading = ref(true);
const isDragging = ref(false);
const menuHovered = ref(false);
const tabList = ref<TabInfo[]>([]);
const sortable = ref<SortableJS>();
const sortableRef = ref<HTMLElement>();
const appMainStatus = reactive({ isMaximized: false, isFullScreen: false, isHomeActive: false });

const appManagerAPI = window.appManagerAPI;
const isMac = Boolean(appManagerAPI?.platform.isMac);

onMounted(() => {
  initSortable();
  initAutoResizeTab();
  window.addEventListener('message', handleParseMessage);
  window.appManagerAPI && window.appManagerAPI.init();
});

onBeforeUnmount(() => {
  sortable.value?.destroy();
  window.removeEventListener('message', handleParseMessage);
});

function initSortable() {
  if (sortableRef.value) {
    sortable.value = new SortableJS(sortableRef.value, {
      draggable: '.sort-tab--sortable',
      animation: 200,
      forceFallback: true,
      fallbackOnBody: true,
      fallbackTolerance: 5,
      touchStartThreshold: 5,
      filter: '.tab-ignore-sortable',
      dragClass: 'sortable-drag--visible',
      ghostClass: 'sortable-ghost--hidden',
      onStart() {
        isDragging.value = true;
      },
      onEnd() {
        isDragging.value = false;
      },
      onSort(event) {
        const { oldIndex, newIndex } = event;
        if (typeof oldIndex === 'number' && typeof newIndex === 'number') {
          const deleteList = tabList.value.splice(oldIndex - 1, 1);
          tabList.value.splice(newIndex - 1, 0, deleteList[0]);
        }
      },
    });
  }
}

function onMenuMouseenter() {
  menuHovered.value = true;
}

function onMenuMouseleave() {
  menuHovered.value = false;
}

function handleHeaderDbClick() {
  if (!isMac) {
    return;
  }
  handleToggleMaximize();
}

function showHomepageContextMenu() {
  appManagerAPI.showHomepageContextMenu();
}

function handleShowTabContextMenu(tabId: string) {
  appManagerAPI.showTabContextMenu(tabId);
}

function handleClose() {
  appManagerAPI.closeWindow();
  appManagerAPI.sensorTrack('PCTopFunction', { PCTop_Function: '关闭' });
}

function handleOpenNewTab() {
  appManagerAPI.openNewTab();
}

function handleShowTab(tabId: string) {
  if (window.appManagerAPI) {
    appManagerAPI.showTab(tabId);
  } else {
    appMainStatus.isHomeActive = false;
    for (let i = 0; i < tabList.value.length; i++) {
      const tabItem = tabList.value[i];
      if (tabItem.id === tabId) {
        tabItem.isActive = true;
      } else {
        tabItem.isActive = false;
      }
    }
  }
}

function handleCloseTab(tabId: string) {
  if (window.appManagerAPI) {
    appManagerAPI.closeTab(tabId);
  } else {
    const index = tabList.value.findIndex((item) => item.id === tabId);
    if (index > -1) {
      tabList.value.splice(index, 1);
    }
  }
}

function handleToggleMaximize() {
  appManagerAPI.toggleMaximize();
  appManagerAPI.sensorTrack('PCTopFunction', { PCTop_Function: '最大化' });
}

function handleToggleMinimize() {
  appManagerAPI.toggleMinimize();
  appManagerAPI.sensorTrack('PCTopFunction', { PCTop_Function: '最小化' });
}

function handleAppMenu() {
  appManagerAPI.showAppMenu();
  appManagerAPI.sensorTrack('PCTopFunction', { PCTop_Function: '展开更多' });
}

function handleAppRefresh() {
  appManagerAPI.toggleAppRefresh();
  appManagerAPI.sensorTrack('PCTopFunction', { PCTop_Function: '刷新页面' });
}

function showHomepage() {
  if (window.appManagerAPI) {
    appManagerAPI.showHomepage();
    appManagerAPI.sensorTrack('PCTopFunction', { PCTop_Function: '回到首页' });
  } else {
    appMainStatus.isHomeActive = true;
    tabList.value.forEach((item) => (item.isActive = false));
  }
}

function handleParseMessage(event: MessageEvent<MessageToWeb>) {
  const content = event.data;
  if (!content.message) return;
  switch (content.message) {
    case 'TABS_SET':
      tabList.value = sortTabList(content.data?.tabList as TabInfo[]);
      appMainStatus.isHomeActive = content.data?.isHomeActive as boolean;
      nextTick(initAutoResizeTab);
      break;
    case 'HEADER_INFO':
      appMainStatus.isMaximized = content.data?.isMaximized as boolean;
      appMainStatus.isFullScreen = content.data?.isFullScreen as boolean;
      break;
    case 'SENSORS_TRACK':
      if (content.data) {
        appManagerAPI.sensorTrack(
          content.data.event as keyof SensorsTrack,
          content.data.properties as SensorsTrack[keyof SensorsTrack],
        );
      }
      break;
    case 'CLEAR_HOVER':
      menuHovered.value = content.data?.hover as boolean;
      break;
    case 'PAGE_LOADING':
      showLoading.value = content.data?.loading as boolean;
      break;
    case 'PAGE_ERROR':
      showError.value = content.data?.error as boolean;
      break;
    default:
      break;
  }
}

function sortTabList(targets: TabInfo[] = []) {
  const newTabList: TabInfo[] = [];
  for (let index = 0; index < tabList.value.length; index++) {
    const tabIndex = targets.findIndex((item) => item.id === tabList.value[index].id);
    if (tabIndex > -1) {
      newTabList.push(...targets.splice(tabIndex, 1));
    }
  }
  newTabList.push(...targets);
  return newTabList;
}
</script>

<style lang="scss" scoped>
.loading-body {
  width: 100%;
  height: calc(100% - 40px);
  user-select: none;
}

.header-container {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  width: 100%;
  height: 40px;
  padding-left: 8px;
  background-color: var(--color--bg-body-base);
  overflow: hidden;
  -webkit-app-region: no-drag;

  * {
    -webkit-app-region: no-drag;
  }

  &.header-mac {
    padding-left: 68px;
  }

  .header-tabs {
    display: flex;
    align-items: center;
    overflow: hidden;
    user-select: none;
  }

  .header-tabs--wrap {
    position: relative;
    height: 40px;
  }

  .header-tabs--drag {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 8px;
    -webkit-app-region: drag;
  }

  .header-tabs--ul {
    display: flex;
    margin-top: 8px;
    list-style: none;
  }

  .tab-item--home {
    position: relative;
    display: flex;
    float: left;
    color: var(--color--text-secondary);

    .tab_item--icon {
      fill: var(--color--icon-secondary);
    }

    .tab_item--link {
      float: left;
      position: relative;
      display: flex;
      align-items: center;
      height: 32px;
      text-decoration: none;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;

      &::after {
        position: absolute;
        right: 0px;
        bottom: 10px;
        content: '';
        display: block;
        width: 1px;
        height: 16px;
        background-color: rgba(18, 17, 43, 0.07);
      }
    }

    .tab_item--menu {
      z-index: 4;
      display: flex;
      width: 40px;
      height: 32px;
      padding: 2px 8px 6px;
      font-size: 0;
    }

    &:hover {
      z-index: 11;
      color: var(--color--text-primary);

      .tab_item--left,
      .tab_item--right {
        fill: var(--color--bg-body-overlay);
      }

      .tab_item--icon {
        fill: var(--color--icon-primary);
      }

      .tab_item--link {
        background-color: var(--color--bg-body-overlay);

        &::after {
          display: none;
        }
      }
    }

    &.tab-item__active {
      z-index: 12;
      color: var(--color--text-primary);

      .tab_item--left,
      .tab_item--right {
        fill: var(--color--bg-body-overlay);
      }

      .tab_item--icon {
        fill: var(--color--icon-primary);
      }

      .tab_item--link {
        background-color: var(--color--bg-body-overlay);

        &::after {
          display: none;
        }
      }
    }

    .tab_item--left,
    .tab_item--right {
      margin-top: 24px;
      fill: var(--color--bg-body-base);
    }
  }

  .tab-item--plus {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0px;
    margin-bottom: 4px;

    .tab_item--icon {
      fill: var(--color--icon-secondary);
    }

    &:hover {
      .tab_item--icon {
        fill: var(--color--icon-primary);
      }
    }
  }

  .header-fill {
    flex: 1 1 auto;
    height: 100%;
    -webkit-app-region: drag;
  }

  .header-menu {
    display: flex;
    height: 100%;
    padding-left: 24px;
    -webkit-app-region: drag;

    .header-menu--list {
      width: 46px;
      height: 40px;
      padding: 6px 9px;
      font-size: 0;
      color: var(--color--icon-primary);

      &.menu-hover {
        background-color: var(--color--bg-hover);
      }
    }

    .header-menu--btn {
      width: 46px;
      height: 40px;
      padding: 6px 9px;
      font-size: 0;
      color: var(--color--icon-primary);

      &:hover {
        background-color: var(--color--bg-hover);
      }

      &.header-menu--close:hover {
        color: var(--color--text-contrary);
        background-color: var(--color--bg-danger-normal);
      }
    }
  }
}
</style>
