import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';

// Import screens (to be created)
import AlertsScreen from '../screens/AlertsScreen';
import MyJobsScreen from '../screens/MyJobsScreen';
import MyResumeScreen from '../screens/MyResumeScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#4285F4',
        tabBarInactiveTintColor: '#A19FA8',
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen 
        name="Alerts" 
        component={AlertsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeTab]}>
              <Text style={styles.icon}>🔔</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="My Jobs" 
        component={MyJobsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeTab]}>
              <Text style={styles.icon}>💼</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="My Resume" 
        component={MyResumeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeTab]}>
              <Text style={styles.icon}>📄</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeTab]}>
              <Text style={styles.icon}>👤</Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 24,
    left: '50%',
    marginLeft: -152.5,
    width: 305,
    height: 70,
    backgroundColor: '#F1F1F1',
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
    borderTopWidth: 0,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Poppins',
  },
  iconContainer: {
    width: 46,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'rgba(66, 133, 244, 0.16)',
    borderRadius: 30,
  },
  icon: {
    fontSize: 28,
  },
});

export default BottomTabNavigator;
