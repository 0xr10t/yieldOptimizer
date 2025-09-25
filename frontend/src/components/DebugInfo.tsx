import React from 'react';

const DebugInfo: React.FC = () => {
  React.useEffect(() => {
    // Log any console errors with stack trace
    const originalError = console.error;
    console.error = (...args) => {
      console.log('🐛 Debug - Console Error:', args);
      console.log('🐛 Debug - Stack Trace:', new Error().stack);
      originalError(...args);
    };

    // Also catch unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.log('🐛 Debug - Unhandled Promise Rejection:', event.reason);
      console.log('🐛 Debug - Promise:', event.promise);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      console.error = originalError;
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default DebugInfo;
