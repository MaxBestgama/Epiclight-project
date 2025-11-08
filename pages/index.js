import { useState, useEffect } from 'react';
import { Search, Download, Clock, Star, Trash2, ExternalLink, Info, Calendar, DollarSign, Users, Tag } from 'lucide-react';

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
};

export default function Home() {
  const [gameId, setGameId] = useState('');
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloadStatus, setDownloadStatus] = useState(null);
  const [checkingDownload, setCheckingDownload] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('info');

  // Load saved data on mount
  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const [searchResult, favResult] = await Promise.all([
        window.storage.get('recent-searches').catch(() => null),
        window.storage.get('favorites').catch(() => null)
      ]);

      if (searchResult?.value) {
        setRecentSearches(JSON.parse(searchResult.value));
      }
      if (favResult?.value) {
        setFavorites(JSON.parse(favResult.value));
      }
    } catch (err) {
      console.error('Error loading stored data:', err);
    }
  };

  const saveRecentSearch = async (id, name, image) => {
    const newSearch = {
      id,
      name,
      image,
      timestamp: Date.now()
    };

    const updated = [newSearch, ...recentSearches.filter(s => s.id !== id)].slice(0, 10);
    setRecentSearches(updated);
    
    try {
      await window.storage.set('recent-searches', JSON.stringify(updated));
    } catch (err) {
      console.error('Error saving search:', err);
    }
  };

  const clearRecentSearches = async () => {
    setRecentSearches([]);
    try {
      await window.storage.delete('recent-searches');
    } catch (err) {
      console.error('Error clearing searches:', err);
    }
  };

  const toggleFavorite = async (id, name, image) => {
    const isFav = favorites.some(f => f.id === id);
    let updated;
    
    if (isFav) {
      updated = favorites.filter(f => f.id !== id);
    } else {
      updated = [...favorites, { id, name, image, timestamp: Date.now() }];
    }
    
    setFavorites(updated);
    try {
      await window.storage.set('favorites', JSON.stringify(updated));
    } catch (err) {
      console.error('Error saving favorites:', err);
    }
  };

  useEffect(() => {
    if (error && gameId) {
      setError('');
    }
  }, [gameId, error]);

  useEffect(() => {
    if (gameData) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [gameData]);

  const fetchGameData = async (id = gameId) => {
    const targetId = id || gameId;
    if (!targetId.trim()) {
      setError('Please enter a Steam Game ID');
      return;
    }

    if (isNaN(targetId)) {
      setError('Game ID must be a number');
      return;
    }

    setLoading(true);
    setError('');
    setDownloadStatus(null);
    setGameData(null);
    
    try {
      // Simulated API call - replace with actual API
      const mockData = {
        success: true,
        data: {
          steam_appid: targetId,
          name: `Game ${targetId}`,
          header_image: `https://cdn.akamai.steamstatic.com/steam/apps/${targetId}/header.jpg`,
          release_date: { date: 'Nov 9, 2025' },
          developers: ['Developer Studio'],
          publishers: ['Publisher Inc'],
          price_overview: { final_formatted: '$19.99' },
          detailed_description: '<p>This is a detailed game description with HTML content.</p>',
          genres: [{ description: 'Action' }, { description: 'Adventure' }],
          categories: [{ description: 'Single-player' }, { description: 'Multi-player' }],
          recommendations: { total: 150000 },
          media: {
            videos: [],
            screenshots: []
          }
        }
      };

      setGameData(mockData.data);
      saveRecentSearch(targetId, mockData.data.name, mockData.data.header_image);
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      setGameData(null);
    } finally {
      setLoading(false);
    }
  };

  const checkDownloadAvailability = async () => {
    if (!gameId || !gameData) return;

    setCheckingDownload(true);
    setDownloadStatus(null);

    try {
      // Simulated download check
      const mockStatus = apiConfig.api_list.map(api => ({
        name: api.name,
        available: Math.random() > 0.5,
        directUrl: api.url.replace('<appid>', gameId),
        status: Math.random() > 0.5 ? 200 : 404
      }));
      
      setDownloadStatus(mockStatus);
    } catch (error) {
      console.error('Error checking download:', error);
      setError('Error checking download availability');
    } finally {
      setCheckingDownload(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchGameData();
  };

  const handleDownload = (downloadUrl) => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  };

  const popularGames = [
    { id: '730', name: 'CS:GO' },
    { id: '570', name: 'Dota 2' },
    { id: '440', name: 'Team Fortress 2' },
    { id: '620', name: 'Portal 2' },
    { id: '400', name: 'Portal' },
    { id: '220', name: 'Half-Life 2' }
  ];

  const isFavorite = gameData && favorites.some(f => f.id === gameData.steam_appid);

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="logo">🎮 Steam Game Finder</h1>
          <p className="tagline">Discover and download your favorite games</p>
        </div>
      </header>

      <main className="main">
        {/* Search Section */}
        <div className="search-section">
          <form onSubmit={handleSubmit} className="search-form">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                placeholder="Enter Steam Game ID (e.g., 730)"
                className="search-input"
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
          
          {error && (
            <div className="alert alert-error">
              <Info size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Access Tabs */}
          <div className="quick-access">
            <div className="tabs">
              <button 
                className={`tab ${!gameData ? 'active' : ''}`}
                onClick={() => setGameData(null)}
              >
                <Star size={16} /> Popular
              </button>
              <button 
                className={`tab ${recentSearches.length > 0 ? '' : 'disabled'}`}
                disabled={recentSearches.length === 0}
              >
                <Clock size={16} /> Recent
              </button>
              <button 
                className={`tab ${favorites.length > 0 ? '' : 'disabled'}`}
                disabled={favorites.length === 0}
              >
                <Star size={16} fill="currentColor" /> Favorites
              </button>
            </div>

            {!gameData && (
              <>
                <div className="games-grid">
                  {popularGames.map((game) => (
                    <button
                      key={game.id}
                      onClick={() => {
                        setGameId(game.id);
                        setTimeout(() => fetchGameData(game.id), 100);
                      }}
                      className="game-card-mini"
                    >
                      <span className="game-name">{game.name}</span>
                      <span className="game-id">#{game.id}</span>
                    </button>
                  ))}
                </div>

                {recentSearches.length > 0 && (
                  <div className="recent-section">
                    <div className="section-header">
                      <h3><Clock size={18} /> Recent Searches</h3>
                      <button onClick={clearRecentSearches} className="btn-text">
                        <Trash2 size={16} /> Clear
                      </button>
                    </div>
                    <div className="games-grid">
                      {recentSearches.map((search) => (
                        <button
                          key={search.id}
                          onClick={() => {
                            setGameId(search.id);
                            setTimeout(() => fetchGameData(search.id), 100);
                          }}
                          className="game-card-mini recent"
                        >
                          <img src={search.image} alt={search.name} className="mini-thumb" />
                          <div className="mini-info">
                            <span className="game-name">{search.name}</span>
                            <span className="game-id">#{search.id}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {favorites.length > 0 && (
                  <div className="recent-section">
                    <div className="section-header">
                      <h3><Star size={18} fill="currentColor" /> Favorites</h3>
                    </div>
                    <div className="games-grid">
                      {favorites.map((fav) => (
                        <button
                          key={fav.id}
                          onClick={() => {
                            setGameId(fav.id);
                            setTimeout(() => fetchGameData(fav.id), 100);
                          }}
                          className="game-card-mini favorite"
                        >
                          <img src={fav.image} alt={fav.name} className="mini-thumb" />
                          <div className="mini-info">
                            <span className="game-name">{fav.name}</span>
                            <span className="game-id">#{fav.id}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Game Details */}
        {gameData && (
          <div className="game-details">
            <div className="game-header-section">
              <img 
                src={gameData.header_image} 
                alt={gameData.name}
                className="game-header-img"
                onError={(e) => e.target.src = 'https://via.placeholder.com/460x215?text=No+Image'}
              />
              <div className="game-header-info">
                <div className="title-row">
                  <h1 className="game-title">{gameData.name}</h1>
                  <button
                    onClick={() => toggleFavorite(gameData.steam_appid, gameData.name, gameData.header_image)}
                    className={`btn-icon ${isFavorite ? 'favorite' : ''}`}
                    title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Star size={24} fill={isFavorite ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <div className="meta-grid">
                  <div className="meta-item">
                    <Tag size={16} />
                    <span>ID: {gameData.steam_appid}</span>
                  </div>
                  <div className="meta-item">
                    <Calendar size={16} />
                    <span>{gameData.release_date?.date || 'N/A'}</span>
                  </div>
                  <div className="meta-item">
                    <DollarSign size={16} />
                    <span>{gameData.price_overview?.final_formatted || 'Free'}</span>
                  </div>
                  <div className="meta-item">
                    <Users size={16} />
                    <span>{gameData.developers?.[0] || 'N/A'}</span>
                  </div>
                </div>

                <button 
                  onClick={checkDownloadAvailability}
                  disabled={checkingDownload}
                  className="btn btn-download"
                >
                  <Download size={20} />
                  {checkingDownload ? 'Checking...' : 'Check Downloads'}
                </button>
              </div>
            </div>

            {/* Download Status */}
            {downloadStatus && (
              <div className="download-panel">
                <h3>📥 Download Sources</h3>
                <div className="download-grid">
                  {downloadStatus.map((result, index) => (
                    <div key={index} className={`download-card ${result.available ? 'available' : 'unavailable'}`}>
                      <div className="download-header">
                        <span className="source-name">{result.name}</span>
                        <span className={`status-badge ${result.available ? 'success' : 'error'}`}>
                          {result.available ? '✓ Available' : '✗ Unavailable'}
                        </span>
                      </div>
                      {result.available && (
                        <button 
                          onClick={() => handleDownload(result.directUrl)}
                          className="btn btn-sm btn-download-link"
                        >
                          <Download size={16} />
                          Download Now
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="detail-tabs">
              <button 
                className={`tab ${activeTab === 'info' ? 'active' : ''}`}
                onClick={() => setActiveTab('info')}
              >
                Information
              </button>
              <button 
                className={`tab ${activeTab === 'media' ? 'active' : ''}`}
                onClick={() => setActiveTab('media')}
              >
                Media
              </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === 'info' && (
                <div className="info-panel">
                  <div className="description-box">
                    <h3>About This Game</h3>
                    <div 
                      dangerouslySetInnerHTML={{ __html: gameData.detailed_description }} 
                      className="description-content"
                    />
                  </div>

                  {gameData.genres && (
                    <div className="tags-section">
                      <h4>Genres</h4>
                      <div className="tags">
                        {gameData.genres.map((genre, i) => (
                          <span key={i} className="tag">{genre.description}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'media' && (
                <div className="media-panel">
                  {gameData.media?.screenshots?.length > 0 ? (
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
                  ) : (
                    <p className="no-content">No media available</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .app {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
          color: #e0e0e0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .header {
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 2rem 1rem;
          text-align: center;
        }

        .logo {
          font-size: 2.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
        }

        .tagline {
          color: #a0a0a0;
          font-size: 1rem;
        }

        .main {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .search-section {
          margin-bottom: 3rem;
        }

        .search-form {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .search-input-wrapper {
          position: relative;
          flex: 1;
          min-width: 300px;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #888;
        }

        .search-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #fff;
          font-size: 1rem;
          transition: all 0.3s;
        }

        .search-input:focus {
          outline: none;
          border-color: #667eea;
          background: rgba(255, 255, 255, 0.08);
        }

        .btn {
          padding: 1rem 2rem;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          white-space: nowrap;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-download {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          color: white;
          width: 100%;
          justify-content: center;
        }

        .btn-download:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(56, 239, 125, 0.4);
        }

        .btn-icon {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 50%;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          color: #fff;
        }

        .btn-icon:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.1);
        }

        .btn-icon.favorite {
          color: #ffd700;
          background: rgba(255, 215, 0, 0.2);
        }

        .btn-text {
          background: none;
          border: none;
          color: #ff6b6b;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          transition: all 0.3s;
        }

        .btn-text:hover {
          background: rgba(255, 107, 107, 0.1);
        }

        .alert {
          padding: 1rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .alert-error {
          background: rgba(255, 107, 107, 0.1);
          border: 1px solid rgba(255, 107, 107, 0.3);
          color: #ff6b6b;
        }

        .quick-access {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 16px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
        }

        .tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .tab {
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: #e0e0e0;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.95rem;
        }

        .tab:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
          border-color: #667eea;
        }

        .tab.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: transparent;
        }

        .tab:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .games-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }

        .game-card-mini {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          text-align: left;
        }

        .game-card-mini.recent,
        .game-card-mini.favorite {
          flex-direction: row;
          align-items: center;
        }

        .game-card-mini:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-4px);
          border-color: #667eea;
        }

        .mini-thumb {
          width: 60px;
          height: 28px;
          object-fit: cover;
          border-radius: 6px;
        }

        .mini-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          flex: 1;
        }

        .game-name {
          color: #fff;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .game-id {
          color: #888;
          font-size: 0.85rem;
        }

        .recent-section {
          margin-top: 2rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .section-header h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.2rem;
        }

        .game-details {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 16px;
          padding: 2rem;
          backdrop-filter: blur(10px);
        }

        .game-header-section {
          display: grid;
          grid-template-columns: 460px 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .game-header-img {
          width: 100%;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }

        .game-header-info {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }

        .game-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #fff;
          line-height: 1.2;
        }

        .meta-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          color: #ccc;
        }

        .download-panel {
          background: rgba(17, 153, 142, 0.1);
          border: 1px solid rgba(17, 153, 142, 0.3);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .download-panel h3 {
          margin-bottom: 1rem;
          color: #38ef7d;
        }

        .download-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .download-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          padding: 1rem;
          border: 2px solid transparent;
        }

        .download-card.available {
          border-color: #38ef7d;
        }

        .download-card.unavailable {
          border-color: #ff6b6b;
          opacity: 0.6;
        }

        .download-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .source-name {
          font-weight: 600;
          color: #fff;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .status-badge.success {
          background: rgba(56, 239, 125, 0.2);
          color: #38ef7d;
        }

        .status-badge.error {
          background: rgba(255, 107, 107, 0.2);
          color: #ff6b6b;
        }

        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
        }

        .btn-download-link {
          background: #38ef7d;
          color: #000;
          width: 100%;
          justify-content: center;
        }

        .detail-tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
        }

        .tab-content {
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .info-panel {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .description-box {
          background: rgba(255, 255, 255, 0.03);
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .description-box h3 {
          margin-bottom: 1rem;
          color: #fff;
          font-size: 1.5rem;
        }

        .description-content {
          line-height: 1.8;
          color: #ccc;
        }

        .description-content :global(p) {
          margin-bottom: 1rem;
        }

        .tags-section h4 {
          margin-bottom: 1rem;
          color: #fff;
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .tag {
          padding: 0.5rem 1rem;
          background: rgba(102, 126, 234, 0.2);
          border: 1px solid rgba(102, 126, 234, 0.4);
          border-radius: 20px;
          color: #667eea;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .media-panel {
          min-height: 200px;
        }

        .screenshots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }

        .screenshot {
          width: 100%;
          border-radius: 12px;
          transition: transform 0.3s;
          cursor: pointer;
        }

        .screenshot:hover {
          transform: scale(1.05);
        }

        .no-content {
          text-align: center;
          color: #888;
          padding: 3rem;
          font-size: 1.1rem;
        }

        @media (max-width: 1024px) {
          .game-header-section {
            grid-template-columns: 1fr;
          }

          .meta-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .logo {
            font-size: 2rem;
          }

          .search-form {
            flex-direction: column;
          }

          .search-input-wrapper {
            min-width: 100%;
          }

          .game-title {
            font-size: 1.8rem;
          }

          .games-grid {
            grid-template-columns: 1fr;
          }

          .download-grid {
            grid-template-columns: 1fr;
          }

          .tabs {
            flex-direction: column;
          }

          .tab {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
