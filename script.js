/* =====================================================
CLIMATESIM — SIMULADOR METEOROLÓGICO
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

```
const locationBtn = document.getElementById("locationBtn");
const rainSlider = document.getElementById("rainSlider");
const autoMode = document.getElementById("autoMode");

let currentWeather = null;
let automaticMode = false;
let automaticInterval = null;

if (locationBtn) {
    locationBtn.addEventListener("click", getLocation);
}

if (rainSlider) {
    rainSlider.addEventListener("input", () => {
        automaticMode = false;
        stopAutomaticMode();

        if (autoMode) {
            autoMode.textContent = "🤖 Modo automático";
        }

        updateSimulation(Number(rainSlider.value));
    });
}

if (autoMode) {
    autoMode.addEventListener("click", toggleAutomaticMode);
}

updateSimulation(0);

// Tenta carregar a localização automaticamente.
// O navegador pedirá permissão quando necessário.
setTimeout(getLocation, 500);


/* =================================================
   LOCALIZAÇÃO
================================================= */

function getLocation() {

    const status = document.getElementById("connectionStatus");

    if (!status) return;

    if (!navigator.geolocation) {

        status.textContent = "● Geolocalização não suportada";

        return;
    }

    status.textContent = "● Obtendo localização...";

    navigator.geolocation.getCurrentPosition(

        async (position) => {

            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            const coordinates =
                document.getElementById("coordinates");

            if (coordinates) {

                coordinates.textContent =
                    `Latitude: ${latitude.toFixed(5)} | ` +
                    `Longitude: ${longitude.toFixed(5)}`;

            }

            try {

                await getCityName(latitude, longitude);

                await getWeather(latitude, longitude);

                status.textContent = "● Dados atualizados";

            } catch (error) {

                console.error("Erro ao carregar dados:", error);

                status.textContent =
                    "● Erro ao carregar dados meteorológicos";

            }

        },

        (error) => {

            console.error("Erro de localização:", error);

            switch (error.code) {

                case 1:
                    status.textContent =
                        "● Permissão de localização negada";
                    break;

                case 2:
                    status.textContent =
                        "● Localização indisponível";
                    break;

                case 3:
                    status.textContent =
                        "● Tempo limite excedido";
                    break;

                default:
                    status.textContent =
                        "● Erro desconhecido";

            }

        },

        {
            enableHighAccuracy: false,
            timeout: 15000,
            maximumAge: 300000
        }

    );

}


/* =================================================
   BUSCAR CIDADE
================================================= */

async function getCityName(latitude, longitude) {

    const cityElement = document.getElementById("city");

    if (!cityElement) return;

    try {

        const url =
            `https://nominatim.openstreetmap.org/reverse` +
            `?format=json` +
            `&lat=${latitude}` +
            `&lon=${longitude}` +
            `&zoom=10` +
            `&addressdetails=1`;

        const response = await fetch(url, {
            headers: {
                "Accept-Language": "pt-BR"
            }
        });

        if (!response.ok) {
            throw new Error("Erro no reverse geocoding");
        }

        const data = await response.json();

        const address = data.address || {};

        const city =
            address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            address.county ||
            "Local desconhecido";

        const state = address.state || "";

        const country = address.country || "";

        cityElement.textContent = city;

        cityElement.dataset.state = state;
        cityElement.dataset.country = country;

        console.log(`Local: ${city}, ${state}, ${country}`);

    } catch (error) {

        console.error("Erro ao descobrir cidade:", error);

        cityElement.textContent = "Localização encontrada";

    }

}


/* =================================================
   BUSCAR CLIMA — OPEN-METEO
================================================= */

