import * as Notifications from 'expo-notifications';
import { serverUrl } from './screens/config';

export const scheduleItemNotifications = async (userItems) => {
  if (userItems && Array.isArray(userItems)) {
    for (const item of userItems) {
      // Function to check if notification_id is null for an item
      const checkNotificationIdIsNull = async (itemId) => {
        try {
          const response = await fetch(`${serverUrl}/api/check-notification-id/${itemId}`);
          if (response.ok) {
            const data = await response.json();
            return data.isNull;
          } else {
            console.error('Failed to check notification ID:', response.status);
            return false;
          }
        } catch (error) {
          console.error('Error checking notification ID:', error);
          return false;
        }
      };

      const isNotificationIdNull = await checkNotificationIdIsNull(item.id);
      if (!isNotificationIdNull) {
        // Skip scheduling for items that already have a notification
        console.log(`Notification already exists for item "${item.name}"`);
        continue;
      }

      // Calculate the notification date (3 days in advance)
      const currentDate = new Date();
      const expiryDate = new Date(item.expiry_date);
      const notificationDate = new Date(expiryDate);
      notificationDate.setDate(expiryDate.getDate() - 3); // Adjust for 3 days in advance
      notificationDate.setHours(17, 0, 0, 0);

      const addProductNotification = async (productId, notificationId) => {
        try {
          const response = await fetch(`${serverUrl}/api/update-product-notification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId, notificationId }),
          });
      
          if (response.ok) {
            const data = await response.json();
            console.log(data.message); // Log success message
          } else {
            console.error('Failed to add product notification:', response.status);
          }
        } catch (error) {
          console.error('Error adding product notification:', error);
        }
      };

      // Calculate the time difference in days
      const timeDifferenceInDays = Math.floor((expiryDate - currentDate) / (24 * 60 * 60 * 1000));

      if (timeDifferenceInDays >= 0 && timeDifferenceInDays <= 3) {
        // Item will expire within 3 days or less, schedule the notification with a minimal delay
        console.log(`Scheduling immediate notification for item "${item.name}"`);
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Item Expiry Reminder',
            body: `Your item "${item.name}" will expire in less than 3 days.`,
          },
          trigger: {
            seconds: 10, // Schedule the notification with a minimal delay (e.g., 10 seconds)
          },
        });
        console.log(`Scheduled immediate notification for item "${item.name}" with ID ${notificationId}`);
        
        // Call this function to add a notification to a product
        addProductNotification(item.id, notificationId);

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

        // Call this function to add a notification to a product
        addProductNotification(item.id, notificationId);

      } else {
        // Item has already expired
        console.log(`Item "${item.name}" has already expired.`);
      }
    }
  }
};
