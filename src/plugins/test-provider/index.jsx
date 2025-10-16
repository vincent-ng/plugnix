// 示例插件 - 演示如何注册自定义Provider
import React, { createContext, useContext, useState } from 'react';

// 创建一个简单的计数器Context
const CounterContext = createContext();

export const useCounter = () => {
  const context = useContext(CounterContext);
  if (!context) {
    throw new Error('useCounter must be used within a CounterProvider');
  }
  return context;
};

// 计数器Provider组件
export const CounterProvider = ({ children, initialValue = 0 }) => {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);
  const reset = () => setCount(initialValue);

  const value = {
    count,
    increment,
    decrement,
    reset
  };

  return (
    <CounterContext.Provider value={value}>
      {children}
    </CounterContext.Provider>
  );
};

// 插件注册函数
export default (registryApi) => {
  // 注册自定义Provider
  registryApi.registerProvider({
    name: 'CounterProvider',
    component: CounterProvider,
    props: { initialValue: 10 }, // 设置初始值为10
    order: 100, // 在核心Provider之后加载
    description: '提供一个简单的计数器功能，用于演示插件如何注册自定义Provider'
  });

  // 注册一个路由来测试Provider
  registryApi.registerRoute({
    path: '/test-counter',
    component: () => {
      const { count, increment, decrement, reset } = useCounter();
      
      return (
        <div className="p-6 max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-4">计数器测试</h1>
          <div className="bg-card p-4 rounded-lg shadow-md">
            <p className="text-center text-3xl font-bold mb-4">{count}</p>
            <div className="flex justify-center space-x-2">
              <button 
                onClick={decrement}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
              >
                -
              </button>
              <button 
                onClick={reset}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
              >
                重置
              </button>
              <button 
                onClick={increment}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                +
              </button>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            这个页面演示了插件如何注册自定义Provider并在组件中使用它。
          </p>
        </div>
      );
    }
  });

  // 注册菜单项
  registryApi.registerMenuItem({
    key: 'test-counter',
    label: '测试计数器',
    path: '/test-counter',
    icon: '🔢',
    order: 999
  }, 'public');

  console.log('Counter plugin registered');
};