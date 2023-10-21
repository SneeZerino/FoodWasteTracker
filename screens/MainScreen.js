import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CommunityScreen from './CommunityScreen';
import AddGroceriesScreen from './AddGroceriesScreen';
import ShoppingListScreen from './ShoppingListScreen';
import StorageScreen from './StorageScreen';
import StatisticsScreen from './StatisticsScreen';
import { Ionicons } from '@expo/vector-icons';
import LogoutButton from './LogoutButton';

const Tab = createBottomTabNavigator();

function MainScreen({ route, navigation }) {
  const userId = route.params.userId;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Add Groceries') {
            iconName = 'ios-cart';
          } else if (route.name === 'Storage') {
            iconName = 'ios-archive';
          } else if (route.name === 'Shopping List') {
            iconName = 'ios-list';
          } else if (route.name === 'Community') {
            iconName = 'ios-people';
          } else if (route.name === 'Statistics') {
            iconName = 'ios-stats-chart';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarStyle: {
        backgroundColor: '#3498db',
        },
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'white',
      })}
    >
      <Tab.Screen
        name="Add Groceries"
        options={{ title: 'Add Groceries', headerRight: () => <LogoutButton />, headerStyle: {backgroundColor: '#3498db', }}}
        initialParams={{ userId }}
        component={AddGroceriesScreen}
      />
      <Tab.Screen
        name="Storage"
        options={{ title: 'Storage', headerRight: () => <LogoutButton />, headerStyle: {backgroundColor: '#3498db', }}}
        initialParams={{ userId }}
        component={StorageScreen}
      />
      <Tab.Screen
        name="Shopping List"
        options={{ title: 'Shopping List', headerRight: () => <LogoutButton />, headerStyle: {backgroundColor: '#3498db', }}}
        initialParams={{ userId }}
        component={ShoppingListScreen}
      />
      <Tab.Screen
        name="Community"
        options={{ title: 'Community', headerRight: () => <LogoutButton />, headerStyle: {backgroundColor: '#3498db', }}}
        initialParams={{ userId }}
        component={CommunityScreen}
      />
      <Tab.Screen
        name="Statistics"
        options={{ title: 'Statistics', headerRight: () => <LogoutButton />, headerStyle: {backgroundColor: '#3498db', }}}
        component={StatisticsScreen}
        />
    </Tab.Navigator>
  );
}

export default MainScreen;
