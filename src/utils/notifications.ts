export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('Browser tidak mendukung notifikasi');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const sendNotification = (title: string, options?: NotificationOptions) => {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: 'https://ik.imagekit.io/e6vjjeaon/favicon-96x96.png?updatedAt=1762912118986',
      badge: 'https://ik.imagekit.io/e6vjjeaon/favicon-96x96.png?updatedAt=1762912118986',
      ...options,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  }
  return null;
};

export const subscribeToPushNotifications = async () => {
  try {
    const registration = await navigator.serviceWorker.ready;
    
    if (!('pushManager' in registration)) {
      console.log('Push notifications tidak didukung');
      return null;
    }

    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log('Notifikasi tidak diizinkan');
      return null;
    }

    // Get push subscription
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        // Ganti dengan VAPID public key Anda dari backend
        'YOUR_VAPID_PUBLIC_KEY'
      ),
    });

    console.log('Push subscription:', subscription);
    return subscription;
  } catch (error) {
    console.error('Error subscribing to push:', error);
    return null;
  }
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
