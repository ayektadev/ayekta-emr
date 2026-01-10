import { useState, useEffect } from 'react';
import {
  initGoogleDrive,
  signInToGoogle,
  signOutFromGoogle,
  isUserSignedIn,
} from '../../services/googleDrive';
import { processSyncQueue, getSyncQueueStatus } from '../../services/syncQueue';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

/**
 * Google Drive sync status component
 * Shows sign-in status, sync queue, and manual sync controls
 */
export default function GoogleDriveSync() {
  const [isSignedIn, setIsSignedIn] = useState(() => {
    // Check localStorage for persisted sign-in state
    return localStorage.getItem('ayekta_drive_signed_in') === 'true';
  });
  const [isInitializing, setIsInitializing] = useState(true); // Start as true during init
  const [lastSyncMessage, setLastSyncMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    // Initialize Google Drive API on mount
    setIsInitializing(true);
    console.log('Initializing Google Drive...');

    initGoogleDrive()
      .then(() => {
        console.log('Google Drive initialized successfully');

        // Check if user is actually signed in via Google API
        const actuallySignedIn = isUserSignedIn();

        // Verify localStorage state matches actual state
        const persistedSignIn = localStorage.getItem('ayekta_drive_signed_in') === 'true';

        if (persistedSignIn && !actuallySignedIn) {
          // User was previously signed in but token expired
          console.log('Sign-in state expired, clearing localStorage');
          localStorage.removeItem('ayekta_drive_signed_in');
          setIsSignedIn(false);
        } else {
          setIsSignedIn(actuallySignedIn);
        }

        updateQueueStatus();
        setInitError(null);
        setIsInitializing(false);
      })
      .catch((error) => {
        console.error('Failed to initialize Google Drive:', error);
        setInitError('Failed to load Google Drive. Please refresh the page.');
        setIsInitializing(false);
      });
  }, []);

  useEffect(() => {
    // Auto-sync when coming online
    if (isOnline && isSignedIn) {
      handleSync();
    }
  }, [isOnline]);

  const updateQueueStatus = async () => {
    // Just check status without setting state (used for auto-sync trigger)
    await getSyncQueueStatus();
  };

  const handleSignIn = async () => {
    if (isInitializing) {
      setLastSyncMessage('Please wait for initialization...');
      return;
    }

    try {
      await signInToGoogle();
      setIsSignedIn(true);
      // Persist sign-in state to localStorage
      localStorage.setItem('ayekta_drive_signed_in', 'true');
      setLastSyncMessage('Signed in to Google Drive');

      // Auto-sync after sign-in
      setTimeout(() => handleSync(), 1000);
    } catch (error) {
      console.error('Sign-in failed:', error);
      setLastSyncMessage('Sign-in failed. Please try again.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutFromGoogle();
      setIsSignedIn(false);
      // Clear persisted sign-in state
      localStorage.removeItem('ayekta_drive_signed_in');
      setLastSyncMessage('Signed out from Google Drive');
    } catch (error) {
      console.error('Sign-out failed:', error);
    }
  };

  const handleSync = async () => {
    if (!isSignedIn) {
      console.log('Not signed in, skipping sync');
      return;
    }

    if (!isOnline) {
      console.log('Not online, skipping sync');
      return;
    }

    try {
      console.log('Processing sync queue...');
      const result = await processSyncQueue();
      console.log('Sync result:', result);
      await updateQueueStatus();

      if (result.succeeded === result.total && result.total > 0) {
        console.log('All syncs succeeded, dispatching sync-complete event');
        // Dispatch event for header to update status
        window.dispatchEvent(new Event('ayekta-sync-complete'));
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  // If signed in, show only the connectivity indicator
  if (isSignedIn) {
    return (
      <div
        className={`w-4 h-4 rounded-full shadow-lg ${
          isOnline ? 'bg-green-500' : 'bg-gray-400'
        }`}
        title={isOnline ? 'Online' : 'Offline'}
      />
    );
  }

  // If not signed in, show full sign-in interface
  return (
    <div className="bg-white rounded-lg shadow-lg border border-ayekta-border">
      {/* Compact header - always visible */}
      <div
        className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-blue-600"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" />
          </svg>
          <span className="text-xs font-semibold">Drive</span>

          {/* Online/Offline indicator */}
          <div
            className={`w-2 h-2 rounded-full ${
              isOnline ? 'bg-green-500' : 'bg-gray-400'
            }`}
          />
        </div>

        {/* Expand/collapse icon */}
        <svg
          className={`w-4 h-4 text-gray-600 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="p-3 pt-0 border-t border-gray-200">
          <div className="space-y-2">
            {initError ? (
              <div className="text-xs text-red-600 text-center p-2 bg-red-50 rounded">
                {initError}
              </div>
            ) : !isSignedIn ? (
              <button
                onClick={handleSignIn}
                disabled={isInitializing}
                className="w-full px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 text-xs font-medium transition-colors"
              >
                {isInitializing ? 'Loading...' : 'Sign in'}
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Signed in to Google Drive</span>
                  <button
                    onClick={handleSignOut}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Sign out
                  </button>
                </div>

                <button
                  onClick={handleSync}
                  disabled={!isOnline}
                  className="w-full px-3 py-1.5 bg-ayekta-orange text-white rounded hover:bg-opacity-90 disabled:bg-gray-400 text-xs font-medium transition-colors"
                >
                  Sync Queue Now
                </button>
              </div>
            )}

            {lastSyncMessage && (
              <p className="text-xs text-gray-600 text-center">{lastSyncMessage}</p>
            )}
          </div>

          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Files upload to Drive when you click "Save Patient"
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
