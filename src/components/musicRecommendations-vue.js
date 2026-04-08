import VueTree from '@ssthouse/vue-tree-chart'

const PLUGIN_NAME = 'music-recommendations'

console.log('[MusicRecommendations] Loading Vue component for:', `plugin.${PLUGIN_NAME}`)

Vue.component(`plugin.${PLUGIN_NAME}`, {
  template: `
    <div @wheel.prevent="handleWheel">
      <vue-tree-controls
        @zoom-in="zoomIn"
        @zoom-out="zoomOut"
        @zoom-reset="zoomReset"
        @open-settings="toggleSettingsMenu(true)"
      />

      <vue-settings 
        v-if="settingsMenuOpen"
        :allow-duplicate-artists.sync="settings.allowDuplicateArtists"
        @close-settings="toggleSettingsMenu(false)"
      />

      <vue-tree
        :dataset="treeData"
        :config="treeConfig"
        direction="vertical"
        :collapse-enabled="false"
        ref="tree"
        class="tree"
      >
        <template v-slot:node="{ node }">
          <vue-tree-node 
            :node="node" 
            @add-similar-artists="addSimilarArtists(node)"
            @remove-similar-artists="removeSimilarArtists(node)"
          />
        </template>
      </vue-tree>
    </div>
  `,
  components: {
    'vue-tree': VueTree
  },
  data: () => ({
    treeData: {},
    treeConfig: { 
      nodeWidth: 250, 
      nodeHeight: 100, 
      levelHeight: 350
    },
    loadedArtists: new Set(),
    settings: {
      allowDuplicateArtists: false,
    },
    settingsMenuOpen: false
  }),
  async mounted () {
    console.log('[MusicRecommendations] Component mounted')
    const settings = this.getLocalStorage('settings')
    if (settings) this.settings = settings

    try {
      const nowPlayingArtist = await MusicRecommendationsPlugin.getNowPlayingArtist()
      console.log('[MusicRecommendations] Now playing artist:', nowPlayingArtist)
      const localTreeData = this.getLocalStorage('treeData')

      // If the local save exists and it's the same artist or there is no artist, use the local save
      if (localTreeData && (localTreeData.id === nowPlayingArtist.id || !nowPlayingArtist)) {
        console.log('[MusicRecommendations] Using cached tree data')
        this.treeData = localTreeData
        this.loadedArtists = MusicRecommendationsPlugin.getAllIds(this.treeData)

      // If no save is loaded, use the now playing artist
      } else if (nowPlayingArtist) {
        console.log('[MusicRecommendations] Loading artist:', nowPlayingArtist.id)
        const artist = await MusicRecommendationsPlugin.getArtist(nowPlayingArtist.id)
        this.treeData = this.buildNode(artist)
        this.loadedArtists.add(this.treeData.id)
        console.log('[MusicRecommendations] Tree data loaded:', this.treeData)
      } else {
        console.log('[MusicRecommendations] No artist to display')
      }
    } catch (error) {
      console.error('[MusicRecommendations] Error loading artist:', error)
    }
  },
  watch: {
    settings: {
      deep: true,
      handler () {
        this.updateLocalStorage('settings', this.settings)
      }
    }
  },
  methods: {
    buildNode (artist) {
      return {
        nodeId: window.uuidv4(),
        id: artist.id,
        name: artist.attributes.name,
        genres: artist.attributes.genreNames.join(', '),
        details: JSON.stringify(artist),
        children: []
      }
    },
    async addSimilarArtists (node) {
      const relatedArtists = await MusicRecommendationsPlugin.getSimilarArtists(node.id)
      MusicRecommendationsPlugin.debug(`Found ${relatedArtists.length} related artists`)

      if (!relatedArtists.length) return window.notyf.error('Unable to find any related artists')
      
      let children = relatedArtists.map(artist => {
        return this.buildNode(artist)
      })

      if (!this.settings.allowDuplicateArtists) {
        MusicRecommendationsPlugin.debug(`Removing duplicate artists`)
        children = children.filter(child => {
          return !this.loadedArtists.has(child.id)
        })
      }

      if (!children.length) return window.notyf.error('All related artists exist in the tree already')

      // Push the new artist to the Set of loaded artists
      children.forEach(child => {
        this.loadedArtists.add(child.id)
      })
      
      MusicRecommendationsPlugin.insertNode(this.treeData, node.nodeId, children)

      this.updateLocalStorage('treeData', this.treeData)
    },
    removeSimilarArtists (node) {
      MusicRecommendationsPlugin.removeChildren(this.treeData, node.nodeId)
      this.updateLocalStorage('treeData', this.treeData)

      this.loadedArtists = MusicRecommendationsPlugin.getAllIds(this.treeData)
      MusicRecommendationsPlugin.debug(`Found ${this.loadedArtists.size} loaded artists`)
    },
    zoomIn () {
      this.$refs.tree.zoomIn()
    },
    zoomOut () {
      this.$refs.tree.zoomOut()
    },
    zoomReset () {
      this.$refs.tree.restoreScale()
    },
    handleWheel (event) {
      // Prevent default scroll behavior
      event.preventDefault()
      
      // Determine zoom direction based on wheel delta
      // deltaY > 0 means scrolling down (zoom out)
      // deltaY < 0 means scrolling up (zoom in)
      if (event.deltaY < 0) {
        this.zoomIn()
      } else if (event.deltaY > 0) {
        this.zoomOut()
      }
    },
    updateLocalStorage (key, data) {
      localStorage.setItem(`plugin.${PLUGIN_NAME}.${key}`, JSON.stringify(data))

      MusicRecommendationsPlugin.debug(`Updated ${key} in localStorage`, data)
    },
    getLocalStorage (key) {
      const data = localStorage.getItem(`plugin.${PLUGIN_NAME}.${key}`)

      if (data) MusicRecommendationsPlugin.debug(`Loaded ${key} from localStorage`, JSON.parse(data))
      return JSON.parse(data)
    },
    toggleSettingsMenu (mode) {
      this.settingsMenuOpen = mode
    },
  }
});

