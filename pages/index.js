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
            <h1 className="sidebar-title">MYGAMELIST™</h1>
            <nav className="sidebar-nav">
              <a href="#" className="nav-link">Sign in</a>
              <a href="#" className="nav-link">Q Game</a>
              <a href="#" className="nav-link">Home</a>
              <a href="#" className="nav-link">Calendar</a>
              <a href="#" className="nav-link">Community</a>
            </nav>

            <hr className="divider" />

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="sidebar-section">
                <p className="section-title">Recent Searches</p>
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
              <p className="section-title">Popular Games</p>
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
              {/* Game Header Section */}
              <div className="game-header">
                <div className="game-title-section">
                  <h1 className="game-main-title">{gameData.name}</h1>
                  <div className="game-subtitle">One Must Possess Skill In Order To Continue</div>
                </div>
                
                {/* Stats Grid */}
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-label">Approval</div>
                    <div className="stat-value">NS</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">MQL</div>
                    <div className="stat-value">0</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Popularity</div>
                    <div className="stat-value">0</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Reviews</div>
                    <div className="stat-value">0</div>
                  </div>
                  <div className="stat-item signin-item">
                    <div className="stat-label">Sign in to add this game to your list</div>
                    <button className="signin-button">Sign in</button>
                  </div>
                </div>

                {/* Action Icons */}
                <div className="action-icons">
                  <span className="action-icon">✅️</span>
                  <span className="action-icon">💤 lists</span>
                  <span className="action-icon">💤 read</span>
                </div>
              </div>

              {/* Main Game Card */}
              <div className="modern-game-card">
                <div className="card-header">
                  <h2 className="card-game-title">Jump To Stratos</h2>
                  <div className="card-game-subtitle">2025 | Main Game</div>
                </div>

                <div className="progress-stats">
                  <div className="progress-item">
                    <div className="progress-count">1</div>
                    <div className="progress-label">Finished</div>
                  </div>
                  <div className="progress-item">
                    <div className="progress-count">2</div>
                    <div className="progress-label">Playing</div>
                  </div>
                  <div className="progress-item">
                    <div className="progress-count">0</div>
                    <div className="progress-label">Want +</div>
                  </div>
                  <div className="progress-item">
                    <div className="progress-count">3</div>
                    <div className="progress-label">Dropped</div>
                  </div>
                  <div className="progress-item">
                    <div className="progress-count">0</div>
                    <div className="progress-label">0</div>
                  </div>
                  <div className="progress-item">
                    <div className="progress-count">0</div>
                    <div className="progress-label">0</div>
                  </div>
                </div>

                <div className="game-details">
                  <div className="detail-row">
                    <span className="detail-label">Developers:</span>
                    <span className="detail-value">~</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Publishers:</span>
                    <span className="detail-value">~</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Genres:</span>
                    <span className="detail-value">Platform, Adventure, Indie</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Platforms:</span>
                    <span className="detail-value">PC (Microsoft Windows)</span>
                  </div>
                </div>

                <div className="game-description">
                  {gameData.short_description || "Jump To Stratos is a Rage Physics Platformer that takes place in a cyberpunk city, your goal is to jump your way through the city and past obstacles to reach the top."}
                </div>

                {/* Story Section */}
                <div className="story-section">
                  <h3 className="story-title">Story</h3>
                  <p className="story-content">
                    The story follows the journey of the main character whose goal is to climb the city in the Stratos race event, at first he encounters adversity from the crowd but by the end they cheer him on to the finish.
                  </p>
                </div>

                {/* Screenshots Section */}
                <div className="screenshots-section">
                  <h3 className="screenshots-title">Screenshots (3)</h3>
                  <div className="screenshots-grid">
                    {gameData.media?.screenshots?.slice(0, 3).map((screenshot, index) => (
                      <div key={index} className="screenshot-placeholder">
                        <img 
                          src={screenshot.path_thumbnail} 
                          alt={`Screenshot ${index + 1}`}
                          className="screenshot-thumb"
                        />
                      </div>
                    ))}
                    {(!gameData.media?.screenshots || gameData.media.screenshots.length === 0) && (
                      <>
                        <div className="screenshot-placeholder"></div>
                        <div className="screenshot-placeholder"></div>
                        <div className="screenshot-placeholder"></div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Original content sections (keep for functionality) */}
              <button 
                onClick={checkDownloadAvailability}
                disabled={checkingDownload}
                className="download-check-button"
              >
                {checkingDownload ? '⏳ Checking...' : '📦 Check Download'}
              </button>

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
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
          margin: 0 0 1.5rem 0;
          color: #ffffff;
          font-weight: 700;
          font-family: 'Arial Black', sans-serif;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .nav-link {
          color: #cbd5e1;
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.2s ease;
        }

        .nav-link:hover {
          color: #ffffff;
        }

        .divider {
          border: none;
          border-top: 1px solid #1e293b;
          margin: 1.5rem 0;
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

        /* Modern Game Card Styles */
        .game-header {
          margin-bottom: 2rem;
        }

        .game-main-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 0.5rem 0;
          line-height: 1.1;
        }

        .game-subtitle {
          font-size: 1.1rem;
          color: #94a3b8;
          margin-bottom: 2rem;
          font-weight: 500;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1rem;
          margin-bottom: 1rem;
          background: #0f1629;
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid #1e293b;
        }

        .stat-item {
          text-align: center;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #94a3b8;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #ffffff;
        }

        .signin-item {
          grid-column: span 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .signin-button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          margin-top: 0.5rem;
          transition: background 0.2s ease;
        }

        .signin-button:hover {
          background: #2563eb;
        }

        .action-icons {
          display: flex;
          gap: 1rem;
          align-items: center;
          color: #94a3b8;
          font-size: 0.9rem;
        }

        .action-icon {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .modern-game-card {
          background: #0f1629;
          border: 1px solid #1e293b;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .card-header {
          margin-bottom: 2rem;
        }

        .card-game-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 0.5rem 0;
        }

        .card-game-subtitle {
          font-size: 1rem;
          color: #94a3b8;
        }

        .progress-stats {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: #1e293b;
          border-radius: 8px;
        }

        .progress-item {
          text-align: center;
        }

        .progress-count {
          font-size: 1.5rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 0.25rem;
        }

        .progress-label {
          font-size: 0.75rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .game-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: #1e293b;
          border-radius: 8px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
        }

        .detail-label {
          color: #94a3b8;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .detail-value {
          color: #ffffff;
          font-size: 0.9rem;
        }

        .game-description {
          line-height: 1.6;
          color: #cbd5e1;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: #1e293b;
          border-radius: 8px;
          font-size: 0.95rem;
        }

        .story-section {
          margin-bottom: 2rem;
        }

        .story-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 1rem 0;
        }

        .story-content {
          line-height: 1.6;
          color: #cbd5e1;
          margin: 0;
          padding: 1.5rem;
          background: #1e293b;
          border-radius: 8px;
        }

        .screenshots-section {
          margin-bottom: 2rem;
        }

        .screenshots-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 1rem 0;
        }

        .screenshots-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .screenshot-placeholder {
          aspect-ratio: 16/9;
          background: #1e293b;
          border-radius: 8px;
          border: 1px solid #334155;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          font-size: 0.875rem;
          overflow: hidden;
        }

        .screenshot-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Keep original functional styles */
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
          margin-bottom: 1.5rem;
        }

        .card {
          background: #0f1629;
          border: 1px solid #1e293b;
          border-radius: 12px;
          padding: 1.75rem;
          margin-bottom: 1.5rem;
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

        .status-available {
          color: #10b981;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-unavailable {
          color: #ef4444;
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

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .progress-stats {
            grid-template-columns: repeat(3, 1fr);
          }

          .screenshots-grid {
            grid-template-columns: 1fr;
          }

          .api-result {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }

          .game-main-title {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  )
}
