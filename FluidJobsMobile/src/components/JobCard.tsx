import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

interface JobCardProps {
  job: {
    id: string;
    title: string;
    postedDate: string;
    jobType: string;
    ctc: string;
    industry: string;
    location: string;
    registrationOpens?: string;
    registrationCloses?: string;
    description: string;
    skills: string[];
    matchScore?: number;
  };
  isSaved: boolean;
  onToggleSave: (jobId: string) => void;
  onViewDetails: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, isSaved, onToggleSave, onViewDetails }) => {
  return (
    <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        {/* Company Banner */}
        <View style={styles.banner} />

        {/* Company Logo Circle */}
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>f~l</Text>
        </View>

        {/* Actions */}
        <View style={styles.topActions}>
          <TouchableOpacity style={styles.applyButton}>
            <Text style={styles.applyIcon}>👤</Text>
            <Text style={styles.applyText}>Apply Now</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onToggleSave(job.id)} style={styles.bookmarkButton}>
            <Text style={styles.bookmark}>💬</Text>
          </TouchableOpacity>
        </View>

        {/* Job Title */}
        <Text style={styles.title}>{job.title}</Text>
        <Text style={styles.postedDate}>Posted on: {job.postedDate}</Text>

        {/* Job Metadata */}
        <View style={styles.metadata}>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>JOB TYPE</Text>
              <Text style={styles.metaValue}>{job.jobType}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>INDUSTRY</Text>
              <Text style={styles.metaValue}>{job.industry}</Text>
            </View>
          </View>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>CTC</Text>
              <Text style={styles.metaValue}>{job.ctc}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>LOCATION</Text>
              <Text style={styles.metaValue}>{job.location}</Text>
            </View>
          </View>
        </View>

        {/* Registration Schedule */}
        {job.registrationOpens && job.registrationCloses && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>REGISTRATION SCHEDULE</Text>
            <View style={styles.scheduleItem}>
              <Text style={styles.scheduleIcon}>📅</Text>
              <Text style={styles.scheduleText}>
                <Text style={styles.scheduleLabel}>Opens: </Text>
                {job.registrationOpens}
              </Text>
            </View>
            <View style={styles.scheduleItem}>
              <Text style={styles.scheduleIconRed}>📅</Text>
              <Text style={styles.scheduleText}>
                <Text style={styles.scheduleLabel}>Closes: </Text>
                {job.registrationCloses}
              </Text>
            </View>
          </View>
        )}

        {/* About Organization */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT THE ORGANIZATION</Text>
          <Text style={styles.description}>
            {job.description}{' '}
            <Text style={styles.moreLink}>more</Text>
          </Text>
          <TouchableOpacity style={styles.websiteButton}>
            <Text style={styles.websiteText}>View Website</Text>
            <Text style={styles.websiteIcon}>🚀</Text>
          </TouchableOpacity>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DESCRIPTION</Text>
          <Text style={styles.description}>{job.description}</Text>
        </View>

        {/* Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ELIGIBLE SKILLS</Text>
          <View style={styles.skillsContainer}>
            {job.skills.map((skill, index) => (
              <View key={index} style={styles.skillBadge}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  banner: {
    width: '100%',
    height: 140,
    backgroundColor: '#C4C4C4',
    borderRadius: 20,
    marginBottom: 50,
  },
  logoCircle: {
    position: 'absolute',
    top: 100,
    left: 35,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    borderWidth: 8,
    borderColor: 'rgba(66, 133, 244, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4285F4',
    fontFamily: 'Poppins',
  },
  topActions: {
    position: 'absolute',
    top: 160,
    right: 20,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4285F4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  applyIcon: {
    fontSize: 14,
  },
  applyText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Poppins',
  },
  bookmarkButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookmark: {
    fontSize: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'Poppins',
    marginBottom: 4,
  },
  postedDate: {
    fontSize: 10,
    fontWeight: '500',
    color: '#6E6E6E',
    fontFamily: 'Poppins',
    marginBottom: 16,
  },
  metadata: {
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6E6E6E',
    fontFamily: 'Poppins',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Poppins',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'Poppins',
    marginBottom: 10,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  scheduleIcon: {
    fontSize: 16,
    color: '#34A853',
  },
  scheduleIconRed: {
    fontSize: 16,
    color: '#EA4335',
  },
  scheduleText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Poppins',
  },
  scheduleLabel: {
    fontWeight: '600',
  },
  description: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 16,
    color: '#6E6E6E',
    fontFamily: 'Poppins',
  },
  moreLink: {
    color: '#4285F4',
    fontWeight: '600',
  },
  websiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 4,
  },
  websiteText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4285F4',
    fontFamily: 'Poppins',
  },
  websiteIcon: {
    fontSize: 14,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  skillBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#4285F4',
    borderRadius: 6,
  },
  skillText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4285F4',
    fontFamily: 'Poppins',
  },
});

export default JobCard;
