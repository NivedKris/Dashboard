import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const fetchData = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    // Add all non-empty filters to the request
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });

    const response = await axios.get(`${API_URL}/api/data`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export const fetchFilters = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/filters`);
    return response.data;
  } catch (error) {
    console.error('Error fetching filters:', error);
    throw error;
  }
};

export const fetchIntensityData = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/intensity`);
    return response.data;
  } catch (error) {
    console.error('Error fetching intensity data:', error);
    throw error;
  }
}; 