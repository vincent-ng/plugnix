const eventBus = {
  on(event, callback) {
    // console.log(`[EventBus] Registering listener for event: ${event}`);
    const handler = (e) => {
      console.log(`[EventBus] Handling event: ${event}`, e.detail);
      try {
        // 使用 setTimeout 确保回调在下一个事件循环中执行，避免在渲染过程中更新状态
        setTimeout(() => callback(e.detail), 0);
      } catch (err) {
        console.error(`[EventBus] Listener error for event: ${event}`, err);
      }
    };
    document.addEventListener(event, handler);
    // 返回一个取消订阅的函数
    return () => {
      console.log(`[EventBus] Unregistering listener for event: ${event}`);
      document.removeEventListener(event, handler);
    };
  },
  emit(event, data) {
    console.log(`[EventBus] Emitting event: ${event}`, data);
    document.dispatchEvent(new CustomEvent(event, { detail: data }));
  },
};

export default eventBus;