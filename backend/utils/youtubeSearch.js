const SearchCache = require('../models/SearchCache');

const fetchResourceUrls = async (roadmapJson) => {
  // Deep clone to avoid mutating the original directly
  const roadmap = JSON.parse(JSON.stringify(roadmapJson));

  for (const dayObj of roadmap) {
    if (!dayObj.lessons) continue;

    for (const lesson of dayObj.lessons) {
      if (!lesson.resources) continue;

      for (const resource of lesson.resources) {
        if (!resource.searchQuery) {
          // If it happens to already have a URL but no searchQuery, we fall back to it
          resource.url = resource.url || '#';
          continue;
        }

        const originalQuery = resource.searchQuery;
        const normalizedQuery = originalQuery.toLowerCase();
        
        // Step A: Cache Check
        let cached = null;
        try {
          cached = await SearchCache.findOne({ searchQuery: normalizedQuery });
        } catch (cacheErr) {
          console.error('Cache read error:', cacheErr.message);
        }

        if (cached && cached.directUrl) {
          resource.url = cached.directUrl;
          delete resource.searchQuery;
          continue;
        }

        // Step B: API Call
        let finalUrl = null;
        try {
          const apiKey = process.env.YOUTUBE_API_KEY;
          if (!apiKey) {
            throw new Error('YOUTUBE_API_KEY is missing from environment variables');
          }

          const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(originalQuery)}&type=video&maxResults=1&key=${apiKey}`;
          const response = await fetch(searchUrl);
          
          if (!response.ok) {
            throw new Error(`YouTube API failed with status ${response.status}`);
          }

          const data = await response.json();
          if (data.items && data.items.length > 0 && data.items[0].id && data.items[0].id.videoId) {
            const videoId = data.items[0].id.videoId;
            finalUrl = `https://www.youtube.com/watch?v=${videoId}`;
            
            // Save to Cache
            try {
              // Upsert to handle potential race conditions
              await SearchCache.findOneAndUpdate(
                 { searchQuery: normalizedQuery },
                 { directUrl: finalUrl },
                 { upsert: true, new: true, setDefaultsOnInsert: true }
              );
            } catch (saveErr) {
               console.error('Cache write error:', saveErr.message);
            }
          } else {
             throw new Error('No video results returned from API');
          }
        } catch (error) {
          // Step C: The Graceful Fallback
          console.error(`YouTube API fallback triggered for query "${originalQuery}":`, error.message);
          finalUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(originalQuery)}`;
        }

        resource.url = finalUrl;
        delete resource.searchQuery;
      }
    }
  }

  return roadmap;
};

module.exports = {
  fetchResourceUrls,
};
