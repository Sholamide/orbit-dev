import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

import {
  addNotificationReceivedListener,
  addNotificationResponseListener,
  registerForPushNotifications,
} from '@/lib/services/notifications';

export function useNotifications(userId: string | undefined) {
  const router = useRouter();
  const registered = useRef(false);

  useEffect(() => {
    if (!userId || registered.current) return;
    registered.current = true;
    registerForPushNotifications(userId);
  }, [userId]);

  useEffect(() => {
    const receivedSub = addNotificationReceivedListener(() => {});

    const responseSub = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;

      if (data?.type === 'chat' && data?.conversationId) {
        router.push(`/chat/${data.conversationId}`);
      } else if (data?.type === 'companion_request') {
        router.push('/(tabs)/profile');
      } else if (data?.type === 'event' && data?.eventId) {
        router.push(`/event/${data.eventId}`);
      }
    });

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, [router]);
}
