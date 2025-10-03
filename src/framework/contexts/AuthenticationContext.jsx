import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/framework/lib/supabase.js';
import eventBus from '@/framework/lib/eventBus';

const AuthenticationContext = createContext({});

export const useAuthentication = () => {
  const context = useContext(AuthenticationContext);
  if (!context) {
    throw new Error('useAuthentication must be used within an AuthenticationProvider');
  }
  return context;
};

export const AuthenticationProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 检查用户会话
  useEffect(() => {
    setLoading(true);

    // onAuthStateChange fires immediately with the current session, so we don't need a separate getUser call.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const newUser = session?.user ?? null;

        // Only update state if the user ID is different. This prevents re-renders
        // when the session is refreshed but the user is the same.
        setUser(currentUser => {
          if (currentUser?.id !== newUser?.id) {
            return newUser;
          }
          return currentUser; // Keep the old state to prevent re-renders
        });

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setUser(data.user);
      console.log('登录成功:', data.user);
      return { error: null }; // 登录成功，无错误
    } catch (error) {
      console.error('登录失败:', error.message);
      return { error: { message: error.message } }; // 返回错误对象
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, userData = {}) => {
    try {
      setLoading(true);

      // 1. 注册用户
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (signUpError) throw signUpError;

      // 2. 注册成功后，立即登录
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // 3. 更新用户状态
      setUser(signInData.user);

      console.log('注册并登录成功:', signInData.user);
      return { success: true, data: signInData };
    } catch (error) {
      console.error('注册或自动登录失败:', error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(async () => {
    try {
      setLoading(true);

      // 清理用户相关的 localStorage 数据
      if (user?.id) {
        localStorage.removeItem(`currentGroup_${user.id}`);
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      console.log('登出成功');
      return { success: true };
    } catch (error) {
      console.error('登出失败:', error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [user]); // 添加 user 作为依赖

  // 从事件总线监听登出事件
  useEffect(() => {
    const unsubscribe = eventBus.on('auth:logout', () => {
      logout();
    });

    return unsubscribe; // 在组件卸载时取消订阅
  }, [logout]); // 添加 logout 作为依赖


  const value = {
    user,
    loading,
    login,
    signIn: login, // 添加 signIn 别名
    register,
    logout,
    signOut: logout // 添加 signOut 别名
  };

  return (
    <AuthenticationContext.Provider value={value}>
      {children}
    </AuthenticationContext.Provider>
  );
};

export default AuthenticationContext;