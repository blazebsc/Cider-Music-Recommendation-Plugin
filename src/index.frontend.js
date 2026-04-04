class MusicRecommendationsFrontend {
  PLUGIN_NAME = 'music-recommendations'

  constructor() {
    console.log('[MusicRecommendations] Initializing frontend plugin')
    // Use the plugin name to construct the correct path
    CiderFrontAPI.StyleSheets.Add(`./plugins/${this.PLUGIN_NAME}/musicrecommendation.less`)
    console.log('[MusicRecommendations] Stylesheet added')

    this.menuEntryId = window.uuidv4()

    const menuEntry = new CiderFrontAPI.Objects.MenuEntry()
    menuEntry.Id = this.menuEntryId
    menuEntry.name = "Music Recommendations"
    menuEntry.onClick = ()=>{
      console.log('[MusicRecommendations] Menu clicked, routing to:', `plugin/${this.PLUGIN_NAME}`)
      app.appRoute(`plugin/${this.PLUGIN_NAME}`)
    }
    CiderFrontAPI.AddMenuEntry(menuEntry)
    console.log('[MusicRecommendations] Menu entry added')
  }

  async getArtist (id) {
    const musickit = window.app.mk
    
    const storefront = musickit.storefrontId
    const response = await musickit.api.v3.music(`/v1/catalog/${storefront}/artists/${id}`)
  
    const artist = response?.data?.data[0]
    return artist
  }

  async getSimilarArtists (id) {
    const musickit = window.app.mk
    
    const storefront = musickit.storefrontId
    const response = await musickit.api.v3.music(`/v1/catalog/${storefront}/artists/${id}`, {
      views: ['similar-artists']
    })
  
    const artist = response?.data?.data[0]
    return artist.views['similar-artists'].data
  }

  async getNowPlayingArtist () {
    const musickit = window.app.mk
    const nowPlayingSong = musickit.nowPlayingItem
  
    const storefront = musickit.storefrontId
    const response = await musickit.api.v3.music(`/v1/catalog/${storefront}/songs/${nowPlayingSong.songId}`, {
      views: ['artists']
    })
  
    return response?.data?.data[0]?.relationships?.artists?.data[0]
  }

  async debug(text) {
    console.log(`[Plugin][${this.PLUGIN_NAME}]`, text)
  }

  insertNode(node, nodeId, newNode) {
    if (node.nodeId === nodeId) { 
      node.children = newNode;
    } else if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        this.insertNode(node.children[i], nodeId, newNode);
      }
    }
  }

  removeChildren(node, nodeId) {
    if (node.nodeId === nodeId) { 
      node.children = [];
    } else if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        this.removeChildren(node.children[i], nodeId);
      }
    }
  }

  getAllIds(node) {
    const ids = new Set()
    ids.add(node.id)
  
    getAllIdsHelper(node)
    
    return ids
  
    function getAllIdsHelper (node) {
      if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
          ids.add(node.children[i].id)
          getAllIdsHelper(node.children[i]);
        }
      }
    }
  }
}

window.MusicRecommendationsPlugin = new MusicRecommendationsFrontend()