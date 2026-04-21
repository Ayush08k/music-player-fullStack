# Music Player 🎵

A **premium, full‑stack music player** built with React Native, Expo, and a native equalizer module.  
It features a sleek UI, swipe‑down dismissal, a powerful equalizer with presets (including a **Custom** preset for manual bass/treble control), shuffle/repeat, likes, search, and persistent settings.

## ✨ Features
- **Beautiful UI** with glass‑morphism style album art, animated pulse, and rotating vinyl effect.
- **Playback controls** – play/pause, next/previous, seek via slider, shuffle, repeat, and like.
- **Equalizer** – presets (Flat, Bass Boost, Vocal Boost, Rock, Pop) **plus a Custom preset** that lets users freely adjust bass and treble.
- **Swipe‑down gesture** to dismiss the full‑screen player without interfering with the seek slider.
- **Persistent settings** – volume, EQ, shuffle/repeat, liked songs saved with AsyncStorage.
- **Search & sort** – debounced search, sorting by name, date, or duration.
- **Sharing** – share songs via the native share sheet.
- **Cross‑platform** – works on Android and iOS via Expo.

## 📦 Installation
```bash
# Clone the repository
git clone https://github.com/Ayush08k/music-player-fullStack.git
cd music-player-fullStack

# Install dependencies (requires Node.js & Expo CLI)
npm install   # or yarn install

# Run the app on a device or simulator
expo start
```

## 🚀 Usage
- Launch the app on your device.
- Grant media library permissions to load songs.
- Tap a song to start playback.
- Open the **Equalizer** (ellipsis button) to choose a preset or select **Custom** to manually adjust bass and treble with the circular knobs.
- Swipe down on the player screen to close it – the gesture now only activates when starting near the top, preserving slider functionality.

## 🛠 Development
### Project structure
```
/music
├─ src/
│  ├─ components/          # UI components (PlayerScreen, EqualizerModal, SongList, etc.)
│  ├─ theme/               # Color palette and styling
│  ├─ utils/               # Helper functions (sorting, audio processing)
│  └─ App.js               # Entry point, state management, TrackPlayer setup
├─ modules/                # Native equalizer module (expo‑equalizer)
├─ package.json
└─ README.md               # ← this file
```
### Adding new features
1. Create a new component under `src/components`.
2. Export it and import where needed in `App.js` or other screens.
3. Update the navigation or modal handling as appropriate.
4. Run `expo start` and test on a device.

## 📚 Documentation
- **Equalizer** – The `EqualizerModal` component defines presets in `presets` object. Selecting **Custom** keeps the current bass/treble values, allowing manual adjustments via the circular knobs.
- **Slider gesture fix** – The `PanResponder` in `PlayerScreen.js` now only activates the swipe‑down when the gesture starts near the top (`gestureState.y0 < 120`). This prevents the seek slider from being captured unintentionally.

## 🤝 Contributing
Contributions are welcome! Please:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Make your changes and ensure the app still builds.
4. Submit a pull request with a clear description of the changes.

## 📄 License
This project is licensed under the **MIT License** – see the `LICENSE` file for details.

---
*Built with love by Ayush08k – enjoy the music!*
