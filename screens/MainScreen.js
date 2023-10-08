import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CommunityScreen from './CommunityScreen';
import AddGroceriesScreen from './AddGroceriesScreen';
import ShoppingListScreen from './ShoppingListScreen';
import StorageScreen from './StorageScreen';

const Tab = createBottomTabNavigator();
function MainScreen({ route }) {

  const userId = route.params.userId
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: 'blue',
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: {
          fontSize: 14,
        },
        tabBarStyle: {
          display: 'flex',
        },
      }}
    >
      <Tab.Screen
        name="Add Groceries"
        options={{ title: 'Add Groceries' }}
        initialParams={{ userId }}
        component={AddGroceriesScreen}
      />
      <Tab.Screen
        name="Storage"
        options={{ title: 'Storage' }}
        initialParams={{ userId }}
        component={StorageScreen}
      />
      <Tab.Screen
        name="Shopping List"
        options={{ title: 'Shopping List' }}
        initialParams={{ userId }}
        component={ShoppingListScreen}
      />
      <Tab.Screen
        name="Community"
        options={{ title: 'Community' }}
        initialParams={{ userId }}
        component={CommunityScreen}
      />
    </Tab.Navigator>
  );
}

export default MainScreen;
