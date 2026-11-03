// NutriAgro Feeds — Google-Grade Real-Time Weather Widget
// Features 100% Precise Auto-Geolocation, Hourly SVG Curve & 7-Day Forecast



// Interpret WMO weather codes to Google Weather icons & descriptions
function getGwWeatherMeta(code, isNight = false) {
  // 0: Clear sky
  if (code === 0) {
    return {
      desc: isNight ? 'Clear' : 'Sunny',
      iconSvg: isNight
        ? `<svg viewBox="0 0 64 64" width="100%" height="100%"><path d="M38 14 A16 16 0 1 0 52 38 A17 17 0 0 1 38 14 Z" fill="#8ab4f8"/><circle cx="44" cy="18" r="1.5" fill="#e8eaed"/><circle cx="50" cy="28" r="1" fill="#e8eaed"/></svg>`
        : `<svg viewBox="0 0 64 64" width="100%" height="100%"><circle cx="32" cy="32" r="13" fill="#fbbc04"/><g stroke="#fbbc04" stroke-width="3" stroke-linecap="round"><line x1="32" y1="7" x2="32" y2="13"/><line x1="32" y1="51" x2="32" y2="57"/><line x1="7" y1="32" x2="13" y2="32"/><line x1="51" y1="32" x2="57" y2="32"/><line x1="14.5" y1="14.5" x2="18.5" y2="18.5"/><line x1="45.5" y1="45.5" x2="49.5" y2="49.5"/><line x1="14.5" y1="49.5" x2="18.5" y2="45.5"/><line x1="45.5" y1="18.5" x2="49.5" y2="14.5"/></g></svg>`
    };
  }

  // 1: Mainly clear / Mostly sunny
  if (code === 1) {
    return {
      desc: isNight ? 'Mostly clear' : 'Mostly sunny',
      iconSvg: isNight
        ? `<svg viewBox="0 0 64 64" width="100%" height="100%"><path d="M32 14 A14 14 0 1 0 44 34 A15 15 0 0 1 32 14 Z" fill="#8ab4f8"/><path d="M28 48 h18 a8 8 0 0 0 0-16 a10 10 0 0 0-18-2 a7 7 0 0 0 0 18 z" fill="#f1f5f9"/></svg>`
        : `<svg viewBox="0 0 64 64" width="100%" height="100%"><circle cx="28" cy="24" r="12" fill="#fbbc04"/><g stroke="#fbbc04" stroke-width="2.5" stroke-linecap="round"><line x1="28" y1="6" x2="28" y2="9"/><line x1="12" y1="24" x2="15" y2="24"/><line x1="41" y1="24" x2="44" y2="24"/><line x1="16" y1="12" x2="19" y2="15"/><line x1="37" y1="12" x2="40" y2="15"/></g><path d="M26 48 h22 a8 8 0 0 0 0-16 a11 11 0 0 0-19-3 a7 7 0 0 0-3 19 z" fill="#f1f5f9"/></svg>`
    };
  }

  // 2: Partly cloudy
  if (code === 2) {
    return {
      desc: 'Partly cloudy',
      iconSvg: isNight
        ? `<svg viewBox="0 0 64 64" width="100%" height="100%"><path d="M28 14 A13 13 0 1 0 38 32 A14 14 0 0 1 28 14 Z" fill="#8ab4f8"/><path d="M22 50 h24 a9 9 0 0 0 0-18 a12 12 0 0 0-21-3 a8 8 0 0 0-3 21 z" fill="#e2e8f0"/></svg>`
        : `<svg viewBox="0 0 64 64" width="100%" height="100%"><circle cx="26" cy="24" r="12" fill="#fbbc04"/><path d="M22 50 h24 a9 9 0 0 0 0-18 a12 12 0 0 0-21-3 a8 8 0 0 0-3 21 z" fill="#f1f5f9"/></svg>`
    };
  }

  // 3: Overcast
  if (code === 3) {
    return {
      desc: 'Overcast',
      iconSvg: `<svg viewBox="0 0 64 64" width="100%" height="100%"><path d="M22 36 h26 a10 10 0 0 0 0-20 a13 13 0 0 0-23-3 a9 9 0 0 0-3 23 z" fill="#94a3b8"/><path d="M16 48 h26 a10 10 0 0 0 0-20 a13 13 0 0 0-23-3 a9 9 0 0 0-3 23 z" fill="#f1f5f9"/></svg>`
    };
  }

  // 45, 48: Fog / Depositing rime fog
  if (code === 45 || code === 48) {
    return {
      desc: code === 48 ? 'Depositing rime fog' : 'Fog',
      iconSvg: `<svg viewBox="0 0 64 64" width="100%" height="100%"><path d="M18 36 h28 a9 9 0 0 0 0-18 a12 12 0 0 0-21-3 a8 8 0 0 0-7 21 z" fill="#cbd5e1"/><g stroke="#94a3b8" stroke-width="2.8" stroke-linecap="round"><line x1="16" y1="44" x2="48" y2="44"/><line x1="20" y1="50" x2="44" y2="50"/><line x1="24" y1="56" x2="40" y2="56"/></g></svg>`
    };
  }

  // 51, 53, 55: Drizzle (Light, Moderate, Dense)
  if (code === 51 || code === 53 || code === 55) {
    const intensity = code === 51 ? 'Light drizzle' : code === 55 ? 'Dense drizzle' : 'Drizzle';
    return {
      desc: intensity,
      iconSvg: `<svg viewBox="0 0 64 64" width="100%" height="100%"><path d="M18 38 h28 a9 9 0 0 0 0-18 a12 12 0 0 0-21-3 a8 8 0 0 0-7 21 z" fill="#cbd5e1"/><g stroke="#60a5fa" stroke-width="2.2" stroke-linecap="round"><line x1="24" y1="44" x2="22" y2="50"/><line x1="33" y1="44" x2="31" y2="50"/><line x1="42" y1="44" x2="40" y2="50"/></g></svg>`
    };
  }

  // 56, 57, 66, 67: Freezing Drizzle / Freezing Rain
  if (code === 56 || code === 57 || code === 66 || code === 67) {
    const isFreezingRain = code >= 66;
    return {
      desc: isFreezingRain ? 'Freezing rain' : 'Freezing drizzle',
      iconSvg: `<svg viewBox="0 0 64 64" width="100%" height="100%"><path d="M18 38 h28 a9 9 0 0 0 0-18 a12 12 0 0 0-21-3 a8 8 0 0 0-7 21 z" fill="#94a3b8"/><g stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round"><line x1="24" y1="44" x2="21" y2="52"/><line x1="34" y1="44" x2="31" y2="52"/><line x1="44" y1="44" x2="41" y2="52"/></g><circle cx="21" cy="56" r="1.5" fill="#a5f3fc"/><circle cx="31" cy="56" r="1.5" fill="#a5f3fc"/><circle cx="41" cy="56" r="1.5" fill="#a5f3fc"/></svg>`
    };
  }

  // 61, 63, 65: Rain (Slight, Moderate, Heavy)
  if (code === 61 || code === 63 || code === 65) {
    const desc = code === 61 ? 'Light rain' : code === 65 ? 'Heavy rain' : 'Rain';
    const cloudColor = code === 65 ? '#475569' : '#64748b';
    return {
      desc: desc,
      iconSvg: `<svg viewBox="0 0 64 64" width="100%" height="100%"><path d="M18 38 h28 a10 10 0 0 0 0-20 a13 13 0 0 0-23-3 a9 9 0 0 0-5 23 z" fill="${cloudColor}"/><g stroke="#3b82f6" stroke-width="${code === 65 ? '3' : '2.5'}" stroke-linecap="round"><line x1="21" y1="44" x2="17" y2="54"/><line x1="29" y1="44" x2="25" y2="54"/><line x1="37" y1="44" x2="33" y2="54"/><line x1="45" y1="44" x2="41" y2="54"/></g></svg>`
    };
  }

  // 71, 73, 75, 77: Snow Fall & Snow Grains
  if (code === 71 || code === 73 || code === 75 || code === 77) {
    const desc = code === 71 ? 'Light snow' : code === 75 ? 'Heavy snow' : code === 77 ? 'Snow grains' : 'Snow';
    return {
      desc: desc,
      iconSvg: `<svg viewBox="0 0 64 64" width="100%" height="100%"><path d="M18 38 h28 a9 9 0 0 0 0-18 a12 12 0 0 0-21-3 a8 8 0 0 0-7 21 z" fill="#cbd5e1"/><g stroke="#93c5fd" stroke-width="2" stroke-linecap="round"><line x1="24" y1="45" x2="24" y2="53"/><line x1="20" y1="49" x2="28" y2="49"/><line x1="36" y1="45" x2="36" y2="53"/><line x1="32" y1="49" x2="40" y2="49"/></g><circle cx="24" cy="49" r="1" fill="#fff"/><circle cx="36" cy="49" r="1" fill="#fff"/></svg>`
    };
  }

  // 80, 81, 82: Rain Showers (Slight, Moderate, Violent)
  if (code >= 80 && code <= 82) {
    const desc = code === 80 ? 'Scattered showers' : code === 82 ? 'Heavy showers' : 'Rain showers';
    return {
      desc: desc,
      iconSvg: isNight
        ? `<svg viewBox="0 0 64 64" width="100%" height="100%"><path d="M28 14 A12 12 0 1 0 38 30 A13 13 0 0 1 28 14 Z" fill="#8ab4f8"/><path d="M18 42 h26 a9 9 0 0 0 0-18 a12 12 0 0 0-21-3 a8 8 0 0 0-5 21 z" fill="#64748b"/><g stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round"><line x1="22" y1="47" x2="18" y2="56"/><line x1="31" y1="47" x2="27" y2="56"/><line x1="40" y1="47" x2="36" y2="56"/></g></svg>`
        : `<svg viewBox="0 0 64 64" width="100%" height="100%"><circle cx="25" cy="22" r="11" fill="#fbbc04"/><path d="M18 42 h26 a9 9 0 0 0 0-18 a12 12 0 0 0-21-3 a8 8 0 0 0-5 21 z" fill="#64748b"/><g stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round"><line x1="22" y1="47" x2="18" y2="56"/><line x1="31" y1="47" x2="27" y2="56"/><line x1="40" y1="47" x2="36" y2="56"/></g></svg>`
    };
  }

  // 85, 86: Snow Showers
  if (code === 85 || code === 86) {
    return {
      desc: code === 86 ? 'Heavy snow showers' : 'Snow showers',
      iconSvg: `<svg viewBox="0 0 64 64" width="100%" height="100%"><circle cx="25" cy="22" r="11" fill="#fbbc04"/><path d="M18 42 h26 a9 9 0 0 0 0-18 a12 12 0 0 0-21-3 a8 8 0 0 0-5 21 z" fill="#cbd5e1"/><g stroke="#93c5fd" stroke-width="2" stroke-linecap="round"><line x1="24" y1="47" x2="24" y2="54"/><line x1="20.5" y1="50.5" x2="27.5" y2="50.5"/><line x1="36" y1="47" x2="36" y2="54"/><line x1="32.5" y1="50.5" x2="39.5" y2="50.5"/></g></svg>`
    };
  }

  // 95, 96, 99: Thunderstorms
  if (code >= 95) {
    const isHail = code === 96 || code === 99;
    const desc = code === 99 ? 'Heavy thunderstorm' : code === 96 ? 'Thunderstorm with hail' : 'Thunderstorm';
    return {
      desc: desc,
      iconSvg: `<svg viewBox="0 0 64 64" width="100%" height="100%"><path d="M18 36 h26 a10 10 0 0 0 0-20 a13 13 0 0 0-23-3 a9 9 0 0 0-3 23 z" fill="#334155"/><polygon points="30,36 24,46 31,46 27,58 39,44 32,44" fill="#fbbf24"/>${isHail ? '<g stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round"><line x1="20" y1="44" x2="17" y2="52"/><line x1="42" y1="44" x2="39" y2="52"/></g>' : ''}</svg>`
    };
  }

  // Fallback
  return {
    desc: isNight ? 'Clear' : 'Fair',
    iconSvg: isNight
      ? `<svg viewBox="0 0 64 64" width="100%" height="100%"><path d="M38 14 A16 16 0 1 0 52 38 A17 17 0 0 1 38 14 Z" fill="#8ab4f8"/></svg>`
      : `<svg viewBox="0 0 64 64" width="100%" height="100%"><circle cx="32" cy="32" r="14" fill="#fbbc04"/></svg>`
  };
}