async function getWeather(latitude, longitude) {

    const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${latitude}` +
        `&longitude=${longitude}` +
        `&current=temperature_2m,relative_humidity_2m,` +
        `apparent_temperature,precipitation,rain,weather_code,` +
        `wind_speed_10m` +
        `&hourly=temperature_2m,precipitation_probability,` +
        `precipitation,rain,weather_code,wind_speed_10m` +
        `&forecast_days=2` +
        `&timezone=auto`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
    }

    const data = await response.json();

    currentWeather = data;

    console.log("Dados meteorológicos:", data);

    const current = data.current;

    const temperature = Number(current.temperature_2m) || 0;
    const humidity = Number(current.relative_humidity_2m) || 0;
    const wind = Number(current.wind_speed_10m) || 0;
    const rain = Number(current.precipitation) || 0;
    const weatherCode = Number(current.weather_code) || 0;

    setText("temperature", `${Math.round(temperature)}°C`);

    setText("humidity", `${humidity}%`);

    setText("wind", `${wind.toFixed(1)} km/h`);

    setText("rain", `${rain.toFixed(1)} mm`);

    setText(
        "rainProbability",
        `${getCurrentRainProbability(data)}%`
    );

    setText(
        "description",
        getWeatherDescription(weatherCode)
    );

    setText(
        "weatherIcon",
        getWeatherIcon(weatherCode)
    );

    setText(
        "updateTime",
        `Atualizado às ${formatTime(current.time)}`
    );

    // Atualiza a simulação com a chuva atual.
    const currentRain = calculateRainIntensity(
        rain,
        getCurrentRainProbability(data)
    );

    if (!automaticMode) {

        const slider = document.getElementById("rainSlider");

        if (slider) {
            slider.value = currentRain;
        }

        updateSimulation(currentRain);

    }

    updateForecast(data);

}


/* =================================================
   PROBABILIDADE DE CHUVA
================================================= */

function getCurrentRainProbability(data) {

    if (
        !data.hourly ||
        !data.hourly.time ||
        !data.hourly.precipitation_probability
    ) {
        return 0;
    }

    const currentTime = data.current.time;

    let index = data.hourly.time.indexOf(currentTime);

    if (index === -1) {

        index = data.hourly.time.findIndex(time =>
            time >= currentTime
        );

    }

    if (index === -1) {
        index = 0;
    }

    return Number(
        data.hourly.precipitation_probability[index]
    ) || 0;

}


function calculateRainIntensity(rain, probability) {

    const rainScore = Math.min(rain / 15, 1) * 70;

    const probabilityScore = probability * 0.3;

    return Math.round(
        Math.min(100, rainScore + probabilityScore)
    );

}


/* =================================================
   DESCRIÇÃO DO CLIMA
================================================= */

function getWeatherDescription(code) {

    const descriptions = {

        0: "Céu limpo",

        1: "Predominantemente limpo",
        2: "Parcialmente nublado",
        3: "Nublado",

        45: "Névoa",
        48: "Névoa com geada",

        51: "Garoa leve",
        53: "Garoa moderada",
        55: "Garoa intensa",

        61: "Chuva leve",
        63: "Chuva moderada",
        65: "Chuva forte",

        71: "Neve leve",
        73: "Neve moderada",
        75: "Neve forte",

        80: "Pancadas de chuva leves",
        81: "Pancadas de chuva moderadas",
        82: "Pancadas de chuva fortes",

        95: "Trovoada",
        96: "Trovoada com granizo",
        99: "Trovoada forte com granizo"

    };

    return descriptions[code] || "Condição meteorológica desconhecida";

}


function getWeatherIcon(code) {

    if (code === 0) return "☀️";

    if (code <= 3) return "🌤️";

    if (code === 45 || code === 48) return "🌫️";

    if (code >= 51 && code <= 67) return "🌧️";

    if (code >= 71 && code <= 77) return "❄️";

    if (code >= 80 && code <= 82) return "🌦️";

    if (code >= 95) return "⛈️";

    return "🌤️";

}


/* =================================================
   SIMULAÇÃO PRINCIPAL
================================================= */

function updateSimulation(intensity) {

    intensity = Math.max(0, Math.min(100, intensity));

    setText("simulationValue", `${intensity}%`);

    setText(
        "simulationStatus",
        getSimulationStatus(intensity)
    );

    updateRainIndex(intensity);

    updateHouseIndex(intensity);

    updateEnvironmentIndex(intensity);

    updateTransportIndex(intensity);

    updateEconomicImpact(intensity);

    updateCategoryPrices(intensity);

    updateHouseImpacts(intensity);

    updateEnvironmentalImpacts(intensity);

    updateRainAnimation(intensity);

}


function getSimulationStatus(intensity) {

    if (intensity === 0) return "Sem chuva";

    if (intensity <= 20) return "Chuva muito fraca";

    if (intensity <= 40) return "Chuva leve";

    if (intensity <= 60) return "Chuva moderada";

    if (intensity <= 80) return "Chuva forte";

    return "Chuva muito intensa";

}


/* =================================================
   ÍNDICES
================================================= */

function updateRainIndex(value) {

    setText("rainIndex", value);

    setBar("rainBar", value);

    setText(
        "rainText",
        getRainDescription(value)
    );

}


function updateHouseIndex(value) {

    const index = Math.round(value * 0.85);

    setText("houseIndex", index);

    setBar("houseBar", index);

    setText(
        "houseText",
        getImpactDescription(index)
    );

}


function updateEnvironmentIndex(value) {

    const index = Math.round(value * 0.75);

    setText("environmentIndex", index);

    setBar("environmentBar", index);

    setText(
        "environmentText",
        getImpactDescription(index)
    );

}


function updateTransportIndex(value) {

    const index = Math.round(value * 0.9);

    setText("transportIndex", index);

    setBar("transportBar", index);

    setText(
        "transportText",
        getImpactDescription(index)
    );

}


function getRainDescription(value) {

    if (value === 0) return "Sem chuva significativa";

    if (value <= 20) return "Chuva fraca";

    if (value <= 40) return "Chuva leve";

    if (value <= 60) return "Chuva moderada";

    if (value <= 80) return "Chuva forte";

    return "Chuva muito intensa";

}


function getImpactDescription(value) {

    if (value <= 20) return "Baixo impacto";

    if (value <= 40) return "Impacto moderado";

    if (value <= 60) return "Atenção necessária";

    if (value <= 80) return "Impacto elevado";

    return "Alto impacto";

}


/* =================================================
   IMPACTOS ECONÔMICOS
================================================= */

function updateEconomicImpact(value) {

    const demand = Math.round(100 + value * 0.8);

    const price = Math.round(value * 0.45);

    const logistics = Math.round(value * 0.9);

    const commerce = Math.round(value * 0.65);

    setText("demand", `${demand}%`);

    setText("prices", `+${price}%`);

    setText("logistics", `${logistics}%`);

    setText("commerce", `${commerce}%`);

    setText(
        "demandDescription",
        value > 60
            ? "Maior procura por produtos essenciais."
            : "Demanda dentro do padrão."
    );

    setText(
        "priceDescription",
        value > 60
            ? "Possível pressão em produtos afetados."
            : "Baixa pressão estimada."
    );

    setText(
        "logisticsDescription",
        value > 60
            ? "Possíveis atrasos no transporte."
            : "Operação relativamente normal."
    );

    setText(
        "commerceDescription",
        value > 60
            ? "Movimento comercial pode ser afetado."
            : "Comércio funcionando normalmente."
    );

}


/* =================================================
   PREÇOS POR CATEGORIA
================================================= */

function updateCategoryPrices(value) {

    const foodDemand = Math.round(100 + value * 0.8);

    const transportDemand = Math.round(100 + value * 0.45);

    const constructionDemand = Math.round(100 - value * 0.3);

    const energyDemand = Math.round(100 + value * 0.5);

    const foodPrice = Math.round(value * 0.45);

    const transportPrice = Math.round(value * 0.35);

    const constructionPrice = Math.round(value * 0.25);

    const energyPrice = Math.round(value * 0.2);

    setText("foodDemand", `${foodDemand}%`);
    setText("foodPrice", `+${foodPrice}%`);
    setText("foodImpact", getImpactDescription(value));

    setText("transportDemand", `${transportDemand}%`);
    setText("transportPrice", `+${transportPrice}%`);
    setText("transportImpact", getImpactDescription(value));

    setText("constructionDemand", `${constructionDemand}%`);
    setText("constructionPrice", `+${constructionPrice}%`);
    setText("constructionImpact", getImpactDescription(value));

    setText("energyDemand", `${energyDemand}%`);
    setText("energyPrice", `+${energyPrice}%`);
    setText("energyImpact", getImpactDescription(value));

}


/* =================================================
   IMPACTOS NAS CASAS
================================================= */

function updateHouseImpacts(value) {

    setText(
        "infiltration",
        getImpactLevel(value * 0.8)
    );

    setText(
        "flooding",
        getImpactLevel(value * 0.9)
    );

    setText(
        "roof",
        getImpactLevel(value * 0.65)
    );

    setText(
        "moisture",
        getImpactLevel(value * 0.95)
    );

}


/* =================================================
   IMPACTOS AMBIENTAIS
================================================= */

function updateEnvironmentalImpacts(value) {

    setText(
        "waterRecharge",
        getImpactLevel(value * 0.8)
    );

    setText(
        "erosion",
        getImpactLevel(value * 0.9)
    );

    setText(
        "vegetation",
        getImpactLevel(value * 0.4)
    );

    setText(
        "environmentRisk",
        getImpactLevel(value * 0.75)
    );

}


function getImpactLevel(value) {

    value = Math.max(0, Math.min(100, value));

    if (value <= 20) return "Baixo";

    if (value <= 40) return "Moderado";

    if (value <= 60) return "Médio";

    if (value <= 80) return "Alto";

    return "Muito alto";

}


/* =================================================
   PREVISÃO DAS PRÓXIMAS HORAS
================================================= */

function updateForecast(data) {

    const forecast = document.getElementById("forecast");

    if (!forecast || !data.hourly) return;

    forecast.innerHTML = "";

    const hourly = data.hourly;

    const currentTime = data.current.time;

    let startIndex = hourly.time.indexOf(currentTime);

    if (startIndex === -1) {

        startIndex = hourly.time.findIndex(time =>
            time >= currentTime
        );

    }

    if (startIndex === -1) startIndex = 0;

    for (
        let i = startIndex;
        i < Math.min(startIndex + 12, hourly.time.length);
        i++
    ) {

        const time = formatTime(hourly.time[i]);

        const temperature =
            Math.round(hourly.temperature_2m[i]);

        const probability =
            hourly.precipitation_probability[i] ?? 0;

        const code =
            hourly.weather_code[i];

        const item = document.createElement("div");

        item.className = "forecast-item";

        item.innerHTML = `
            <div class="hour">${time}</div>

            <div class="icon">
                ${getWeatherIcon(code)}
            </div>

            <div class="temp">
                ${temperature}°C
            </div>

            <div class="rain-prob">
                🌧️ ${probability}% 
            </div>
        `;

        forecast.appendChild(item);

    }

}


/* =================================================
   MODO AUTOMÁTICO
================================================= */

function toggleAutomaticMode() {

    automaticMode = !automaticMode;

    if (automaticMode) {

        startAutomaticMode();

        if (autoMode) {
            autoMode.textContent = "⏹️ Parar automático";
        }

    } else {

        stopAutomaticMode();

        if (autoMode) {
            autoMode.textContent = "🤖 Modo automático";
        }

    }

}


function startAutomaticMode() {

    stopAutomaticMode();

    let value = Number(
        document.getElementById("rainSlider")?.value || 0
    );

    automaticInterval = setInterval(() => {

        value += 5;

        if (value > 100) {
            value = 0;
        }

        const slider = document.getElementById("rainSlider");

        if (slider) {
            slider.value = value;
        }

        updateSimulation(value);

    }, 1000);

}


function stopAutomaticMode() {

    if (automaticInterval) {

        clearInterval(automaticInterval);

        automaticInterval = null;

    }

}


/* =================================================
   ANIMAÇÃO DE CHUVA
================================================= */

function updateRainAnimation(intensity) {

    const canvas = document.getElementById("weatherCanvas");

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (intensity <= 0) return;

    const drops = Math.round(intensity * 1.5);

    ctx.strokeStyle = "rgba(100,180,255,0.45)";

    ctx.lineWidth = 1;

    for (let i = 0; i < drops; i++) {

        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;

        ctx.beginPath();

        ctx.moveTo(x, y);

        ctx.lineTo(x - 2, y + 12);

        ctx.stroke();

    }

}


/* =================================================
   FUNÇÕES AUXILIARES
================================================= */

function setText(id, value) {

    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }

}


function setBar(id, value) {

    const element = document.getElementById(id);

    if (element) {

        element.style.width =
            `${Math.max(0, Math.min(100, value))}%`;

    }

}


function formatTime(time) {

    if (!time) return "--:--";

    return time.substring(11, 16);

}


/* =================================================
   REDIMENSIONAR CANVAS
================================================= */

window.addEventListener("resize", () => {

    if (rainSlider) {
        updateRainAnimation(Number(rainSlider.value));
    }

});
```

});
