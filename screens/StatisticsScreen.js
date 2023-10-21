import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

const serverUrl = 'http://sneeze.internet-box.ch:3006';

const StatisticsScreen = () => {
    const [totalItems, setTotalItems] = useState(0);
    const [itemsWithCommunity, setItemsWithCommunity] = useState(0);
  
    useEffect(() => {
      // Make an API call to fetch statistics data
      fetchStatisticsData();
    }, []);
  
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
    
      // Define data for the chart based on the fetched values
      const chartData = {
        labels: ['Total Items', 'Items with Community'],
        datasets: [
          {
            data: [totalItems, itemsWithCommunity],
          },
        ],
      };
    
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Statistics</Text>
          
          <Text style={styles.numberLabel}>Total Items:</Text>
          <Text style={styles.number}>{totalItems}</Text>
    
          <Text style={styles.numberLabel}>Items with Community:</Text>
          <Text style={styles.number}>{itemsWithCommunity}</Text>
    
          <BarChart
            data={chartData}
            width={300}
            height={200}
            yAxisSuffix=""
            yAxisInterval={1}
            chartConfig={{
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
          />
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
});

export default StatisticsScreen;
