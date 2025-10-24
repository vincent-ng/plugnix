// 参数验证工具
import i18n from '../i18n/index.js';

/**
 * 验证器类
 * 用于验证各种类型的配置对象
 */
export class Validator {
  constructor(object, objectType) {
    this.object = object;
    this.objectType = objectType;
  }

  /**
   * 验证对象是否为非空对象
   * @returns {Validator} 验证器实例（支持链式调用）
   */
  isObject() {
    if (typeof this.object !== 'object' || this.object === null || Array.isArray(this.object)) {
      throw new Error(i18n.t('errors:objectRequired', { objectType: this.objectType }));
    }
    return this;
  }

  /**
   * 验证属性是否存在且非空
   * @param {string} key - 对象的键名
   * @returns {Validator} 验证器实例（支持链式调用）
   */
  required(key) {
    if (this.object[key] === null || this.object[key] === undefined || this.object[key] === '') {
      throw new Error(i18n.t('errors:propertyRequired', { objectType: this.objectType, propertyName: key }));
    }
    return this;
  }

  /**
   * 验证属性值是否为字符串
   * @param {string} key - 对象的键名
   * @returns {Validator} 验证器实例（支持链式调用）
   */
  isString(key) {
    if (typeof this.object[key] !== 'string') {
      throw new Error(i18n.t('errors:propertyMustBeString', { objectType: this.objectType, propertyName: key }));
    }
    return this;
  }

  /**
   * 验证属性值是否为函数
   * @param {string} key - 对象的键名
   * @returns {Validator} 验证器实例（支持链式调用）
   */
  isFunction(key) {
    if (typeof this.object[key] !== 'function') {
      throw new Error(i18n.t('errors:propertyMustBeFunction', { objectType: this.objectType, propertyName: key }));
    }
    return this;
  }

  /**
   * 验证属性值是否在指定的枚举值中
   * @param {string} key - 对象的键名
   * @param {Array} allowedValues - 允许的值数组
   * @returns {Validator} 验证器实例（支持链式调用）
   */
  isEnum(key, allowedValues) {
    if (!allowedValues.includes(this.object[key])) {
      throw new Error(i18n.t('errors:invalidEnumValue', { 
        objectType: this.objectType, 
        propertyName: key, 
        value: this.object[key], 
        allowedValues: allowedValues.join(', ') 
      }));
    }
    return this;
  }

  /**
   * 验证属性值是否为字符串或字符串数组
   * @param {string} key - 对象的键名
   * @returns {Validator} 验证器实例（支持链式调用）
   */
  isStringOrStringArray(key) {
    if (typeof this.object[key] !== 'string' && !Array.isArray(this.object[key])) {
      throw new Error(i18n.t('errors:propertyMustBeStringOrArray', { objectType: this.objectType, propertyName: key }));
    }
    
    if (Array.isArray(this.object[key])) {
      for (const item of this.object[key]) {
        if (typeof item !== 'string') {
          throw new Error(i18n.t('errors:propertyMustBeStringOrArray', { objectType: this.objectType, propertyName: key }));
        }
      }
    }
    
    return this;
  }

  /**
   * 验证属性值是否为数字
   * @param {string} key - 对象的键名
   * @returns {Validator} 验证器实例（支持链式调用）
   */
  isNumber(key) {
    if (typeof this.object[key] !== 'number') {
      throw new Error(i18n.t('errors:propertyMustBeNumber', { objectType: this.objectType, propertyName: key }));
    }
    return this;
  }

  /**
   * 验证属性值是否为数组
   * @param {string} key - 对象的键名
   * @returns {Validator} 验证器实例（支持链式调用）
   */
  isArray(key) {
    if (!Array.isArray(this.object[key])) {
      throw new Error(i18n.t('errors:propertyMustBeArray', { objectType: this.objectType, propertyName: key }));
    }
    return this;
  }

  /**
   * 验证数组中的所有元素是否为字符串
   * @param {string} key - 对象的键名
   * @returns {Validator} 验证器实例（支持链式调用）
   */
  isStringArray(key) {
    if (!Array.isArray(this.object[key])) {
      throw new Error(i18n.t('errors:propertyMustBeArray', { objectType: this.objectType, propertyName: key }));
    }
    
    for (const item of this.object[key]) {
      if (typeof item !== 'string') {
        throw new Error(i18n.t('errors:arrayItemsMustBeStrings', { objectType: this.objectType, propertyName: key }));
      }
    }
    
    return this;
  }

  /**
   * 验证属性是否为布尔值
   * @param {string} key - 对象的键名
   * @returns {Validator} 验证器实例（支持链式调用）
   */
  isBoolean(key) {
    if (typeof this.object[key] !== 'boolean') {
      throw new Error(i18n.t('errors:propertyMustBeBoolean', { objectType: this.objectType, propertyName: key }));
    }
    return this;
  }

  /**
   * 条件验证 - 只有当条件满足时才执行验证
   * @param {boolean} condition - 条件
   * @param {Function} validator - 验证函数
   * @returns {Validator} 验证器实例（支持链式调用）
   */
  when(condition, validator) {
    if (condition) {
      validator(this);
    }
    return this;
  }

  /**
   * 如果属性存在则验证
   * @param {string} key - 对象的键名
   * @param {Function} validator - 验证函数
   * @returns {Validator} 验证器实例（支持链式调用）
   */
  ifExists(key, validator) {
    return this.when(this.object[key] !== undefined && this.object[key] !== null, validator);
  }
}