// Convert Celsius to Fahrenheit
function toUnit(celsius) {
  if (currentWeatherUnit === 'F') {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

// Format Day of Week and Time string (e.g. "Sunday, 5:00 am")
function formatGoogleDateTime() {
  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
  return `${dayName}, ${timeStr}`;
}

// Default to user's verified location: TNHB, Sholinganallur, Chennai
let currentCoords = {
  lat: 12.88996,
  lon: 80.23127,
  name: 'Zone 15 Sholinganallur, Chennai'
};

let currentWeatherUnit = 'C'; // 'C' or 'F'
let activeGwTab = 'temp';     // 'temp', 'precip', 'wind'
let cachedWeatherData = null;
let selectedDayIdx = 0;       // 0 = Today (default), 1 = Next day, etc. (7-day forecast)

// Calculate NRC Livestock Temperature-Humidity Index (THI)
function computeTHI(tempC, rh) {
  return Math.round((1.8 * tempC + 32) - (0.55 - 0.0055 * rh) * (1.8 * tempC - 26));
}

// Fetch Full Google-Grade Weather Forecast from Open-Meteo (Today + Next 6 days = 7 days)
async function fetchGoogleWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch Open-Meteo forecast');
  return await res.json();
}

// Auto-Detect Exact Customer Location (GPS + IP fallback)
async function autoDetectCustomerLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        try {
          const revUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
          const revRes = await fetch(revUrl, { headers: { 'Accept': 'application/json' } });
          const revData = await revRes.json();
          const addr = revData.address || {};
          const localPart = addr.suburb || addr.neighbourhood || addr.road || addr.county || 'Local Area';
          const cityPart = addr.city || addr.town || addr.state_district || 'City';
          const fullLabel = `${localPart}, ${cityPart}`;

          currentCoords = { lat, lon, name: fullLabel };
          loadAndRenderGoogleWeather();
        } catch (e) {
          currentCoords = { lat, lon, name: 'Detected Location' };
          loadAndRenderGoogleWeather();
        }
      },
      async () => {
        await detectLocationViaIP();
      },
      { timeout: 7000 }
    );
  } else {
    await detectLocationViaIP();
  }
}

