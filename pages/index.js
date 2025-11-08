import { useState, useEffect } from 'react'

// API configuration (for display purposes only)
const apiConfig = {
  "api_list": [
    {
      "name": "TwentyTwo Cloud",
      "url": "http://masss.pythonanywhere.com/storage?auth=IEOIJE54esfsipoE56GE4&appid=<appid>",
      "success_code": 200,
      "unavailable_code": 404,
      "enabled": true
    },
    {
      "name": "Sadie",
      "url": "https://mellyiscoolaf.pythonanywhere.com/m/<appid>",
      "success_code": 200,
      "unavailable_code": 404,
      "enabled": true
    },
    {
      "name": "Ryuu",
      "url": "https://mellyiscoolaf.pythonanywhere.com/<appid>",
      "success_code": 200,
      "unavailable_code": 404,
      "enabled": true
    },
    {
      "name": "Sushi",
      "url": "https://raw.githubusercontent.com/sushi-dev55/sushitools-games-repo/refs/heads/main/<appid>.zip",
      "success_code": 200,
      "unavailable_code": 404,
      "enabled": true
    }
  ]
}

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
          <h1 className="header-title">🎮 Steam Game DL</h1>
          <p className="header-subtitle">Find and download Steam games</p>
        </div>
      </header>
      
      <main className="main-content">
        <div className="search-section">
          <form onSubmit={handleSubmit} className="search-form">
            <input
              type="text"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              placeholder="Enter Steam Game ID (e.g., 730 for CS:GO)"
              className="search-input"
            />
            <button type="submit" disabled={loading} className="search-button">
              {loading ? '🔄 Loading...' : '🔍 Get Game Info'}
            </button>
          </form>
          
          {error && (
            <div className="error-message">
              <strong>⚠️ Error:</strong> {error}
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="recent-searches">
              <p className="section-title">⏱️ Recent Searches</p>
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
          <div className="popular-games">
            <p className="section-title">🔥 Popular Games</p>
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
                {checkingDownload ? '🔄 Checking...' : '📥 Check Download'}
              </button>
            </div>
            
            {/* Download Status */}
            {downloadStatus && (
              <div className="download-status">
                <h3>📦 Download Availability</h3>
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
              
              <div className="game-basic-info">
                <p><strong>🆔 Steam ID:</strong> {gameData.steam_appid}</p>
                <p><strong>📅 Release Date:</strong> {gameData.release_date?.date || 'N/A'}</p>
                <p><strong>👨‍💻 Developers:</strong> {gameData.developers?.join(', ') || 'N/A'}</p>
                <p><strong>🏢 Publishers:</strong> {gameData.publishers?.join(', ') || 'N/A'}</p>
                <p><strong>💰 Price:</strong> {gameData.price_overview?.final_formatted || 'Free'}</p>
              </div>
            </div>

            {/* Description */}
            <div className="game-description">
              <h2>📝 Description</h2>
              <div 
                dangerouslySetInnerHTML={{ __html: gameData.detailed_description }} 
                className="description-content"
              />
            </div>

            {/* Media Showcase */}
            {gameData.media && (
              <div className="media-section">
                <h2>🎬 Media</h2>
                
                {/* Videos */}
                {gameData.media.videos && gameData.media.videos.length > 0 && (
                  <div className="videos-section">
                    <h3>Videos</h3>
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
                  <div className="screenshots-section">
                    <h3>Screenshots</h3>
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
              <div className="dlc-section">
                <h2>🎁 Downloadable Content (DLC)</h2>
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
          background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
          color: #e0e0e0;
        }

        .header {
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(10px);
          border-bottom: 2px solid rgba(106, 90, 205, 0.3);
          padding: 2rem 1rem;
          text-align: center;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .header-title {
          font-size: 3rem;
          margin: 0;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 800;
        }

        .header-subtitle {
          margin: 0.5rem 0 0 0;
          color: #b0b0b0;
          font-size: 1.1rem;
        }

        .main-content {
          flex: 1;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
          overflow: visible;
        }

        .search-section {
          margin: 2rem 0;
        }

        .search-form {
          display: flex;
          gap: 1rem;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          margin-bottom: 2rem;
        }

        .search-input {
          padding: 1rem;
          font-size: 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(106, 90, 205, 0.5);
          border-radius: 12px;
          min-width: 300px;
          max-width: 100%;
          color: #fff;
          transition: all 0.3s ease;
        }

        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .search-input:focus {
          outline: none;
          border-color: #667eea;
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
        }

        .search-button, .download-check-button {
          padding: 1rem 2rem;
          font-size: 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
          font-weight: 600;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .download-check-button {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          box-shadow: 0 4px 15px rgba(56, 239, 125, 0.4);
        }

        .search-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        .download-check-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(56, 239, 125, 0.6);
        }

        .search-button:disabled,
        .download-check-button:disabled {
          background: #555;
          cursor: not-allowed;
          box-shadow: none;
        }

        .error-message {
          color: #ff6b6b;
          margin: 1rem auto;
          font-weight: bold;
          padding: 1rem;
          background: rgba(255, 107, 107, 0.1);
          border: 2px solid rgba(255, 107, 107, 0.3);
          border-radius: 12px;
          max-width: 600px;
          backdrop-filter: blur(10px);
        }

        .section-title {
          margin-bottom: 1rem;
          font-weight: bold;
          font-size: 1.1rem;
          color: #b0b0b0;
        }

        .recent-searches {
          margin: 2rem 0;
          padding: 1.5rem;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 16px;
          border: 1px solid rgba(106, 90, 205, 0.3);
          backdrop-filter: blur(10px);
        }

        .recent-searches-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .recent-search-btn {
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(106, 90, 205, 0.3);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #e0e0e0;
        }

        .recent-search-btn:hover {
          background: rgba(102, 126, 234, 0.2);
          border-color: #667eea;
          transform: translateX(5px);
        }

        .search-name {
          font-weight: 600;
        }

        .search-id {
          font-size: 0.9rem;
          color: #b0b0b0;
          background: rgba(0, 0, 0, 0.3);
          padding: 0.25rem 0.75rem;
          border-radius: 8px;
        }

        .popular-games {
          margin: 2rem 0;
          padding: 1.5rem;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 16px;
          border: 1px solid rgba(106, 90, 205, 0.3);
          backdrop-filter: blur(10px);
        }

        .popular-games-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .popular-game-btn {
          padding: 0.75rem 1.25rem;
          background: rgba(255, 255, 255, 0.08);
          color: #e0e0e0;
          border: 1px solid rgba(106, 90, 205, 0.3);
          border-radius: 10px;
          cursor: pointer;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .popular-game-btn:hover {
          background: rgba(102, 126, 234, 0.3);
          border-color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .game-id-badge {
          background: rgba(0, 0, 0, 0.4);
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-size: 0.85rem;
          margin-left: 0.5rem;
        }

        .game-info {
          width: 100%;
          padding: 2rem 0;
        }

        .game-title-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .game-title {
          font-size: 2.5rem;
          color: #fff;
          margin: 0;
          word-wrap: break-word;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
        }

        .download-status {
          margin: 2rem 0;
          padding: 1.5rem;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 16px;
          border: 1px solid rgba(106, 90, 205, 0.3);
          backdrop-filter: blur(10px);
        }

        .download-status h3 {
          margin-top: 0;
          color: #fff;
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
          border-radius: 12px;
          border-left: 4px solid;
          transition: all 0.3s ease;
        }

        .api-result.available {
          background: rgba(56, 239, 125, 0.1);
          border-left-color: #38ef7d;
        }

        .api-result.unavailable {
          background: rgba(255, 107, 107, 0.1);
          border-left-color: #ff6b6b;
        }

        .api-name {
          font-weight: bold;
          font-size: 1.1rem;
          color: #fff;
        }

        .download-link {
          margin-left: 1rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .download-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.5);
        }

        .status-available {
          color: #38ef7d;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-unavailable {
          color: #ff6b6b;
        }

        .game-header {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .game-header-image {
          width: 100%;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }

        .game-basic-info {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          font-size: 1.1rem;
          background: rgba(0, 0, 0, 0.3);
          padding: 1.5rem;
          border-radius: 16px;
          border: 1px solid rgba(106, 90, 205, 0.3);
        }

        .game-basic-info p {
          margin: 0;
          line-height: 1.6;
        }

        .game-basic-info strong {
          color: #b0b0b0;
        }

        .game-description {
          margin: 2rem 0;
          padding: 1.5rem;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 16px;
          border: 1px solid rgba(106, 90, 205, 0.3);
        }

        .game-description h2 {
          color: #fff;
          margin-top: 0;
        }

        .description-content {
          line-height: 1.8;
          overflow-wrap: break-word;
          color: #d0d0d0;
        }

        .media-section {
          margin: 2rem 0;
        }

        .media-section h2, .media-section h3 {
          color: #fff;
        }

        .videos-grid, .screenshots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-top: 1rem;
        }

        .game-video, .screenshot {
          width: 100%;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
        }

        .dlc-section {
          margin: 2rem 0;
        }

        .dlc-section h2 {
          color: #fff;
        }

        .dlc-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .dlc-item {
          padding: 1.5rem;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 12px;
          border: 1px solid rgba(106, 90, 205, 0.3);
          transition: all 0.3s ease;
        }

        .dlc-item:hover {
          border-color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
        }

        .dlc-item h4 {
          color: #fff;
          margin-top: 0;
        }

        .dlc-item p {
          color: #b0b0b0;
          margin-bottom: 0;
        }

        .footer {
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(10px);
          border-top: 2px solid rgba(106, 90, 205, 0.3);
          padding: 2rem 1rem;
          text-align: center;
          color: #b0b0b0;
        }

        .footer p {
          margin: 0;
        }

        @media (max-width: 768px) {
          .header-title {
            font-size: 2rem;
          }

          .main-content {
            padding: 0 0.5rem;
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
            font-size: 2rem;
          }

          .recent-search-btn {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  )
}
