import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import { serverUrl } from './config';

const StatisticsScreen = () => {
  const [totalItems, setTotalItems] = useState(0);
  const [itemsWithCommunity, setItemsWithCommunity] = useState(0);
  const [totalGlobalItems, setTotalGlobalItems] = useState(0);
  const [globalItemsWithCommunity, setGlobalItemsWithCommunity] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      fetchStatisticsData();
      fetchGlobalItemsStatistics();
    }, [])
  );

  const fetchStatisticsData = async () => {
    try {
      const response = await fetch(`${serverUrl}/api/statistics`);
      if (response.ok) {
        const data = await response.json();
        setTotalItems(data.totalItems);
        setItemsWithCommunity(data.itemsWithCommunity);
      } else {
        console.error('Error fetching statistics:', response.status);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchGlobalItemsStatistics = async () => {
    try {
      const response = await fetch(`${serverUrl}/api/global-items/statistics`);
      if (response.ok) {
        const data = await response.json();
        setTotalGlobalItems(data.totalGlobalItems);
        setGlobalItemsWithCommunity(data.globalItemsWithCommunity);
      } else {
        console.error('Error fetching global items statistics:', response.status);
      }
    } catch (error) {
      console.error('Error fetching global items statistics:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.chartGlobalContainer}>
      <View style={styles.chartBox}>   
        <Text style={styles.chartTitle}>Global Not Expired Items</Text>
        <Text style={styles.text}>Total Items: {totalItems}</Text>
        <PieChart
          data={[
            {
              name: 'Community',
              population: itemsWithCommunity,
              color: '#3498db',
              legendFontColor: '#7F7F7F',
              legendFontSize: 13,
            },
            {
              name: 'Personal',
              population: totalItems - itemsWithCommunity,
              color: '#7F7F7F',
              legendFontColor: '#7F7F7F',
              legendFontSize: 13,
            },
          ]}
          width={350}
          height={200}
          chartConfig={{
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
        />
        </View>
      </View>

      <View style={styles.chartLifetimeContainer}>
        <View style={styles.chartBox}>     
        <Text style={styles.chartTitle}>Lifetime Items</Text>
        <Text style={styles.text}>Total Items: {totalGlobalItems}</Text>
        <PieChart
          data={[
            {
              name: 'Community',
              population: globalItemsWithCommunity,
              color: '#FFC500',
              legendFontColor: '#7F7F7F',
              legendFontSize: 13,
            },
            {
              name: 'Personal',
              population: totalGlobalItems - globalItemsWithCommunity,
              color: '#FF6B50',
              legendFontColor: '#7F7F7F',
              legendFontSize: 13,
            },
          ]}
          width={350}
          height={200}
          chartConfig={{
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
        />
        </View>
     </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  chartGlobalContainer: {
    marginVertical: 20,
  },
  chartLifetimeContainer: {
    marginVertical: 20,
  },
  chartBox: {
    padding: 10,
  },
  text: {
    fontSize: 13,
    textAlign: 'center',
  }
});

export default StatisticsScreen;