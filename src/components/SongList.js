import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export default function SongList({ item, onPress, isActive }) {
  // item is the asset object from expo-media-library
  const title = item.filename.replace(/\.[^/.]+$/, ""); // remove extension

  return (
    <TouchableOpacity 
      style={[styles.container, isActive && styles.activeContainer]} 
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {isActive ? (
          <MaterialIcons name="audiotrack" size={24} color={colors.primary} />
        ) : (
          <MaterialIcons name="music-note" size={24} color={colors.textSecondary} />
        )}
      </View>
      <View style={styles.details}>
        <Text style={[styles.title, isActive && styles.activeText]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle}>
          Unknown Artist • {formatDuration(item.duration)}
        </Text>
      </View>
      {isActive && (
        <MaterialIcons name="graphic-eq" size={20} color={colors.primary} style={styles.eqIcon} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  activeContainer: {
    backgroundColor: colors.active,
    borderColor: colors.border,
    borderWidth: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  details: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  activeText: {
    color: colors.primary,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  eqIcon: {
    marginLeft: 10,
  }
});