Vue.component('vue-tree-node', {
  template: `
    <div class="rich-media-node">
      <mediaitem-square
        v-if="node.details"
        :item="JSON.parse(node.details)"
      />
      
      <div class="content">
        <div class="subtitle">{{ node.genres }}</div>
      </div>

      <button
        v-if="!node.children || !node.children.length"
        @click="addSimilarArtists(node)" 
        class="node-control"
      >
        Add Similar Artists
      </button>

      <button
        v-if="node.children && node.children.length"
        @click="removeSimilarArtists(node)" 
        class="node-control"
      >
        Remove Similar Artists
      </button>
    </div>
  `,
  props: {
    node: Object
  },
  methods: {
    addSimilarArtists(node) {
      this.$emit('add-similar-artists', node)
    },
    removeSimilarArtists(node) {
      this.$emit('remove-similar-artists', node)
    }
  }
});

Vue.component('vue-tree-controls', {
  template: `
    <div class="control-container">
      <button 
        @click="$emit('zoom-in')" 
        class="control-button"
        title="Zoom In"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="11" y1="8" x2="11" y2="14"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
      </button>
      <button 
        @click="$emit('zoom-out')" 
        class="control-button"
        title="Zoom Out"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
      </button>
      <button 
        @click="$emit('zoom-reset')" 
        class="control-button"
        title="Reset Zoom"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="1 4 1 10 7 10"></polyline>
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
        </svg>
      </button>
      <button 
        @click="$emit('open-settings')" 
        class="control-button"
        title="Settings"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </button>
    </div>
  `
});

Vue.component('vue-settings', {
  template: `
    <div 
      class="modal-fullscreen addtoplaylist-panel" 
      @click.self="$emit('close-settings')" 
      @contextmenu.self="$emit('close-settings')"
    >
      <div class="modal-window">
        <div class="modal-header">
          <div class="modal-title">Plugin Settings</div>
          <button class="close-btn" @click="$emit('close-settings')"></button>
        </div>
        <div class="modal-content">
          <div class="modal-item playlist-item">
            <div class="modal-item-name">Allow Duplicate Artists</div>
            <input 
              type="checkbox" 
              switch
              :checked="allowDuplicateArtists"
              @change="$emit('update:allow-duplicate-artists', $event.target.checked)"
              class="modal-item-control"
            />
          </div>
        </div>
      </div>
    </div>
  `,
  props: {
    allowDuplicateArtists: {
      type: Boolean
    }
  },
});