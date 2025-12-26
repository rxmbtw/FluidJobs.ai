import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';

const LoadingScreen: React.FC = () => {
  const [progress] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 100,
      duration: 2000,
      useNativeDriver: false,
    }).start();
  }, []);

  const progressWidth = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/logo.png')} 
          style={styles.logo}
        />
        <Text style={styles.brandText}>FluidJobs.ai</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground} />
        <Animated.View 
          style={[
            styles.progressBar, 
            { width: progressWidth }
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 48,
  },
  logo: {
    width: 59,
    height: 59,
  },
  brandText: {
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 45,
    fontFamily: 'Poppins',
    color: '#4285F4',
  },
  progressContainer: {
    width: 263,
    height: 10,
    position: 'relative',
  },
  progressBackground: {
    position: 'absolute',
    width: '100%',
    height: 10,
    backgroundColor: '#A19FA8',
    borderRadius: 10,
  },
  progressBar: {
    position: 'absolute',
    height: 10,
    backgroundColor: '#4285F4',
    borderRadius: 10,
  },
});

export default LoadingScreen;
