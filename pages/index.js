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
      <header className="header">
        <div className="header-content">
          <h1 className="header-title">🎮 Epic Light</h1>
          <p className="header-subtitle">Find and download Steam games</p>
        </div>
      </header>
      
      <main className="main-content">
        <div className="search-section">
          <div className="search-form">
            <input
              type="text"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchGameData()}
              placeholder="Enter Steam Game ID (e.g., 730 for CS:GO)"
              className="search-input"
            />
            <button onClick={fetchGameData} disabled={loading} className="search-button">
              {loading ? '⏳ Loading...' : '🔍 Get Game Info'}
            </button>
          </div>
          
          {error && (
            <div className="error-message">
              <strong>⚠️ Error:</strong> {error}
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="card">
              <p className="section-title">🕒 Recent Searches</p>
              <div className="recent-searches-list">
                {recentSearches.map((search) => (
                  <button
                    key={search.id}
                    onClick={() => handleRecentSearch(search.id)}
                    className="recent-search-btn"
                  >
                    <span className="search-name">{search.name}</span>
                    <span className="search-id">ID: {search.id}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Games Quick Access */}
          <div className="card">
            <p className="section-title">⭐ Popular Games</p>
            <div className="popular-games-list">
              {popularGames.map((game) => (
                <button
                  key={game.id}
                  onClick={() => {
                    setGameId(game.id)
                    setTimeout(() => fetchGameData(), 100)
                  }}
                  className="popular-game-btn"
                >
                  {game.name} <span className="game-id-badge">{game.id}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {gameData && (
          <div className="game-info">
            {/* Title and Download Button */}
            <div className="game-title-section">
              <h1 className="game-title">{gameData.name}</h1>
              <button 
                onClick={checkDownloadAvailability}
                disabled={checkingDownload}
                className="download-check-button"
              >
                {checkingDownload ? '⏳ Checking...' : '📦 Check Download'}
              </button>
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

            {/* Header with Picture and Basic Info */}
            <div className="game-header">
              {gameData.header_image && (
                <img 
                  src={gameData.header_image} 
                  alt={gameData.name}
                  className="game-header-image"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              )}
              
              <div className="card game-basic-info">
                <p><strong>🆔 Steam ID:</strong> {gameData.steam_appid}</p>
                <p><strong>📅 Release Date:</strong> {gameData.release_date?.date || 'N/A'}</p>
                <p><strong>👨‍💻 Developers:</strong> {gameData.developers?.join(', ') || 'N/A'}</p>
                <p><strong>🏢 Publishers:</strong> {gameData.publishers?.join(', ') || 'N/A'}</p>
                <p><strong>💰 Price:</strong> {gameData.price_overview?.final_formatted || 'Free'}</p>
              </div>
            </div>

            {/* Description */}
            <div className="card">
              <h2 className="card-title">📖 Description</h2>
              <div 
                dangerouslySetInnerHTML={{ __html: gameData.detailed_description }} 
                className="description-content"
              />
            </div>

            {/* Media Showcase */}
            {gameData.media && (
              <div className="media-section">
                {/* Videos */}
                {gameData.media.videos && gameData.media.videos.length > 0 && (
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

                {/* Screenshots */}
                {gameData.media.screenshots && gameData.media.screenshots.length > 0 && (
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
                      <p><strong>DLC ID:</strong> {dlc.id}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="footer">
        <p>© 2024 Steam Game DL. Powered by Steam API.</p>
      </footer>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #0a0e27;
          color: #e4e4e7;
        }

        .header {
          background: #0f1629;
          border-bottom: 1px solid #1e293b;
          padding: 1.5rem 1rem;
          text-align: center;
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
        }

        .header-title {
          font-size: 2rem;
          margin: 0;
          color: #ffffff;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .header-subtitle {
          margin: 0.5rem 0 0 0;
          color: #94a3b8;
          font-size: 0.95rem;
        }

        .main-content {
          flex: 1;
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 1.5rem;
          overflow: visible;
        }

        .search-section {
          margin: 2rem 0;
        }

        .search-form {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          margin-bottom: 2rem;
        }

        .search-input {
          padding: 0.875rem 1.125rem;
          font-size: 0.95rem;
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 8px;
          min-width: 320px;
          max-width: 100%;
          color: #e4e4e7;
          transition: all 0.2s ease;
        }

        .search-input::placeholder {
          color: #64748b;
        }

        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          background: #1e293b;
        }

        .search-button, .download-check-button {
          padding: 0.875rem 1.5rem;
          font-size: 0.95rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          font-weight: 600;
        }

        .download-check-button {
          background: #10b981;
        }

        .search-button:hover:not(:disabled) {
          background: #2563eb;
        }

        .download-check-button:hover:not(:disabled) {
          background: #059669;
        }

        .search-button:disabled,
        .download-check-button:disabled {
          background: #334155;
          cursor: not-allowed;
          opacity: 0.5;
        }

        .error-message {
          color: #ef4444;
          margin: 1rem auto;
          font-weight: 500;
          padding: 1rem 1.25rem;
          background: #1e293b;
          border: 1px solid #334155;
          border-left: 3px solid #ef4444;
          border-radius: 8px;
          max-width: 600px;
        }

        .card {
          background: #0f1629;
          border: 1px solid #1e293b;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .section-title {
          margin: 0 0 1rem 0;
          font-weight: 600;
          font-size: 1rem;
          color: #e4e4e7;
        }

        .card-title {
          margin: 0 0 1.25rem 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #ffffff;
        }

        .recent-searches-list {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }

        .recent-search-btn {
          padding: 0.875rem 1rem;
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #e4e4e7;
        }

        .recent-search-btn:hover {
          background: #334155;
          border-color: #3b82f6;
        }

        .search-name {
          font-weight: 500;
        }

        .search-id {
          font-size: 0.875rem;
          color: #94a3b8;
          background: #0a0e27;
          padding: 0.25rem 0.625rem;
          border-radius: 6px;
        }

        .popular-games-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.625rem;
        }

        .popular-game-btn {
          padding: 0.625rem 1rem;
          background: #1e293b;
          color: #e4e4e7;
          border: 1px solid #334155;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .popular-game-btn:hover {
          background: #334155;
          border-color: #3b82f6;
        }

        .game-id-badge {
          background: #0a0e27;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-size: 0.8rem;
          margin-left: 0.5rem;
          color: #94a3b8;
        }

        .game-info {
          width: 100%;
          padding: 0;
        }

        .game-title-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .game-title {
          font-size: 2rem;
          color: #ffffff;
          margin: 0;
          word-wrap: break-word;
          font-weight: 700;
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
          transition: all 0.2s ease;
        }

        .api-result.available {
          border-left-color: #10b981;
        }

        .api-result.unavailable {
          border-left-color: #ef4444;
        }

        .api-name {
          font-weight: 600;
          font-size: 1rem;
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

        .game-header {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .game-header-image {
          width: 100%;
          border-radius: 12px;
          border: 1px solid #1e293b;
        }

        .game-basic-info {
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
          font-size: 0.95rem;
        }

        .game-basic-info p {
          margin: 0;
          line-height: 1.6;
        }

        .game-basic-info strong {
          color: #94a3b8;
        }

        .description-content {
          line-height: 1.7;
          overflow-wrap: break-word;
          color: #cbd5e1;
        }

        .media-section {
          margin: 0;
        }

        .videos-grid, .screenshots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }

        .game-video, .screenshot {
          width: 100%;
          border-radius: 8px;
          border: 1px solid #1e293b;
        }

        .dlc-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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

        .footer {
          background: #0f1629;
          border-top: 1px solid #1e293b;
          padding: 2rem 1rem;
          text-align: center;
          color: #94a3b8;
          margin-top: 2rem;
        }

        .footer p {
          margin: 0;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .header-title {
            font-size: 1.5rem;
          }

          .main-content {
            padding: 0 1rem;
          }

          .game-header {
            grid-template-columns: 1fr;
          }
          
          .search-form {
            flex-direction: column;
          }
          
          .search-input {
            min-width: auto;
            width: 100%;
          }

          .game-title-section {
            flex-direction: column;
            align-items: flex-start;
          }

          .api-result {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .game-title {
            font-size: 1.5rem;
          }

          .recent-search-btn {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .videos-grid, .screenshots-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
