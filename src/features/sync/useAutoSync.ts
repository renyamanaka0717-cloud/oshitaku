import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useAuthStore } from '@/features/auth/store';
import { useChildStore } from '@/features/child/store';
import { pullChildrenFromCloud, pushChildToCloud } from './syncService';

const AUTO_PUSH_INTERVAL_MS = 3 * 60 * 1000;

async function pushAllChildren() {
  for (const child of useChildStore.getState().children) {
    try {
      await pushChildToCloud(child.id);
    } catch {
      // silent: background sync failures don't interrupt the app,
      // the user can still sync manually from the account screen
    }
  }
}

// Logged-in users get their data backed up automatically:
//  - once right after login, a fresh device with no local data pulls
//    from the cloud instead of pushing empty tables
//  - periodically while the app is open
//  - whenever the app is backgrounded, so nothing is lost on close
export function useAutoSync() {
  const session = useAuthStore((s) => s.session);
  const authLoaded = useAuthStore((s) => s.loaded);
  const childLoaded = useChildStore((s) => s.loaded);
  const lastSyncedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!authLoaded || !childLoaded || !session) return;

    const runInitialSync = async () => {
      if (lastSyncedUserId.current === session.user.id) return;
      lastSyncedUserId.current = session.user.id;
      try {
        if (useChildStore.getState().children.length === 0) {
          await pullChildrenFromCloud();
        } else {
          await pushAllChildren();
        }
      } catch {
        // silent, same as above
      }
    };
    runInitialSync();

    const interval = setInterval(pushAllChildren, AUTO_PUSH_INTERVAL_MS);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'background' || state === 'inactive') {
        pushAllChildren();
      }
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [authLoaded, childLoaded, session]);
}
