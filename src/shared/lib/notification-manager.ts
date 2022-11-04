import type { Options } from '@tauri-apps/api/notification';
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from '@tauri-apps/api/notification';

export async function createNotificationManager() {
  await requestPermission();
  return {
    async notify(options: Options | string) {
      const grantedPermission = await isPermissionGranted();
      if (!grantedPermission) sendNotification(options);
    },
  };
}
