# Cider Music Recommendations

A [Cider Music](https://github.com/taoky/Cider) plugin for visualizing music recommendations based on artists in an interactive tree format.

![Music Recommendations Plugin](https://i.imgur.com/cWzWGVO.jpg)

## Features

- 🎵 Visual artist recommendation tree
- 🔍 Zoom controls (buttons + mouse wheel)
- 🎨 Theme-independent design
- 💾 Saves state to localStorage
- ⚙️ Configurable settings

## Installation

### Option 1: Download Pre-built Release (Recommended)

1. **Download the latest release**
   - Go to the [Releases](https://github.com/blazebsc/Cider-Music-Recommendation-Plugin/releases) page
   - Download `music-recommendations.zip` from the latest release

2. **Extract the ZIP file**
   - Unzip `music-recommendations.zip` to get the `music-recommendations` folder

3. **Locate your Cider plugins directory:**
   - **Windows**: `%APPDATA%\Cider\Plugins\`
     - Press `Win + R`, type `%APPDATA%\Cider\Plugins\`, and press Enter
     - If the `Plugins` folder doesn't exist, create it
   - **macOS**: `~/Library/Application Support/Cider/Plugins/`
     - In Finder, press `Cmd + Shift + G`, paste the path, and press Enter
     - If the `Plugins` folder doesn't exist, create it
   - **Linux**: `~/.config/Cider/Plugins/`
     - If the `Plugins` folder doesn't exist, create it with: `mkdir -p ~/.config/Cider/Plugins/`

4. **Copy the plugin**
   - Move the entire `music-recommendations` folder into your Cider `Plugins` directory
   - Final structure should be: `Plugins/music-recommendations/` (containing `index.js`, `package.json`, etc.)

5. **Restart Cider**
   - Completely quit and relaunch Cider for the plugin to load

### Option 2: Build from Source

1. Clone this repository:
   ```bash
   git clone https://github.com/blazebsc/Cider-Music-Recommendation-Plugin.git
   cd Cider-Music-Recommendation-Plugin
   ```

2. Install dependencies (requires [pnpm](https://pnpm.io/installation)):
   ```bash
   pnpm install
   ```

3. Build the plugin:
   ```bash
   pnpm build
   ```

4. Copy the built plugin:
   - The built files will be in the `dist/` folder
   - Copy the entire `dist/` folder contents to `Plugins/music-recommendations/` (see paths above)
   - Or set `OUTPUT_DIR` in a `.env` file to automatically build to your plugins directory

## Usage

1. Open Cider
2. Play a song to establish a current artist
3. Navigate to **Music Recommendations** from:
   - The dropdown menu (top-left corner), or
   - Settings → Advanced
4. Use the controls:
   - **Mouse Wheel**: Scroll to zoom in/out
   - **Zoom Buttons**: Click to zoom in/out or reset
   - **Click Artists**: Expand to show similar artists
   - **Settings**: Configure duplicate artist handling

## Development

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Configure your `.env` file:
   ```
   OUTPUT_DIR = "~/.config/Cider/Plugins/music-recommendations"
   ```
   Adjust the path based on your OS (see Installation paths above).

### Development Mode (Hot Reload)

Run with automatic rebuild on file changes:

```bash
pnpm start
```

Changes will automatically rebuild and copy to your `OUTPUT_DIR`. Reload Cider (Ctrl+R / Cmd+R) to see updates.

### Production Build

Build once for production:

```bash
pnpm build
```

This builds and copies all files to `OUTPUT_DIR` (or `dist/` if OUTPUT_DIR is not set).

## Plugin Structure

After installation, your plugin folder should look like this:

```
Cider/Plugins/music-recommendations/
├── index.js                    # Main plugin backend
├── index.frontend.js           # Frontend initialization
├── musicRecommendations-vue.js # Vue components
├── musicrecommendation.less    # Styles
├── assets/                     # SVG icons
├── package.json
└── README.md
```

## Troubleshooting

**Plugin doesn't appear in Cider:**
- Ensure the folder is named `music-recommendations` (not `music-recommendations-main` or `dist`)
- Verify the folder is directly inside the `Plugins` directory (not nested deeper)
- Check that `index.js` and `package.json` are in the `music-recommendations` folder
- Try completely quitting Cider (not just minimizing) and relaunching

**Can't find the Plugins folder:**
- The folder might not exist by default - create it manually
- Make sure you're looking in the correct location for your OS (see Installation section)

**Plugin loads but doesn't work:**
- Check the Cider console for errors (View → Toggle Developer Tools → Console)
- Ensure you're using a compatible version of Cider

## Technologies

- Vue 2.7
- Rollup (bundler)
- Apple Music API
- pnpm (package manager)

## Contributing

Pull requests are welcome! For major changes, please open an issue first.

## License

ISC

## Resources

* [Cider Music](https://github.com/taoky/Cider)
* [Apple Music API](https://developer.apple.com/documentation/applemusicapi)
* [Rollup.js](https://rollupjs.org/guide/en/)
