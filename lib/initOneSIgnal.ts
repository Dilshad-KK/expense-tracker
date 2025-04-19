


  export const initOneSignal = async () => {
    const OneSignal = (await import('react-onesignal')).default;
  
    await OneSignal.init({
      appId: '00b19587-74cb-4d19-931d-e74f5a20e8a1',
      notifyButton: {
        enable: true,
        prenotify: true,
        showCredit: false,
        position: 'bottom-right',
        text: {
          'tip.state.unsubscribed': 'Subscribe to notifications',
          'tip.state.subscribed': 'You’re subscribed to notifications',
          'tip.state.blocked': 'You have blocked notifications',
          'message.prenotify': 'Click to subscribe to notifications',
          'message.action.subscribed': 'Thanks for subscribing!',
          'message.action.resubscribed': "You're subscribed again!",
          'message.action.unsubscribed': "You've unsubscribed",
          'message.action.subscribing': "Subscribing...",
          'dialog.main.title': 'Manage Notifications',
          'dialog.main.button.subscribe': 'SUBSCRIBE',
          'dialog.main.button.unsubscribe': 'UNSUBSCRIBE',
          'dialog.blocked.title': 'Unblock Notifications',
          'dialog.blocked.message': 'Follow these instructions to allow notifications:',
        }
      },
      allowLocalhostAsSecureOrigin: true,
    });
  
    // ✅ Use the correct method for the new SDK
    await OneSignal.Slidedown.promptPush();
  };