import React, { useEffect, useState, useRef } from "react";
import L from "leaflet";
import axios from "axios";
import * as turf from "@turf/turf";
import { useParams } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import ShowDeviceDetails from "./ShowDeviceDetails";

const ClusterviewDetails = () => {
  const [pondData, setPondData] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const { id } = useParams();
  const mapRef = useRef(null);

  const WEATHER_API_KEY = "f06c28466bd98b962ed2e94b9fd29598";

  useEffect(() => {
    const fetchPondData = async () => {
      const BASEURL = process.env.REACT_APP_IP;
      try {
        const response = await axios.get(`${BASEURL}/send_location/${id}/`);
        console.log(response);

        setPondData(response.data);

        if (response.data.length > 0 && mapRef.current) {
          const firstPondCoords = response.data[0]?.pond_location[0]?.[0];
          if (firstPondCoords) {
            mapRef.current.setView(firstPondCoords, 12); // Center the map on the first pond
          }

          // Fit the map to all polygons' bounds
          const allCoordinates = response.data.flatMap(
            (pond) => pond.pond_location[0]
          );
          const bounds = L.latLngBounds(allCoordinates);
          mapRef.current.fitBounds(bounds);

          // Fetch weather data for the first pond's location
          const [latitude, longitude] = firstPondCoords;
          fetchWeatherData(latitude, longitude);
        }
      } catch (error) {
        console.error("Error fetching pond data:", error);
      }
    };

    const fetchWeatherData = async (lat, lon) => {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`
        );

        const uniqueForecastDays = [];
        const sixDaysData = response.data.list.filter((day) => {
          const date = new Date(day.dt_txt).getDate();
          if (!uniqueForecastDays.includes(date)) {
            uniqueForecastDays.push(date);
            return true;
          }
          return false;
        });

        setWeatherData(sixDaysData);
        setLoadingWeather(false);
      } catch (error) {
        console.error("Error fetching weather data:", error);
        setLoadingWeather(false);
      }
    };

    fetchPondData();
  }, [id]);

  useEffect(() => {
    if (!mapRef.current) {
      // Initialize the map
      mapRef.current = L.map("map", {
        center: [21.559, 87.065], // Default center
        zoom: 12,
        zoomControl: true,
      });

      // Create tile layers for default and satellite views
      const defaultLayer = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
          subdomains: ["a", "b", "c", "d"],
          maxZoom: 19,
        }
      );

      const satelliteLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "© Esri",
          maxZoom: 19,
        }
      );

      satelliteLayer.addTo(mapRef.current);

      const baseLayers = { Default: defaultLayer, Satellite: satelliteLayer };
      L.control
        .layers(baseLayers, {}, { collapsed: false })
        .addTo(mapRef.current);
    }
  }, []);

  useEffect(() => {
    if (pondData.length > 0 && mapRef.current) {
      const allPolygons = [];

      pondData.forEach((pond) => {
        if (
          Array.isArray(pond.pond_location) &&
          Array.isArray(pond.pond_location[0])
        ) {
          // Convert pond location to GeoJSON polygon
          const polygonCoords = pond.pond_location[0].map(([lat, lng]) => [
            lng,
            lat,
          ]);
          const geoJsonPolygon = turf.polygon([[...polygonCoords]]);

          // Calculate area (in square meters)
          const area = turf.area(geoJsonPolygon);

          // Convert area to acres
          const areaInAcres = (area * 0.000247105).toFixed(2);

          const polygon = L.polygon(pond.pond_location[0], {
            color: "red",
            weight: 2,
            opacity: 0.7,
            fill: true,
            fillOpacity: 0.1,
          })
            .addTo(mapRef.current)
            .bindPopup(
              `<b>${
                pond.name || "Unnamed Pond"
              }</b><br>Area: ${areaInAcres} acres`
            );

          allPolygons.push(polygon);
        }
      });

      const group = L.featureGroup(allPolygons);
      mapRef.current.fitBounds(group.getBounds());

      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 200);
    }
  }, [pondData]);

  const getWeekdayName = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  return (
    <div>
      <div className="relative w-full bg-gray-100 flex flex-col lg:flex-row gap-4 p-4">
        {/* Map container */}
        <div className="flex-[3] border-2 border-gray-300 rounded-lg overflow-hidden">
          <div id="map" className="h-[400px] w-full"></div>
        </div>

        {/* Weather Section */}
        <div className="flex-[1] bg-sky-200 p-6 rounded-lg shadow-md text-gray-800">
          {loadingWeather ? (
            <p>Loading weather data...</p>
          ) : weatherData && weatherData.length > 0 ? (
            <div className="flex flex-col mb-6">
              <div className="flex justify-between">
                <div>
                  <strong className="text-lg">
                    {getWeekdayName(weatherData[0].dt_txt)}
                  </strong>
                  <p>{weatherData[0].dt_txt.split(" ")[0]}</p>
                </div>
                <div className="text-[2rem] font-bold">
                  {(weatherData[0].main.temp - 273.15).toFixed(2)}°C
                </div>
              </div>
              <div className="flex flex-col items-center mt-4">
                <img
                  src={`https://openweathermap.org/img/wn/${weatherData[0].weather[0].icon}@2x.png`}
                  alt="Weather Icon"
                  className="w-28 h-28 "
                />
                <p className="text-lg mt-2 font-bold">
                  {weatherData[0].weather[0].description}
                </p>
              </div>
              <div className="flex justify-between w-full mt-4 font-bold">
                <div className="text-center">
                  <i className="bi bi-water text-2xl"></i>
                  <p className="text-2xl">{weatherData[0].main.humidity}%</p>
                  <p>Humidity</p>
                </div>
                <div className="text-center">
                  <i className="bi bi-wind text-2xl"></i>
                  <p className="text-2xl">
                    {(weatherData[0].wind.speed * 3.6).toFixed(2)} km/h
                  </p>
                  <p>Wind Speed</p>
                </div>
              </div>
            </div>
          ) : (
            <p>No weather data available.</p>
          )}
        </div>
      </div>
      <ShowDeviceDetails />
    </div>
  );
};

export default ClusterviewDetails;
