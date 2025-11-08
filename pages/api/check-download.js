// API configuration
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

export default async function handler(req, res) {
  const { appid } = req.query;

  if (!appid) {
    return res.status(400).json({
      success: false,
      error: 'App ID is required'
    });
  }

  try {
    const results = [];

    for (const api of apiConfig.api_list) {
      if (!api.enabled) continue;

      try {
        const url = api.url.replace('<appid>', appid);
        
        // Use fetch with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(url, { 
          method: 'HEAD',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        results.push({
          name: api.name,
          url: url,
          available: response.status === api.success_code,
          status: response.status,
          directUrl: response.status === api.success_code ? url : null
        });
      } catch (error) {
        console.error(`Error checking API ${api.name}:`, error.message);
        results.push({
          name: api.name,
          url: api.url.replace('<appid>', appid),
          available: false,
          status: 'Error',
          error: error.name === 'AbortError' ? 'Timeout' : error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Error in check-download API:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while checking downloads'
    });
  }
}