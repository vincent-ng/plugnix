// 插件集成入口文件 - 自动扫描版本
// 导入禁用插件黑名单
import disabledPlugins from './plugins-disabled.json';

// 动态导入所有插件的函数
const importAllPlugins = async () => {
  // 获取所有插件模块
  const allPluginModules = import.meta.glob('./plugins/*/index.{js,jsx}');
  const plugins = [];
  
  for (const path in allPluginModules) {
    try {
      // 从路径中提取插件名称
      const pluginName = path.match(/\.\/plugins\/([^/]+)\/index\.(js|jsx)$/)[1];
      
      // 检查插件是否在黑名单中
      if (disabledPlugins.includes(pluginName)) {
        console.log(`Plugin ${pluginName} is disabled, skipping...`);
        continue;
      }
      
      const module = await allPluginModules[path]();
      if (module.default && typeof module.default === 'function') {
        plugins.push(module.default);
      }
    } catch (error) {
      console.warn(`Failed to load plugin from ${path}:`, error);
    }
  }
  
  return plugins;
};

// 导出异步加载的插件数组
export default importAllPlugins;