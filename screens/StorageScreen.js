import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet, ImageBackground } from 'react-native';
import { useRoute } from '@react-navigation/native';
import {scheduleItemNotifications} from '../notifyUser';

const serverUrl = 'http://sneeze.internet-box.ch:3006';

const StorageScreen = () => {
  const [userItems, setUserItems] = useState([]);
  
  const route = useRoute();
  const userId = route.params.userId;

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
        // Call the notification scheduling function here if needed
        scheduleItemNotifications(data);
      } else {
        console.error('Failed to fetch user items:', response.status);
      }
    } catch (error) {
      console.error('Error fetching user items:', error);
    }
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
      } else {
        console.error('Failed to remove item from storage:', response.status);
      }
    } catch (error) {
      console.error('Error removing item from storage:', error);
    }
  };

  return (
    <ImageBackground
    source={require('../Pictures/background.jpg')}
    style={styles.backgroundImage}
  >
    <View style={styles.container}>
      <FlatList
        data={userItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemExpiryDate}>
              {new Date(item.expiry_date).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            {item.addtocommunity === 0 ? (
              <Button title="Offer to Community" onPress={() => handleOfferToCommunity(item.id)} />
            ) : (
              <Button title="Remove from Storage" onPress={() => handleRemoveFromStorage(item.id)} />
            )}
            {item.addtocommunity === 1 && (
                      <Text style={styles.communityText}>Currently offered to the Community</Text>
            )}
          </View>
        )}
      />
    </View>
    </ImageBackground>
  )};
  

const styles = StyleSheet.create({
    itemContainer: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        backgroundColor: 'white',
        marginBottom: 10,
        borderRadius: 10,
        opacity: 0.8,
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
        fontSize: 16,
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
    });

export default StorageScreen;
