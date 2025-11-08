import Head from 'next/head'
import { useState, useEffect } from 'react'
import Header from '@components/Header'
import Footer from '@components/Footer'

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

  const handleSubmit = (e) => {
    e.preventDefault()
    fetchGameData()
  }

  const handleDownload = (downloadUrl) => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank')
    }
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
      <Head>
        <title>Steam Game Info Finder</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header title="Steam Game Information Finder" />
      
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
              {loading ? 'Loading...' : 'Get Game Info'}
            </button>
          </form>
          
          {error && (
            <div className="error-message">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Popular Games Quick Access */}
          <div className="popular-games">
            <p>Try these popular games:</p>
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
                  {game.name} ({game.id})
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
                {checkingDownload ? 'Checking...' : 'Check Download'}
              </button>
            </div>
            
            {/* Download Status */}
            {downloadStatus && (
              <div className="download-status">
                <h3>Download Availability</h3>
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
                <p><strong>Steam ID:</strong> {gameData.steam_appid}</p>
                <p><strong>Release Date:</strong> {gameData.release_date?.date || 'N/A'}</p>
                <p><strong>Developers:</strong> {gameData.developers?.join(', ') || 'N/A'}</p>
                <p><strong>Publishers:</strong> {gameData.publishers?.join(', ') || 'N/A'}</p>
                <p><strong>Price:</strong> {gameData.price_overview?.final_formatted || 'Free'}</p>
              </div>
            </div>

            {/* Description */}
            <div className="game-description">
              <h2>Description</h2>
              <div 
                dangerouslySetInnerHTML={{ __html: gameData.detailed_description }} 
                className="description-content"
              />
            </div>

            {/* Media Showcase */}
            {gameData.media && (
              <div className="media-section">
                <h2>Media</h2>
                
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
                <h2>Downloadable Content (DLC)</h2>
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

      <Footer />

      <style jsx>{`
        /* Reset entire page layout */
        .page-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* Main content should grow and be scrollable */
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
          text-align: center;
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
          padding: 0.75rem;
          font-size: 1rem;
          border: 2px solid #0070f3;
          border-radius: 4px;
          min-width: 300px;
          max-width: 100%;
        }

        .search-button, .download-check-button {
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
          white-space: nowrap;
        }

        .download-check-button {
          background-color: #28a745;
        }

        .download-check-button:hover:not(:disabled) {
          background-color: #218838;
        }

        .search-button:hover:not(:disabled),
        .download-check-button:hover:not(:disabled) {
          background-color: #0051a8;
        }

        .search-button:disabled,
        .download-check-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .error-message {
          color: #ff0000;
          margin: 1rem 0;
          font-weight: bold;
          padding: 1rem;
          background: #ffe6e6;
          border: 1px solid #ff0000;
          border-radius: 4px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .popular-games {
          margin: 2rem 0;
          padding: 1rem;
          background: #f5f5f5;
          border-radius: 8px;
        }

        .popular-games p {
          margin-bottom: 0.5rem;
          font-weight: bold;
        }

        .popular-games-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          justify-content: center;
        }

        .popular-game-btn {
          padding: 0.5rem 1rem;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background-color 0.2s;
        }

        .popular-game-btn:hover {
          background: #545b62;
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
          color: #333;
          margin: 0;
          word-wrap: break-word;
        }

        /* Rest of your existing styles */
        .download-status {
          margin: 2rem 0;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #dee2e6;
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
          border-radius: 6px;
          border-left: 4px solid;
        }

        .api-result.available {
          background: #d4edda;
          border-left-color: #28a745;
        }

        .api-result.unavailable {
          background: #f8d7da;
          border-left-color: #dc3545;
        }

        .api-name {
          font-weight: bold;
          font-size: 1.1rem;
        }

        .download-link {
          margin-left: 1rem;
          padding: 0.25rem 0.75rem;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .download-link:hover {
          background: #0056b3;
        }

        .status-available {
          color: #155724;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-unavailable {
          color: #721c24;
        }

        .game-header {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .game-header-image {
          width: 100%;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .game-basic-info {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          font-size: 1.1rem;
        }

        .game-description {
          margin: 2rem 0;
          padding: 1.5rem;
          background: #f5f5f5;
          border-radius: 8px;
        }

        .description-content {
          line-height: 1.6;
          overflow-wrap: break-word;
        }

        .description-content :global(img) {
          max-width: 100%;
          height: auto;
        }

        .media-section {
          margin: 2rem 0;
        }

        .videos-grid, .screenshots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .game-video, .screenshot {
          width: 100%;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .dlc-section {
          margin: 2rem 0;
        }

        .dlc-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .dlc-item {
          padding: 1rem;
          background: #f9f9f9;
          border-radius: 8px;
          border: 1px solid #ddd;
        }

        @media (max-width: 768px) {
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
        }

        /* Global reset for full page scrolling */
        :global(html) {
          height: 100%;
        }

        :global(body) {
          height: 100%;
          margin: 0;
          padding: 0;
          overflow-y: auto;
        }

        :global(#__next) {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  )
}
