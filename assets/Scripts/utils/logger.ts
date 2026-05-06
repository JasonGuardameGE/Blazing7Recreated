// 定义样式
const styles = {
    log: 'color: #2196F3; ',  // 蓝色
    warn: 'color: #FFC107;',  // 黄色
    error: 'color: #F44336;',  // 红色
    success: 'color: #4CAF50;',  // 绿色
    network: 'color: #00BCD4;'  // 青色   
  };
  
  // 判断是否是生产环境
  const isProduction = false;
  
  const log = (...args: any[]) => {
    if (!isProduction) {
      if (typeof args[0] === 'string') {
        console.log('%c' + args[0], styles.log, ...args.slice(1));
      } else {
        console.log(...args);
      }
    }
  };
  
  const warn = (...args: any[]) => {
    if (!isProduction) {
      if (typeof args[0] === 'string') {
        console.warn('%c' + args[0], styles.warn, ...args.slice(1));
      } else {
        console.warn(...args);
      }
    }
  };
  
  const error = (...args: any[]) => {
    if (!isProduction) {
      if (typeof args[0] === 'string') {
        console.error('%c' + args[0], styles.error, ...args.slice(1));
      } else {
        console.error(...args);
      }
    }
  };
  
  const success = (...args: any[]) => {
    if (!isProduction) {
      if (typeof args[0] === 'string') {
        console.log('%c' + args[0], styles.success, ...args.slice(1));
      } else {
        console.log(...args);
      }
    }
  };
  
  const network = (...args: any[]) => {
    if (!isProduction) {
      console.log('%c' + args[0], styles.network, ...args.slice(1));
    }
  };
  
  export default {
    log,
    warn,
    error,
    success,
    network,
    isProduction
  };
  