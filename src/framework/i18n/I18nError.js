/**
 * 国际化错误类
 * 用于处理需要国际化显示的错误
 */
import i18n from './index.js';

export class I18nError extends Error {
  constructor(key, params = {}) {
    super(key);
    const message = i18n.t(key, params);
    this.message = message;
    // console.log(`I18nError: ${key} with params ${JSON.stringify(params)}, message: ${message}`);
  }
}