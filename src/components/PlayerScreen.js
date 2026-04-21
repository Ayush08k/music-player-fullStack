import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Dimensions, Animated, PanResponder } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { colors } from '../theme/colors';
import EqualizerModal from './EqualizerModal';

const { width } = Dimensions.get('window');

const formatDuration = (millis) => {
  if (!millis) return '0:00';
  const totalSeconds = Math.floor(millis / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function PlayerScreen({
  visible,
  onClose,
  currentSong,
  isPlaying,
  onTogglePlay,
  positionMillis,
  durationMillis,
  onSeek,
  onNext,
  onPrevious,
  isLiked,
  onToggleLike,
  isShuffle,
  onToggleShuffle,
  isRepeat,
  onToggleRepeat,
  onShare,
  // EQ Props
  bass,
  setBass,
  treble,
  setTreble,
  noiseCancel,
  setNoiseCancel
}) {
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [eqVisible, setEqVisible] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const rotateLoop = useRef(null);

  const panY = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Activate swipe-down only when gesture starts near the top (header area) to avoid blocking slider interaction
        return gestureState.dy > 15 && gestureState.y0 < 120;
      },
      onPanResponderMove: Animated.event([null, { dy: panY }], { useNativeDriver: false }),
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > Dimensions.get('window').height * 0.15) {
          onClose(); // Swipe down successful
          panY.setValue(0);
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (!isSeeking) {
      setSeekValue(positionMillis);
    }
  }, [positionMillis, isSeeking]);

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.06, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 600, useNativeDriver: true }),
        ])
      ).start();
      rotateLoop.current = Animated.loop(
        Animated.timing(rotateAnim, { toValue: 1, duration: 12000, useNativeDriver: true })
      );
      rotateLoop.current.start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      if (rotateLoop.current) rotateLoop.current.stop();
    }
  }, [isPlaying]);
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Early return AFTER all hooks
  if (!currentSong) return null;
  const title = currentSong.filename.replace(/\.[^/.]+$/, '');
  const progress = durationMillis > 0 ? positionMillis / durationMillis : 0;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <Animated.View 
        style={[styles.container, { transform: [{ translateY: panY.interpolate({ inputRange: [-1, 0, 1], outputRange: [0, 0, 1] }) }] }]} 
        {...panResponder.panHandlers}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
            <Ionicons name="chevron-down" size={28} color={colors.textSecondary} />
          </TouchableOpacity>
          <View>
            <Text style={styles.nowPlayingLabel}>NOW PLAYING</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setEqVisible(true)}>
            <Ionicons name="ellipsis-horizontal" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Rotating Album Art */}
        <View style={styles.albumArtSection}>
          <Animated.View style={[styles.albumArtOuter, { transform: [{ scale: pulseAnim }] }]}>
            <Animated.View style={[styles.albumArtInner, { transform: [{ rotate: spin }] }]}>
              <View style={styles.albumImagePlaceholder}>
                <Ionicons name="musical-notes" size={80} color={colors.primary} />
              </View>

              {/* Vinyl center hole */}
              <View style={styles.vinylHole} />
            </Animated.View>
          </Animated.View>

          {/* Outer glow ring */}
          <View style={[styles.glowRing, isPlaying && styles.glowRingActive]} />
        </View>

        {/* Track Info */}
        <View style={styles.infoSection}>
          <Text style={styles.songTitle} numberOfLines={1}>{title}</Text>
          <Text style={styles.artistText}>Unknown Artist</Text>
        </View>
        {/* Slider */}
        <View style={styles.sliderSection}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={durationMillis || 1}
            value={seekValue}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.waveInactive}
            thumbTintColor={colors.primaryLight}
            onSlidingStart={() => setIsSeeking(true)}
            onSlidingComplete={(val) => { onSeek(val); setIsSeeking(false); }}
            onValueChange={setSeekValue}
          />
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatDuration(seekValue)}</Text>
            <Text style={styles.timeText}>{formatDuration(durationMillis)}</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.sideBtn} onPress={onPrevious}>
            <Ionicons name="play-skip-back" size={32} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.playButton} onPress={onTogglePlay}>
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={40} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.sideBtn} onPress={onNext}>
            <Ionicons name="play-skip-forward" size={32} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Extra controls row */}
        <View style={styles.extraControls}>
          <TouchableOpacity 
            style={[styles.extraBtn, isShuffle && { shadowColor: colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 10, elevation: 8 }]} 
            onPress={onToggleShuffle}
          >
            <Ionicons name="shuffle" size={22} color={isShuffle ? colors.primary : colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.extraBtn, isRepeat && { shadowColor: colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 10, elevation: 8 }]} 
            onPress={onToggleRepeat}
          >
            <Ionicons name="repeat" size={22} color={isRepeat ? colors.primary : colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.extraBtn} onPress={onToggleLike}>
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={22}
              color={isLiked ? colors.secondary : colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.extraBtn} onPress={onShare}>
            <Ionicons name="share-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <EqualizerModal 
          visible={eqVisible} 
          onClose={() => setEqVisible(false)} 
          bass={bass}
          setBass={setBass}
          treble={treble}
          setTreble={setTreble}
          noiseCancel={noiseCancel}
          setNoiseCancel={setNoiseCancel}
        />
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 55,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  iconBtn: {
    padding: 6,
  },
  nowPlayingLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  albumArtSection: {
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  albumArtOuter: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: (width * 0.7) / 2,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
  },
  albumArtInner: {
    width: '100%',
    height: '100%',
    borderRadius: (width * 0.7) / 2,
    overflow: 'hidden',
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumImage: {
    width: '100%',
    height: '100%',
  },
  albumImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
  },
  vinylHole: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
  },
  glowRing: {
    position: 'absolute',
    width: width * 0.7 + 20,
    height: width * 0.7 + 20,
    borderRadius: (width * 0.7 + 20) / 2,
    borderWidth: 2,
    borderColor: 'transparent',
    top: -10,
  },
  glowRingActive: {
    borderColor: colors.primary + '44',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  infoSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  songTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  artistText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '500',
  },
  sliderSection: {
    marginBottom: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: -8,
  },
  timeText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginBottom: 24,
  },
  sideBtn: {
    padding: 10,
  },
  playButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 12,
  },
  extraControls: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingTop: 4,
  },
  extraBtn: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
