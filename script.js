/* =====================================================
   CLIMATESIM — SIMULADOR METEOROLÓGICO
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
    const locationBtn = document.getElementById("locationBtn");
    const connectionStatus = document.getElementById("connectionStatus");

    const city = document.getElementById("city");
    const coordinates = document.getElementById("coordinates");
    const temperature = document.getElementById("temperature");
    const description = document.getElementById("description");
    const weatherIcon = document.getElementById("weatherIcon");
    const humidity = document.getElementById("humidity");
    const wind = document.getElementById("wind");
    const rain = document.getElementById("rain");
    const rainProbability = document.getElementById("rainProbability");

    const rainIndex = document.getElementById("rainIndex");
    const houseIndex = document.getElementById("houseIndex");
    const environmentIndex = document.getElementById("environmentIndex");
    const transportIndex = document.getElementById("transportIndex");

    const rainBar = document.getElementById("rainBar");
    const houseBar = document.getElementById("houseBar");
    const environmentBar = document.getElementById("environmentBar");
    const transportBar = document.getElementById("transportBar");

    const rainText = document.getElementById("rainText");
    const houseText = document.getElementById("houseText");
    const environmentText = document.getElementById("environmentText");
    const transportText = document.getElementById("transportText");

    const foodPrice = document.getElementById("foodPrice");
    const transportPrice = document.getElementById("transportPrice");
    const energyPrice = document.getElementById("energyPrice");
    const constructionPrice = document.getElementById("constructionPrice");

    const economicImpact = document.getElementById("economicImpact");
    const houseImpact = document.getElementById("houseImpact");
    const environmentalImpact = document.getElementById("environmentalImpact");

    const rainSlider = document.getElementById("rainSlider");
    const autoMode = document.getElementById("autoMode");
    const simulationValue = document.getElementById("simulationValue");
    const simulationStatus = document.getElementById("simulationStatus");

    const forecast = document.getElementById("forecast");
    const canvas = document.getElementById("weatherCanvas");
    const ctx = canvas ? canvas.getContext("2d") : null;

    let currentWeather = {
        temperature: 25,
        humidity: 70,
        wind: 10,
        rain: 0,
        probability: 0
    };

    let rainDrops = [];
    let animationFrame;

    function setText(element, value) {
        if (element) {
            element.textContent = value;
        }
    }

    function setBar(element, value) {
        if (element) {
            element.style.width = `${Math.max(0, Math.min(100, value))}%`;
        }
    }

    function getWeatherDescription(code) {
        const descriptions = {
            0: "Céu limpo",
            1: "Principalmente limpo",
            2: "Parcialmente nublado",
            3: "Nublado",
            45: "Neblina",
            48: "Neblina congelante",
            51: "Garoa fraca",
            53: "Garoa moderada",
            55: "Garoa intensa",
            61: "Chuva fraca",
            63: "Chuva moderada",
            65: "Chuva forte",
            71: "Neve fraca",
            73: "Neve moderada",
            75: "Neve forte",
            80: "Pancadas fracas",
            81: "Pancadas moderadas",
            82: "Pancadas fortes",
            95: "Trovoada",
            96: "Trovoada com granizo",
            99: "Trovoada forte com granizo"
        };

        return descriptions[code] || "Condição desconhecida";
    }

    function getWeatherIcon(code) {
        if (code === 0) return "☀️";
        if (code === 1 || code === 2) return "🌤️";
        if (code === 3) return "☁️";
        if (code === 45 || code === 48) return "🌫️";
        if (code >= 51 && code <= 67) return "🌧️";
        if (code >= 71 && code <= 77) return "❄️";
        if (code >= 80 && code <= 82) return "🌦️";
        if (code >= 95) return "⛈️";

        return "🌡️";
    }

    function calculateIndexes(data) {
        const precipitation = Number(data.rain || 0);
        const rainChance = Number(data.probability || 0);
        const humidityValue = Number(data.humidity || 0);
        const windValue = Number(data.wind || 0);

        const rainScore = Math.min(
            100,
            Math.round(precipitation * 8 + rainChance * 0.5)
        );

        const houseScore = Math.min(
            100,
            Math.round(
                precipitation * 5 +
                rainChance * 0.35 +
                windValue * 0.8
            )
        );

        const environmentScore = Math.min(
            100,
            Math.round(
                precipitation * 4 +
                humidityValue * 0.25
            )
        );

        const transportScore = Math.min(
            100,
            Math.round(
                precipitation * 5 +
                rainChance * 0.4 +
                windValue * 0.7
            )
        );

        setText(rainIndex, `${rainScore}%`);
        setText(houseIndex, `${houseScore}%`);
        setText(environmentIndex, `${environmentScore}%`);
        setText(transportIndex, `${transportScore}%`);

        setBar(rainBar, rainScore);
        setBar(houseBar, houseScore);
        setBar(environmentBar, environmentScore);
        setBar(transportBar, transportScore);

        setText(
            rainText,
            rainScore < 30
                ? "Baixa possibilidade de chuva intensa."
                : rainScore < 70
                ? "Possibilidade moderada de chuva."
                : "Alta possibilidade de chuva intensa."
        );

        setText(
            houseText,
            houseScore < 30
                ? "Baixo risco para residências."
                : houseScore < 70
                ? "Atenção a infiltrações e ventos."
                : "Risco elevado de danos estruturais."
        );

        setText(
            environmentText,
            environmentScore < 30
                ? "Impacto ambiental baixo."
                : environmentScore < 70
                ? "Impacto ambiental moderado."
                : "Impacto ambiental elevado."
        );

        setText(
            transportText,
            transportScore < 30
                ? "Trânsito com poucas alterações."
                : transportScore < 70
                ? "Possíveis atrasos e pistas molhadas."
                : "Risco elevado para o transporte."
        );

        setText(
            foodPrice,
            precipitation > 10 ? "Aumento moderado" : "Estável"
        );

        setText(
            transportPrice,
            precipitation > 10 || windValue > 30
                ? "Aumento provável"
                : "Estável"
        );

        setText(
            energyPrice,
            data.temperature < 18 || data.temperature > 32
                ? "Aumento no consumo"
                : "Consumo normal"
        );

        setText(
            constructionPrice,
            precipitation > 15
                ? "Obras podem atrasar"
                : "Condições favoráveis"
        );

        setText(
            economicImpact,
            precipitation > 15
                ? "A chuva pode aumentar custos e atrasar atividades econômicas."
                : "As condições atuais apresentam baixo impacto econômico."
        );

        setText(
            houseImpact,
            houseScore > 70
                ? "Recomenda-se verificar telhados, calhas, janelas e possíveis infiltrações."
                : "Não há sinais de impacto elevado nas residências."
        );

        setText(
            environmentalImpact,
            environmentScore > 70
                ? "Pode ocorrer erosão, alagamento e alteração na qualidade da água."
                : "O impacto ambiental previsto é baixo ou moderado."
        );
    }

    function updateWeatherInterface(data, latitude, longitude, cityName) {
        currentWeather = {
            temperature: data.temperature,
            humidity: data.humidity,
            wind: data.wind,
            rain: data.rain,
            probability: data.probability
        };

        setText(city, cityName || "Localização atual");

        setText(
            coordinates,
            `Latitude: ${latitude.toFixed(5)} | ` +
            `Longitude: ${longitude.toFixed(5)}`
        );

        setText(temperature, `${data.temperature.toFixed(1)} °C`);
        setText(description, getWeatherDescription(data.weatherCode));
        setText(weatherIcon, getWeatherIcon(data.weatherCode));
        setText(humidity, `${data.humidity}%`);
        setText(wind, `${data.wind.toFixed(1)} km/h`);
        setText(rain, `${data.rain.toFixed(1)} mm`);
        setText(rainProbability, `${data.probability}%`);

        calculateIndexes(data);
        updateSimulation(data.rain);
    }

    async function getCityName(latitude, longitude) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
            );

            if (!response.ok) {
                return "Localização atual";
            }

            const result = await response.json();

            return (
                result.address?.city ||
                result.address?.town ||
                result.address?.municipality ||
                result.address?.village ||
                "Localização atual"
            );
        } catch (error) {
            console.warn("Não foi possível obter o nome da cidade:", error);
            return "Localização atual";
        }
    }

    async function getWeather(latitude, longitude) {
        try {
            setText(connectionStatus, "Buscando dados meteorológicos...");

            const url =
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}` +
                `&longitude=${longitude}` +
                `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,rain` +
                `&hourly=precipitation_probability` +
                `&forecast_days=2` +
                `&timezone=auto`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("Erro ao consultar a API meteorológica.");
            }

            const result = await response.json();

            const current = result.current;
            const hourly = result.hourly;

            const currentIndex = hourly.time.indexOf(current.time);

            const probability =
                currentIndex >= 0
                    ? hourly.precipitation_probability[currentIndex] || 0
                    : 0;

            const data = {
                temperature: current.temperature_2m,
                humidity: current.relative_humidity_2m,
                wind: current.wind_speed_10m,
                rain: current.rain || 0,
                probability,
                weatherCode: current.weather_code
            };

            const cityName = await getCityName(latitude, longitude);

            updateWeatherInterface(
                data,
                latitude,
                longitude,
                cityName
            );

            createForecast(result);
            setText(connectionStatus, "Dados atualizados com sucesso.");
        } catch (error) {
            console.error(error);
            setText(
                connectionStatus,
                "Não foi possível carregar os dados meteorológicos."
            );
        }
    }

    function getLocation() {
        if (!navigator.geolocation) {
            setText(
                connectionStatus,
                "Seu navegador não suporta geolocalização."
            );
            return;
        }

        setText(connectionStatus, "Obtendo sua localização...");

        navigator.geolocation.getCurrentPosition(
            position => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                getWeather(latitude, longitude);
            },
            error => {
                console.error(error);

                setText(
                    connectionStatus,
                    "Permissão de localização negada ou indisponível."
                );
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }

    function createForecast(data) {
        if (!forecast || !data.hourly) {
            return;
        }

        forecast.innerHTML = "";

        const times = data.hourly.time || [];
        const temperatures = data.hourly.temperature_2m || [];
        const probabilities =
            data.hourly.precipitation_probability || [];

        const limit = Math.min(times.length, 12);

        for (let i = 0; i < limit; i++) {
            const item = document.createElement("div");
            item.className = "forecast-item";

            const date = new Date(times[i]);

            item.innerHTML = `
                <strong>${date.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit"
                })}</strong>
                <span>${temperatures[i]} °C</span>
                <small>${probabilities[i] || 0}% de chuva</small>
            `;

            forecast.appendChild(item);
        }
    }

    function updateSimulation(value) {
        const rainValue = Number(value) || 0;

        setText(simulationValue, `${rainValue.toFixed(1)} mm`);

        setText(
            simulationStatus,
            rainValue < 5
                ? "Chuva fraca ou inexistente."
                : rainValue < 15
                ? "Chuva moderada."
                : "Chuva intensa com possibilidade de impactos."
        );

        if (autoMode && autoMode.checked) {
            currentWeather.rain = rainValue;
            calculateIndexes(currentWeather);
        }
    }

    function createRainDrops() {
        rainDrops = [];

        for (let i = 0; i < 120; i++) {
            rainDrops.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                length: Math.random() * 15 + 5,
                speed: Math.random() * 5 + 3
            });
        }
    }

    function animateRain() {
        if (!ctx || !canvas) {
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const rainAmount = Number(currentWeather.rain) || 0;

        if (rainAmount <= 0) {
            animationFrame = requestAnimationFrame(animateRain);
            return;
        }

        ctx.beginPath();

        rainDrops.forEach(drop => {
            ctx.moveTo(drop.x, drop.y);
            ctx.lineTo(drop.x - 2, drop.y + drop.length);

            drop.y += drop.speed;

            if (drop.y > canvas.height) {
                drop.y = -drop.length;
                drop.x = Math.random() * canvas.width;
            }
        });

        ctx.strokeStyle = "rgba(120, 180, 255, 0.7)";
        ctx.lineWidth = 1;
        ctx.stroke();

        animationFrame = requestAnimationFrame(animateRain);
    }

    if (locationBtn) {
        locationBtn.addEventListener("click", getLocation);
    }

    if (rainSlider) {
        rainSlider.addEventListener("input", event => {
            updateSimulation(event.target.value);
        });
    }

    if (autoMode) {
        autoMode.addEventListener("change", () => {
            if (autoMode.checked) {
                updateSimulation(currentWeather.rain);
            }
        });
    }

    if (canvas) {
        canvas.width = canvas.clientWidth || 600;
        canvas.height = canvas.clientHeight || 300;

        createRainDrops();
        animateRain();
    }

    getLocation();
});
