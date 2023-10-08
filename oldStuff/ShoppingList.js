import React, { useState, useEffect } from 'react';
import {View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

const serverUrl = 'http://sneeze.internet-box.ch:3006';

const ShoppingList = ({ userId, onClose }) => {
  const [shoppingList, setShoppingList] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [isShoppingListVisible, setIsShoppingListVisible] = useState(true);


  // Fetch shopping list items for the user
  useEffect(() => {
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

  const handleClose = () => {
    setIsShoppingListVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
      <Text style={styles.closeButtonText}>Close</Text>
    </TouchableOpacity>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Shopping List</Text>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 30, // Add horizontal padding
    paddingVertical: 30,   // Add vertical padding
    marginBottom: 8,     // Add bottom margin
    borderRadius: 8,    // Add border radius for rounded corners
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 30, // Add horizontal padding
    paddingVertical: 30,   // Add vertical padding
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    backgroundColor: 'red',
    borderRadius: 5,
    paddingVertical: 4, // Adjust vertical padding
    paddingHorizontal: 8, // Adjust horizontal padding
    alignSelf: 'flex-end', // Align to the right
    marginRight: 8, // Add some right margin for spacing
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 16,
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

export default ShoppingList;
