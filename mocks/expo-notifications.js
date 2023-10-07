
export const setNotificationHandler = jest.fn();
export const getExpoPushTokenAsync = jest.fn();
export const addNotificationReceivedListener = jest.fn();
export const addNotificationResponseReceivedListener = jest.fn();
export const removeNotificationSubscription = jest.fn();

setNotificationHandler.mockReturnValue(Promise.resolve());

getExpoPushTokenAsync.mockReturnValue(Promise.resolve('fake-push-token'));
addNotificationReceivedListener.mockReturnValue({ remove: jest.fn() });
addNotificationResponseReceivedListener.mockReturnValue({ remove: jest.fn() });
removeNotificationSubscription.mockImplementation((subscription) => {
  });

export default {
    // Define mocked implementations or values here if needed.
    
  };