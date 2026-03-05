import React from 'react';
import { AlertCircle, X, RefreshCw } from 'lucide-react';

export interface ErrorInfo {
  message: string;
  details?: string;
  code?: string;
  retryable?: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
}

interface ErrorHandlerProps {
  error: ErrorInfo;
  className?: string;
}

const ErrorHandler: React.FC<ErrorHandlerProps> = ({ error, className = '' }) => {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-red-600" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-red-800 mb-1">
            {error.message}
          </h3>
          
          {error.details && (
            <p className="text-sm text-red-700 mb-3">
              {error.details}
            </p>
          )}
          
          {error.code && (
            <p className="text-xs text-red-600 font-mono mb-3">
              Error Code: {error.code}
            </p>
          )}
          
          <div className="flex items-center gap-2">
            {error.retryable && error.onRetry && (
              <button
                onClick={error.onRetry}
                className="inline-flex items-center gap-1 text-xs font-medium text-red-700 hover:text-red-800 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Try Again
              </button>
            )}
          </div>
        </div>
        
        {error.onDismiss && (
          <button
            onClick={error.onDismiss}
            className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// Hook for managing error state
export const useErrorHandler = () => {
  const [errors, setErrors] = React.useState<ErrorInfo[]>([]);

  const addError = React.useCallback((error: Omit<ErrorInfo, 'onDismiss' | 'onRetry'> & { 
    onRetry?: () => void;
    autoRemove?: boolean;
    timeout?: number;
  }) => {
    const errorId = Date.now().toString();
    
    const newError: ErrorInfo = {
      ...error,
      onDismiss: () => removeError(errorId),
      onRetry: error.onRetry ? () => {
        error.onRetry!();
        removeError(errorId);
      } : undefined
    };

    setErrors(prev => [...prev, { ...newError, code: errorId }]);

    // Auto-remove error after timeout
    if (error.autoRemove !== false) {
      setTimeout(() => {
        removeError(errorId);
      }, error.timeout || 5000);
    }
  }, []);

  const removeError = React.useCallback((errorId: string) => {
    setErrors(prev => prev.filter(error => error.code !== errorId));
  }, []);

  const clearErrors = React.useCallback(() => {
    setErrors([]);
  }, []);

  return {
    errors,
    addError,
    removeError,
    clearErrors
  };
};

// Error Toast Container
export const ErrorToastContainer: React.FC<{ errors: ErrorInfo[] }> = ({ errors }) => {
  if (errors.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {errors.map((error, index) => (
        <div
          key={error.code || index}
          className="animate-in slide-in-from-right duration-300"
        >
          <ErrorHandler error={error} />
        </div>
      ))}
    </div>
  );
};

export default ErrorHandler;