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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NoticeCard, Notice } from '../components/NoticeCard';

// Required Namespaced Keys
const CACHE_KEY = '@uj/notices/cache';
const TIMESTAMP_KEY = '@uj/notices/lastUpdated';
const API_ENDPOINT = 'https://jsonplaceholder.typicode.com/posts';

export default function App() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSavedCopy, setIsSavedCopy] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Expected offline-first flow: App opens -> Read cache -> Try live API
  useEffect(() => {
    initNoticesFlow();
  }, []);

  const initNoticesFlow = async () => {
    const hasCache = await loadCachedNotices();
    await fetchLiveNotices(hasCache);
  };

  // 1. Read Cached Notices from AsyncStorage
  const loadCachedNotices = async (): Promise<boolean> => {
    try {
      const cachedData = await AsyncStorage.getItem(CACHE_KEY);
      const savedTime = await AsyncStorage.getItem(TIMESTAMP_KEY);

      if (cachedData !== null) {
        const parsed: Notice[] = JSON.parse(cachedData);
        setNotices(parsed);
        setLastUpdated(savedTime);
        return parsed.length > 0;
      }
      return false;
    } catch (e) {
      console.error('Error loading cached notices:', e);
      return false;
    }
  };

  // 2. Request Fresh Data from Live API
  const fetchLiveNotices = async (cachedAvailable: boolean = false) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(API_ENDPOINT);

      if (!response.ok) {
        throw new Error(`Server status: ${response.status}`);
      }

      const rawData: Notice[] = await response.json();
      const top10 = rawData.slice(0, 10);

      // Generate formatted timestamp (HH:MM)
      const now = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      // Update state to live data
      setNotices(top10);
      setIsSavedCopy(false);
      setLastUpdated(now);

      // Persist to cache (Never save an error response)
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(top10));
      await AsyncStorage.setItem(TIMESTAMP_KEY, now);
    } catch (error) {
      // API fails + cache exists -> Keep cached notices & show honest status
      if (cachedAvailable || notices.length > 0) {
        setIsSavedCopy(true);
      } else {
        // API fails + no cache -> Show user-friendly error message
        setErrorMessage(
          'Unable to load notices. Check your connection and try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // 3. Clear Saved Notices (removes only targeted keys)
  const handleClearSaved = async () => {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
      await AsyncStorage.removeItem(TIMESTAMP_KEY);
      setNotices([]);
      setLastUpdated(null);
      setIsSavedCopy(false);
    } catch (e) {
      console.error('Error removing cached notices:', e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>UJ Campus Notices</Text>
      </View>

      {/* Freshness Banner: Displayed when API fails but cached data exists */}
      {isSavedCopy && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineBannerText}>
            Saved copy • Last updated {lastUpdated || 'Unknown'}
          </Text>
        </View>
      )}

      {/* Loading Indicator */}
      {loading && notices.length === 0 && (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#F26A36" />
          <Text style={styles.statusText}>Checking for campus notices...</Text>
        </View>
      )}

      {/* Error State: Network failed & no cache present */}
      {!loading && errorMessage && notices.length === 0 && (
        <View style={styles.centeredContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchLiveNotices(false)}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Empty State after Clear Cache */}
      {!loading && !errorMessage && notices.length === 0 && (
        <View style={styles.centeredContainer}>
          <Text style={styles.statusText}>No notices stored on device.</Text>
          <Text style={styles.subText}>Tap "Refresh" while connected to load notices.</Text>
        </View>
      )}

      {/* Main Notice Feed */}
      {notices.length > 0 && (
        <FlatList
          data={notices}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <NoticeCard notice={item} />}
          contentContainerStyle={styles.listPadding}
        />
      )}

      {/* Footer Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => fetchLiveNotices(notices.length > 0)}
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonText}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.clearButton]}
          onPress={handleClearSaved}
          activeOpacity={0.8}
        >
          <Text style={styles.clearButtonText}>Clear Saved Notices</Text>
        </TouchableOpacity>
      </View>
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
  offlineBanner: {
    backgroundColor: '#FFF4E5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FFD199',
    alignItems: 'center',
  },
  offlineBannerText: {
    color: '#B84500',
    fontSize: 13,
    fontWeight: '700',
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
  subText: {
    marginTop: 4,
    fontSize: 13,
    color: '#999999',
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
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#FEECEB',
  },
  clearButtonText: {
    color: '#D32F2F',
    fontSize: 13,
    fontWeight: '600',
  },
});