const { gql } = require("apollo-server-express");

// Define our schema using the GraphQL schema language
const schema = gql`
  type weatherData {
    lat: Float
    lon: Float
    timezone: String
    timezone_offset: Int
    current: currentWeather
    daily: dailyWeather
    hourly: hourlyWeather
  }
  type currentWeather {
    dt: Int
    sunrise: Int
    sunset: Int
    temp: Float
    feels_like: Float
    pressure: Int
    humidity: Int
    dew_point: Float
    uvi: Float
    clouds: Int
    visibility: Int
    wind_speed: Float
    wind_deg: Int
    weather: [Weather]
  }
  type dailyWeather {
    dt: Int
    sunrise: Int
    sunset: Int
    moonrise: Int
    moonset: Int
    moon_phase: Float
    pressure: Int
    humidity: Int
    dew_point: Float
    wind_speed: Float
    wind_deg: Int
    wind_gust: Float
    clouds: Int
    pop: Float
    uvi: Float
    temp: Temp
    feelsLike: feelsLike
    weather: [Weather]
  }
  type hourlyWeather {
    dt: Int
    temp: Float
    feels_like: Float
    pressure: Int
    humidity: Int
    dew_point: Float
    uvi: Float
    clouds: Int
    visibility: Int
    wind_speed: Float
    wind_deg: Int
    wind_gust: Float
    weather: [Weather]
    pop: Float
  }
  type Temp {
    day: Float
    min: Float
    max: Float
    night: Float
    eve: Float
    morn: Float
  }
  type feelsLike {
    day: Float
    night: Float
    eve: Float
    morn: Float
  }
  type Weather {
    id: Int
    main: String
    description: String
    icon: String
  }
  extend type Query {
    getWeather: weatherData @hasAccess(slug: "weather_widget", scope: "view")
  }
`;

module.exports = schema;