async function detectLocationViaIP() {
  try {
    const ipRes = await fetch('https://ipwho.is/');
    const ipData = await ipRes.json();
    if (ipData && ipData.success !== false && ipData.latitude) {
      currentCoords = {
        lat: ipData.latitude,
        lon: ipData.longitude,
        name: `${ipData.city || 'Local Area'}, ${ipData.region || 'State'}`
      };
      loadAndRenderGoogleWeather();
      return;
    }
  } catch (e) { }

  // Default confirmed location: Sholinganallur, Chennai
  loadAndRenderGoogleWeather();
}

// Load and Render the Google Weather Card
async function loadAndRenderGoogleWeather() {
  try {
    const data = await fetchGoogleWeather(currentCoords.lat, currentCoords.lon);
    cachedWeatherData = data;
    renderGoogleWeatherUI(data);
  } catch (err) {
    console.warn('Weather fetch fallback:', err);
  }
}

function renderGoogleWeatherUI(data) {
  if (!data || !data.daily) return;
  // 1. Render daily horizontal strip first (passing daily and current)
  renderDailyStrip(data.daily, data.current);
  // 2. Render selected day (defaults to Today, dayIdx = 0)
  renderSelectedDayWeather(selectedDayIdx);
}

// Render Weather for whichever day is clicked (0 = Today, 1..6 = Upcoming days)
function renderSelectedDayWeather(dayIdx) {
  if (!cachedWeatherData || !cachedWeatherData.daily) return;
  const data = cachedWeatherData;
  const daily = data.daily;
  const hourly = data.hourly;
  const current = data.current;

  selectedDayIdx = dayIdx;

  // 1. Header Location Title
  const locTitle = document.getElementById('gwLocationTitle');
  if (locTitle) locTitle.textContent = currentCoords.name;

  const dateObj = new Date(daily.time[dayIdx] + 'T00:00:00');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dateStr = `${monthNames[dateObj.getMonth()]} ${dateObj.getDate()}`;
  const fullDayName = fullDayNames[dateObj.getDay()];

  // 2. Current vs Selected Day Conditions
  const isToday = dayIdx === 0;

  const rawMaxC = daily.temperature_2m_max[dayIdx] || 33;
  const rawMinC = daily.temperature_2m_min[dayIdx] || 27;
  const maxT = toUnit(rawMaxC);
  const minT = toUnit(rawMinC);

  // For Today: prioritize current.weather_code so the main condition matches live right now
  const code = isToday 
    ? (current && current.weather_code !== undefined ? current.weather_code : daily.weather_code[0]) 
    : daily.weather_code[dayIdx];

  const nowHours = new Date().getHours();
  const isNight = isToday && (nowHours < 6 || nowHours >= 18);
  const meta = getGwWeatherMeta(code, isNight);

  // Main Temperature Value & Range Tag
  const tempValEl = document.getElementById('gwCurrentTemp');
  const rangeTag = document.getElementById('gwTempRangeTag');
  if (isToday) {
    if (tempValEl) tempValEl.textContent = toUnit(current.temperature_2m);
    if (rangeTag) {
      rangeTag.style.display = 'inline-block';
      rangeTag.textContent = `High: ${maxT}° • Low: ${minT}°`;
    }
  } else {
    // Show forecast peak temperature for that day
    if (tempValEl) tempValEl.textContent = maxT;
    if (rangeTag) {
      rangeTag.style.display = 'inline-block';
      rangeTag.textContent = `High: ${maxT}° • Low: ${minT}°`;
    }
  }

  // Condition Icon
  const iconEl = document.getElementById('gwConditionIcon');
  if (iconEl) iconEl.innerHTML = meta.iconSvg;

  // Date/Time String
  const dateTimeEl = document.getElementById('gwDateTimeStr');
  if (dateTimeEl) {
    if (isToday) {
      dateTimeEl.textContent = formatGoogleDateTime();
    } else {
      dateTimeEl.textContent = `${fullDayName}, ${dateStr} (Forecast)`;
    }
  }

  // Condition Description
  const condDescEl = document.getElementById('gwConditionDesc');
  if (condDescEl) condDescEl.textContent = meta.desc;

  // Precipitation
  const precipProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[dayIdx] : (daily.precipitation_sum ? Math.round(daily.precipitation_sum[dayIdx] * 10) : 4);
  const precipSum = daily.precipitation_sum ? daily.precipitation_sum[dayIdx] : 0;
  const precipEl = document.getElementById('gwPrecipVal');
  if (precipEl) {
    if (isToday) {
      precipEl.textContent = `${precipProb || 4}%`;
    } else {
      precipEl.textContent = `${precipProb}% ${precipSum > 0 ? '(' + precipSum + 'mm)' : ''}`;
    }
  }

  // Humidity (Average of that day's 24 hours if not Today)
  let dayHumidity = 80;
  if (isToday) {
    dayHumidity = Math.round(current.relative_humidity_2m);
  } else if (hourly.relative_humidity_2m) {
    const dayStart = dayIdx * 24;
    const daySlice = hourly.relative_humidity_2m.slice(dayStart, dayStart + 24);
    if (daySlice.length > 0) {
      const sum = daySlice.reduce((a, b) => a + b, 0);
      dayHumidity = Math.round(sum / daySlice.length);
    }
  }
  const humEl = document.getElementById('gwHumidityVal');
  if (humEl) humEl.textContent = `${dayHumidity}%`;

  // Wind Speed
  const windKm = isToday
    ? Math.round(current.wind_speed_10m)
    : (daily.wind_speed_10m_max ? Math.round(daily.wind_speed_10m_max[dayIdx]) : 12);
  const windEl = document.getElementById('gwWindVal');
  if (windEl) windEl.textContent = `${windKm} km/h`;

  // 3. Update Daily Strip Selection Highlights
  const cols = document.querySelectorAll('.gw-day-col');
  cols.forEach((col, i) => {
    if (i === dayIdx) col.classList.add('selected');
    else col.classList.remove('selected');
  });

  // 4. Render Hourly Graph for this exact selected day
  renderHourlyGraph(hourly, dayIdx);

  // 5. Livestock THI & Feeding Advisory tailored for this day (pass raw Celsius)
  renderDayFarmerAdvisory(dayIdx, rawMaxC, dayHumidity, precipProb, isToday);
}

