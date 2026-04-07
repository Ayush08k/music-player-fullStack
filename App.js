import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { Audio } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';

import SongList from './src/components/SongList';
import PlayerWidget from './src/components/PlayerWidget';
import SortModal from './src/components/SortModal';
import { colors } from './src/theme/colors';

export default function App() {
  const [songs, setSongs] = useState([]);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const [loading, setLoading] = useState(true);
  
  const [currentSong, setCurrentSong] = useState(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [sortMethod, setSortMethod] = useState('A-Z'); // default sort

  useEffect(() => {
    if (permissionResponse && permissionResponse.status === 'granted') {
      getAudioFiles();
    } else if (permissionResponse && permissionResponse.status !== 'granted' && permissionResponse.canAskAgain) {
      requestPermission();
    } else if (!permissionResponse) {
      requestPermission();
    }
  }, [permissionResponse]);

  const getAudioFiles = async () => {
    setLoading(true);
    let media = await MediaLibrary.getAssetsAsync({
      mediaType: 'audio',
      first: 100, // adjust as needed
    });
    
    // Sort logic
    let sortedMedia = [...media.assets];
    sortedMedia = sortAudioFiles(sortedMedia, sortMethod);

    setSongs(sortedMedia);
    setLoading(false);
  };

  const sortAudioFiles = (files, method) => {
    return files.sort((a, b) => {
      switch (method) {
        case 'A-Z':
          return a.filename.localeCompare(b.filename);
        case 'Z-A':
          return b.filename.localeCompare(a.filename);
        case 'durationAsc':
          return a.duration - b.duration;
        case 'durationDesc':
          return b.duration - a.duration;
        default:
          return 0;
      }
    });
  };

  const handleSort = (method) => {
    setSortMethod(method);
    setSongs(sortAudioFiles([...songs], method));
  };

  const playSong = async (song) => {
    if (sound) {
      await sound.unloadAsync();
    }
    
    // expo-av needs the setup for audio session
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });

    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: song.uri },
      { shouldPlay: true }
    );
    
    setSound(newSound);
    setCurrentSong(song);
    setIsPlaying(true);

    newSound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        setIsPlaying(false);
      }
    });
  };

  const togglePlay = async () => {
    if (!sound) return;
    
    if (isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  if (!permissionResponse || permissionResponse.status !== 'granted') {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>We need permission to access your audio files to play music.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Music</Text>
        <TouchableOpacity onPress={() => setSortModalVisible(true)} style={styles.iconButton}>
          <MaterialIcons name="sort" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Scanning device for songs...</Text>
        </View>
      ) : songs.length === 0 ? (
        <View style={styles.centerContainer}>
          <MaterialIcons name="music-off" size={64} color={colors.textSecondary} />
          <Text style={styles.loadingText}>No audio files found on device.</Text>
        </View>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SongList 
              item={item} 
              onPress={playSong}
              isActive={currentSong && currentSong.id === item.id}
            />
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      {/* Mini Player */}
      <PlayerWidget 
        currentSong={currentSong} 
        isPlaying={isPlaying} 
        onTogglePlay={togglePlay} 
      />

      {/* Modals */}
      <SortModal 
        visible={sortModalVisible} 
        onClose={() => setSortModalVisible(false)}
        onSort={handleSort}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  errorText: {
    color: colors.text,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 16,
  }
});
