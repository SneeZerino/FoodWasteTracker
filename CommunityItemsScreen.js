import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button } from 'react-native';

const serverUrl = 'http://sneeze.internet-box.ch:3006';

const CommunityItemsScreen = ({ userId }) => {
  const [communityItems, setCommunityItems] = useState([]);
  useEffect(() => {
    // Fetch community items when the component mounts
    fetchCommunityItems();
  }, []);

  const fetchCommunityItems = async () => {
    try {
      // Make a GET request to your API endpoint for community items
      const response = await fetch(`${serverUrl}/api/community-items`);
      if (response.ok) {
        const data = await response.json();
        setCommunityItems(data);
      } else {
        console.error('Failed to fetch community items:', response.status);
      }
    } catch (error) {
      console.error('Error fetching community items:', error);
    }
  };

  const handleTakeItem = async (itemId) => {
    try {
      // Make a POST request to update the item's user_id and addToCommunity
      const response = await fetch(`${serverUrl}/api/take-item`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
          userId,
        }),
      });

      if (response.ok) {
        // Item taken successfully, remove it from the list
        setCommunityItems((prevItems) =>
          prevItems.filter((item) => item.id !== itemId)
        );
      } else {
        console.error('Failed to take item:', response.status);
      }
    } catch (error) {
      console.error('Error taking item:', error);
    }
  };

  return (
    <View>
      <Text>Community Items</Text>
      <FlatList
        data={communityItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View>
            <Text>Name: {item.name}</Text>
            <Text>Expiry Date: {item.expiryDate}</Text>
            <Button
              title="Take"
              onPress={() => handleTakeItem(item.id)}
            />
          </View>
        )}
      />
    </View>
  );
};

export default CommunityItemsScreen;
