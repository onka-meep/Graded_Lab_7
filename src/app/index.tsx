import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { NoticeCard, Notice } from '../components/NoticeCard';
import { Stack } from 'expo-router';
// const API_ENDPOINT = 'https://jsonplaceholder.typicode.com/postsBroken';  Broken link I used
const API_ENDPOINT = 'https://jsonplaceholder.typicode.com/posts';
export default function App() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Trigger API request when screen opens
  useEffect(() => {
    fetchCampusNotices();
  }, []);

  const fetchCampusNotices = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(API_ENDPOINT);

      // Explicit response validation as required
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const rawData: Notice[] = await response.json();

      // Display only the first 10 records
      const limitedRecords = rawData.slice(0, 10);
      setNotices(limitedRecords);
    } catch (error) {
      // User-friendly feedback without exposing raw internal error strings
      setErrorMessage(
        'Unable to load notices. Check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false}}/>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />

      {/* Screen Title */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>UJ Campus Notices</Text>
      </View>

      {/* Loading State Feedback */}
      {loading && (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#F26A36" />
          <Text style={styles.statusText}>Loading campus notices...</Text>
        </View>
      )}

      {/* Error & Retry State */}
      {!loading && errorMessage && (
        <View style={styles.centeredContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchCampusNotices}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Notices Feed using FlatList */}
      {!loading && !errorMessage && notices.length > 0 && (
        <FlatList
          data={notices}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <NoticeCard notice={item} />}
          contentContainerStyle={styles.listPadding}
        />
      )}

      {/* Sticky Refresh Action Footer */}
      {!loading && !errorMessage && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={fetchCampusNotices}
            activeOpacity={0.8}
          >
            <Text style={styles.refreshButtonText}>Refresh Notices</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  header: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#F26A36',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  listPadding: {
    paddingVertical: 10,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statusText: {
    marginTop: 12,
    fontSize: 15,
    color: '#666666',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 15,
    color: '#D32F2F',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#F26A36',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'center',
  },
  refreshButton: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 6,
    width: '90%',
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});