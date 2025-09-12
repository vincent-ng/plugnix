import { createClient } from '@supabase/supabase-js';

// Supabase 配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 创建 Supabase 客户端（仅在配置有效时）
let supabase = null;

if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your-supabase-url') {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Supabase 客户端初始化成功');
  } catch (error) {
    console.warn('Supabase 客户端初始化失败:', error.message);
  }
} else {
  console.warn('Supabase 配置未设置或无效，将使用模拟模式');
}

window.supabase = supabase;

export { supabase };

export default supabase;