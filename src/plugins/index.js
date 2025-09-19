// 插件集成入口文件 - 自动扫描版本
// 动态导入所有插件的函数
const importAllPlugins = async () => {
  const pluginModules = import.meta.glob('./*/index.{js,jsx}');
  const plugins = [];
  
  for (const path in pluginModules) {
    try {
      const module = await pluginModules[path]();
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