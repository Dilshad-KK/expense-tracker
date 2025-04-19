import OneSignal from 'react-onesignal';

export const initOneSignal = async () => {
  if (typeof window !== 'undefined') {
    await OneSignal.init({
      appId: '00b19587-74cb-4d19-931d-e74f5a20e8a1',
      serviceWorkerPath: '/OneSignalSDKWorker.js',
      serviceWorkerUpdaterPath: '/OneSignalSDKUpdaterWorker.js',
      notifyButton: {
        enable: true,
        showCredit: false,
        prenotify: true,
        position: 'bottom-right',
        text: {
          'tip.state.unsubscribed': 'Subscribe to notifications',
          'tip.state.subscribed': "You're subscribed to notifications",
          'tip.state.blocked': 'You have blocked notifications',
          'message.prenotify': 'Click to subscribe to push notifications',
          'message.action.subscribing': 'Subscribing...',
          'message.action.subscribed': "Thanks for subscribing!",
          'message.action.resubscribed': "You're subscribed to notifications",
          'message.action.unsubscribed': "You won't receive notifications again",
          'dialog.main.title': 'Manage Site Notifications',
          'dialog.main.button.subscribe': 'SUBSCRIBE',
          'dialog.main.button.unsubscribe': 'UNSUBSCRIBE',
          'dialog.blocked.title': 'Unblock Notifications',
          'dialog.blocked.message': 'Follow these instructions to allow notifications:',
        },
      },
    });
  }
};