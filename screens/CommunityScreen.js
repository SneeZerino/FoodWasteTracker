import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Modal, ImageBackground } from 'react-native';
import ResidentialDataForm from '../ResidentialDataForm';
import { useFocusEffect } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

const serverUrl = 'http://sneeze.internet-box.ch:3006';

const CommunityScreen = () => {
  const [communityItems, setCommunityItems] = useState([]);
  const [hasResidentialData, setHasResidentialData] = useState(false);
  const [isCommunityVisible, setIsCommunityVisible] = useState(true);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [requestingUser, setRequestingUser] = useState(null);
  const [approved, setApproved] = useState(false);
  const route = useRoute();
  const userId = route.params.userId;

  useFocusEffect(
    React.useCallback(() => {
        fetchCommunityItems();
        fetchUserResidentialData();
    }, [])
  );

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

  const handleSubmitResidentialData = async (data) => {
    // Make a POST request to insert the user's residential data
    console.log('Sending request...');
    const response = await fetch(`${serverUrl}/api/insert-residential-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response) {
      if (response.ok) {
        // Data inserted successfully
        setHasResidentialData(true);
        console.log('Data inserted successfully');
      } else {
        // Registration failed, handle errors or show an error message
        const errorData = await response.json();
        console.error('Failed to insert residential data:', errorData.error || 'An error occurred during registration');
      }
    } else {
      console.error('Response is undefined');
    }
  };

  const handleCloseCommunity = () => {
    // Navigate to another screen when the "Close Community" button is pressed
    setIsCommunityVisible(false);
  };

  const handleTakeItem = (itemId, requestingUserId) => {
    // Make an API call to fetch user information for the requesting user
    fetch(`/api/user-info/${requestingUserId}`) // Replace with your actual API endpoint
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Assuming the API response contains user information
          const requestingUser = data.user;

          // Display the request modal to the current item owner
          setRequestingUser(requestingUser);
          setRequestModalVisible(true);
        } else {
          console.error('Failed to fetch user information for requesting user.');
        }
      })
      .catch((error) => {
        console.error('Error fetching user information:', error);
      });
  };

  const handleApproveRequest = () => {
    // Assuming you have the current item's ID, requestingUserId, and the item's current owner in state
    const updatedItem = {
      id: currentItem.id,
      addtocommunity: 0, // Set addtocommunity to 0 to indicate it's no longer in the community
      ownerUserId: requestingUserId, // Set the new owner to the requesting user
    };

    // Make an API call to update the item in the database
    fetch(`/api/update-item/${currentItem.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedItem),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Item updated successfully

          // Close the request modal
          setRequestModalVisible(false);

          // Set approved to true
          setApproved(true);

          // Optionally, you can update the local state to reflect the changes
          // For example, you can remove the item from the communityItems list
          // and update the item's owner in the local state
        } else {
          console.error('Failed to update the item in the database.');
        }
      })
      .catch((error) => {
        console.error('Error updating the item:', error);
      });
  };

  return (
    <ImageBackground
    source={require('../Pictures/background.jpg')}
    style={styles.backgroundImage}
  >
    <View style={styles.container}>
      <Text style={styles.header}>Community Items</Text>
      {hasResidentialData ? (
        <FlatList
          data={communityItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            // Parse the ISO date string into a JavaScript Date object
            const expiryDate = new Date(item.expiry_date);

            // Format the date as desired (e.g., "Day Month Year")
            const formattedExpiryDate = expiryDate.toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });
            return (
              <View style={styles.itemContainer}>
                <Text style={styles.itemText}>Name: {item.name}</Text>
                <Text style={styles.itemText}>Expiry Date: {formattedExpiryDate}</Text>
                <Button title="Take" onPress={() => handleTakeItem(item.id, item.ownerId)} />
              </View>
            );
          }}
        />
      ) : (
        <ResidentialDataForm userId={userId} onSubmit={handleSubmitResidentialData} onClose={() => setHasResidentialData(true)} />
      )}

      {/* Add the request modal here */}
      <Modal
        visible={requestModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setRequestModalVisible(false)}
      >
        <View>
          <Text>{requestingUser ? `${requestingUser.name} wants to take the item.` : ''}</Text>
          {requestingUser && !approved && (
            <Button title="Approve" onPress={handleApproveRequest} />
          )}
          <Button title="Decline" onPress={() => setRequestModalVisible(false)} />
        </View>
      </Modal>
    </View>
    </ImageBackground>
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
  itemText: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default CommunityScreen;
