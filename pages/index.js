import { useState, useEffect } from 'react'

export default function SteamGameFinder() {
  const [gameId, setGameId] = useState('')
  const [gameData, setGameData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [downloadStatus, setDownloadStatus] = useState(null)
  const [checkingDownload, setCheckingDownload] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])
  const [activeTab, setActiveTab] = useState('about')

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
    { id: '730', name: 'Counter-Strike 2' },
    { id: '570', name: 'Dota 2' },
    { id: '440', name: 'Team Fortress 2' },
    { id: '620', name: 'Portal 2' },
    { id: '271590', name: 'Grand Theft Auto V' },
    { id: '292030', name: 'The Witcher 3' },
    { id: '1091500', name: 'Cyberpunk 2077' },
    { id: '1172470', name: 'Apex Legends' }
  ]

  return (
    <div className="steam-page">
      {/* Steam Header */}
      <header className="steam-header">
        <div className="steam-nav">
          <div className="nav-logo">STEAM</div>
          <div className="nav-links">
            <a href="#" className="nav-link">STORE</a>
            <a href="#" className="nav-link">COMMUNITY</a>
            <a href="#" className="nav-link active">LIBRARY</a>
          </div>
          <div className="nav-user">
            <span className="user-name">Epic Light Finder</span>
          </div>
        </div>
      </header>

      {/* Search Bar Area */}
      <div className="search-container">
        <div className="search-wrapper">
          <input
            type="text"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchGameData()}
            placeholder="Enter Steam App ID (e.g., 730 for CS2)"
            className="steam-search-input"
          />
          <button onClick={fetchGameData} disabled={loading} className="steam-search-btn">
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        
        {error && (
          <div className="steam-error">
            {error}
          </div>
        )}
      </div>

      {/* Recent & Popular Games */}
      {!gameData && (
        <div className="browse-section">
          {recentSearches.length > 0 && (
            <div className="steam-section">
              <h2 className="section-title">RECENT SEARCHES</h2>
              <div className="games-grid">
                {recentSearches.map((search) => (
                  <div
                    key={search.id}
                    onClick={() => handleRecentSearch(search.id)}
                    className="game-card"
                  >
                    <div className="game-card-content">
                      <div className="game-card-title">{search.name}</div>
                      <div className="game-card-id">App ID: {search.id}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="steam-section">
            <h2 className="section-title">POPULAR GAMES</h2>
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
                  <div className="game-card-content">
                    <div className="game-card-title">{game.name}</div>
                    <div className="game-card-id">App ID: {game.id}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Game Page */}
      {gameData && (
        <div className="game-page">
          {/* Game Header with Image */}
          <div className="game-hero">
            {gameData.header_image && (
              <img 
                src={gameData.header_image} 
                alt={gameData.name}
                className="game-hero-img"
              />
            )}
            <div className="game-hero-overlay">
              <h1 className="game-hero-title">{gameData.name}</h1>
            </div>
          </div>

          {/* Game Content Area */}
          <div className="game-content">
            {/* Left Column */}
            <div className="game-main">
              {/* Screenshots/Media */}
              {gameData.media && (
                <div className="media-showcase">
                  {gameData.media.screenshots && gameData.media.screenshots.length > 0 && (
                    <div className="screenshots">
                      <img 
                        src={gameData.media.screenshots[0].path_full} 
                        alt="Screenshot"
                        className="featured-screenshot"
                      />
                      <div className="screenshot-thumbs">
                        {gameData.media.screenshots.slice(0, 4).map((screenshot, index) => (
                          <img 
                            key={index}
                            src={screenshot.path_thumbnail || screenshot.path_full} 
                            alt={`Thumb ${index + 1}`}
                            className="screenshot-thumb"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tabs */}
              <div className="game-tabs">
                <div 
                  className={`tab ${activeTab === 'about' ? 'active' : ''}`}
                  onClick={() => setActiveTab('about')}
                >
                  About This Game
                </div>
                <div 
                  className={`tab ${activeTab === 'download' ? 'active' : ''}`}
                  onClick={() => setActiveTab('download')}
                >
                  Download
                </div>
              </div>

              {/* Tab Content */}
              <div className="tab-content">
                {activeTab === 'about' && (
                  <div className="about-content">
                    <div 
                      dangerouslySetInnerHTML={{ __html: gameData.detailed_description }} 
                      className="game-description"
                    />
                    
                    {gameData.dlcs && gameData.dlcs.length > 0 && (
                      <div className="dlc-section">
                        <h3>Downloadable Content For This Game</h3>
                        <div className="dlc-list">
                          {gameData.dlcs.slice(0, 5).map((dlc) => (
                            <div key={dlc.id} className="dlc-item">
                              {dlc.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'download' && (
                  <div className="download-content">
                    {!downloadStatus && (
                      <button 
                        onClick={checkDownloadAvailability}
                        disabled={checkingDownload}
                        className="check-download-btn"
                      >
                        {checkingDownload ? 'Checking Availability...' : 'Check Download Options'}
                      </button>
                    )}

                    {downloadStatus && (
                      <div className="download-results">
                        {downloadStatus.map((result, index) => (
                          <div key={index} className={`download-option ${result.available ? 'available' : 'unavailable'}`}>
                            <div className="download-source">{result.name}</div>
                            <div className="download-status-text">
                              {result.available ? (
                                <button 
                                  onClick={() => handleDownload(result.directUrl)}
                                  className="download-btn"
                                >
                                  Download Now
                                </button>
                              ) : (
                                <span className="unavailable-text">Not Available</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="game-sidebar">
              {/* Purchase Box */}
              <div className="purchase-box">
                <div className="purchase-header">
                  <span className="purchase-title">Buy {gameData.name}</span>
                </div>
                <div className="purchase-price">
                  {gameData.price_overview?.final_formatted || 'Free To Play'}
                </div>
                <button className="add-to-cart-btn">
                  Add to Cart
                </button>
              </div>

              {/* Game Details */}
              <div className="game-details">
                <div className="detail-row">
                  <span className="detail-label">Developer:</span>
                  <span className="detail-value">{gameData.developers?.join(', ') || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Publisher:</span>
                  <span className="detail-value">{gameData.publishers?.join(', ') || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Release Date:</span>
                  <span className="detail-value">{gameData.release_date?.date || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">App ID:</span>
                  <span className="detail-value">{gameData.steam_appid}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .steam-page {
          min-height: 100vh;
          background: linear-gradient(to bottom, #1b2838 0%, #2a475e 100%);
          font-family: "Motiva Sans", Arial, sans-serif;
          color: #c7d5e0;
        }

        /* Header */
        .steam-header {
          background: #171a21;
          border-bottom: 1px solid #000;
        }

        .steam-nav {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          padding: 0 20px;
          height: 60px;
        }

        .nav-logo {
          font-size: 24px;
          font-weight: bold;
          color: #fff;
          margin-right: 40px;
          letter-spacing: 2px;
        }

        .nav-links {
          display: flex;
          gap: 25px;
          flex: 1;
        }

        .nav-link {
          color: #b8b6b4;
          text-decoration: none;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.5px;
          transition: color 0.2s;
          cursor: pointer;
        }

        .nav-link:hover {
          color: #fff;
        }

        .nav-link.active {
          color: #fff;
        }

        .nav-user {
          color: #b8b6b4;
          font-size: 13px;
        }

        .user-name {
          color: #66c0f4;
        }

        /* Search Container */
        .search-container {
          max-width: 940px;
          margin: 40px auto;
          padding: 0 20px;
        }

        .search-wrapper {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }

        .steam-search-input {
          flex: 1;
          background: #316282;
          border: none;
          padding: 12px 15px;
          color: #fff;
          font-size: 14px;
          border-radius: 3px;
        }

        .steam-search-input::placeholder {
          color: #7193a6;
        }

        .steam-search-input:focus {
          outline: none;
          background: #3d7fa3;
        }

        .steam-search-btn {
          background: linear-gradient(to bottom, #75b022 5%, #588a1b 95%);
          border: none;
          color: #fff;
          padding: 12px 30px;
          font-size: 14px;
          font-weight: 600;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .steam-search-btn:hover:not(:disabled) {
          background: linear-gradient(to bottom, #8bc53f 5%, #75b022 95%);
        }

        .steam-search-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .steam-error {
          background: #5c2626;
          border: 1px solid #8b4242;
          padding: 12px 15px;
          border-radius: 3px;
          color: #f4a3a3;
          font-size: 13px;
        }

        /* Browse Section */
        .browse-section {
          max-width: 940px;
          margin: 0 auto;
          padding: 0 20px 40px;
        }

        .steam-section {
          margin-bottom: 40px;
        }

        .section-title {
          font-size: 14px;
          color: #fff;
          font-weight: 300;
          text-transform: uppercase;
          margin-bottom: 15px;
          letter-spacing: 2px;
        }

        .games-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
        }

        .game-card {
          background: linear-gradient(to bottom, #2a475e 0%, #1f3344 100%);
          padding: 15px;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
        }

        .game-card:hover {
          background: linear-gradient(to bottom, #3d5a6f 0%, #2a475e 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
        }

        .game-card-title {
          color: #fff;
          font-size: 14px;
          margin-bottom: 5px;
          font-weight: 500;
        }

        .game-card-id {
          color: #66c0f4;
          font-size: 12px;
        }

        /* Game Page */
        .game-page {
          max-width: 100%;
        }

        .game-hero {
          position: relative;
          width: 100%;
          height: 400px;
          overflow: hidden;
        }

        .game-hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .game-hero-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%);
          padding: 40px;
        }

        .game-hero-title {
          color: #fff;
          font-size: 36px;
          font-weight: 300;
          max-width: 940px;
          margin: 0 auto;
        }

        .game-content {
          max-width: 940px;
          margin: 0 auto;
          padding: 20px;
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 20px;
        }

        .game-main {
          background: rgba(0, 0, 0, 0.2);
        }

        /* Media Showcase */
        .media-showcase {
          margin-bottom: 20px;
        }

        .featured-screenshot {
          width: 100%;
          height: auto;
          display: block;
          margin-bottom: 10px;
        }

        .screenshot-thumbs {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        .screenshot-thumb {
          width: 100%;
          height: 80px;
          object-fit: cover;
          cursor: pointer;
          opacity: 0.7;
          transition: opacity 0.2s;
        }

        .screenshot-thumb:hover {
          opacity: 1;
        }

        /* Tabs */
        .game-tabs {
          display: flex;
          background: #1b2838;
          border-bottom: 1px solid #000;
        }

        .tab {
          padding: 15px 25px;
          color: #8f98a0;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          border-bottom: 2px solid transparent;
        }

        .tab:hover {
          color: #fff;
        }

        .tab.active {
          color: #fff;
          background: rgba(103, 193, 245, 0.2);
          border-bottom-color: #66c0f4;
        }

        /* Tab Content */
        .tab-content {
          background: #0e1419;
          padding: 25px;
        }

        .game-description {
          color: #acb2b8;
          line-height: 1.8;
          font-size: 14px;
        }

        .game-description h1, .game-description h2 {
          color: #fff;
          margin: 20px 0 10px;
          font-weight: 400;
        }

        .dlc-section {
          margin-top: 30px;
        }

        .dlc-section h3 {
          color: #fff;
          font-size: 16px;
          font-weight: 400;
          margin-bottom: 15px;
        }

        .dlc-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .dlc-item {
          background: rgba(0, 0, 0, 0.3);
          padding: 10px 15px;
          border-radius: 3px;
          color: #8f98a0;
          font-size: 13px;
        }

        /* Download Tab */
        .download-content {
          min-height: 200px;
        }

        .check-download-btn {
          background: linear-gradient(to bottom, #75b022 5%, #588a1b 95%);
          border: none;
          color: #fff;
          padding: 15px 40px;
          font-size: 15px;
          font-weight: 600;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
        }

        .check-download-btn:hover:not(:disabled) {
          background: linear-gradient(to bottom, #8bc53f 5%, #75b022 95%);
        }

        .check-download-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .download-results {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .download-option {
          background: rgba(0, 0, 0, 0.3);
          padding: 15px;
          border-radius: 3px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-left: 3px solid transparent;
        }

        .download-option.available {
          border-left-color: #75b022;
        }

        .download-option.unavailable {
          border-left-color: #8f463f;
        }

        .download-source {
          color: #fff;
          font-size: 14px;
          font-weight: 500;
        }

        .download-btn {
          background: linear-gradient(to bottom, #75b022 5%, #588a1b 95%);
          border: none;
          color: #fff;
          padding: 8px 20px;
          font-size: 13px;
          font-weight: 600;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .download-btn:hover {
          background: linear-gradient(to bottom, #8bc53f 5%, #75b022 95%);
        }

        .unavailable-text {
          color: #8f463f;
          font-size: 13px;
        }

        /* Sidebar */
        .game-sidebar {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .purchase-box {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid #000;
        }

        .purchase-header {
          background: linear-gradient(to bottom, #2a475e 0%, #1f3344 100%);
          padding: 12px 15px;
          border-bottom: 1px solid #000;
        }

        .purchase-title {
          color: #fff;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .purchase-price {
          padding: 20px 15px;
          color: #beee11;
          font-size: 24px;
          font-weight: 600;
          text-align: center;
        }

        .add-to-cart-btn {
          width: calc(100% - 30px);
          margin: 0 15px 15px;
          background: linear-gradient(to bottom, #75b022 5%, #588a1b 95%);
          border: none;
          color: #fff;
          padding: 12px;
          font-size: 15px;
          font-weight: 600;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-to-cart-btn:hover {
          background: linear-gradient(to bottom, #8bc53f 5%, #75b022 95%);
        }

        .game-details {
          background: rgba(0, 0, 0, 0.2);
          padding: 15px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.3);
          font-size: 12px;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-label {
          color: #556772;
        }

        .detail-value {
          color: #c6d4df;
          text-align: right;
        }

        @media (max-width: 768px) {
          .game-content {
            grid-template-columns: 1fr;
          }

          .game-hero-title {
            font-size: 24px;
            padding: 20px;
          }

          .nav-links {
            display: none;
          }

          .games-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          }

          .screenshot-thumbs {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  )
}
