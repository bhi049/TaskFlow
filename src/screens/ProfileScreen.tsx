import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { selectUserStats } from '../store/userStatsSlice';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export const ProfileScreen: React.FC = () => {
  const stats = useSelector(selectUserStats);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentWeek = getISOWeek(new Date());

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons name="account-circle" size={80} color="#007AFF" />
          <Text style={styles.title}>Your Progress</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalTasksCompleted}</Text>
            <Text style={styles.statLabel}>Total Tasks</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.longestStreak}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
        </View>

        {/* Progress Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${Math.min((stats.weeklyCompletions[currentWeek] || 0) * 10, 100)}%` }
              ]} 
            />
            <Text style={styles.progressText}>
              {stats.weeklyCompletions[currentWeek] || 0} tasks completed
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Month</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${Math.min((stats.monthlyCompletions[currentMonth] || 0) * 2, 100)}%` }
              ]} 
            />
            <Text style={styles.progressText}>
              {stats.monthlyCompletions[currentMonth] || 0} tasks completed
            </Text>
          </View>
        </View>

        {/* Achievement Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementGrid}>
            <View style={[styles.achievement, stats.totalTasksCompleted >= 10 && styles.achievementUnlocked]}>
              <MaterialCommunityIcons 
                name="trophy" 
                size={32} 
                color={stats.totalTasksCompleted >= 10 ? '#FFD700' : '#ccc'} 
              />
              <Text style={styles.achievementLabel}>10 Tasks</Text>
            </View>
            <View style={[styles.achievement, stats.currentStreak >= 7 && styles.achievementUnlocked]}>
              <MaterialCommunityIcons 
                name="fire" 
                size={32} 
                color={stats.currentStreak >= 7 ? '#FF4444' : '#ccc'} 
              />
              <Text style={styles.achievementLabel}>7 Day Streak</Text>
            </View>
            <View style={[styles.achievement, stats.totalTasksCompleted >= 50 && styles.achievementUnlocked]}>
              <MaterialCommunityIcons 
                name="star" 
                size={32} 
                color={stats.totalTasksCompleted >= 50 ? '#FFA500' : '#ccc'} 
              />
              <Text style={styles.achievementLabel}>50 Tasks</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper function to get ISO week string (YYYY-Www)
function getISOWeek(date: Date): string {
  const dt = new Date(date);
  dt.setHours(0, 0, 0, 0);
  dt.setDate(dt.getDate() + 3 - (dt.getDay() + 6) % 7);
  const week = Math.floor((dt.getTime() - new Date(dt.getFullYear(), 0, 4).getTime()) / 86400000 / 7) + 1;
  return `${dt.getFullYear()}-W${week.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 10,
    color: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    padding: 16,
    backgroundColor: 'white',
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  progressBar: {
    height: 24,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#007AFF',
    borderRadius: 12,
  },
  progressText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    lineHeight: 24,
    color: '#333',
    fontSize: 12,
    fontWeight: '600',
  },
  achievementGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  achievement: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f8f8f8',
    width: 100,
  },
  achievementUnlocked: {
    backgroundColor: '#fff9e6',
  },
  achievementLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
}); 