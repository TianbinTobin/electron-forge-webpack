export const REGEX_HTTP_PATH = /https?:\/\/([^?#]*)(\?.*)?(#.*)?/;
/**
 * 分别匹配localhost:port|10.10.x.x|board.cn/boardmix.cn/boardmix.com等ip和域名
 */
const REGEX_BASE_PATH =
  '(((localhost|(10\\.10(\\.((2(5[0-5]|[0-4]\\d))|[0-1]?\\d{1,2})){2})):([1-6]\\d{0,4}|[7-9]\\d{0,3}))|(board(mix)?\\.(cn)|(com)))';

/**
 * 是否应用内域名
 */
export const REGEX_DOMAIN_PATH = new RegExp(REGEX_BASE_PATH);
/**
 * 应用的正则表达式
 */
export const REGEX_APP_PATH = new RegExp(`${REGEX_BASE_PATH}/app/`);
/**
 * 编辑页的正则表达式
 */
export const REGEX_APP_EDITOR_PATH = new RegExp(`${REGEX_BASE_PATH}/app/editor/([a-zA-Z0-9-_])+(.*)`);

/**
 * 应用首页的正则表达式
 */
export const REGEX_APP_HOME_PATH = new RegExp(
  `${REGEX_BASE_PATH}/app((/(?=my-space|my-folder|star-file|template|team|project|trash))|(/$))`,
);

/**
 * 社区的正则表达式
 */
export const REGEX_COMMUNITY_PATH = new RegExp(`${REGEX_BASE_PATH}/community/`);
