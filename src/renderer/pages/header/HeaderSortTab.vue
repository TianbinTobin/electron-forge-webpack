<template>
  <li class="sort-tab sort-tab--sortable" :class="{ 'sort-tab__active': isActive }">
    <SvgIcon class="sort-tab--left" :size="8" :src="require('../../assets/icons/icon_tab_left.svg')" />
    <a class="sort-tab--link">
      <div class="sort-tab--title">
        <span>{{ title }}</span>
      </div>
      <div class="sort-tab--close">
        <div class="sort-tab--mask"></div>
        <SvgIcon
          class="sort-tab--close-btn tab-ignore-sortable"
          :size="28"
          :src="require('../../assets/icons/icon_tab_close.svg')"
          @click.stop="onCloseTab"
        />
      </div>
    </a>
    <SvgIcon class="sort-tab--right" :size="8" :src="require('../../assets/icons/icon_tab_right.svg')" />
  </li>
</template>

<script setup lang="ts">
import SvgIcon from '../../components/SvgIcon.vue';

defineProps<{
  id: string;
  title: string;
  isActive: boolean;
}>();

const emit = defineEmits<{
  (event: 'on-close'): void;
}>();

function onCloseTab() {
  emit('on-close');
}
</script>

<style lang="scss" scoped>
li {
  position: relative;
  z-index: 10;
  float: left;
  display: flex;
  align-items: flex-end;
}

.sort-tab {
  min-width: 82px;
  max-width: 280px;
  margin-left: -17px;
  transition: none 0s ease 0s;

  &.sortable-drag--visible {
    .sort-tab--link {
      &::after {
        display: none;
      }
    }
    .sort-tab--mask {
      display: none;
    }
    .sort-tab--left,
    .sort-tab--right {
      display: none;
    }
  }

  &:hover {
    z-index: 11;

    .sort-tab--link {
      background-color: #f6f6f8;

      &::after {
        display: none;
      }
    }

    .sort-tab--left,
    .sort-tab--right {
      fill: #f6f6f8;
    }

    .sort-tab--title {
      color: var(--color--text-primary);
    }

    .sort-tab--mask {
      background: linear-gradient(270deg, #f7f7f9 0%, rgba(247, 247, 249, 0) 99.24%);
    }

    .sort-tab--close {
      padding-right: 0;
    }

    .sort-tab--close-btn {
      display: block;
      background-color: #f6f6f8;
    }
  }

  &.sort-tab__active {
    z-index: 12;

    &.sortable-drag--visible {
      .sort-tab--mask {
        display: block;
      }

      .sort-tab--left,
      .sort-tab--right {
        display: block;
      }
    }

    .sort-tab--link {
      background-color: var(--color--bg-body);

      &::after {
        display: none;
      }
    }

    .sort-tab--left,
    .sort-tab--right {
      fill: var(--color--bg-body);
    }

    .sort-tab--title {
      color: var(--color--text-primary);
    }

    .sort-tab--mask {
      background: linear-gradient(270deg, #ffffff 0%, rgba(255, 255, 255, 0) 99.24%);
    }

    .sort-tab--close {
      padding-right: 0;
    }

    .sort-tab--close-btn {
      display: block;
      background-color: var(--color--bg-body);
    }
  }

  .sort-tab--link {
    position: relative;
    display: flex;
    align-items: center;
    float: left;
    height: 32px;
    padding: 0 8px;
    border-radius: 8px 8px 0px 0px;
    overflow: hidden;

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

  .sort-tab--left,
  .sort-tab--right {
    flex-shrink: 0;
    fill: var(--color--bg-body-base);
  }

  .sort-tab--title {
    display: flex;
    align-items: center;
    min-width: 50px;
    padding: 4px 28px 8px 8px;
    margin: auto;
    font-size: 12px;
    line-height: 20px;
    color: var(--color--text-secondary);
    overflow: hidden;
    white-space: nowrap;
  }

  .sort-tab--mask {
    width: 20px;
    height: 28px;
    background: linear-gradient(270deg, #edeef0 0%, rgba(237, 238, 240, 0) 99.24%);
  }

  .sort-tab--close {
    position: absolute;
    top: 0;
    right: 0;
    display: flex;
    align-items: center;
    padding-right: 8px;
    color: var(--color--icon-secondary);

    &:hover {
      color: var(--color--icon-primary);
    }
  }

  .sort-tab--close-btn {
    display: none;
  }
}
</style>
