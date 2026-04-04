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
  const [blockReason, setBlockReason] = useState<'disabled' | 'role' | null>(null);

  useEffect(() => {
    if (!isEnabled) setBlockReason('disabled');
    else if (!isAccessible) setBlockReason('role');
    else setBlockReason(null);
  }, [isEnabled, isAccessible]);

  if (blockReason) {
    return (
      <div className="max-w-7xl mx-auto p-6 font-clinical">
        <div className="bg-red-50 border border-red-200 rounded-md p-6">
          <h3 className="text-base font-semibold text-red-900 mb-2">This section is not available</h3>
          <p className="text-sm text-red-800">
            {blockReason === 'disabled'
              ? 'Turn it on under Settings → Chart sections, or ask an administrator.'
              : 'Your current role cannot open this section. Change workspace role in Settings if your team allows it.'}
          </p>
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
        <p className="text-center text-ayekta-muted mt-4">Loading section…</p>
      </div>
    </div>
  );
}
