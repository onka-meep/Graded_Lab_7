import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface Notice {
  id: number;
  title: string;
  body: string;
  userId?: number;
}

interface NoticeCardProps {
  notice: Notice;
}

export const NoticeCard: React.FC<NoticeCardProps> = ({ notice }) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.badge}>Notice #{notice.id}</Text>
      </View>
      <Text style={styles.title}>{notice.title}</Text>
      <Text style={styles.body}>{notice.body}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#F26A36', // UJ Orange branding
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  headerRow: {
    marginBottom: 6,
  },
  badge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F26A36',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
    textTransform: 'capitalize',
    lineHeight: 22,
  },
  body: {
    fontSize: 14,
    color: '#4A4A4A',
    lineHeight: 20,
  },
});