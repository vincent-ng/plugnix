import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializeNavigation } from './navigationService.js';

/**
 * 导航提供者组件
 * 初始化全局导航服务，使其可以在非组件环境中使用
 */
export function NavigationProvider({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    // 初始化全局导航服务
    initializeNavigation(navigate);
  }, [navigate]);

  return children;
}