const { Pool } = require('pg');

exports.handler = async (event, context) => {
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
      message: 'Test function is working!',
      method: event.httpMethod,
      timestamp: new Date().toISOString()
    })
  };
};
