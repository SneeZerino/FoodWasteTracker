import * as Notifications from 'expo-notifications';

export const scheduleItemNotifications = async (userItems) => {
  if (userItems && Array.isArray(userItems)) {
    for (const item of userItems) {
      // Calculate the notification date (3 days in advance)
      const currentDate = new Date();
      const expiryDate = new Date(item.expiry_date);
      const notificationDate = new Date(expiryDate);
      notificationDate.setDate(expiryDate.getDate() - 3); // Adjust for 3 days in advance
      notificationDate.setHours(17, 0, 0, 0);

      // Calculate the time difference in days
      const timeDifferenceInDays = Math.floor((expiryDate - currentDate) / (24 * 60 * 60 * 1000));

      if (timeDifferenceInDays >= 0 && timeDifferenceInDays <= 3) {
        // Item will expire within 3 days or less, schedule the notification with a minimal delay
        console.log(`Scheduling immediate notification for item "${item.name}"`);
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Item Expiry Reminder',
            body: `Your item "${item.name}" will expire in less then 3 Days.`,
          },
          trigger: {
            seconds: 10, // Schedule the notification with a minimal delay (e.g., 10 seconds)
          },
        });
        console.log(`Scheduled immediate notification for item "${item.name}" with ID ${notificationId}`);
      } else if (timeDifferenceInDays > 3) {
        // Item will expire more than 3 days from now, schedule the notification for the calculated date
        console.log(`Scheduling notification for item "${item.name}" at ${notificationDate.toISOString()}`);
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Item Expiry Reminder',
            body: `Your item "${item.name}" will expire in 3 days.`,
          },
          trigger: {
            date: notificationDate.getTime(), // Use getTime() to provide a valid timestamp
          },
        });
        console.log(`Scheduled notification for item "${item.name}" with ID ${notificationId}`);
      } else {
        // Item has already expired
        console.log(`Item "${item.name}" has already expired.`);
      }
    }
  }
};
