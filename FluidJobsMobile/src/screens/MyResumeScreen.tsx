import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import LoadingScreen from '../components/LoadingScreen';

const MyResumeScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: 'Shriram Surse',
    location: 'Pune, Maharashtra',
    joinedDate: 'Joined Oct 2025',
    email: 'ram@fluid.live',
    phone: '+91 98765 XXXXX',
    dob: '01/01/2004',
    currentCity: 'Pune, Maharashtra',
    joined: '5 Oct 2025',
    skills: ['Python', 'C/C++', 'Java'],
  });

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header Banner */}
      <View style={styles.header}>
        <View style={styles.banner} />
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarIcon}>👤</Text>
          </View>
        </View>
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{userData.name}</Text>
        <Text style={styles.userLocation}>{userData.location} | {userData.joinedDate}</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.buttonIcon}>📄</Text>
          <Text style={styles.primaryButtonText}>Generate Resume</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.buttonIcon}>🤖</Text>
          <Text style={styles.secondaryButtonText}>AI Resume Reviewer</Text>
        </TouchableOpacity>
      </View>

      {/* Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>✉️</Text>
              <Text style={styles.infoLabel}>Email Address</Text>
            </View>
            <Text style={styles.infoValue}>{userData.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>📞</Text>
              <Text style={styles.infoLabel}>Phone Number</Text>
            </View>
            <Text style={styles.infoValue}>{userData.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>🎂</Text>
              <Text style={styles.infoLabel}>DOB (Date of Birth)</Text>
            </View>
            <Text style={styles.infoValue}>{userData.dob}</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>📍</Text>
              <Text style={styles.infoLabel}>Current City</Text>
            </View>
            <Text style={styles.infoValue}>{userData.currentCity}</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>ℹ️</Text>
              <Text style={styles.infoLabel}>Joined</Text>
            </View>
            <Text style={styles.infoValue}>{userData.joined}</Text>
          </View>
        </View>
      </View>

      {/* Work Experience Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Work Experience</Text>
      </View>

      {/* Resume Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resume</Text>
      </View>

      {/* Skills Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills</Text>
        <View style={styles.skillsContainer}>
          {userData.skills.map((skill, index) => (
            <View key={index} style={styles.skillBadge}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F1F1',
  },
  contentContainer: {
    paddingBottom: 120,
  },
  header: {
    position: 'relative',
    marginBottom: 60,
  },
  banner: {
    width: '100%',
    height: 180,
    backgroundColor: '#4285F4',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarContainer: {
    position: 'absolute',
    bottom: -50,
    alignSelf: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#6BA3F7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: '#FFFFFF',
  },
  avatarIcon: {
    fontSize: 50,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'Poppins',
    marginBottom: 4,
  },
  userLocation: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4285F4',
    fontFamily: 'Poppins',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Poppins',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34A853',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Poppins',
  },
  buttonIcon: {
    fontSize: 18,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'Poppins',
    marginBottom: 16,
  },
  infoCard: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  infoIcon: {
    fontSize: 20,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6E6E6E',
    fontFamily: 'Poppins',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Poppins',
    textAlign: 'right',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  skillBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#4285F4',
    borderRadius: 8,
  },
  skillText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4285F4',
    fontFamily: 'Poppins',
  },
  bottomPadding: {
    height: 20,
  },
});

export default MyResumeScreen;
