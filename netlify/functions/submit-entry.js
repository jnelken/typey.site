exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
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
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    const { text } = JSON.parse(event.body);
    
    if (!text || text.trim().length === 0) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Text is required' })
      };
    }

    // Get IP address
    const ip = event.headers['x-forwarded-for'] || 
               event.headers['x-real-ip'] || 
               context.clientContext?.ip || 
               'unknown';

    // Create entry object
    const entry = {
      text: text.trim(),
      timestamp: new Date().toISOString(),
      ip: ip.split(',')[0].trim() // Take first IP if multiple
    };

    // For now, we'll use environment variables to store a simple list
    // In production, you'd want to use a proper database
    const entries = JSON.parse(process.env.ENTRIES || '[]');
    entries.push(entry);
    
    // Keep only the last 100 entries to prevent unbounded growth
    if (entries.length > 100) {
      entries.splice(0, entries.length - 100);
    }

    // Store back (this won't persist across function invocations in practice)
    // You'd need a proper database like FaunaDB, Supabase, or similar
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        success: true, 
        entry: entry
      })
    };

  } catch (error) {
    console.error('Error processing entry:', error);
    
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