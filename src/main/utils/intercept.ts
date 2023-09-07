import { AppEnv } from './env';
import { REGEX_APP_EDITOR_PATH, REGEX_APP_HOME_PATH, REGEX_APP_PATH, REGEX_COMMUNITY_PATH } from './regex';
import appManager from '../core/manager';
import type AppView from '../core/view';
import { isSameAppEnv, openExternalBrowser } from '../utils';

const WHITE_LIST_MAIN = [/board.cn/, /bosyun.cn/, /boardmix.cn/, /http:\/\/localhost:3000\//];

const WHITE_LIST_INTL = [
  /boardmix.com/,
  /http:\/\/localhost:3000\//,
  /https:\/\/nid.naver.com\//,
  /https:\/\/access.line.me\//,
  /https:\/\/www.facebook.com\//,
  /https:\/\/accounts.google.com\//,
];

/**
 * 拦截导航 当路由不在白名单中时，阻止路由跳转
 * @param event
 * @param url
 * @param appView
 */
export function interceptWillNavigate(event: Electron.Event, url: string, appView: AppView) {
  if (REGEX_APP_HOME_PATH.test(url) && appView.id !== appView.window.homepage.id) {
    console.log('%c返回首页', 'color:green');
    appView.window.showHomepage();
    event.preventDefault();
    return;
  }
  const white_list = AppEnv.IS_INTERNATIONAL_EDITION ? WHITE_LIST_INTL : WHITE_LIST_MAIN;
  // 拦截导航
  const isWhiteList = white_list.some((item) => {
    return item.test(url);
  });

  if (!isWhiteList) {
    event.preventDefault();
    return;
  }
}

/**
 * 页内导航回到首页
 * @param event
 * @param url
 * @param appView
 */
export function interceptDidNavigateInPage(event: Electron.Event, url: string, appView: AppView) {
  if (REGEX_APP_HOME_PATH.test(url) && appView.id !== appView.window.homepage.id) {
    console.log('%c返回首页', 'color:green');
    appView.window.showHomepage();
    appView.close();
    event.preventDefault();
  }
}

/**
 * 拦截newWindow 通过浏览器打开
 */
export function interceptWindowOpen(url: string) {
  console.log('interception url', url);
  // 当匹配到首页，打开homepage
  if (REGEX_APP_HOME_PATH.test(url) && isSameAppEnv(url)) {
    appManager.getLastFocusedWindow()?.showHomepage();
    appManager.getLastFocusedWindow()?.homeLoadUrl(url);
  }
  // 当匹配到编辑页，新建一个标签页
  else if (REGEX_APP_EDITOR_PATH.test(url) && isSameAppEnv(url)) {
    appManager.getLastFocusedWindow()?.openTab(url);
  }
  // 当匹配到社区时，新建一个标签页
  else if (REGEX_COMMUNITY_PATH.test(url) && isSameAppEnv(url)) {
    appManager.getLastFocusedWindow()?.openTab(url);
  }
  // 当匹配到应用的其他页面时，新建一个标签页
  else if (REGEX_APP_PATH.test(url) && isSameAppEnv(url)) {
    appManager.getLastFocusedWindow()?.openTab(url);
  } else {
    // 其他情况通过浏览器进行打开
    openExternalBrowser(url);
  }
}

/**
 * 拦截键盘事件 用于快捷键 homepage
 */
export function interceptKeyEventWithHomepage(event: Electron.Event, input: Electron.Input, view: AppView) {
  if (view.window.homepage !== view) return;
  switch (true) {
    case input.shift && input.code === 'F5':
      view.browserView.webContents.reload();
      event.preventDefault();
      break;
    default:
      break;
  }
}

/**
 * 拦截键盘事件 用于快捷键
 */
export function interceptKeyEvent(event: Electron.Event, input: Electron.Input, view: AppView) {
  if (view.window.homepage == view) return;
  switch (true) {
    case input.shift && input.code === 'F5':
      view.browserView.webContents.reload();
      event.preventDefault();
      break;
    default:
      break;
  }
}
