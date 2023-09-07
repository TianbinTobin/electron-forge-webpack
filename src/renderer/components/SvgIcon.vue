<template>
  <InlineSvg :src="src" :width="size || width" :height="size || height" fill="currentColor" />
</template>

<script lang="ts" setup>
import InlineSvg from 'vue-inline-svg';

withDefaults(
  defineProps<{
    src: string;
    size?: number;
    width?: number;
    height?: number;
  }>(),
  {
    size: undefined,
    width: undefined,
    height: undefined,
  },
);
</script>

<style lang="scss" scoped>
.svg-icon {
  display: inline-block;
  transform: translateZ(0);
}
</style>
