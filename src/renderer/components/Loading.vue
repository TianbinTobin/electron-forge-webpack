<template>
  <div class="loading">
    <img class="loading-image" src="../assets/images/loading.gif" />
  </div>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  .loading-image {
    width: 120px;
    height: 120px;
  }
}
</style>
