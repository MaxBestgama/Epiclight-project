import { useState, useEffect } from 'react'

export default function Home() {
  const [gameId, setGameId] = useState('')
  const [gameData, setGameData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [downloadStatus, setDownloadStatus] = useState(null)
  const [checkingDownload, setCheckingDownload] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])

  // Load recent searches from memory on mount
  useEffect(() => {
    const stored = window.recentSearches || []
    setRecentSearches(stored)
  }, [])

  // Clear error when user starts typing
  useEffect(() => {
    if (error && gameId) {
      setError('')
    }
  }, [gameId, error])

  // Scroll to top when game data loads
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

    // Validate numeric ID
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

  const handleSubmit = (e) => {
    e.preventDefault()
    fetchGameData()
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

  // Popular Steam game IDs for reference
  const popularGames = [
    { id: '730', name: 'CS:GO' },
    { id: '570', name: 'Dota 2' },
    { id: '440', name: 'Team Fortress 2' },
    { id: '620', name: 'Portal 2' },
    { id: '400', name: 'Portal' },
    { id: '220', name: 'Half-Life 2' },
    { id: '10', name: 'Counter-Strike' },
    { id: '80', name: 'Counter-Strike: Condition Zero' },
    { id: '240', name: 'Counter-Strike: Source' },
    { id: '500', name: 'Left 4 Dead' }
  ]

  return (
    <div className="page-container">
      <div className="layout-wrapper">
        {/* Left Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-content">
            <h1 className="sidebar-title">🎮 Epic Light</h1>
            <p className="sidebar-subtitle">Find and download Steam games</p>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="sidebar-section">
                <p className="section-title">🕒 Recent Searches</p>
                <div className="recent-searches-list">
                  {recentSearches.map((search) => (
                    <button
                      key={search.id}
                      onClick={() => handleRecentSearch(search.id)}
                      className="sidebar-item"
                    >
                      <span className="search-name">{search.name}</span>
                      <span className="search-id">{search.id}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Games */}
            <div className="sidebar-section">
              <p className="section-title">⭐ Popular Games</p>
              <div className="popular-games-list">
                {popularGames.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => {
                      setGameId(game.id)
                      setTimeout(() => fetchGameData(), 100)
                    }}
                    className="sidebar-item"
                  >
                    <span>{game.name}</span>
                    <span className="search-id">{game.id}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {/* Search Bar - Top Right */}
          <div className="search-section">
            <div className="search-form">
              <input
                type="text"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchGameData()}
                placeholder="Enter Steam Game ID (e.g., 730)"
                className="search-input"
              />
              <button onClick={fetchGameData} disabled={loading} className="search-button">
                {loading ? '⏳' : '🔍'}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <strong>⚠️</strong> {error}
            </div>
          )}

          {gameData && (
            <div className="game-content">
              {/* Game Card */}
              <div className="game-card">
                {gameData.header_image && (
                  <div className="game-card-image-wrapper">
                    <img 
                      src={gameData.header_image} 
                      alt={gameData.name}
                      className="game-card-image"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                )}
                
                <div className="game-card-content">
                  <h2 className="game-card-title">{gameData.name}</h2>
                  
                  <div className="game-card-info">
                    <div className="info-row">
                      <span className="info-label">Steam ID:</span>
                      <span className="info-value">{gameData.steam_appid}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Release Date:</span>
                      <span className="info-value">{gameData.release_date?.date || 'N/A'}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Developer:</span>
                      <span className="info-value">{gameData.developers?.join(', ') || 'N/A'}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Publisher:</span>
                      <span className="info-value">{gameData.publishers?.join(', ') || 'N/A'}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Price:</span>
                      <span className="info-value price">{gameData.price_overview?.final_formatted || 'Free'}</span>
                    </div>
                  </div>

                  <button 
                    onClick={checkDownloadAvailability}
                    disabled={checkingDownload}
                    className="download-check-button"
                  >
                    {checkingDownload ? '⏳ Checking...' : '📦 Check Download'}
                  </button>
                </div>
              </div>

              {/* Download Status */}
              {downloadStatus && (
                <div className="card">
                  <h3 className="card-title">📦 Download Availability</h3>
                  <div className="api-results">
                    {downloadStatus.map((result, index) => (
                      <div key={index} className={`api-result ${result.available ? 'available' : 'unavailable'}`}>
                        <div className="api-name">{result.name}</div>
                        <div className="api-status">
                          {result.available ? (
                            <span className="status-available">
                              ✅ Available 
                              <button 
                                onClick={() => handleDownload(result.directUrl)}
                                className="download-link"
                              >
                                Download
                              </button>
                            </span>
                          ) : (
                            <span className="status-unavailable">
                              ❌ {result.error || `Unavailable (Status: ${result.status})`}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="card">
                <h2 className="card-title">📖 Description</h2>
                <div 
                  dangerouslySetInnerHTML={{ __html: gameData.detailed_description }} 
                  className="description-content"
                />
              </div>

              {/* Screenshots */}
              {gameData.media?.screenshots && gameData.media.screenshots.length > 0 && (
                <div className="card">
                  <h3 className="card-title">📸 Screenshots</h3>
                  <div className="screenshots-grid">
                    {gameData.media.screenshots.map((screenshot, index) => (
                      <img 
                        key={index}
                        src={screenshot.path_full} 
                        alt={`Screenshot ${index + 1}`}
                        className="screenshot"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Videos */}
              {gameData.media?.videos && gameData.media.videos.length > 0 && (
                <div className="card">
                  <h3 className="card-title">🎬 Videos</h3>
                  <div className="videos-grid">
                    {gameData.media.videos.map((video, index) => (
                      <div key={index} className="video-item">
                        <video 
                          controls 
                          poster={video.thumbnail}
                          className="game-video"
                        >
                          <source src={video.webm?.max || video.mp4?.max} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DLCs */}
              {gameData.dlcs && gameData.dlcs.length > 0 && (
                <div className="card">
                  <h2 className="card-title">🎁 Downloadable Content (DLC)</h2>
                  <div className="dlc-grid">
                    {gameData.dlcs.map((dlc) => (
                      <div key={dlc.id} className="dlc-item">
                        <h4>{dlc.name}</h4>
                        <p>DLC ID: {dlc.id}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page-container {
          min-height: 100vh;
          background: #0a0e27;
          color: #e4e4e7;
        }

        .layout-wrapper {
          display: flex;
          min-height: 100vh;
        }

        .sidebar {
          width: 280px;
          background: #0f1629;
          border-right: 1px solid #1e293b;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
          flex-shrink: 0;
        }

        .sidebar-content {
          padding: 2rem 1.25rem;
        }

        .sidebar-title {
          font-size: 1.5rem;
          margin: 0 0 0.5rem 0;
          color: #ffffff;
          font-weight: 700;
        }

        .sidebar-subtitle {
          margin: 0 0 2rem 0;
          color: #64748b;
          font-size: 0.875rem;
        }

        .sidebar-section {
          margin-bottom: 2rem;
        }

        .section-title {
          margin: 0 0 0.875rem 0;
          font-weight: 600;
          font-size: 0.875rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .recent-searches-list,
        .popular-games-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .sidebar-item {
          padding: 0.75rem 1rem;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #cbd5e1;
          font-size: 0.875rem;
          text-align: left;
          width: 100%;
        }

        .sidebar-item:hover {
          background: #1e293b;
          border-color: #334155;
          color: #ffffff;
        }

        .search-name {
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .search-id {
          font-size: 0.75rem;
          color: #64748b;
          background: #0a0e27;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          flex-shrink: 0;
          margin-left: 0.5rem;
        }

        .main-content {
          flex: 1;
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        .search-section {
          margin-bottom: 2rem;
          display: flex;
          justify-content: flex-end;
        }

        .search-form {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .search-input {
          padding: 0.75rem 1rem;
          font-size: 0.9rem;
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 8px;
          width: 300px;
          color: #e4e4e7;
          transition: all 0.2s ease;
        }

        .search-input::placeholder {
          color: #64748b;
        }

        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .search-button {
          padding: 0.75rem 1rem;
          font-size: 1.25rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
        }

        .search-button:hover:not(:disabled) {
          background: #2563eb;
        }

        .search-button:disabled {
          background: #334155;
          cursor: not-allowed;
          opacity: 0.5;
        }

        .error-message {
          color: #ef4444;
          margin-bottom: 1.5rem;
          font-weight: 500;
          padding: 1rem;
          background: #1e293b;
          border: 1px solid #334155;
          border-left: 3px solid #ef4444;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .game-content {
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .game-card {
          background: #0f1629;
          border: 1px solid #1e293b;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 1.5rem;
        }

        .game-card-image-wrapper {
          width: 100%;
          height: 300px;
          overflow: hidden;
          background: #1e293b;
        }

        .game-card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .game-card-content {
          padding: 1.75rem;
        }

        .game-card-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 1.5rem 0;
        }

        .game-card-info {
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
          margin-bottom: 1.5rem;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 0.875rem;
          border-bottom: 1px solid #1e293b;
        }

        .info-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .info-label {
          color: #94a3b8;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .info-value {
          color: #e4e4e7;
          font-size: 0.875rem;
          text-align: right;
        }

        .info-value.price {
          color: #10b981;
          font-weight: 600;
        }

        .download-check-button {
          width: 100%;
          padding: 1rem;
          font-size: 0.95rem;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 600;
        }

        .download-check-button:hover:not(:disabled) {
          background: #059669;
        }

        .download-check-button:disabled {
          background: #334155;
          cursor: not-allowed;
          opacity: 0.5;
        }

        .card {
          background: #0f1629;
          border: 1px solid #1e293b;
          border-radius: 12px;
          padding: 1.75rem;
          margin-bottom: 1.5rem;
        }

        .card-title {
          margin: 0 0 1.25rem 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #ffffff;
        }

        .api-results {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .api-result {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-radius: 8px;
          background: #1e293b;
          border: 1px solid #334155;
          border-left-width: 3px;
        }

        .api-result.available {
          border-left-color: #10b981;
        }

        .api-result.unavailable {
          border-left-color: #ef4444;
        }

        .api-name {
          font-weight: 600;
          font-size: 0.95rem;
          color: #ffffff;
        }

        .download-link {
          margin-left: 1rem;
          padding: 0.5rem 1rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .download-link:hover {
          background: #2563eb;
        }

        .status-available {
          color: #10b981;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-unavailable {
          color: #ef4444;
        }

        .description-content {
          line-height: 1.7;
          color: #cbd5e1;
        }

        .screenshots-grid, .videos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
        }

        .screenshot, .game-video {
          width: 100%;
          border-radius: 8px;
          border: 1px solid #1e293b;
        }

        .dlc-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
        }

        .dlc-item {
          padding: 1.25rem;
          background: #1e293b;
          border-radius: 8px;
          border: 1px solid #334155;
          transition: all 0.2s ease;
        }

        .dlc-item:hover {
          border-color: #3b82f6;
        }

        .dlc-item h4 {
          color: #ffffff;
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
          font-weight: 600;
        }

        .dlc-item p {
          color: #94a3b8;
          margin: 0;
          font-size: 0.875rem;
        }

        @media (max-width: 968px) {
          .layout-wrapper {
            flex-direction: column;
          }

          .sidebar {
            width: 100%;
            height: auto;
            position: relative;
            border-right: none;
            border-bottom: 1px solid #1e293b;
          }

          .main-content {
            padding: 1.5rem 1rem;
          }

          .search-section {
            justify-content: stretch;
          }

          .search-form {
            width: 100%;
          }

          .search-input {
            flex: 1;
            width: auto;
          }

          .screenshots-grid, .videos-grid {
            grid-template-columns: 1fr;
          }

          .api-result {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }

          .download-link {
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  )
}
