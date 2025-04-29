
const axios = require('axios');
const { URL } = require('url');
  
 async function validateUrl(urlString) {
    // Basic URL structure validation
    if(!isValidUrl(urlString)) {
      return { isValid: false, error: 'Invalid URL format' };
    }
  
    // Add https:// if no protocol is specified
    if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
      urlString = 'https://' + urlString;
    }
  
    // Check URL reachability
    try {
      const response = await axios.head(urlString, {
        timeout: 5000, // 5 seconds timeout
        maxRedirects: 5 // Follow redirects
      });
      
      return { 
        isValid: true, 
        normalizedUrl: urlString,
        status: response.status
      };
    } catch (error) {
      // Try with GET if HEAD fails (some servers block HEAD)
      try {
        const response = await axios.get(urlString, {
          timeout: 5000,
          maxRedirects: 5
        });
        return { 
          isValid: true, 
          normalizedUrl: urlString,
          status: response.status
        };
      } catch (fallbackError) {
        return { 
          isValid: false, 
          error: 'URL is not reachable',
          details: fallbackError.message
        };
      }
    }
  }


  const isValidUrl = (url) => {
    try {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
          }
      new URL(url);
      
      return { 
        isValid: true, 
        normalizedUrl: url,
        status: '200'
      };
    } catch (err) {
        return { 
            isValid: false, 
            error: 'Invalid URL',
            details: ""
          };
    }
  };
  module.exports = { validateUrl,isValidUrl };
