import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet, ImageBackground, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useRoute } from '@react-navigation/native';
import {scheduleItemNotifications} from '../notifyUser';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {notification, usePushNotifications} from '../notifications'

const serverUrl = 'http://sneeze.internet-box.ch:3006';

const StorageScreen = () => {
  const [userItems, setUserItems] = useState([]);
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const {expoPushToken} = usePushNotifications();

  const route = useRoute();
  const userId = route.params.userId;

  const showPopup = (message) => {
    setPopupMessage(message);
    setPopupVisible(true);
  
    // Automatically hide the pop-up after 2 seconds
    setTimeout(() => {
      setPopupVisible(false);
      setPopupMessage('');
    }, 5000);
  };

  const handleOfferToCommunity = async (itemId) => {
    try {
      // Make a POST request to update the item's addToCommunity property
      const response = await fetch(`${serverUrl}/api/offer-to-community`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
        }),
      });

      if (response.ok) {
        // Item offered to the community successfully, update the state
        setUserItems((prevItems) =>
          prevItems.map((item) =>
            item.id === itemId ? { ...item, addtocommunity: 1 } : item
          )
        );
        // Set the success message
        showPopup('Item offered to the community successfully.');
      } else {
        console.error('Failed to offer item to the community:', response.status);
      }
    } catch (error) {
      console.error('Error offering item to the community:', error);
    }
  };

  const fetchUserItems = async () => {
    try {
      const response = await fetch(`${serverUrl}/api/user-items?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserItems(data);
      } else {
        console.error('Failed to fetch user items:', response.status);
      }
    } catch (error) {
      console.error('Error fetching user items:', error);
    }
  };

  const handleScheduleNotifications = () => {
    // Call the notification scheduling function here
    scheduleItemNotifications(userItems);
  };

  useEffect(() => {
    if (userId) {
      fetchUserItems();
    }
  }, [userId]);

  const handleRemoveFromStorage = async (itemId) => {
    try {
      // Make a DELETE request to your API to remove the item from the database
      const response = await fetch(`${serverUrl}/api/remove-item/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // If the deletion was successful, update the userItems state to reflect the change
        setUserItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
        // Show a success message
        showPopup(`Item was removed from storage.`);
      } else {
        console.error('Failed to remove item from storage:', response.status);
      }
    } catch (error) {
      console.error('Error removing item from storage:', error);
    }
  };

  const isItemExpired = (expiryDate) => {
    const currentDate = new Date();
    return currentDate > new Date(expiryDate);
  };

  const handleAddToShoppingList = async (itemId, itemName) => {
    // Make a POST request to add the item to the shopping list with quantity 1
    try {
      const response = await fetch(`${serverUrl}/api/shopping-list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId, 
          name: itemName,
          quantity: 1,
        }),
      });
      if (response.ok) {
        // Update the state to remove the item from the storage
        setUserItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
        // Call handleRemoveFromStorage to delete the item from storage
        handleRemoveFromStorage(itemId);
        // Show a success message
        showPopup(`${itemName} was added to the shopping list and removed from storage.`);
      } else {
        console.error('Failed to add item to shopping list:', response.status);
      }
    } catch (error) {
      console.error('Error adding item to shopping list:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUserItems();
    }, [])
  );

return (
  <ImageBackground
    source={require('../Pictures/background.jpg')}
    style={styles.backgroundImage}
  >
    <ScrollView>
      <View style={styles.container}>
        <TouchableOpacity
          onPress={handleScheduleNotifications}
          style={styles.scheduleNotificationsButton}
        >
          <Text style={styles.scheduleNotificationsButtonText}>
            Schedule Expiry Notifications
          </Text>
        </TouchableOpacity>
        {userItems.map((item) => (
          <View key={item.id} style={styles.itemContainer}>
            <View style={styles.itemDetailsContainer}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemExpiryDate}>
                Expiry Date: {new Date(item.expiry_date).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
            <View style={styles.itemButtonsContainer}>
              {isItemExpired(item.expiry_date) ? (
                <View>
                  <Text style={styles.expiredText}>
                    Item Expired
                  </Text>
                  <TouchableOpacity
                    style={styles.addToShoppingListButton}
                    onPress={() => handleAddToShoppingList(item.id, item.name)}
                  >
                    <Ionicons name="basket" size={24} color="green" />
                    <Text style={styles.addToShoppingListText}>
                      Add to Shopping List
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : item.addtocommunity === 1 ? (
                <Text style={styles.communityText}>
                  Already Offered to Community
                </Text>
              ) : (
                <TouchableOpacity
                  style={styles.offerButton}
                  onPress={() => handleOfferToCommunity(item.id)}
                >
                  <Text style={styles.offerButtonText}>
                    Offer to Community
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveFromStorage(item.id)}
              >
                <Ionicons name="trash" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <Modal
        animationType="slide"
        transparent={true}
        visible={isPopupVisible}
        onRequestClose={() => {
          setPopupVisible(false);
          setPopupMessage('');
        }}
      >
        <View style={styles.popup}>
          <Text style={styles.popupText}>{popupMessage}</Text>
        </View>
      </Modal>
      </View>
    </ScrollView>
  </ImageBackground>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: 'white',
    marginBottom: 10,
    borderRadius: 20,
    opacity: 0.85,
  },
  itemText: {
    fontSize: 16,
    marginBottom: 5,
  },
  offerButton: {
    backgroundColor: 'purple',
    padding: 10,
    margin: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  offerButtonText: {
    color: 'white',
    fontSize: 16,
  },
  communityText: {
    color: 'gray',
    fontSize: 15,
    marginTop: 5,
  },
  removeButton: {
    backgroundColor: 'red',
    padding: 10,
    margin: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
  },
  scheduleNotificationsButton: {
    backgroundColor: 'blue',
    padding: 10,
    margin: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  scheduleNotificationsButtonText: {
    color: 'white',
    fontSize: 16,
  },
  itemDetailsContainer: {
    flexGrow: 1,
  },
  itemButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  expiredText: {
    color: 'red',
    fontSize: 15,
    marginTop: 5,
  },
  addToShoppingListButton: {
    backgroundColor: 'transparent',
    borderColor: 'green',
    borderWidth: 1,
    padding: 10,
    margin: 10,
    borderRadius: 5,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  popup: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  popupText: {
    fontSize: 18,
    color: 'white',
    padding: 20,
    width: '80%',
    backgroundColor: 'rgba(0, 128, 0, 0.8)',
    borderRadius: 10,
  },
});

export default StorageScreen;