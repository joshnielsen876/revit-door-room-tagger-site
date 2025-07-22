const { Pool } = require('pg');

exports.handler = async (event, context) => {
  // Handle OPTIONS requests for CORS preflight
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

  // Handle POST requests
  if (event.httpMethod === 'POST') {
    try {
      // Parse the JSON body
      const data = JSON.parse(event.body);
      
      // Extract the calculator data
      const {
        rooms,
        tagsPerRoom,
        taggingRate,
        revisionHours,
        revisionCount,
        hourlyRate,
        sessionId,
        // Calculated results
        initialCost,
        revisionCost,
        totalCost,
        totalHours,
        automationHours,
        timeSaved,
        potentialSavings,
        savingsPercentage,
        errorCount,
        errorCost
      } = data;

      // Validate required fields
      if (!rooms || !tagsPerRoom || !taggingRate || !revisionHours || !revisionCount || !hourlyRate) {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'POST, OPTIONS'
          },
          body: JSON.stringify({ 
            error: 'Missing required fields',
            required: ['rooms', 'tagsPerRoom', 'taggingRate', 'revisionHours', 'revisionCount', 'hourlyRate']
          })
        };
      }

      // Get database connection from environment variable
      const databaseUrl = process.env.NETLIFY_DATABASE_URL;
      if (!databaseUrl) {
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'POST, OPTIONS'
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

      // Insert data into calculator_logs table
      const query = `
        INSERT INTO calculator_logs (
          rooms,
          tags_per_room,
          tagging_rate,
          revision_hours,
          revision_count,
          hourly_rate,
          session_id,
          initial_cost,
          revision_cost,
          total_cost,
          total_hours,
          automation_hours,
          time_saved,
          potential_savings,
          savings_percentage,
          error_count,
          error_cost,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW())
        RETURNING id
      `;

      const values = [
        parseInt(rooms),
        parseFloat(tagsPerRoom),
        parseFloat(taggingRate),
        parseFloat(revisionHours),
        parseInt(revisionCount),
        parseFloat(hourlyRate),
        sessionId || null,
        parseFloat(initialCost) || 0,
        parseFloat(revisionCost) || 0,
        parseFloat(totalCost) || 0,
        parseFloat(totalHours) || 0,
        parseFloat(automationHours) || 0,
        parseFloat(timeSaved) || 0,
        parseFloat(potentialSavings) || 0,
        parseInt(savingsPercentage) || 0,
        parseInt(errorCount) || 0,
        parseFloat(errorCost) || 0
      ];

      const result = await pool.query(query, values);
      
      // Close the database connection
      await pool.end();

      // Return success response
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({
          success: true,
          message: 'Calculator data logged successfully',
          id: result.rows[0].id
        })
      };

    } catch (error) {
      console.error('Error logging calculator data:', error);
      
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({
          error: 'Internal server error',
          message: error.message
        })
      };
    }
  }

  // Handle other methods
  return {
    statusCode: 405,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    },
    body: JSON.stringify({
      error: 'Method not allowed',
      allowedMethods: ['POST', 'OPTIONS']
    })
  };
};
