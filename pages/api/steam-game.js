export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Game ID is required'
    });
  }

  // Validate that ID is a number
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: 'Game ID must be a number'
    });
  }

  try {
    // Fetch game details from Steam Store API
    const gameResponse = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${id}`
    );
    
    if (!gameResponse.ok) {
      throw new Error(`Steam API responded with status: ${gameResponse.status}`);
    }

    const gameData = await gameResponse.json();

    // Check if game exists and data is successful
    if (!gameData[id]) {
      return res.status(404).json({
        success: false,
        error: 'Game not found in Steam database'
      });
    }

    if (!gameData[id].success) {
      return res.status(404).json({
        success: false,
        error: 'Game data not available or game might be delisted'
      });
    }

    const game = gameData[id].data;

    // Extract DLC information with error handling
    let dlcs = [];
    if (game.dlc && Array.isArray(game.dlc) && game.dlc.length > 0) {
      try {
        const dlcIds = game.dlc.slice(0, 10).join(','); // Limit to first 10 DLCs to avoid rate limiting
        const dlcResponse = await fetch(
          `https://store.steampowered.com/api/appdetails?appids=${dlcIds}`
        );
        
        if (dlcResponse.ok) {
          const dlcData = await dlcResponse.json();
          
          dlcs = game.dlc.map(dlcId => {
            const dlc = dlcData[dlcId];
            return {
              id: dlcId,
              name: dlc?.success ? dlc.data.name : `DLC ${dlcId}`,
              success: dlc?.success || false
            };
          });
        }
      } catch (dlcError) {
        console.error('Error fetching DLC data:', dlcError);
        // Continue without DLC data rather than failing completely
        dlcs = game.dlc.map(dlcId => ({
          id: dlcId,
          name: `DLC ${dlcId}`,
          success: false
        }));
      }
    }

    // Extract media information with fallbacks
    const media = {
      screenshots: game.screenshots || [],
      videos: game.movies || [],
      header_image: game.header_image || null
    };

    // Format response with safe property access
    const responseData = {
      steam_appid: game.steam_appid || id,
      name: game.name || 'Unknown Game',
      header_image: game.header_image || null,
      release_date: game.release_date || { date: 'Coming Soon' },
      developers: game.developers || [],
      publishers: game.publishers || [],
      price_overview: game.price_overview || { final_formatted: 'Free' },
      detailed_description: game.detailed_description || 'No description available.',
      short_description: game.short_description || 'No description available.',
      media: media,
      dlcs: dlcs,
      categories: game.categories || [],
      genres: game.genres || [],
      platforms: game.platforms || {}
    };

    // Validate essential data
    if (!responseData.name || responseData.name === 'Unknown Game') {
      return res.status(404).json({
        success: false,
        error: 'Game data incomplete or unavailable'
      });
    }

    res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error fetching Steam data:', error);
    
    // Provide more specific error messages
    if (error.message.includes('Steam API responded with status:')) {
      return res.status(500).json({
        success: false,
        error: 'Steam API is currently unavailable. Please try again later.'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch game data from Steam. The game might not exist or the ID might be incorrect.'
    });
  }
}