// Livestock & Farm Advisory tailored for farmers
function renderDayFarmerAdvisory(dayIdx, maxT, humidity, precipProb, isToday) {
  const thi = computeTHI(maxT, humidity);
  const thiInd = document.getElementById('gwThiIndicator');
  const thiText = document.getElementById('gwThiText');
  if (!thiText || !thiInd) return;

  if (isToday) {
    if (thi < 68) {
      thiInd.style.color = '#34a853';
      thiText.textContent = `Today's Livestock THI: ${thi} (Comfort Zone) • Optimal feed intake & milk yield`;
    } else if (thi <= 72) {
      thiInd.style.color = '#fbbc04';
      thiText.textContent = `Today's Livestock THI: ${thi} (Mild Alert) • Ensure abundant clean drinking water & shed shade`;
    } else if (thi <= 79) {
      thiInd.style.color = '#f97316';
      thiText.textContent = `Today's Livestock THI: ${thi} (Heat Stress Warning) • Supplement NutriAgro Bypass Fat & electrolyte buffers`;
    } else {
      thiInd.style.color = '#ef4444';
      thiText.textContent = `Today's Livestock THI: ${thi} (Severe Heat Alert) • Shift feeding to dawn/night hours, run shed ventilation`;
    }
    return;
  }

  // Future Days Forecast
  if (precipProb >= 60) {
    thiInd.style.color = '#60a5fa';
    thiText.textContent = `Forecast (${precipProb}% Rain Risk): Move dry fodder to covered sheds, prevent mold, increase Vitamin C in herd rations.`;
  } else if (maxT >= 33) {
    thiInd.style.color = '#f97316';
    thiText.textContent = `Forecast (Heat Spike ${maxT}°C expected): Prepare cooling mists, plan early feed delivery to prevent rumen heat load.`;
  } else {
    thiInd.style.color = '#34a853';
    thiText.textContent = `Forecast (Comfortable ${maxT}°C): Excellent conditions expected for forage digestion and herd feed conversion.`;
  }
}

