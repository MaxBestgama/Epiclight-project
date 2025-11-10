import { useState, useEffect } from 'react'

export default function Home() {
  const [gameId, setGameId] = useState('')
  const [gameData, setGameData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [downloadStatus, setDownloadStatus] = useState(null)
  const [checkingDownload, setCheckingDownload] = useState(false)

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

  return (
    <div className="page-container">
      {/* Header with Search */}
      <header className="header">
        <div className="header-content">
          <h1 className="header-title">Epicano 247</h1>
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
              {loading ? 'Search' : 'Searching'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {error && !gameData && (
          <div className="error-message">
            <strong></strong> {error}
          </div>
        )}

        {gameData && (
          <div className="game-layout">
            {/* Left Column - Game Info */}
            <div className="left-column">

              {/* Download Check Card */}
              <div className="download-card">
                <button 
                  onClick={checkDownloadAvailability}
                  disabled={checkingDownload}
                  className="download-check-btn"
                >
                  {checkingDownload ? 'Checking...' : 'Check download'}
                </button>
              </div>

              {/* Download Status */}
              {downloadStatus && (
                <div className="download-status-card">
                  <h3 className="section-title">DOWNLOAD AVAILABILITY</h3>
                  <div className="download-results">
                    {downloadStatus.map((result, index) => (
                      <div key={index} className={`download-item ${result.available ? 'available' : 'unavailable'}`}>
                        <div className="download-name">{result.name}</div>
                        <div className="download-action">
                          {result.available ? (
                            <>
                              <span className="status-badge available">Available</span>
                              <button 
                                onClick={() => handleDownload(result.directUrl)}
                                className="download-btn"
                              >
                                Download
                              </button>
                            </>
                          ) : (
                            <span className="status-badge unavailable">
                               Unavailable
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}


              {/* Game Info */}
              <div className="info-card">
                <h3 className="section-title"> GAME INFORMATION</h3>
                <ul className="info-list">
                  <li>
                    <span className="info-label">Developers:</span>
                    <span className="info-value">{gameData.developers?.join(', ') || '-'}</span>
                  </li>
                  <li>
                    <span className="info-label">Publishers:</span>
                    <span className="info-value">{gameData.publishers?.join(', ') || '-'}</span>
                  </li>
                  <li>
                    <span className="info-label">Release Date:</span>
                    <span className="info-value">{gameData.release_date?.date || 'N/A'}</span>
                  </li>
                  <li>
                    <span className="info-label">Price:</span>
                    <span className="info-value price">{gameData.price_overview?.final_formatted || 'Free'}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column - Game Card */}
            <div className="right-column">
              <div className="game-card">
                {/* Hero Image */}
                <div className="game-hero">
                  <img 
                    src={gameData.header_image} 
                    alt={gameData.name}
                    className="game-hero-image"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                  <div className="game-hero-gradient"></div>
                </div>

                {/* Game Content */}
                <div className="game-content">
                  <h1 className="game-title">{gameData.name}</h1>
                  <p className="game-meta">
                    {gameData.release_date?.date || '2025'} | Main Game
                  </p>

                  {/* Description */}
                  <div className="game-description">
                    <div 
                      dangerouslySetInnerHTML={{ __html: gameData.short_description || gameData.detailed_description }} 
                      className="description-text"
                    />
                  </div>

                  {/* Screenshots */}
                  {gameData.media?.screenshots && gameData.media.screenshots.length > 0 && (
                    <section className="media-section">
                      <h2 className="media-title">
                        <span className="media-icon">📸</span>
                        Screenshots ({gameData.media.screenshots.length})
                      </h2>
                      <div className="screenshots-grid">
                        {gameData.media.screenshots.slice(0, 6).map((screenshot, index) => (
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
                    </section>
                  )}

                  {/* Videos */}
                  {gameData.media?.videos && gameData.media.videos.length > 0 && (
                    <section className="media-section">
                      <h2 className="media-title">
                        <span className="media-icon">🎬</span>
                        Videos ({gameData.media.videos.length})
                      </h2>
                      <div className="videos-grid">
                        {gameData.media.videos.map((video, index) => (
                          <div key={index} className="video-wrapper">
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
                    </section>
                  )}

                  {/* Full Description */}
                  {gameData.detailed_description && (
                    <section className="media-section">
                      <h2 className="media-title">
                        <span className="media-icon"></span>
                        Full Description
                      </h2>
                      <div 
                        dangerouslySetInnerHTML={{ __html: gameData.detailed_description }} 
                        className="full-description"
                      />
                    </section>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page-container {
          min-height: 100vh;
          background: #1a1a2e;
          color: #e4e4e7;
        }

        .header {
          background: #16213e;
          border-bottom: 3px solid #e94560;
          padding: 1.5rem 2rem;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }

        .header-title {
          font-size: 1.5rem;
          color: #e94560;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0;
        }

        .search-form {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .search-input {
          padding: 0.75rem 1rem;
          font-size: 0.9rem;
          background: #1a1a2e;
          border: 2px solid #0f3460;
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
          border-color: #e94560;
          box-shadow: 0 0 10px rgba(233, 69, 96, 0.3);
        }

        .search-button {
          padding: 0.75rem 1rem;
          font-size: 1.25rem;
          background: #e94560;
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
          background: #d63651;
          box-shadow: 0 0 15px rgba(233, 69, 96, 0.5);
        }

        .search-button:disabled {
          background: #334155;
          cursor: not-allowed;
          opacity: 0.5;
        }

        .main-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .error-message {
          color: #ef4444;
          margin-bottom: 1.5rem;
          font-weight: 500;
          padding: 1rem;
          background: #16213e;
          border: 2px solid #e94560;
          border-left: 4px solid #e94560;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .game-layout {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 2rem;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Left Column */
        .left-column {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .stats-card {
          background: rgba(27, 29, 31, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          padding: 1rem;
          backdrop-filter: blur(20px);
        }

        .stats-cover {
          width: 64px;
          height: 90px;
          object-fit: cover;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
        }

        .stat-label {
          font-size: 0.8125rem;
          color: rgba(255, 255, 255, 0.8);
          text-shadow: 1px 1px 2px rgba(27, 29, 31, 0.5);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #888;
        }

        .stat-sublabel {
          font-size: 0.8125rem;
          color: rgba(255, 255, 255, 0.8);
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .download-card {
          background: rgba(27, 29, 31, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          padding: 1rem;
          backdrop-filter: blur(20px);
        }

        .download-check-btn {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #e94560 0%, #0f3460 100%);
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.95rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: all 0.2s ease;
        }

        .download-check-btn:hover:not(:disabled) {
          box-shadow: 0 0 20px rgba(233, 69, 96, 0.5);
          transform: translateY(-2px);
        }

        .download-check-btn:disabled {
          background: #334155;
          cursor: not-allowed;
          opacity: 0.5;
        }

        .download-status-card {
          background: rgba(27, 29, 31, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          padding: 1.5rem;
          backdrop-filter: blur(20px);
        }

        .section-title {
          font-size: 0.875rem;
          color: #e94560;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
          margin: 0 0 1rem 0;
        }

        .download-results {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .download-item {
          padding: 1rem;
          background: #0f3460;
          border-radius: 8px;
          border-left: 4px solid #1a1a2e;
        }

        .download-item.available {
          border-left-color: #00d9ff;
        }

        .download-item.unavailable {
          border-left-color: #e94560;
        }

        .download-name {
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #ffffff;
        }

        .download-action {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .status-badge {
          font-size: 0.875rem;
        }

        .status-badge.available {
          color: #00d9ff;
        }

        .status-badge.unavailable {
          color: #e94560;
        }

        .download-btn {
          padding: 0.5rem 1rem;
          background: #e94560;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: all 0.2s ease;
        }

        .download-btn:hover {
          background: #d63651;
          box-shadow: 0 0 15px rgba(233, 69, 96, 0.5);
        }

        .status-card {
          background: rgba(27, 29, 31, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          padding: 1.5rem;
          backdrop-filter: blur(20px);
        }

        .status-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .status-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .status-icon {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-count {
          font-weight: 700;
          color: #ffffff;
        }

        .info-card {
          background: rgba(27, 29, 31, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          padding: 1.5rem;
          backdrop-filter: blur(20px);
        }

        .info-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .info-list li {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          font-size: 0.875rem;
        }

        .info-label {
          color: rgba(255, 255, 255, 0.5);
        }

        .info-value {
          color: #ffffff;
        }

        .info-value.price {
          color: #00d9ff;
          font-weight: 600;
          font-size: 1rem;
        }

        /* Right Column */
        .right-column {
          min-width: 0;
        }

        .game-card {
          background: rgba(27, 29, 31, 1);
          border: 1px solid rgba(56, 58, 64, 0.6);
          border-radius: 20px;
          overflow: hidden;
          position: relative;
        }

        .game-hero {
          position: relative;
          aspect-ratio: 16/9;
          width: 100%;
          overflow: hidden;
          margin-bottom: -6.5rem;
        }

        .game-hero-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top;
        }

        .game-hero-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(0deg, #1b1d1f 0%, rgba(27, 29, 31, 0) 30%);
        }

        .game-content {
          position: relative;
          z-index: 1;
          padding: 1.5rem 2rem 2rem;
        }

        .game-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 0.5rem 0;
        }

        .game-meta {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.5);
          margin: 0 0 1.5rem 0;
        }

        .game-description {
          margin-bottom: 2rem;
        }

        .description-text {
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          font-size: 0.95rem;
        }

        .media-section {
          margin-bottom: 2rem;
        }

        .media-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #ffffff;
          margin: 0 0 1rem 0;
        }

        .media-icon {
          opacity: 0.3;
          font-size: 1.25rem;
        }

        .screenshots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
        }

        .screenshot {
          width: 100%;
          aspect-ratio: 16/9;
          object-fit: cover;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.2s ease;
        }

        .screenshot:hover {
          border-color: #e94560;
          box-shadow: 0 0 15px rgba(233, 69, 96, 0.3);
        }

        .videos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        }

        .video-wrapper {
          aspect-ratio: 16/9;
        }

        .game-video {
          width: 100%;
          height: 100%;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .full-description {
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.7;
          font-size: 0.95rem;
        }

        @media (max-width: 1024px) {
          .game-layout {
            grid-template-columns: 1fr;
          }

          .left-column {
            order: 2;
          }

          .right-column {
            order: 1;
          }

          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 1rem;
          }

          .search-form {
            width: 100%;
          }

          .search-input {
            flex: 1;
            width: auto;
          }

          .main-content {
            padding: 1rem;
          }

          .game-content {
            padding: 1rem;
          }

          .screenshots-grid {
            grid-template-columns: 1fr;
          }

          .videos-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
