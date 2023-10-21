import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Modal, ImageBackground, TouchableOpacity } from 'react-native';
import ResidentialDataForm from '../ResidentialDataForm';
import { useFocusEffect } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

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

  useEffect(() => {
    fetchUserResidentialData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchCommunityItems();
    }, [])
  );

const fetchCommunityItems = async () => {
  const userId = route.params.userId;

  try {
    const response = await fetch(`${serverUrl}/api/community-items`);
    if (response.ok) {
      const data = await response.json();
      // Filter out expired items and items owned by the current user
      const currentDate = new Date();
      const filteredItems = data.filter((item) => {
        return new Date(item.expiry_date) > currentDate && item.ownerId !== userId;
      });
      setCommunityItems(filteredItems);
    } else {
      console.error('Failed to fetch community items:', response.status);
    }
  } catch (error) {
    console.error('Error fetching community items:', error);
  }
};

  const fetchUserResidentialData = async () => {
    try {
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
        setHasResidentialData(true);
        console.log('Data inserted successfully');
      } else {
        const errorData = await response.json();
        console.error('Failed to insert residential data:', errorData.error || 'An error occurred during registration');
      }
    } else {
      console.error('Response is undefined');
    }
  };

  const handleTakeItem = async (itemId, requestingUserId) => {
    const response = await fetch(`${serverUrl}/api/user-info/${requestingUserId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const requestingUser = data.user;
          setRequestingUser(requestingUser);
          setRequestingUserId(requestingUserId);
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
    const updatedItem = {
      id: currentItem.id,
      addtocommunity: 0,
      ownerUserId: requestingUserId,
    };

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
          setRequestModalVisible(false);
          setApproved(true);
        } else {
          console.error('Failed to update the item in the database.');
        }
      })
      .catch((error) => {
        console.error('Error updating the item:', error);
      });
  };

  const handleRemoveFromCommunity = async (itemId) => {
    try {
      const response = await fetch(`${serverUrl}/api/update-item/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ addtocommunity: 0 }),
      });
  
      if (response.ok) {
        // Remove the item from the communityItems state.
        setCommunityItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
      } else {
        const errorData = await response.json();
        console.error('Failed to update the item in the database:', errorData.error);
      }
    } catch (error) {
      console.error('Error updating the item:', error);
    }
  };

  return (
    <ImageBackground source={require('../Pictures/background.jpg')} style={styles.backgroundImage}>
      {hasResidentialData ? (
        <FlatList
          data={communityItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const expiryDate = new Date(item.expiry_date);
            const formattedExpiryDate = expiryDate.toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });
  
            // Check if the user is the owner of the item to show the "Remove from Community" icon
            const isOwner = item.user_id === userId;
  
            return (
              <View style={styles.itemContainer}>
                <View style={styles.item}>
                  <Text style={styles.itemText}>Name: {item.name}</Text>
                  <Text style={styles.itemText}>Expiry Date: {formattedExpiryDate}</Text>
                  <View style={styles.itemIcons}>
                    {isOwner ? (
                      <Ionicons
                        name="trash"
                        size={24}
                        color="red"
                        style={styles.icon}
                        onPress={() => handleRemoveFromCommunity(item.id)}
                      />
                    ) : (
                      <TouchableOpacity
                        onPress={() => handleTakeItem(item.id, item.ownerId)}
                      >
                        <View style={styles.requestButton}>
                          <Ionicons
                            name="basket"
                            size={24}
                            color="green"
                            style={styles.icon}
                          />
                          <Text style={styles.requestButtonText}>Request item</Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          }}
        />
      ) : null}
  
      {hasResidentialData ? null : (
        <ResidentialDataForm userId={userId} onSubmit={handleSubmitResidentialData} onClose={() => setHasResidentialData(true)} />
      )}
  
      <Modal
        visible={requestModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setRequestModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>
            {requestingUser ? `${requestingUser.name} wants to take the item.` : ''}
          </Text>
          {requestingUser && !approved && (
            <Button title="Approve" onPress={handleApproveRequest} />
          )}
          <Button title="Decline" onPress={() => setRequestModalVisible(false)} />
        </View>
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  Container: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: 'white',
    marginBottom: 10,
    borderRadius: 20,
    opacity: 0.85,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  itemContainer: {
    borderWidth: 1,
    borderColor: 'white',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    opacity: 0.85,
  },
  itemText: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  itemIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  requestButton: {
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
});

export default CommunityScreen;