// Render Hourly SVG Curve for the selected day
function renderHourlyGraph(hourly, dayIdx = 0) {
  const svg = document.getElementById('gwHourlySvg');
  if (!svg || !hourly || !hourly.temperature_2m) return;

  const points = [];
  const offsets = [0, 3, 6, 9, 12, 15, 18, 21];
  const dayBaseHour = dayIdx * 24;

  offsets.forEach((offset) => {
    const targetIdx = dayBaseHour + offset;
    const rawTemp = hourly.temperature_2m[targetIdx] !== undefined
      ? hourly.temperature_2m[targetIdx]
      : 28;
    const precipProb = hourly.precipitation_probability ? (hourly.precipitation_probability[targetIdx] || 0) : 0;
    const windSpeed = hourly.wind_speed_10m ? Math.round(hourly.wind_speed_10m[targetIdx] || 10) : 10;

    // 12-hour AM/PM label
    const ampm = offset >= 12 ? 'pm' : 'am';
    const hour12 = offset % 12 === 0 ? 12 : offset % 12;
    const timeLabel = `${hour12} ${ampm}`;

    points.push({
      temp: toUnit(rawTemp),
      precip: precipProb,
      wind: windSpeed,
      label: timeLabel
    });
  });

  // Calculate coordinates across viewBox 0 0 540 96
  const W = 540;
  const H = 96;
  const padX = 35;
  const padY = 22;

  let values = points.map(p => activeGwTab === 'precip' ? p.precip : activeGwTab === 'wind' ? p.wind : p.temp);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = (maxV - minV) || 1;

  const stepX = (W - padX * 2) / (points.length - 1);
  const coords = points.map((p, i) => {
    const v = values[i];
    const x = padX + i * stepX;
    const y = H - padY - 14 - ((v - minV) / range) * (H - padY * 2 - 14);
    return { x, y, val: v, label: p.label };
  });

  // Smooth bezier curve path
  let curvePath = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i];
    const p1 = coords[i + 1];
    const mx = (p0.x + p1.x) / 2;
    curvePath += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
  }

  const fillPath = `${curvePath} L ${coords[coords.length - 1].x} ${H - 18} L ${coords[0].x} ${H - 18} Z`;

  // Dynamic theme accent matching the active background slide
  const accent = window.currentWeatherAccent || '#f7b731';

  // Build SVG Content with Dynamic Theme Gradient matching the Cattle Background Slide
  let svgContent = `
    <defs>
      <linearGradient id="gwThemeGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${accent}" stop-opacity="0.45"/>
        <stop offset="100%" stop-color="${accent}" stop-opacity="0.02"/>
      </linearGradient>
    </defs>
    <path d="${fillPath}" fill="url(#gwThemeGrad)"/>
    <path d="${curvePath}" fill="none" stroke="${accent}" stroke-width="2.5"/>
  `;

  // Draw values and labels
  coords.forEach((c) => {
    const unitSuffix = activeGwTab === 'precip' ? '%' : activeGwTab === 'wind' ? ' km/h' : '°';
    svgContent += `
      <circle cx="${c.x}" cy="${c.y}" r="3.2" fill="${accent}"/>
      <text x="${c.x}" y="${c.y - 7}" text-anchor="middle" font-size="11" font-weight="600" fill="#ffffff">${c.val}${unitSuffix}</text>
      <text x="${c.x}" y="${H - 4}" text-anchor="middle" font-size="10.5" fill="#a7c5b6">${c.label}</text>
    `;
  });

  svg.innerHTML = svgContent;
}

