import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

interface JobDetailViewProps {
  job: any;
  isSaved: boolean;
  onToggleSave: (jobId: string) => void;
  onBack: () => void;
}

const JobDetailView: React.FC<JobDetailViewProps> = ({ job, isSaved, onToggleSave, onBack }) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Company Banner */}
      <View style={styles.banner}>
        {job.matchScore && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Perfect Match</Text>
          </View>
        )}
      </View>

      {/* Company Logo Circle */}
      <View style={styles.logoCircle}>
        <Image 
          source={require('../assets/logo.png')} 
          style={styles.logo}
        />
      </View>

      {/* Job Title and Apply Button */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.postedDate}>Posted on: {job.postedDate}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.applyButton}>
            <Text style={styles.applyText}>Apply Now</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onToggleSave(job.id)}>
            <Text style={styles.bookmark}>{isSaved ? '🔖' : '📑'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Job Metadata */}
      <View style={styles.metadata}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>JOB TYPE</Text>
          <Text style={styles.metaValue}>{job.jobType}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>INDUSTRY</Text>
          <Text style={styles.metaValue}>{job.industry}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>CTC</Text>
          <Text style={styles.metaValue}>{job.ctc}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>LOCATION</Text>
          <Text style={styles.metaValue}>{job.location}</Text>
        </View>
      </View>

      {/* Registration Schedule */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>REGISTRATION SCHEDULE</Text>
        <View style={styles.scheduleItem}>
          <Text style={styles.calendarIcon}>📅</Text>
          <Text style={styles.scheduleText}>Opens: 11:00AM, 25 Oct 2025</Text>
        </View>
        <View style={styles.scheduleItem}>
          <Text style={styles.calendarIcon}>📅</Text>
          <Text style={styles.scheduleText}>Closes: 11:00AM, 29 Oct 2025</Text>
        </View>
      </View>

      {/* About Organization */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ABOUT THE ORGANIZATION</Text>
        <Text style={styles.description}>
          FluidLive is a Technology Solutions company with modern techno-creative fluid blend as its principle. 
          Developing economically feasible, artistically adaptable, <Text style={styles.moreLink}>more</Text>
        </Text>
        <TouchableOpacity style={styles.websiteLink}>
          <Text style={styles.websiteLinkText}>View Website 🔗</Text>
        </TouchableOpacity>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DESCRIPTION</Text>
        <Text style={styles.description}>{job.description}</Text>
      </View>

      {/* Skills */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ELIGIBLE SKILLS</Text>
        <View style={styles.skillsContainer}>
          {job.skills.map((skill: string, index: number) => (
            <View key={index} style={styles.skillBadge}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 120,
  },
  banner: {
    width: '100%',
    height: 175,
    backgroundColor: '#D9D9D9',
    borderRadius: 25,
    position: 'relative',
    marginBottom: 40,
  },
  badge: {
    position: 'absolute',
    top: 24,
    right: 24,
    backgroundColor: '#D9D9D9',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 30,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6E6E6E',
    fontFamily: 'Poppins',
  },
  logoCircle: {
    position: 'absolute',
    top: 175 - 40,
    left: 44,
    width: 79,
    height: 79,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    borderWidth: 12,
    borderColor: 'rgba(66, 133, 244, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 57,
    height: 57,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 30,
    color: '#000000',
    fontFamily: 'Poppins',
  },
  postedDate: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 15,
    color: '#6E6E6E',
    marginTop: 4,
    fontFamily: 'Poppins',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  applyButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  applyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Poppins',
  },
  bookmark: {
    fontSize: 20,
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  metaItem: {
    width: '45%',
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
    color: '#6E6E6E',
    fontFamily: 'Poppins',
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
    color: '#000000',
    marginTop: 4,
    fontFamily: 'Poppins',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
    color: '#080808',
    marginBottom: 12,
    fontFamily: 'Poppins',
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  calendarIcon: {
    fontSize: 16,
  },
  scheduleText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
    color: '#6E6E6E',
    fontFamily: 'Poppins',
  },
  description: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
    color: '#6E6E6E',
    fontFamily: 'Poppins',
  },
  moreLink: {
    color: '#4285F4',
  },
  websiteLink: {
    marginTop: 12,
  },
  websiteLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4285F4',
    fontFamily: 'Poppins',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  skillBadge: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#4285F4',
    borderRadius: 5,
  },
  skillText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
    color: '#4285F4',
    fontFamily: 'Poppins',
  },
});

export default JobDetailView;
