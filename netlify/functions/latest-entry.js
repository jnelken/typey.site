exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: ''
    };
  }

  try {
    // Get IP address for filtering (optional)
    const requestIP = event.headers['x-forwarded-for'] || 
                     event.headers['x-real-ip'] || 
                     context.clientContext?.ip || 
                     'unknown';
    
    const currentIP = requestIP.split(',')[0].trim();
    const filterByIP = event.queryStringParameters?.ip === 'current';

    // For now, we'll return a mock entry since we don't have persistent storage
    // In production, you'd fetch from your database
    const mockEntries = [
      {
        text: "Hello from the typing app! This is a sample entry.",
        timestamp: new Date().toISOString(),
        ip: currentIP
      },
      {
        text: "The quick brown fox jumps over the lazy dog.",
        timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        ip: "192.168.1.100"
      }
    ];

    let entry;
    if (filterByIP) {
      // Find latest entry from current IP
      entry = mockEntries
        .filter(e => e.ip === currentIP)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    } else {
      // Get latest entry from all users
      entry = mockEntries
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60' // Cache for 1 minute
      },
      body: JSON.stringify({ 
        entry: entry || null,
        filteredByIP: filterByIP,
        requestIP: currentIP
      })
    };

  } catch (error) {
    console.error('Error fetching latest entry:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};