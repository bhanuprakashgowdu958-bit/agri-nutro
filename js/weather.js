// NutriAgro Feeds — Google-Grade Real-Time Weather Widget
// Features 100% Precise Auto-Geolocation, Hourly SVG Curve & 7-Day Forecast



// Interpret WMO weather codes to Google Weather icons & descriptions
function getGwWeatherMeta(code, isNight = false) {
  // SVG weather icons matching Google Weather style
  if (code === 0) {
    return {
      desc: isNight ? 'Clear' : 'Sunny',
      iconSvg: isNight
        ? `<svg viewBox="0 0 64 64" width="56" height="56"><defs><linearGradient id="gwFullMoon" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#4285f4"/><stop offset="100%" stop-color="#1a73e8"/></linearGradient></defs><path d="M38 12 A18 18 0 1 0 54 36 A19 19 0 0 1 38 12 Z" fill="url(#gwFullMoon)"/></svg>`
        : `<svg viewBox="0 0 64 64" width="56" height="56"><circle cx="32" cy="32" r="14" fill="#fbbc04"/><g stroke="#fbbc04" stroke-width="3" stroke-linecap="round"><line x1="32" y1="6" x2="32" y2="12"/><line x1="32" y1="52" x2="32" y2="58"/><line x1="6" y1="32" x2="12" y2="32"/><line x1="52" y1="32" x2="58" y2="32"/><line x1="14" y1="14" x2="18" y2="18"/><line x1="46" y1="46" x2="50" y2="50"/><line x1="14" y1="50" x2="18" y2="46"/><line x1="46" y1="18" x2="50" y2="14"/></g></svg>`
    };
  }
  if (code === 1 || code === 2) {
    return {
      desc: 'Partly cloudy',
      iconSvg: isNight
        ? `<svg viewBox="0 0 64 64" width="56" height="56"><defs><linearGradient id="gwBlueMoon" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#4285f4"/><stop offset="100%" stop-color="#1a73e8"/></linearGradient><linearGradient id="gwCloudSoft" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#cfd8dc"/></linearGradient></defs><path d="M26 10 C17 10 10 18 10 27 C10 36 17 43 26 43 C29 43 33 42 36 39 C29 38 23 32 23 24 C23 17 28 12 33 10 C31 10 28 10 26 10 Z" fill="url(#gwBlueMoon)"/><path d="M24 48 h22 a9 9 0 0 0 0-18 a12 12 0 0 0-21-3 a8 8 0 0 0-1 21 z" fill="url(#gwCloudSoft)"/></svg>`
        : `<svg viewBox="0 0 64 64" width="56" height="56"><defs><linearGradient id="gwGoldSun" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fbbc04"/><stop offset="100%" stop-color="#f29900"/></linearGradient><linearGradient id="gwCloudDay" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#d0d7de"/></linearGradient></defs><circle cx="26" cy="23" r="13" fill="url(#gwGoldSun)"/><path d="M22 48 h24 a10 10 0 0 0 0-20 a13 13 0 0 0-23-4 a9 9 0 0 0-1 24 z" fill="url(#gwCloudDay)"/></svg>`
    };
  }
  if (code === 3) {
    return {
      desc: 'Overcast',
      iconSvg: `<svg viewBox="0 0 64 64" width="56" height="56"><path d="M18 48h28a12 12 0 000-24 15 15 0 00-29-4 11 11 0 001 28z" fill="#9aa0a6"/><path d="M16 46h26a10 10 0 000-20 13 13 0 00-25-3 9 9 0 00-1 23z" fill="#bdc1c6"/></svg>`
    };
  }
  if (code >= 51 && code <= 67) {
    return {
      desc: 'Rain',
      iconSvg: `<svg viewBox="0 0 64 64" width="56" height="56"><path d="M18 38h26a11 11 0 000-22 13 13 0 00-25-4 10 10 0 00-1 26z" fill="#9aa0a6"/><g stroke="#4285f4" stroke-width="2.5" stroke-linecap="round"><line x1="22" y1="44" x2="19" y2="52"/><line x1="32" y1="44" x2="29" y2="52"/><line x1="42" y1="44" x2="39" y2="52"/></g></svg>`
    };
  }
  if (code >= 80 && code <= 82) {
    return {
      desc: 'Rain showers',
      iconSvg: `<svg viewBox="0 0 64 64" width="56" height="56"><circle cx="24" cy="20" r="9" fill="#fbbc04"/><path d="M18 40h24a10 10 0 000-20 12 12 0 00-23-4 9 9 0 00-1 24z" fill="#9aa0a6"/><g stroke="#4285f4" stroke-width="2.5" stroke-linecap="round"><line x1="22" y1="46" x2="19" y2="54"/><line x1="32" y1="46" x2="29" y2="54"/></g></svg>`
    };
  }
  if (code >= 95) {
    return {
      desc: 'Thunderstorm',
      iconSvg: `<svg viewBox="0 0 64 64" width="56" height="56"><path d="M18 36h26a11 11 0 000-22 13 13 0 00-25-4 10 10 0 00-1 26z" fill="#5f6368"/><polygon points="28,40 24,48 30,48 26,58 36,46 30,46" fill="#fbbc04"/></svg>`
    };
  }
  return {
    desc: 'Fair',
    iconSvg: `<svg viewBox="0 0 64 64" width="56" height="56"><circle cx="32" cy="32" r="14" fill="#fbbc04"/></svg>`
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
  // 1. Render daily horizontal strip first
  renderDailyStrip(data.daily);
  // 2. Render selected day (defaults to Today, dayIdx = 1)
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

  const maxT = toUnit(daily.temperature_2m_max[dayIdx] || 33);
  const minT = toUnit(daily.temperature_2m_min[dayIdx] || 27);
  const code = isToday ? current.weather_code : daily.weather_code[dayIdx];

  const isNight = isToday && (new Date().getHours() < 6 || new Date().getHours() > 18);
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

  // 5. Livestock THI & Feeding Advisory tailored for this day
  renderDayFarmerAdvisory(dayIdx, maxT, dayHumidity, precipProb, isToday);
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

// Render Daily Forecast Strip (Yesterday, Today, Tomorrow, Upcoming)
function renderDailyStrip(daily) {
  const container = document.getElementById('gwDailyStrip');
  if (!container || !daily || !daily.time) return;

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let html = '';

  const count = Math.min(daily.time.length, 7);
  for (let i = 0; i < count; i++) {
    const dateObj = new Date(daily.time[i] + 'T00:00:00');
    const dayStr = days[dateObj.getDay()];
    const dateNum = `${dateObj.getDate()} ${monthNames[dateObj.getMonth()]}`;
    const code = daily.weather_code[i] || 0;
    const maxT = toUnit(daily.temperature_2m_max[i] || 33);
    const minT = toUnit(daily.temperature_2m_min[i] || 27);
    const meta = getGwWeatherMeta(code, false);

    html += `
      <div class="gw-day-col ${i === selectedDayIdx ? 'selected' : ''}" onclick="selectGwDay(${i})" title="Click to view full weather for ${dayStr}, ${dateNum}">
        <div class="gw-day-name">${dayStr}</div>
        <div class="gw-day-date">${dateNum}</div>
        <div class="gw-day-icon">${meta.iconSvg}</div>
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
  if (cachedWeatherData) renderSelectedDayWeather(selectedDayIdx);
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



