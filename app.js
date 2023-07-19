const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: 'http://localhost:8080'
}
));
// Return current weather details for 5 random cities
app.get('/current-weather/:apiid', async (req, res) => {
  const apiKey = req.params.apiid;
  try {
    const cityIds = [2759794, 2657896, 2800866, 2988507, 3067696]; // IDs of specific cities
    const weatherData = await getCurrentWeatherForCities(cityIds, apiKey);
    const currentWeather = weatherData.map(item => {
      const city = {
        id: item.id,
        name: item.name,
        country: item.sys.country
      };
      const temperature = item.main.temp;
      const condition = item.weather[0].description;
      return { city, weather: { temperature, condition } };
    });
    res.json(currentWeather);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch current weather' });
  }
});

// Helper function to fetch current weather for specific cities from OpenWeather API
async function getCurrentWeatherForCities(cityIds, apiKey) {
  try {
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/group?id=${cityIds.join(',')}&units=metric&appid=${apiKey}`);
    return response.data.list;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to fetch current weather');
  }
}

// Return weather forecast for a selected city
app.get('/forecast/:id/:apiid', async (req, res) => {
  const apiKey = req.params.apiid;
  const cityId = req.params.id;
  try {
    const city = await getCityById(cityId, apiKey);
    const forecast = await getWeatherForecast(cityId, apiKey);
    const weatherForecast = forecast.list.slice(0, 10).map(item => {
      const hour = new Date(item.dt * 1000).getHours();
      const temperature = item.main.temp;
      const condition = item.weather[0].description;
      const windspeed = item.wind.speed;
      const date = item.dt;
      return { hour, temperature, condition, windspeed, date };
    });
    res.json({ city, forecast: weatherForecast });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch weather forecast' });
  }
});

// Helper function to fetch city by ID from OpenWeather API
async function getCityById(cityId, apiKey) {
  try {
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?id=${cityId}&appid=${apiKey}`);
    const { id, name } = response.data;
    return { id, name };
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to fetch city');
  }
}

// Helper function to fetch weather forecast for a city from OpenWeather API
async function getWeatherForecast(cityId, apiKey) {
  try {
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?id=${cityId}&appid=${apiKey}&units=metric`);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to fetch weather forecast');
  }
}

// Start the server
const port = 8080;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
