const axios = require('axios');
const ApiError = require('../../../errors/ApiError');
const { parse } = require('path');

const getAccessToken = async () => {
  const url = 'https://api.usps.com/oauth2/v3/token';
  const data = {
    grant_type: 'client_credentials',
    client_id: 'wLWBGbrhsSsEOIad2wsdTSiDL0Cn99tY',
    client_secret: 'SVAGGQsNdj1EcocL',
    scope: 'addresses',
  };

  try {
    const response = await axios.post(url, new URLSearchParams(data), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const accessToken = response.data.access_token;
    return accessToken;
  } catch (error) {
    console.error('Error getting access token:', error.response?.data || error.message);
    throw new ApiError(500, 'Failed to get access token');
  }
};

const getAddressData = async (data) => {
  const { street_address, city, state } = data;
  if (!street_address || !city || !state) {
    throw new ApiError(400, 'Missing required address data');
  }

  try {
    const validStates = ['AA', 'AE', 'AL', 'AK', 'AP', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL', 'GA', 'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MH', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MP', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PW', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY'];

    if (!validStates.includes(state)) {
      throw new ApiError(400, 'Invalid state code: ' + state);
    }

    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new ApiError(500, 'Unable to get access token');
    }

    const url = `https://api.usps.com/addresses/v3/address?streetAddress=${street_address}&city=${city}&state=${state}`;
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data.address;

  } catch (error) {
    throw new ApiError(
      500,
      'Failed to retrieve address information: ' +
      (error.response?.data?.error?.message === 'Address Not Found.'
        ? 'Street Address Not Found.'
        : error.response?.data?.error?.message)
    );
  }
};
   
// ========================================================  
  

const DHL_API_KEY = 'c9vlaaOpVx8hrNviVSYdiLMYnZ8J4P5t';
const DHL_API_SECRET = 'tUMX1L6VVelckv8Z';
const DHL_API_URL = 'https://api-eu.dhl.com/shipments/v1/rates';

const getBaseRates = async () => {
  try { 
    const encodedAuth = Buffer.from(`${DHL_API_KEY}:${DHL_API_SECRET}`).toString('base64');

    const headers = {
      'DHL-API-Key': DHL_API_KEY,
      'Authorization': `Basic ${encodedAuth}`,
      'Content-Type': 'application/json',
    };
 
    const data = {
      "shipmentDetails": {
        "weight": 2.5,  
        "dimensions": {
          "length": 10,  
          "width": 10,  
          "height": 10  
        },
        "currencyCode": "USD", 
        "pickupDate": "2024-01-01", 
        "unitOfMeasurement": "metric", 
        "shipperAddress": {
          "countryCode": "US", 
          "postalCode": "94105", 
        },
        "recipientAddress": {
          "countryCode": "US", 
          "postalCode": "10001",  
        },
      },
    };
 
    const response = await axios.post(DHL_API_URL, data, { headers });
    return response.data;

  } catch (error) { 
    if (error.response) {
      console.error('Error response:', {
        status: error.response.status,
        data: error.response.data,
      });
    } else {
      console.error('Error:', error.message);
    }
  }
};
 
getBaseRates();




const UsaAddressData = {
  getAddressData,
  getBaseRates
};

module.exports = UsaAddressData;
