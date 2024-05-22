const allowedOrigins = [
  'http://www.pfgeomatics.com',
  'http://localhost:3000'
];

exports.handler = async (event) => {
  // Dynamically import node-fetch
  const fetch = (await import('node-fetch')).default;

  const { postcodes } = JSON.parse(event.body);

  const mapboxToken = process.env.MAPBOX_API_KEY;
  if (!mapboxToken) {
    console.error('MAPBOX_API_KEY is not set');
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ error: 'Internal server error: MAPBOX_API_KEY is not set' })
    };
  }

  const geocodePromises = postcodes.map(postcode =>
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${postcode}.json?access_token=${mapboxToken}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch geocode for ${postcode}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.features.length === 0) {
          throw new Error(`No results for postcode ${postcode}`);
        }
        return {
          postcode,
          latitude: data.features[0].center[1],
          longitude: data.features[0].center[0]
        };
      })
  );

  try {
    const coordinates = await Promise.all(geocodePromises);

    const origin = event.headers.origin || event.headers.Origin;
    const allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': allowOrigin,
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify(coordinates)
    };
  } catch (error) {
    console.error('Error fetching coordinates:', error);

    const origin = event.headers.origin || event.headers.Origin;
    const allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': allowOrigin,
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ error: 'Internal server error: ' + (error.message || 'Unknown error') })
    };
  }
};
