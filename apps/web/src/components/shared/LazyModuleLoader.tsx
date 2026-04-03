/**
 * Lazy Module Loader Component
 * 
 * Wrapper for lazy-loaded modules with loading states and error handling.
 */

import { Suspense, useEffect, useState } from 'react';
import { useModuleComponent } from '../../hooks/useModules';

interface LazyModuleLoaderProps {
  moduleId: string;
  fallback?: React.ReactNode;
}

export default function LazyModuleLoader({
  moduleId,
  fallback,
}: LazyModuleLoaderProps) {
  const { Component, isEnabled, isAccessible, isReady } = useModuleComponent(moduleId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEnabled) {
      setError(`Module "${moduleId}" is not enabled`);
    } else if (!isAccessible) {
      setError(`Module "${moduleId}" is not accessible with your current role`);
    }
  }, [isEnabled, isAccessible, moduleId]);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Module Not Available
          </h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!isReady || !Component) {
    return fallback || <DefaultFallback />;
  }

  return (
    <Suspense fallback={fallback || <DefaultFallback />}>
      <Component />
    </Suspense>
  );
}

// ============================================================================
// DEFAULT FALLBACK COMPONENT
// ============================================================================

function DefaultFallback() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-ayekta-border p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ayekta-orange"></div>
        </div>
        <p className="text-center text-ayekta-muted mt-4">Loading module...</p>
      </div>
    </div>
  );
}
