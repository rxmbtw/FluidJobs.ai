import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import LoadingScreen from '../components/LoadingScreen';

const AlertsScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 2000);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }
  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Profile Completion Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Complete your profile</Text>
          <Text style={styles.cardDescription}>
            By completing your profile you can start applying to job openings in one click...
          </Text>
          
          {/* Progress */}
          <View style={styles.progressSection}>
            <Text style={styles.progressText}>50%</Text>
            <View style={styles.progressBar}>
              <View style={styles.progressBackground} />
              <View style={[styles.progressFill, { width: '50%' }]} />
            </View>
          </View>

          <View style={styles.divider} />

          {/* Items */}
          <View style={styles.items}>
            <View style={styles.item}>
              <View style={styles.checkbox} />
              <Text style={styles.itemText}>Upload resume</Text>
              <View style={styles.plusButton}>
                <Text style={styles.plusText}>+</Text>
              </View>
            </View>
            <View style={styles.item}>
              <View style={styles.checkbox} />
              <Text style={styles.itemText}>Upload profile picture</Text>
              <View style={styles.plusButton}>
                <Text style={styles.plusText}>+</Text>
              </View>
            </View>
            <View style={styles.item}>
              <View style={styles.checkbox} />
              <Text style={styles.itemText}>Add your address</Text>
              <View style={styles.plusButton}>
                <Text style={styles.plusText}>+</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Alerts Card */}
        <View style={styles.alertsCard}>
          <View style={styles.alertsHeader}>
            <Text style={styles.alertsIcon}>🔔</Text>
            <Text style={styles.alertsTitle}>Alerts</Text>
          </View>
          <View style={styles.alertsContent}>
            <Text style={styles.alertsMessage}>
              Complete your profile to start getting announcements of the latest job openings!
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F1F1',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 25,
    fontWeight: '800',
    lineHeight: 29,
    color: '#000000',
    fontFamily: 'Roboto',
    marginBottom: 16,
  },
  cardDescription: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 16,
    color: '#6E6E6E',
    fontFamily: 'Roboto',
    marginBottom: 24,
  },
  progressSection: {
    marginBottom: 24,
  },
  progressText: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 23,
    color: '#000000',
    fontFamily: 'Roboto',
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    position: 'relative',
  },
  progressBackground: {
    position: 'absolute',
    width: '100%',
    height: 6,
    backgroundColor: '#D9D9D9',
    borderRadius: 3,
  },
  progressFill: {
    position: 'absolute',
    height: 6,
    backgroundColor: '#4285F4',
    borderRadius: 3,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.29)',
    marginBottom: 16,
  },
  items: {
    gap: 18,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1.5,
    borderColor: '#6E6E6E',
    borderRadius: 4,
    marginRight: 12,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 16,
    color: '#6E6E6E',
    fontFamily: 'Roboto',
  },
  plusButton: {
    width: 24,
    height: 24,
    backgroundColor: '#4285F4',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  alertsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 24,
    minHeight: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  alertsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  alertsIcon: {
    fontSize: 24,
  },
  alertsTitle: {
    fontSize: 25,
    fontWeight: '800',
    lineHeight: 29,
    color: '#000000',
    fontFamily: 'Roboto',
  },
  alertsContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertsMessage: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 16,
    color: '#6E6E6E',
    textAlign: 'center',
    fontFamily: 'Roboto',
  },
});

export default AlertsScreen;
