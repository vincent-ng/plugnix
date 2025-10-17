import React from 'react';
import { toast } from 'sonner';

// 错误边界组件，同时处理全局错误
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidMount() {
    // 设置全局错误处理（含轻量去重，避免开发环境重复提示）
    const DEDUPE_MS = 400;
    let lastMsg = '';
    let lastAt = 0;
    const toastOnce = (msg) => {
      const now = Date.now();
      if (msg === lastMsg && (now - lastAt) < DEDUPE_MS) return;
      lastMsg = msg; lastAt = now;
      toast.error(msg);
    };

    const handleWindowError = (message, sourceUrl, line, col, err) => {
      toastOnce(err?.message || String(message));
    };
    
    // const handleRejection = (event) => {
    //   toastOnce(event.reason?.message || event.reason);
    // };
    
    // 保存之前的错误处理器
    this.prevOnError = window.onerror;
    // this.prevOnRejection = window.onunhandledrejection;
    
    // 设置新的错误处理器
    window.onerror = handleWindowError;
    // window.onunhandledrejection = handleRejection;
  }

  componentWillUnmount() {
    // 恢复之前的错误处理器
    window.onerror = this.prevOnError;
    // window.onunhandledrejection = this.prevOnRejection;
  }

  componentDidCatch(error, errorInfo) {
    const { providerName } = this.props;
    console.error(`[ErrorBoundary] ${providerName} crashed:`, error, errorInfo);
  }

  render() {
    const { hasError, error } = this.state;
    const { providerName, fallback, children } = this.props;
    
    if (hasError) {
      // 使用内联的错误展示组件
      const FallbackComponent = fallback || (({ providerName, error }) => (
        <div className="p-4 m-2 rounded border border-destructive bg-destructive/10 text-destructive">
          <div className="font-semibold">ErrorBoundary: {providerName}</div>
          <div className="text-sm text-muted-foreground mt-1">{error?.message || 'Unknow Error'}</div>
        </div>
      ));
      
      return <FallbackComponent providerName={providerName} error={error} />;
    }
    
    return children;
  }
}

// 错误边界Provider，现在也处理全局错误
export const ErrorBoundaryProvider = ({ providerName = 'Unknown', fallback, children }) => (
  <ErrorBoundary providerName={providerName} fallback={fallback}>
    {children}
  </ErrorBoundary>
);