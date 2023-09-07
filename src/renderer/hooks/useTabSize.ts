import { onMounted, ref } from 'vue';

export function useTabSize() {
  onMounted(() => {
    tempInnerWidth.value = window.innerWidth;
  });

  const MIN_WIDTH = 50;
  // const MAX_WIDTH = 248;
  const TITLE_PADDING = 36;

  const offsetWidth = ref(0);
  const tempInnerWidth = ref(window.innerWidth);

  window.addEventListener('resize', onResize);

  function onResize(event: UIEvent) {
    const curInnerWidth = (event.target as Window).innerWidth;
    offsetWidth.value += curInnerWidth - tempInnerWidth.value;
    tempInnerWidth.value = curInnerWidth;
    if (Math.abs(offsetWidth.value) > 100) {
      initAutoResizeTab();
      offsetWidth.value = 0;
    } else {
      requestAnimationFrame(initAutoResizeTab);
    }
  }

  function getTitleDomList() {
    return document.querySelectorAll<HTMLElement>('.sort-tab--title');
  }

  function getFillDomList() {
    return document.querySelector<HTMLElement>('.header-fill') as HTMLElement;
  }

  function sortTitleDomList() {
    const titleList = getTitleDomList();
    return Array.from(titleList.values()).sort((a, b) => a.clientWidth - b.clientWidth);
  }

  function initAutoResizeTab() {
    const titleList = sortTitleDomList();
    if (titleList.length === 0) {
      return;
    }
    const fillEle = getFillDomList();
    if (fillEle.clientWidth > 0) {
      for (let i = 0; i < titleList.length; i++) {
        if (fillEle.clientWidth <= 0) {
          break;
        }
        const element = titleList[i];
        const elementWidth = element.clientWidth;
        const contentWidth = (element.querySelector('span') as HTMLSpanElement).clientWidth;
        if (contentWidth > elementWidth - TITLE_PADDING) {
          element.style.maxWidth = `${element.clientWidth + fillEle.clientWidth}px`;
        } else {
          element.style.maxWidth = '';
        }
      }
      return;
    }
    const tabsEl = document.querySelector('.header-tabs') as HTMLElement;
    const wrapEl = document.querySelector('.header-tabs--wrap') as HTMLElement;
    const offset = wrapEl.clientWidth - tabsEl.clientWidth;
    if (offset <= 0) {
      return;
    }
    let offsetWidth = offset;

    for (let i = titleList.length - 1; i >= 0; i--) {
      if (offsetWidth <= 0) {
        break;
      }
      const element = titleList[i];
      const overOffset = element.clientWidth - MIN_WIDTH;
      if (overOffset > offsetWidth) {
        element.style.maxWidth = `${element.clientWidth - offsetWidth}px`;
        offsetWidth = 0;
      } else {
        element.style.maxWidth = `${element.clientWidth - overOffset}px`;
        offsetWidth = offsetWidth - overOffset;
      }
    }
  }

  return { initAutoResizeTab };
}
