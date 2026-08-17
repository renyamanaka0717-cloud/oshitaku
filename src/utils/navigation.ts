import { router } from 'expo-router';

// router.back() silently does nothing when the navigation stack has no
// history to pop (e.g. the screen was opened via a direct link, bookmark,
// or a fresh page load instead of in-app navigation), which makes back
// buttons look unresponsive. Falling back to the app root — which always
// redirects to the right home screen — keeps the button working either way.
export function goBack() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/');
  }
}
