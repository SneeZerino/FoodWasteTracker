import * as Notifications from 'expo-notifications';

export const scheduleItemNotifications = (userItems) => {
  if (userItems && Array.isArray(userItems)) {
    userItems.forEach((item) => {
      // Calculate the notification date (3 days in advance)
      const expiryDate = new Date(item.expiry_date);
      const notificationDate = new Date(expiryDate);
      notificationDate.setDate(notificationDate.getDate() - 3); // Adjust for 3 days in advance
      notificationDate.setHours(17, 0, 0, 0);

      // Check if the notification date is in the future
      if (notificationDate > new Date()) {
        console.log(`Scheduling notification for item "${item.name}" at ${notificationDate.toISOString()}`);
        // Schedule the notification
        Notifications.scheduleNotificationAsync({
          content: {
            title: 'Item Expiry Reminder',
            body: `Your item "${item.name}" will expire in 3 days.`,
          },
          trigger: {
            date: notificationDate,
          },
        }).then((notificationId) => {
          console.log(`Scheduled notification for item "${item.name}" with ID ${notificationId}`);
        });
      }
    });
  }
};
