import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import JobCard from '../components/JobCard';
import LoadingScreen from '../components/LoadingScreen';

const MyJobsScreen: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('All Jobs');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [displayJobs, setDisplayJobs] = useState<any[]>([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      // Replace with your API endpoint
      const response = await fetch('http://localhost:8000/api/jobs-enhanced');
      const data = await response.json();
      setJobs(data);
      setDisplayJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Filter jobs based on active filter
    let filtered = jobs;
    if (activeFilter === 'Saved Jobs') {
      filtered = jobs.filter(job => savedJobIds.includes(job.id));
    } else if (activeFilter === 'Applied Jobs') {
      filtered = jobs.filter(job => appliedJobIds.includes(job.id));
    } else if (activeFilter === 'New Jobs') {
      // Filter jobs posted in last 7 days
      filtered = jobs; // Add date filtering logic here
    } else if (activeFilter === 'Perfect Match') {
      filtered = jobs.filter(job => job.matchScore && job.matchScore > 70);
    }
    setDisplayJobs(filtered);
    setCurrentIndex(0);
  }, [activeFilter, jobs, savedJobIds, appliedJobIds]);

  const handleSwipe = ({ nativeEvent }: any) => {
    if (nativeEvent.translationX < -50 && currentIndex < displayJobs.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (nativeEvent.translationX > 50 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleToggleSave = (jobId: string) => {
    setSavedJobIds(prev =>
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {['Saved Jobs', 'All Jobs', 'New Jobs', 'Perfect Match', 'Applied Jobs'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterTab,
                activeFilter === filter && styles.activeFilterTab,
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter && styles.activeFilterText,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Job Card with Swipe */}
      <GestureHandlerRootView style={styles.cardContainer}>
        <PanGestureHandler onGestureEvent={handleSwipe}>
          <View>
            {displayJobs.length > 0 ? (
              <JobCard
                job={displayJobs[currentIndex]}
                isSaved={savedJobIds.includes(displayJobs[currentIndex].id)}
                onToggleSave={handleToggleSave}
                onViewDetails={() => {
                  // Navigate to detail view
                }}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  {activeFilter === 'Saved Jobs' ? 'No saved jobs yet' : 
                   activeFilter === 'Applied Jobs' ? 'No applied jobs yet' : 
                   'No jobs available'}
                </Text>
              </View>
            )}
          </View>
        </PanGestureHandler>
      </GestureHandlerRootView>

      {/* Job Counter */}
      {displayJobs.length > 0 && (
        <View style={styles.counter}>
          <Text style={styles.counterText}>
            {currentIndex + 1} / {displayJobs.length}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F1F1',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    paddingTop: 24,
    paddingBottom: 8,
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 30,
    backgroundColor: '#D9D9D9',
    marginRight: 8,
    height: 30,
  },
  activeFilterTab: {
    backgroundColor: 'rgba(66, 133, 244, 0.16)',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6E6E6E',
    fontFamily: 'Poppins',
  },
  activeFilterText: {
    color: '#4285F4',
  },
  cardContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingBottom: 100,
  },
  counter: {
    position: 'absolute',
    bottom: 110,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 400,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6E6E6E',
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
});

export default MyJobsScreen;
