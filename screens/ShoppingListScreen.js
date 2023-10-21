import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ImageBackground, ScrollView } from 'react-native';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const serverUrl = 'http://sneeze.internet-box.ch:3006';

const ShoppingListScreen = () => {
  const [shoppingList, setShoppingList] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [isEditingQuantity, setIsEditingQuantity] = useState(false);
  const [editedItemId, setEditedItemId] = useState(null);
  const [editedItemQuantity, setEditedItemQuantity] = useState('');

  const route = useRoute();
  const userId = route.params.userId;

  // Fetch shopping list items for the user
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

  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        fetchShoppingList();
      }
    }, [userId])
  );

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
          quantity: quantity.trim() === '' ? 0 : quantity,
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

  const openQuantityEditor = (itemId, currentQuantity) => {
    setIsEditingQuantity(true);
    setEditedItemId(itemId);
    setEditedItemQuantity(currentQuantity.toString());
  };

  const saveQuantityEditor = async () => {
    setIsEditingQuantity(false);
    if (editedItemId) {
      handleUpdateQuantity(editedItemId, editedItemQuantity);
    }
    setEditedItemId(null);
  };
  return (
    <ImageBackground
      source={require('../Pictures/background.jpg')}
      style={styles.backgroundContainer}
    >
      <View style={styles.container}>
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
            style={[styles.quantityInput]}
            placeholderTextColor="#888"
          />
        <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddItem}
            >
            <MaterialIcons name="post-add" size={50} color="green" />
          </TouchableOpacity>
        </View>
        <View style={styles.inputTextContainer}>
        <Text style={styles.labelName}>Item Name</Text>
        <Text style={styles.labelQuantity}>Quantity</Text>
      </View>
      <ScrollView style={styles.itemList}>
    {shoppingList.map((item) => (
      <View key={item.id} style={styles.itemContainer}>
        <Text style={styles.itemName}>{item.name}</Text>
        <TouchableOpacity
          style={styles.editQuantityButton}
          onPress={() => openQuantityEditor(item.id, item.quantity)}
        >
          <Ionicons name="create" size={24} color="blue" />
        </TouchableOpacity>
        {isEditingQuantity && editedItemId === item.id ? (
          <View style={styles.quantityInputContainer}>
            <TextInput
              placeholder="New Quantity"
              value={editedItemQuantity}
              onChangeText={(text) => setEditedItemQuantity(text)}
              style={styles.quantityEditorInput}
              placeholderTextColor="#888"
            />
            <TouchableOpacity
              style={styles.quantityEditorSaveButton}
              onPress={saveQuantityEditor}
            >
              <Text style={styles.quantityEditorSaveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TextInput
            placeholder="Quantity"
            value={item.quantity === 0 ? '' : item.quantity.toString()}
            editable={false}
            style={styles.quantityListInput}
            placeholderTextColor="#888"
          />
        )}
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleDeleteItem(item.id)}
        >
          <Ionicons name="trash" size={24} color="white" />
        </TouchableOpacity>
      </View>
    ))}
  </ScrollView>
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
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 8,
    padding: 8,
    backgroundColor: 'rgba(30,30,30,0.7)', 
    borderRadius: 5,
    marginBottom: 20,
  },
  input: {
    width: '50%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 8,
    marginRight: 8,
    color: '#333',
    backgroundColor: 'white',
  },
  quantityInput: {
    width: '30%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 8,
    color: '#333',
    backgroundColor: 'white',
  },
  quantityListInput: {
    width: 35,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 8,
    marginRight: 8,
    color: '#333',
  },
  buttonText: {
    color: 'white',
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
    backgroundColor: 'white',
    opacity: 0.8,
  },
  itemName: {
    flex: 1,
    color: '#333',
  },
  removeButton: {
    backgroundColor: 'red',
    width: 40,
    height: 40,
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  labelName: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  labelQuantity: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginLeft: 100,
  },
  itemList: {
    padding: 8,
  },
  inputTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 8,
    padding: 8,
    backgroundColor: 'rgba(30,30,30,0.7)',
    borderRadius: 5,
  },
  editQuantityButton: {
    backgroundColor: 'transparent',
    padding: 8,
  },
  quantityEditorOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  quantityEditor: {
    width: 300,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  quantityEditorInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 8,
    marginBottom: 8,
    color: '#333',
  },
  quantityEditorSaveButton: {
    backgroundColor: 'green',
    borderRadius: 5,
    padding: 8,
    alignItems: 'center',
  },
  quantityEditorSaveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ShoppingListScreen;