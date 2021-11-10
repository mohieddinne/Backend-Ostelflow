const httphelper = require("../../../helpers/http.helper");
const utilsHelpers = require("../../../helpers/utils.helper");
const {
  API_LANG,
  API_UNIT,
  API_EXCLUDE,
  API_APPID,
} = require("../../../../constants");

module.exports.getWeather = async function () {
  const [[lat, lon], lng, unit, exclude, appid] = [
    await utilsHelpers.getOptions("lat", "lon"),
    "fr",
    "metric",
    "minutely",
    "3c94c505686f7a88351af67e37efccfc",
  ];
  const url = `https://api.openweathermap.org/data/2.5/onecall?lang=${API_LANG}&lat=${lat}&lon=${lon}&units=${API_UNIT}&exclude=${API_EXCLUDE}&appid=${API_APPID}`;
  var data = await httphelper.request(url);
  const res = { ...data, hourly: data?.hourly[0], daily: data?.daily[0] };
  return res;
};
