exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    // Handle CORS preflight requests
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
        // Parse the request body
        const data = JSON.parse(event.body);
        
        // Extract information from the request
        const timestamp = data.timestamp || new Date().toISOString();
        const logEntry = {
            timestamp: timestamp,
            userAgent: data.userAgent || 'unknown',
            ip: data.ip || 'unknown',
            version: data.version || 'unknown',
            // Add additional context from Netlify
            netlifyId: context.clientContext?.identity?.user?.id || 'anonymous',
            referer: event.headers.referer || 'unknown',
            country: event.headers['x-country-code'] || 'unknown'
        };

        // Log to console for debugging
        console.log('EULA Agreement Logged:', JSON.stringify(logEntry, null, 2));

        // Save to Airtable
        try {
            const airtableResponse = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_NAME}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fields: {
                        'Timestamp': new Date(logEntry.timestamp).toISOString(),
                        'IP Address': logEntry.ip,
                        'User Agent': logEntry.userAgent,
                        'Country': logEntry.country,
                        'Version': logEntry.version,
                        'Referer': logEntry.referer,
                        'Netlify ID': logEntry.netlifyId
                    }
                })
            });

            if (airtableResponse.ok) {
                console.log('Successfully saved to Airtable');
            } else {
                console.error('Failed to save to Airtable:', await airtableResponse.text());
            }
        } catch (airtableError) {
            console.error('Airtable error:', airtableError);
        }
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                success: true, 
                message: 'EULA agreement logged successfully',
                timestamp: logEntry.timestamp
            })
        };

    } catch (error) {
        console.error('Error logging EULA agreement:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                error: 'Failed to log EULA agreement',
                details: error.message 
            })
        };
    }
};
