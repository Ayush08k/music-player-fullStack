import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function PlayerWidget({ currentSong, isPlaying, onTogglePlay }) {
  if (!currentSong) return null;

  const title = currentSong.filename.replace(/\.[^/.]+$/, "");

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        {/* We would use a real progress bar here, simplifying for mock up */}
        <View style={styles.progressBar} />
      </View>
      <View style={styles.content}>
        <View style={styles.details}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.subtitle}>Playing from internal storage</Text>
        </View>
        <View style={styles.controls}>
          <TouchableOpacity onPress={onTogglePlay} style={styles.playButton}>
            <MaterialIcons 
              name={isPlaying ? "pause" : "play-arrow"} 
              size={32} 
              color={colors.background} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressContainer: {
    height: 3,
    backgroundColor: '#333',
    width: '100%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    width: '30%', // static for mockup
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  details: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    color: colors.primary,
    fontSize: 12,
    marginTop: 3,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  }
});
