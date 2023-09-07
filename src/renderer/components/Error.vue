<template>
  <div class="error">
    <img class="error-image" src="../assets/images/refresh.png" />
    <div class="error-tips">
      <span>遇到一些问题，点击</span>
      <span class="error-refresh" @click="handleRefresh">刷新</span>
      <span>重试</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
function handleRefresh() {
  if (appManagerAPI) {
    appManagerAPI.toggleAppRefresh();
  }
}
</script>

<style lang="scss" scoped>
.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  .error-image {
    width: 120px;
    height: 120px;
  }

  .error-tips {
    margin-top: 5px;
    font-size: 12px;
    font-weight: 400;
    line-height: 20px;
    color: var(--color--text-tertiary);
    cursor: default;
  }

  .error-refresh {
    margin: 0 4px;
    color: var(--color--text-brand-normal);
    cursor: pointer;

    &:hover {
      color: var(--color--text-brand-hover);
    }

    &:active {
      color: var(--color--text-brand-press);
    }
  }
}
</style>
