import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 路径解析
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@framework': path.resolve(__dirname, './src/framework'),
      '@plugins': path.resolve(__dirname, './src/plugins'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@components': path.resolve(__dirname, './src/framework/components'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@assets': path.resolve(__dirname, './src/assets')
    }
  },
  
  // 开发服务器配置
  server: {
    port: 3000,
    host: true, // 允许外部访问
    open: true, // 自动打开浏览器
    cors: true, // 启用CORS
    
    // 代理配置（如果需要）
    proxy: {
      // '/api': {
      //   target: 'http://localhost:8000',
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/api/, '')
      // }
    }
  },
  
  // 构建配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // 生产环境不生成sourcemap
    
    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          // 将React相关库打包到单独的chunk
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // 将UI库打包到单独的chunk
          'ui-vendor': ['react-i18next', 'i18next'],
          
          // 将Supabase打包到单独的chunk
          'supabase-vendor': ['@supabase/supabase-js'],
          
          // 框架核心
          'framework': [
            './src/framework/registry',
            './src/framework/api',
            './src/framework/contexts',
            './src/framework/layouts'
          ]
        }
      }
    },
    
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 移除console.log
        drop_debugger: true // 移除debugger
      }
    },
    
    // 资源内联阈值
    assetsInlineLimit: 4096, // 4kb以下的资源内联为base64
    
    // 构建目标
    target: 'es2015'
  },
  
  // 环境变量前缀
  envPrefix: 'VITE_',
  
  // CSS配置
  css: {
    devSourcemap: true, // 开发环境生成CSS sourcemap
    
    // PostCSS配置
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer
      ]
    }
  },
  
  // 依赖优化
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-i18next',
      'i18next',
      '@supabase/supabase-js'
    ],
    exclude: [
      // 排除不需要预构建的依赖
    ]
  },
  
  // 预览服务器配置（用于预览构建结果）
  preview: {
    port: 4173,
    host: true,
    open: true
  },
  
  // 定义全局常量
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  }
});