// Render Daily Forecast Strip (Today + Upcoming 6 Days)
function renderDailyStrip(daily, current) {
  const container = document.getElementById('gwDailyStrip');
  if (!container || !daily || !daily.time) return;

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let html = '';

  const nowHours = new Date().getHours();
  const isNightNow = (nowHours < 6 || nowHours >= 18);

  const count = Math.min(daily.time.length, 7);
  for (let i = 0; i < count; i++) {
    const isToday = (i === 0);
    const dateObj = new Date(daily.time[i] + 'T00:00:00');
    const dayStr = isToday ? 'Today' : days[dateObj.getDay()];
    const dateNum = `${dateObj.getDate()} ${monthNames[dateObj.getMonth()]}`;

    // For Today: use current.weather_code so the strip icon ALWAYS matches the live hero icon!
    const code = isToday
      ? (current && current.weather_code !== undefined ? current.weather_code : daily.weather_code[i] || 0)
      : (daily.weather_code[i] || 0);

    const isNight = isToday ? isNightNow : false;
    const maxT = toUnit(daily.temperature_2m_max[i] || 33);
    const minT = toUnit(daily.temperature_2m_min[i] || 27);
    const meta = getGwWeatherMeta(code, isNight);

    const precipProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : 0;
    const precipBadge = precipProb >= 25 
      ? `<div class="gw-day-precip" title="${precipProb}% rain probability">💧 ${precipProb}%</div>`
      : '';

    html += `
      <div class="gw-day-col ${i === selectedDayIdx ? 'selected' : ''}" onclick="selectGwDay(${i})" title="Click to view full weather for ${dayStr}, ${dateNum}">
        <div class="gw-day-name">${dayStr}</div>
        <div class="gw-day-date">${dateNum}</div>
        <div class="gw-day-icon">${meta.iconSvg}</div>
        ${precipBadge}
        <div class="gw-day-temps">
          <span class="gw-day-high">${maxT}°</span>
          <span class="gw-day-low">${minT}°</span>
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
}

// Day Selection via clicking column
function selectGwDay(idx) {
  renderSelectedDayWeather(idx);
}

// Day Navigation helper
function navigateDay(delta) {
  if (!cachedWeatherData || !cachedWeatherData.daily) return;
  const maxIdx = Math.min(cachedWeatherData.daily.time.length, 7) - 1;
  const newIdx = Math.max(0, Math.min(maxIdx, selectedDayIdx + delta));
  if (newIdx !== selectedDayIdx) {
    renderSelectedDayWeather(newIdx);
  }
}

// Unit Switcher (°C / °F)
function setWeatherUnit(unit) {
  currentWeatherUnit = unit;
  const cBtn = document.querySelector('.gw-unit-c');
  const fBtn = document.querySelector('.gw-unit-f');
  if (cBtn && fBtn) {
    if (unit === 'C') {
      cBtn.classList.add('active');
      fBtn.classList.remove('active');
    } else {
      fBtn.classList.add('active');
      cBtn.classList.remove('active');
    }
  }
  if (cachedWeatherData) {
    renderDailyStrip(cachedWeatherData.daily, cachedWeatherData.current);
    renderSelectedDayWeather(selectedDayIdx);
  }
}

// Switch Forecast Metric Tab (Temperature, Precipitation, Wind)
function switchGwForecastTab(tabKey) {
  activeGwTab = tabKey;
  ['temp', 'precip', 'wind'].forEach(k => {
    const el = document.getElementById(`gwTab${k.charAt(0).toUpperCase() + k.slice(1)}`);
    if (el) {
      if (k === tabKey) el.classList.add('active');
      else el.classList.remove('active');
    }
  });

  if (cachedWeatherData) renderHourlyGraph(cachedWeatherData.hourly, selectedDayIdx);
}

// Choose Area In-Page Modal
function openChooseAreaModal() {
  const modal = document.getElementById('chooseAreaModal');
  if (modal) {
    modal.style.display = 'flex';
    const input = document.getElementById('chooseAreaInput');
    if (input) {
      input.value = '';
      setTimeout(() => input.focus(), 50);
    }
  }
}

function closeChooseAreaModal() {
  const modal = document.getElementById('chooseAreaModal');
  if (modal) modal.style.display = 'none';
}

async function searchCustomArea(queryText) {
  const inputVal = document.getElementById('chooseAreaInput')?.value?.trim();
  const query = queryText || inputVal;
  if (!query) return;

  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1`);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const r = data.results[0];
      currentCoords = {
        lat: r.latitude,
        lon: r.longitude,
        name: `${r.name}${r.admin1 ? ', ' + r.admin1 : ''}`
      };
      selectedDayIdx = 0; // Reset to Today for new city
      loadAndRenderGoogleWeather();
      closeChooseAreaModal();
    } else {
      alert('Location not found. Please try another city or district name.');
    }
  } catch (e) {
    console.error('Error looking up location:', e);
  }
}

function detectUserLocationDirect() {
  selectedDayIdx = 0;
  autoDetectCustomerLocation();
}

// Auto-run on DOM ready: instant render user's Chennai location + background detect
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    loadAndRenderGoogleWeather();
    autoDetectCustomerLocation();
  });
} else {
  loadAndRenderGoogleWeather();
  autoDetectCustomerLocation();
}

function setWeatherThemeAccent(accentColor) {
  window.currentWeatherAccent = accentColor || '#f7b731';
  if (cachedWeatherData && cachedWeatherData.hourly) {
    renderHourlyGraph(cachedWeatherData.hourly, selectedDayIdx);
  }
}

// Window bindings
window.setWeatherUnit = setWeatherUnit;
window.switchGwForecastTab = switchGwForecastTab;
window.selectGwDay = selectGwDay;
window.navigateDay = navigateDay;
window.openChooseAreaModal = openChooseAreaModal;
window.closeChooseAreaModal = closeChooseAreaModal;
window.searchCustomArea = searchCustomArea;
window.detectUserLocationDirect = detectUserLocationDirect;
window.setWeatherThemeAccent = setWeatherThemeAccent;



