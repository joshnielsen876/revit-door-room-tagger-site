const { Pool } = require('pg');

exports.handler = async (event, context) => {
  // Handle OPTIONS requests for CORS preflight
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

  try {
    // Get database connection from environment variable
    const databaseUrl = process.env.NETLIFY_DATABASE_URL;
    if (!databaseUrl) {
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, OPTIONS'
        },
        body: JSON.stringify({ error: 'Database connection not configured' })
      };
    }

    // Create database connection pool
    const pool = new Pool({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false
      }
    });

    // Get analytics data
    const analytics = await getAnalytics(pool);
    
    // Close the database connection
    await pool.end();

    // Return analytics data
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify(analytics)
    };

  } catch (error) {
    console.error('Error fetching analytics:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};

async function getAnalytics(pool) {
  // Get all data
  const allData = await pool.query('SELECT * FROM calculator_logs ORDER BY created_at DESC');
  
  // Get session profiles
  const sessionProfiles = await getSessionProfiles(pool);
  
  // Get overall trends
  const trends = await getOverallTrends(pool);
  
  // Get recent activity
  const recentActivity = await getRecentActivity(pool);
  
  return {
    totalRecords: allData.rows.length,
    sessionProfiles,
    trends,
    recentActivity,
    allData: allData.rows
  };
}

async function getSessionProfiles(pool) {
  const result = await pool.query(`
    SELECT 
      session_id,
      COUNT(*) as interactions,
      MIN(created_at) as first_interaction,
      MAX(created_at) as last_interaction,
      AVG(rooms) as avg_rooms,
      AVG(tags_per_room) as avg_tags_per_room,
      AVG(tagging_rate) as avg_tagging_rate,
      AVG(hourly_rate) as avg_hourly_rate,
      AVG(total_cost) as avg_total_cost,
      AVG(potential_savings) as avg_potential_savings,
      AVG(savings_percentage) as avg_savings_percentage
    FROM calculator_logs 
    WHERE session_id IS NOT NULL
    GROUP BY session_id 
    ORDER BY last_interaction DESC
  `);
  
  return result.rows;
}

async function getOverallTrends(pool) {
  // Average values across all sessions
  const averages = await pool.query(`
    SELECT 
      AVG(rooms) as avg_rooms,
      AVG(tags_per_room) as avg_tags_per_room,
      AVG(tagging_rate) as avg_tagging_rate,
      AVG(hourly_rate) as avg_hourly_rate,
      AVG(total_cost) as avg_total_cost,
      AVG(potential_savings) as avg_potential_savings,
      AVG(savings_percentage) as avg_savings_percentage,
      AVG(error_cost) as avg_error_cost
    FROM calculator_logs
  `);
  
  // Most common values
  const mostCommon = await pool.query(`
    SELECT 
      MODE() WITHIN GROUP (ORDER BY rooms) as most_common_rooms,
      MODE() WITHIN GROUP (ORDER BY tags_per_room) as most_common_tags_per_room,
      MODE() WITHIN GROUP (ORDER BY hourly_rate) as most_common_hourly_rate
    FROM calculator_logs
  `);
  
  // Value ranges
  const ranges = await pool.query(`
    SELECT 
      MIN(rooms) as min_rooms, MAX(rooms) as max_rooms,
      MIN(tags_per_room) as min_tags_per_room, MAX(tags_per_room) as max_tags_per_room,
      MIN(hourly_rate) as min_hourly_rate, MAX(hourly_rate) as max_hourly_rate,
      MIN(total_cost) as min_total_cost, MAX(total_cost) as max_total_cost,
      MIN(potential_savings) as min_potential_savings, MAX(potential_savings) as max_potential_savings
    FROM calculator_logs
  `);
  
  return {
    averages: averages.rows[0],
    mostCommon: mostCommon.rows[0],
    ranges: ranges.rows[0]
  };
}

async function getRecentActivity(pool) {
  const result = await pool.query(`
    SELECT 
      session_id,
      rooms,
      tags_per_room,
      total_cost,
      potential_savings,
      created_at
    FROM calculator_logs 
    ORDER BY created_at DESC 
    LIMIT 20
  `);
  
  return result.rows;
} 