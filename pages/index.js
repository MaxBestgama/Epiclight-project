import { useState, useEffect } from 'react'
import { Search, Download, Info, Calendar, Users, DollarSign, Star } from 'lucide-react'

export default function GameListApp() {
  const [gameId, setGameId] = useState('')
  const [gameData, setGameData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [downloadStatus, setDownloadStatus] = useState(null)
  const [checkingDownload, setCheckingDownload] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const stored = window.recentSearches || []
    setRecentSearches(stored)
  }, [])

  useEffect(() => {
    if (error && gameId) {
      setError('')
    }
  }, [gameId, error])

  useEffect(() => {
    if (gameData) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [gameData]);

  const addToRecentSearches = (id, name) => {
    const newSearch = { id, name, timestamp: Date.now() }
    const updated = [newSearch, ...recentSearches.filter(s => s.id !== id)].slice(0, 5)
    setRecentSearches(updated)
    window.recentSearches = updated
  }

  const fetchGameData = async () => {
    if (!gameId.trim()) {
      setError('Please enter a Steam Game ID')
      return
    }

    if (isNaN(gameId)) {
      setError('Game ID must be a number')
      return
    }

    setLoading(true)
    setError('')
    setDownloadStatus(null)
    setGameData(null)
    
    try {
      const response = await fetch(`/api/steam-game?id=${gameId}`)
      const data = await response.json()
      
      if (data.success) {
        setGameData(data.data)
        addToRecentSearches(gameId, data.data.name)
      } else {
        setError(data.error || 'Failed to fetch game data. The game might not exist on Steam.')
        setGameData(null)
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.')
      setGameData(null)
    } finally {
      setLoading(false)
    }
  }

  const checkDownloadAvailability = async () => {
    if (!gameId || !gameData) return

    setCheckingDownload(true)
    setDownloadStatus(null)

    try {
      const response = await fetch(`/api/check-download?appid=${gameId}`)
      const data = await response.json()
      
      if (data.success) {
        setDownloadStatus(data.data)
      } else {
        setError('Failed to check download availability')
      }
    } catch (error) {
      console.error('Error checking download:', error)
      setError('Error checking download availability')
    } finally {
      setCheckingDownload(false)
    }
  }

  const handleDownload = (downloadUrl) => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank')
    }
  }

  const handleRecentSearch = (id) => {
    setGameId(id)
    setTimeout(() => fetchGameData(), 100)
  }

  const popularGames = [
    { id: '730', name: 'Counter-Strike 2', img: 'https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg' },
    { id: '570', name: 'Dota 2', img: 'https://cdn.cloudflare.steamstatic.com/steam/apps/570/header.jpg' },
    { id: '440', name: 'Team Fortress 2', img: 'https://cdn.cloudflare.steamstatic.com/steam/apps/440/header.jpg' },
    { id: '620', name: 'Portal 2', img: 'https://cdn.cloudflare.steamstatic.com/steam/apps/620/header.jpg' },
    { id: '271590', name: 'GTA V', img: 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg' },
    { id: '292030', name: 'The Witcher 3', img: 'https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg' }
  ]

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <h1 className="logo">
              <span className="logo-icon">🎮</span>
              Epic Light
            </h1>
            <p className="tagline">Discover and Download Your Favorite Games</p>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="search-section">
        <div className="container">
          <div className="search-box">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchGameData()}
                placeholder="Enter Steam App ID (e.g., 730 for CS2)"
                className="search-input"
              />
            </div>
            <button onClick={fetchGameData} disabled={loading} className="search-btn">
              {loading ? 'Searching...' : 'Search Game'}
            </button>
          </div>
          
          {error && (
            <div className="error-box">
              <span>⚠️</span> {error}
            </div>
          )}
        </div>
      </section>

      {/* Browse Section */}
      {!gameData && (
        <div className="container">
          {recentSearches.length > 0 && (
            <section className="section">
              <h2 className="section-title">Recent Searches</h2>
              <div className="games-grid">
                {recentSearches.map((search) => (
                  <div
                    key={search.id}
                    onClick={() => handleRecentSearch(search.id)}
                    className="game-card small"
                  >
                    <div className="game-card-content">
                      <h3 className="game-card-title">{search.name}</h3>
                      <p className="game-card-id">ID: {search.id}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="section">
            <h2 className="section-title">Popular Games</h2>
            <div className="games-grid">
              {popularGames.map((game) => (
                <div
                  key={game.id}
                  onClick={() => {
                    setGameId(game.id)
                    setTimeout(() => fetchGameData(), 100)
                  }}
                  className="game-card"
                >
                  <div className="game-card-image">
                    <img src={game.img} alt={game.name} />
                  </div>
                  <div className="game-card-content">
                    <h3 className="game-card-title">{game.name}</h3>
                    <p className="game-card-id">App ID: {game.id}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Game Details */}
      {gameData && (
        <div className="game-details">
          {/* Hero Banner */}
          <div className="game-banner">
            {gameData.header_image && (
              <img src={gameData.header_image} alt={gameData.name} className="banner-img" />
            )}
            <div className="banner-overlay">
              <div className="container">
                <h1 className="game-title">{gameData.name}</h1>
                <div className="game-meta">
                  <span className="meta-item">
                    <Calendar size={16} />
                    {gameData.release_date?.date || 'TBA'}
                  </span>
                  <span className="meta-item">
                    <Users size={16} />
                    {gameData.developers?.join(', ') || 'Unknown'}
                  </span>
                  <span className="meta-item price">
                    <DollarSign size={16} />
                    {gameData.price_overview?.final_formatted || 'Free'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="container">
            <div className="game-content-wrapper">
              {/* Main Content */}
              <div className="game-main-content">
                {/* Action Bar */}
                <div className="action-bar">
                  <button 
                    onClick={checkDownloadAvailability}
                    disabled={checkingDownload}
                    className="btn-primary"
                  >
                    <Download size={18} />
                    {checkingDownload ? 'Checking...' : 'Check Downloads'}
                  </button>
                </div>

                {/* Download Results */}
                {downloadStatus && (
                  <div className="download-section">
                    <h3 className="download-title">
                      <Download size={20} />
                      Available Downloads
                    </h3>
                    <div className="download-list">
                      {downloadStatus.map((result, index) => (
                        <div key={index} className={`download-item ${result.available ? 'available' : 'unavailable'}`}>
                          <div className="download-info">
                            <span className="download-source">{result.name}</span>
                            <span className={`download-badge ${result.available ? 'success' : 'error'}`}>
                              {result.available ? 'Available' : 'Unavailable'}
                            </span>
                          </div>
                          {result.available && (
                            <button 
                              onClick={() => handleDownload(result.directUrl)}
                              className="btn-download"
                            >
                              Download Now
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tabs */}
                <div className="tabs">
                  <button 
                    className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                  >
                    <Info size={18} />
                    Overview
                  </button>
                  <button 
                    className={`tab ${activeTab === 'media' ? 'active' : ''}`}
                    onClick={() => setActiveTab('media')}
                  >
                    <Star size={18} />
                    Media
                  </button>
                </div>

                {/* Tab Content */}
                <div className="tab-content-area">
                  {activeTab === 'overview' && (
                    <div className="overview-content">
                      <div 
                        dangerouslySetInnerHTML={{ __html: gameData.detailed_description }} 
                        className="game-description"
                      />
                    </div>
                  )}

                  {activeTab === 'media' && gameData.media && (
                    <div className="media-content">
                      {gameData.media.screenshots && gameData.media.screenshots.length > 0 && (
                        <div>
                          <h3 className="media-subtitle">Screenshots</h3>
                          <div className="screenshots-grid">
                            {gameData.media.screenshots.map((screenshot, index) => (
                              <img 
                                key={index}
                                src={screenshot.path_full} 
                                alt={`Screenshot ${index + 1}`}
                                className="screenshot"
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {gameData.media.videos && gameData.media.videos.length > 0 && (
                        <div>
                          <h3 className="media-subtitle">Videos</h3>
                          <div className="videos-grid">
                            {gameData.media.videos.map((video, index) => (
                              <video 
                                key={index}
                                controls 
                                poster={video.thumbnail}
                                className="video"
                              >
                                <source src={video.webm?.max || video.mp4?.max} type="video/mp4" />
                              </video>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <aside className="game-sidebar">
                <div className="info-card">
                  <h3 className="info-card-title">Game Information</h3>
                  <div className="info-list">
                    <div className="info-item">
                      <span className="info-label">App ID</span>
                      <span className="info-value">{gameData.steam_appid}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Developer</span>
                      <span className="info-value">{gameData.developers?.join(', ') || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Publisher</span>
                      <span className="info-value">{gameData.publishers?.join(', ') || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Release Date</span>
                      <span className="info-value">{gameData.release_date?.date || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Price</span>
                      <span className="info-value price-tag">{gameData.price_overview?.final_formatted || 'Free'}</span>
                    </div>
                  </div>
                </div>

                {gameData.dlcs && gameData.dlcs.length > 0 && (
                  <div className="info-card">
                    <h3 className="info-card-title">DLC Available</h3>
                    <div className="dlc-list">
                      {gameData.dlcs.slice(0, 5).map((dlc) => (
                        <div key={dlc.id} className="dlc-item">
                          {dlc.name}
                        </div>
                      ))}
                      {gameData.dlcs.length > 5 && (
                        <p className="dlc-more">+{gameData.dlcs.length - 5} more DLCs</p>
                      )}
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>© 2024 Epic Light - Game Discovery Platform</p>
        </div>
      </footer>

      <style jsx>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .app {
          min-height: 100vh;
          background: #f5f7fa;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* Header */
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 0;
          box-shadow: 0 2px 20px rgba(0,0,0,0.1);
        }

        .header-content {
          text-align: center;
        }

        .logo {
          font-size: 36px;
          font-weight: 800;
          margin: 0 0 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .logo-icon {
          font-size: 40px;
        }

        .tagline {
          font-size: 16px;
          opacity: 0.95;
          font-weight: 300;
        }

        /* Search Section */
        .search-section {
          background: white;
          padding: 40px 0;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .search-box {
          display: flex;
          gap: 12px;
          max-width: 800px;
          margin: 0 auto;
        }

        .search-input-wrapper {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          color: #94a3b8;
        }

        .search-input {
          width: 100%;
          padding: 14px 16px 14px 48px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 15px;
          transition: all 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .search-btn {
          padding: 14px 32px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .search-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .search-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-box {
          max-width: 800px;
          margin: 16px auto 0;
          padding: 14px 20px;
          background: #fee;
          border: 1px solid #fcc;
          border-radius: 12px;
          color: #c33;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* Section */
        .section {
          margin: 40px 0;
        }

        .section-title {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 20px;
        }

        /* Games Grid */
        .games-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .game-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .game-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }

        .game-card.small {
          background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
        }

        .game-card-image {
          width: 100%;
          height: 130px;
          overflow: hidden;
          background: #e2e8f0;
        }

        .game-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .game-card-content {
          padding: 16px;
        }

        .game-card-title {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 6px;
        }

        .game-card-id {
          font-size: 13px;
          color: #667eea;
          font-weight: 500;
        }

        /* Game Banner */
        .game-banner {
          position: relative;
          height: 400px;
          overflow: hidden;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .banner-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.3;
        }

        .banner-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%);
          display: flex;
          align-items: flex-end;
          padding: 40px 0;
        }

        .game-title {
          font-size: 42px;
          font-weight: 800;
          color: white;
          margin-bottom: 16px;
          text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }

        .game-meta {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(255,255,255,0.9);
          font-size: 15px;
        }

        .meta-item.price {
          background: rgba(255,255,255,0.2);
          padding: 6px 14px;
          border-radius: 20px;
          font-weight: 600;
        }

        /* Game Content */
        .game-content-wrapper {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 30px;
          margin: -60px 0 40px;
          position: relative;
        }

        .game-main-content {
          background: white;
          border-radius: 16px;
          padding: 30px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }

        /* Action Bar */
        .action-bar {
          margin-bottom: 30px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Download Section */
        .download-section {
          background: #f8fafc;
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 30px;
        }

        .download-title {
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .download-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .download-item {
          background: white;
          padding: 16px;
          border-radius: 10px;
          border-left: 4px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .download-item.available {
          border-left-color: #22c55e;
        }

        .download-item.unavailable {
          border-left-color: #ef4444;
        }

        .download-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .download-source {
          font-weight: 600;
          color: #1e293b;
        }

        .download-badge {
          font-size: 12px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 6px;
          display: inline-block;
          width: fit-content;
        }

        .download-badge.success {
          background: #dcfce7;
          color: #16a34a;
        }

        .download-badge.error {
          background: #fee2e2;
          color: #dc2626;
        }

        .btn-download {
          background: #22c55e;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-download:hover {
          background: #16a34a;
          transform: translateY(-1px);
        }

        /* Tabs */
        .tabs {
          display: flex;
          gap: 8px;
          border-bottom: 2px solid #e2e8f0;
          margin-bottom: 24px;
        }

        .tab {
          background: none;
          border: none;
          padding: 12px 20px;
          font-size: 15px;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          margin-bottom: -2px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tab:hover {
          color: #667eea;
        }

        .tab.active {
          color: #667eea;
          border-bottom-color: #667eea;
        }

        /* Tab Content */
        .tab-content-area {
          min-height: 300px;
        }

        .game-description {
          color: #475569;
          line-height: 1.8;
          font-size: 15px;
        }

        .game-description h1,
        .game-description h2 {
          color: #1e293b;
          margin: 24px 0 12px;
          font-weight: 700;
        }

        .media-content {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .media-subtitle {
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 16px;
        }

        .screenshots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 16px;
        }

        .screenshot {
          width: 100%;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .videos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        .video {
          width: 100%;
          border-radius: 12px;
        }

        /* Sidebar */
        .game-sidebar {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .info-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }

        .info-card-title {
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 20px;
        }

        .info-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .info-label {
          font-size: 12px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-value {
          font-size: 14px;
          color: #1e293b;
          font-weight: 500;
        }

        .price-tag {
          color: #22c55e;
          font-weight: 700;
          font-size: 16px;
        }

        .dlc-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .dlc-item {
          padding: 10px;
          background: #f8fafc;
          border-radius: 8px;
          font-size: 13px;
          color: #475569;
        }

        .dlc-more {
          text-align: center;
          color: #667eea;
          font-size: 13px;
          font-weight: 600;
          margin-top: 8px;
        }

        /* Footer */
        .footer {
          background: #1e293b;
          color: #94a3b8;
          padding: 30px 0;
          text-align: center;
          margin-top: 60px;
        }

        @media (max-width: 968px) {
          .game-content-wrapper {
            grid-template-columns: 1fr;
            margin-top: 20px;
          }

          .game-sidebar {
            order: -1;
          }

          .game-title {
            font-size: 28px;
          }

          .search-box {
            flex-direction: column;
          }

          .games-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          }

          .game-meta {
            font-size: 13px;
          }

          .screenshots-grid {
            grid-template-columns: 1fr;
          }

          .videos-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .logo {
            font-size: 28px;
          }

          .game-main-content {
            padding: 20px;
          }

          .games-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
