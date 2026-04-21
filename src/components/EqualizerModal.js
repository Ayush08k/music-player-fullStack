import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, PanResponder, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ExpoEqualizer from '../../modules/expo-equalizer';

const CircularKnob = ({ label, value, onChange, min = 0, max = 100 }) => {
  const [currentVal, setCurrentVal] = useState(value);
  const valRef = useRef(value);
  const lastY = useRef(0);

  // Sync internal state if prop changes (e.g. from preset)
  if (value !== valRef.current) {
    valRef.current = value;
    setCurrentVal(value);
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        lastY.current = gestureState.y0;
      },
      onPanResponderMove: (evt, gestureState) => {
        // Calculate delta for smoother continuous movement
        const dy = gestureState.moveY - lastY.current;
        lastY.current = gestureState.moveY;

        // Sensitvity: moving 2.5 pixels changes value by 1%
        const newVal = valRef.current - (dy / 2.5);
        
        // Strictly clamp between min (0) and max (100)
        const clampedVal = Math.max(min, Math.min(max, newVal));
        
        valRef.current = clampedVal;
        setCurrentVal(clampedVal);
      },
      onPanResponderRelease: () => {
        const finalVal = Math.round(valRef.current);
        valRef.current = finalVal;
        setCurrentVal(finalVal);
        onChange(finalVal);
      }
    })
  ).current;

  // 0 to 100 maps to -135deg to +135deg (total 270 deg)
  const deg = -135 + ((currentVal - min) / (max - min)) * 270;

  return (
    <View style={styles.knobContainer}>
      <View style={styles.knobOuter} {...panResponder.panHandlers}>
        <View style={styles.knobRing}>
           <View style={[styles.knobInner, { transform: [{ rotate: `${deg}deg` }] }]}>
             <View style={styles.knobDot} />
           </View>
        </View>
        <Text style={styles.knobValue}>{Math.round(currentVal)}%</Text>
      </View>
      <Text style={styles.knobLabel}>{label}</Text>
    </View>
  );
};

export default function EqualizerModal({ 
  visible, 
  onClose, 
  bass, 
  setBass, 
  treble, 
  setTreble, 
  noiseCancel, 
  setNoiseCancel 
}) {
  const [currentPreset, setCurrentPreset] = useState('Custom');

  const presets = {
    'Custom': {}, // Allows manual adjustment without overriding current values
    'Flat': { bass: 0, treble: 0 },
    'Bass Boost': { bass: 80, treble: 10 },
    'Vocal Boost': { bass: 10, treble: 60 },
    'Rock': { bass: 65, treble: 45 },
    'Pop': { bass: 40, treble: 55 },
  };

  const applyPreset = (name) => {
    setCurrentPreset(name);
    // For 'Custom' we keep current bass/treble values
    if (name !== 'Custom' && presets[name]) {
      setBass(presets[name].bass);
      setTreble(presets[name].treble);
    }
  };

  const handleReset = () => {
    setCurrentPreset('Flat');
    setBass(0);
    setTreble(0);
    setNoiseCancel(false);
    try { ExpoEqualizer.reset(); } catch(e){}
  };

  // Detect manual adjustment to switch to "Custom" label
  const onValChange = (setter, val) => {
    setter(val);
    setCurrentPreset('Custom');
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handleBar} />
          
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Equalizer</Text>
              <Text style={styles.subtitle}>Audio Enhancements</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.presetsWrapper}>
            <Text style={styles.sectionTitle}>Presets</Text>
            <View style={styles.presetsRow}>
              {Object.keys(presets).map(name => (
                <TouchableOpacity 
                  key={name}
                  style={[styles.presetChip, currentPreset === name && styles.presetChipActive]}
                  onPress={() => applyPreset(name)}
                >
                  <Text style={[styles.presetChipText, currentPreset === name && styles.presetChipTextActive]}>{name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.knobsRow}>
            <CircularKnob label="Bass Boost" value={bass} onChange={(v) => onValChange(setBass, v)} />
            <CircularKnob label="Treble" value={treble} onChange={(v) => onValChange(setTreble, v)} />
          </View>

          <View style={styles.switchesContainer}>
            <View style={styles.switchRow}>
              <View style={styles.switchTextCol}>
                <Text style={styles.switchTitle}>Noise Cancellation</Text>
                <Text style={styles.switchDesc}>Active AI noise reduction</Text>
              </View>
              <TouchableOpacity 
                style={[styles.toggleBtn, noiseCancel && styles.toggleBtnActive]} 
                onPress={() => setNoiseCancel(!noiseCancel)}
              >
                <View style={[styles.toggleCircle, noiseCancel && styles.toggleCircleActive]} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footerActions}>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetBtnText}>Reset to Flat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  sheet: { 
    backgroundColor: colors.surface, 
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32, 
    padding: 24, 
    paddingBottom: 40, 
    borderTopWidth: 1, 
    borderColor: colors.border 
  },
  handleBar: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  title: { color: colors.text, fontSize: 24, fontWeight: '800' },
  subtitle: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  closeBtn: { padding: 4, backgroundColor: colors.surfaceLight, borderRadius: 20 },
  
  presetsWrapper: { marginBottom: 32 },
  sectionTitle: { color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  presetsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  presetChip: { 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20, 
    backgroundColor: colors.surfaceLight, 
    marginRight: 8, 
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  presetChipActive: { 
    backgroundColor: colors.primarySubtle, 
    borderColor: colors.primary + '66'
  },
  presetChipText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  presetChipTextActive: { color: colors.primaryLight },

  knobsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 32 },
  knobContainer: { alignItems: 'center' },
  knobOuter: { width: 110, height: 110, borderRadius: 55, backgroundColor: colors.surfaceLight, justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  knobRing: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.surfaceMid, justifyContent: 'center', alignItems: 'center' },
  knobInner: { width: '100%', height: '100%', borderRadius: 42, position: 'absolute', justifyContent: 'flex-start', alignItems: 'center', padding: 4 },
  knobDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  knobValue: { position: 'absolute', color: colors.text, fontSize: 20, fontWeight: '700' },
  knobLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  
  switchesContainer: { backgroundColor: colors.surfaceLight, borderRadius: 20, padding: 16, marginBottom: 32 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchTextCol: { flex: 1, paddingRight: 10 },
  switchTitle: { color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: 2 },
  switchDesc: { color: colors.textSecondary, fontSize: 12 },
  toggleBtn: { width: 52, height: 30, borderRadius: 15, backgroundColor: colors.surfaceMid, padding: 3, justifyContent: 'center' },
  toggleBtnActive: { backgroundColor: colors.primary },
  toggleCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff' },
  toggleCircleActive: { transform: [{ translateX: 22 }] },
  
  footerActions: { flexDirection: 'row', gap: 12 },
  resetBtn: { 
    flex: 1, 
    backgroundColor: 'transparent', 
    borderRadius: 16, 
    paddingVertical: 16, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: colors.border 
  },
  resetBtnText: { color: colors.textSecondary, fontSize: 15, fontWeight: '600' },
  doneBtn: { 
    flex: 2, 
    backgroundColor: colors.primary, 
    borderRadius: 16, 
    paddingVertical: 16, 
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8
  },
  doneBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
