import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LoadingScreen from '../components/LoadingScreen';

const MyResumeScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 2000);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Resume</Text>
      <Text style={styles.subtitle}>Coming Soon</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  title: {
    fontSize: 25,
    fontWeight: '800',
    color: '#000000',
    fontFamily: 'Roboto',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6E6E6E',
    fontFamily: 'Roboto',
  },
});

export default MyResumeScreen;
