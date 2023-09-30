import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import ResidentialDataForm from './ResidentialDataForm';

const serverUrl = 'http://sneeze.internet-box.ch:3006';

const CommunityItemsScreen = ({ userId }) => {
  const [communityItems, setCommunityItems] = useState([]);
  const [hasResidentialData, setHasResidentialData] = useState(false);
  const [isCommunityVisible, setIsCommunityVisible] = useState(true);
  
  useEffect(() => {
    // Fetch community items when the component mounts
    fetchCommunityItems();

    // Fetch user's residential data
    fetchUserResidentialData();
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

  const fetchUserResidentialData = async () => {
    try {
      // Make a GET request to check if the user has residential data
      const response = await fetch(`${serverUrl}/api/check-residential-data?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setHasResidentialData(data.hasResidentialData);
      } else {
        console.error('Failed to fetch user residential data:', response.status);
      }
    } catch (error) {
      console.error('Error fetching user residential data:', error);
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

  const handleSubmitResidentialData = async (data) => {
    try {
      // Make a POST request to insert the user's residential data
      console.log('Sending request...');
      const response = await fetch(`${serverUrl}/api/insert-residential-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (!response) {
        console.error('Response is undefined');
        return;
      }
      console.log('Response received:', response);
      if (response.ok) {
        // Data inserted successfully
        setHasResidentialData(true);
        console.log('Data inserted successfully');
      } else {
        console.error('Failed to insert residential data:', response.status);
      }
    } catch (error) {
      console.error('Error inserting residential data:', error);
    }
  };
  
  const handleCloseCommunity = () => {
    // Navigate to another screen when the "Close Community" button is pressed
    setIsCommunityVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Community Items</Text>
      {hasResidentialData ? (
        <FlatList
          data={communityItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <Text>Name: {item.name}</Text>
              <Text>Expiry Date: {item.expiryDate}</Text>
              <Button title="Take" onPress={() => handleTakeItem(item.id)} />
            </View>
          )}
        />
      ) : (
        <ResidentialDataForm userId={userId} onSubmit={handleSubmitResidentialData} onClose={() => setHasResidentialData(true)} />
      )}
      <Button title="Close Community" onPress={handleCloseCommunity} style={styles.closeButton} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
    marginTop: 100,
    borderRadius: 15,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  itemContainer: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 16,
    marginBottom: 16,
  },
  closeButton: {
    marginTop: 16,
  },
});

export default CommunityItemsScreen;