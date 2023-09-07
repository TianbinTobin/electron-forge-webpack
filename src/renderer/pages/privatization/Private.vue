<template>
  <div class="private">
    <div class="private-dialog">
      <div class="dialog-header">
        <div class="header-title">配置地址</div>
        <div class="header-close" @click="onCancel">
          <SvgIcon :size="32" :src="require('../../assets/icons/icon-close.svg')" />
        </div>
      </div>
      <div class="dialog-body">
        <div class="body-title">请先进行地址配置，否则无法登录使用</div>
        <input v-model.trim="inputValue" class="body-input" placeholder="请输入服务器地址" />
      </div>
      <div class="dialog-footer">
        <button class="footer-btn" @click="onCancel">取消</button>
        <button class="footer-btn footer-submit" :disabled="!inputValue" @click="onSubmit">确定</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import SvgIcon from '../../components/SvgIcon.vue';

const inputValue = ref('');

onMounted(async () => {
  inputValue.value = await appManagerAPI.getServerUrl();
});

function onCancel() {
  appManagerAPI.closeDialogPrivate();
}

function onSubmit() {
  appManagerAPI.submitDialogPrivate(inputValue.value);
}
</script>

<style lang="scss" scoped>
.private {
  padding: 20px;

  * {
    -webkit-app-region: no-drag;
  }
}
.private-dialog {
  width: 360px;
  height: 186px;
  background: #ffffff;
  box-shadow:
    0px 8px 24px rgba(25, 25, 26, 0.06),
    0px 4px 16px rgba(25, 25, 26, 0.04),
    0px 0px 4px rgba(25, 25, 26, 0.04);
  border-radius: 8px;
  overflow: hidden;

  .dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 40px;
    padding: 6px;
    -webkit-app-region: drag;
    border-bottom: 1px solid rgba(19, 18, 43, 0.07);

    .header-title {
      padding: 4px 10px;
      font-size: 14px;
      line-height: 20px;
      font-weight: 600;
      color: #19191a;
    }

    .header-close {
      font-size: 0;
      -webkit-app-region: no-drag;
    }
  }

  .dialog-body {
    padding: 16px;

    .body-title {
      font-size: 12px;
      line-height: 18px;
      color: #19191a;
    }

    .body-input {
      width: 100%;
      height: 28px;
      margin-top: 16px;
      padding: 4px 8px;
      font-size: 12px;
      line-height: 18px;
      outline: none;
      background: #f6f6f8;
      border-radius: 6px;
      border: 1px solid transparent;

      &:focus {
        background: #f7f7f9;
        border: 1px solid #5359fd;
      }
    }
  }

  .dialog-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 10px 16px;

    .footer-btn {
      height: 32px;
      padding: 5px 16px;
      font-size: 12px;
      line-height: 20px;
      outline: none;
      color: #19191a;
      cursor: pointer;
      user-select: none;
      border-radius: 6px;
      background-color: #fff;
      border: 1px solid rgba(6, 6, 30, 0.09);
    }

    .footer-submit {
      margin-left: 8px;
      color: #fff;
      background: #5359fd;
      border: 1px solid transparent;

      &[disabled] {
        background: #c8d9fe;
        pointer-events: none;
      }
    }
  }
}
</style>
