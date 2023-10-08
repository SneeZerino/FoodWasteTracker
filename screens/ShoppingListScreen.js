import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ImageBackground } from 'react-native';
import { useRoute } from '@react-navigation/native';

const serverUrl = 'http://sneeze.internet-box.ch:3006';

const ShoppingListScreen = () => {
  const [shoppingList, setShoppingList] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');

  const route = useRoute();
  const userId = route.params.userId;

  // Fetch shopping list items for the user
  useEffect(() => {
    if (userId) { // Check if userId is defined
      const fetchShoppingList = async () => {
        try {
          const response = await fetch(`${serverUrl}/api/shopping-list/${userId}`);
          if (response.ok) {
            const data = await response.json();
            setShoppingList(data);
          } else {
            console.error('Error fetching shopping list:', response.status);
          }
        } catch (error) {
          console.error('Error fetching shopping list:', error);
        }
      };

      fetchShoppingList();
    }
  }, [userId]);

  const handleAddItem = async () => {
    try {
      const response = await fetch(`${serverUrl}/api/shopping-list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          name: newItemName,
          quantity: newItemQuantity,
        }),
      });

      if (response.ok) {
        const newItem = await response.json();
        setShoppingList([...shoppingList, newItem]);
        setNewItemName('');
        setNewItemQuantity('');
      } else {
        console.error('Error adding item to shopping list:', response.status);
      }
    } catch (error) {
      console.error('Error adding item to shopping list:', error);
    }
  };

  const handleUpdateQuantity = async (itemId, quantity) => {
    try {
      const response = await fetch(`${serverUrl}/api/shopping-list/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity,
        }),
      });

      if (response.ok) {
        const updatedItem = await response.json();
        setShoppingList((prevList) =>
          prevList.map((item) => (item.id === updatedItem.id ? updatedItem : item))
        );
      } else {
        console.error('Error updating item quantity:', response.status);
      }
    } catch (error) {
      console.error('Error updating item quantity:', error);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      const response = await fetch(`${serverUrl}/api/shopping-list/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setShoppingList((prevList) => prevList.filter((item) => item.id !== itemId));
      } else {
        console.error('Error deleting item from shopping list:', response.status);
      }
    } catch (error) {
      console.error('Error deleting item from shopping list:', error);
    }
  };

  return (
    <ImageBackground
    source={require('../Pictures/background.jpg')}
    style={styles.backgroundContainer}
  >
    <View style={styles.container}>
      <View style={styles.headerContainer}>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Item Name"
          value={newItemName}
          onChangeText={(text) => setNewItemName(text)}
          style={styles.input}
          placeholderTextColor="#888"
        />
        <TextInput
          placeholder="Quantity"
          value={newItemQuantity}
          onChangeText={(text) => setNewItemQuantity(text)}
          style={[styles.input, styles.quantityInput]}
          placeholderTextColor="#888"
        />
      </View>
      <TouchableOpacity onPress={handleAddItem} style={styles.addButton}>
        <Text style={styles.buttonText}>Add Item</Text>
      </TouchableOpacity>
      <FlatList
        data={shoppingList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemName}>{item.name}</Text>
            <TextInput
              placeholder="Quantity"
              value={item.quantity.toString()}
              onChangeText={(text) => handleUpdateQuantity(item.id, text)}
              style={styles.quantityInput}
              placeholderTextColor="#888"
            />
            <TouchableOpacity onPress={() => handleDeleteItem(item.id)}>
              <Text style={styles.deleteButton}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    padding: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 30,
    paddingVertical: 30,
    marginBottom: 8,
    borderRadius: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 8,
    marginRight: 8,
    color: '#333',
  },
  quantityInput: {
    marginRight: 0,
  },
  addButton: {
    backgroundColor: '#007bff',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  itemName: {
    flex: 1,
    color: '#333',
  },
  deleteButton: {
    color: 'red',
    fontWeight: 'bold',
  },
});

export default ShoppingListScreen;
