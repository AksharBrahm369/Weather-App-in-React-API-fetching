import React, { useEffect, useRef, useState } from 'react';
import './Weather.css';
import search_icon from '../assets/search.png';
import clear_icon from '../assets/clear.png';
import cloud_icon from '../assets/cloud.png';
import drizzle_icon from '../assets/drizzle.png';
import rain_icon from '../assets/rain.png';
import wind_icon from '../assets/wind.png';
import humidity_icon from '../assets/humidity.png';
import snow_icon from '../assets/snow.png';

const Weather = () => {
  const inputRef = useRef();
  const [weatherData, setWeatherData] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);

  const allIcons = {
    "01d": clear_icon,
    "01n": clear_icon,
    "02d": cloud_icon,
    "02n": cloud_icon,
    "03d": cloud_icon,
    "03n": cloud_icon,
    "04d": drizzle_icon,
    "04n": drizzle_icon,
    "09d": rain_icon,
    "09n": rain_icon,
    "10d": rain_icon,
    "10n": rain_icon,
    "13d": snow_icon,
    "13n": snow_icon,
  };

  const search = async (city) => {
    if (!city) {
      alert("Please enter a city name");
      return;
    }
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${import.meta.env.VITE_API_ID}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.cod !== 200) {
        alert("City not found!");
        return;
      }

      const icon = allIcons[data.weather[0].icon] || clear_icon;

      setWeatherData({
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        temperature: Math.floor(data.main.temp),
        location: data.name,
        icon: icon,
        condition: data.weather[0].main,
      });

      // ✅ Save search history
      setRecentSearches((prev) => {
        const updated = [
          city,
          ...prev.filter((c) => c.toLowerCase() !== city.toLowerCase()),
        ].slice(0, 5);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
        return updated;
      });

      inputRef.current.value = '';
    } catch (error) {
      console.error("Error fetching weather:", error);
    }
  };

  // Load saved searches on mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('recentSearches')) || [];
    setRecentSearches(saved);
    search(saved[0] || "New York");
  }, []);

  const removeSearch = (city) => {
    const updated = recentSearches.filter((c) => c !== city);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const bgClass = weatherData?.condition
    ? weatherData.condition.toLowerCase()
    : '';

  return (
    <div className={`weather ${bgClass}`}>
      <div className="search-bar">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search city..."
        />
        <img
          src={search_icon}
          alt="search"
          onClick={() => search(inputRef.current.value)}
        />

        {/* 🔽 Dropdown (hidden until hover) */}
        {recentSearches.length > 0 && (
          <div className="dropdown-wrapper">
            <div className="dropdown">
              {recentSearches.map((city, index) => (
                <div key={index} className="dropdown-item">
                  <span onClick={() => search(city)}>{city}</span>
                  <button
                    className="remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSearch(city);
                    }}
                  >
                    ❌
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {!weatherData ? (
        <p className="loading">Loading...</p>
      ) : (
        <>
          <img src={weatherData.icon} className="weather-icon" alt="weather" />
          <p className="temperature">{weatherData.temperature}°C</p>
          <p className="location">{weatherData.location}</p>

          <div className="weather-data">
            <div className="col">
              <img src={humidity_icon} alt="humidity" />
              <div>
                <p>{weatherData.humidity}%</p>
                <span>Humidity</span>
              </div>
            </div>

            <div className="col">
              <img src={wind_icon} alt="wind speed" />
              <div>
                <p>{weatherData.windSpeed} km/h</p>
                <span>Wind Speed</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Weather;
