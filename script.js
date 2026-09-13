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
/* =====================================================
   SIMULAÇÃO METEOROLÓGICA 3D
===================================================== */

function iniciarSimulacao3D() {
    const container = document.getElementById("weather3D");

    if (!container) {
        console.warn("Elemento weather3D não encontrado.");
        return;
    }

    if (typeof THREE === "undefined") {
        console.error("Three.js não foi carregado.");
        return;
    }

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );

    camera.position.set(0, 1.5, 8);

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });

    renderer.setSize(
        container.clientWidth,
        container.clientHeight
    );

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(
        0xffffff,
        1.2
    );

    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(
        0xffffff,
        2
    );

    sunLight.position.set(5, 4, 5);
    scene.add(sunLight);

    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    const earthGeometry = new THREE.SphereGeometry(
        2,
        64,
        64
    );

    const earthMaterial = new THREE.MeshStandardMaterial({
        color: 0x2374c6,
        roughness: 0.8,
        metalness: 0.05
    });

    const earth = new THREE.Mesh(
        earthGeometry,
        earthMaterial
    );

    earthGroup.add(earth);

    const atmosphereGeometry = new THREE.SphereGeometry(
        2.08,
        64,
        64
    );

    const atmosphereMaterial = new THREE.MeshBasicMaterial({
        color: 0x55aaff,
        transparent: true,
        opacity: 0.16,
        side: THREE.BackSide
    });

    const atmosphere = new THREE.Mesh(
        atmosphereGeometry,
        atmosphereMaterial
    );

    earthGroup.add(atmosphere);

    const cloudGroup = new THREE.Group();
    earthGroup.add(cloudGroup);

    function criarNuvem(x, y, z, tamanho) {
        const cloudMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });

        const cloud = new THREE.Group();

        for (let i = 0; i < 5; i++) {
            const cloudGeometry = new THREE.SphereGeometry(
                tamanho * (0.45 + Math.random() * 0.3),
                20,
                20
            );

            const cloudPart = new THREE.Mesh(
                cloudGeometry,
                cloudMaterial
            );

            cloudPart.position.set(
                (i - 2) * tamanho * 0.45,
                Math.random() * tamanho * 0.2,
                Math.random() * tamanho * 0.2
            );

            cloud.add(cloudPart);
        }

        cloud.position.set(x, y, z);
        cloudGroup.add(cloud);
    }

    for (let i = 0; i < 18; i++) {
        const angle = Math.random() * Math.PI * 2;
        const height = Math.random() * 1.5 - 0.7;

        criarNuvem(
            Math.cos(angle) * 2.1,
            height,
            Math.sin(angle) * 2.1,
            0.25 + Math.random() * 0.2
        );
    }

    const rainGroup = new THREE.Group();
    scene.add(rainGroup);

    const rainDrops = [];

    function criarChuva() {
        limparChuva();

        for (let i = 0; i < 500; i++) {
            const geometry = new THREE.BufferGeometry();

            const positions = new Float32Array(6);

            const x = (Math.random() - 0.5) * 8;
            const y = Math.random() * 7 - 1;
            const z = (Math.random() - 0.5) * 8;

            positions[0] = x;
            positions[1] = y;
            positions[2] = z;

            positions[3] = x;
            positions[4] = y - 0.25;
            positions[5] = z;

            geometry.setAttribute(
                "position",
                new THREE.BufferAttribute(positions, 3)
            );

            const material = new THREE.LineBasicMaterial({
                color: 0x66baff,
                transparent: true,
                opacity: 0.7
            });

            const drop = new THREE.Line(
                geometry,
                material
            );

            rainGroup.add(drop);
            rainDrops.push(drop);
        }
    }

    function limparChuva() {
        while (rainGroup.children.length > 0) {
            const drop = rainGroup.children[0];

            drop.geometry.dispose();
            drop.material.dispose();

            rainGroup.remove(drop);
        }

        rainDrops.length = 0;
    }

    function atualizarChuva() {
        rainDrops.forEach(drop => {
            const positions = drop.geometry.attributes.position.array;

            positions[1] -= 0.12;
            positions[4] -= 0.12;

            if (positions[1] < -3) {
                const novoY = 5 + Math.random() * 3;

                positions[1] = novoY;
                positions[4] = novoY - 0.25;
            }

            drop.geometry.attributes.position.needsUpdate = true;
        });
    }

    function ativarTempestade() {
        criarChuva();

        scene.background = new THREE.Color(0x070b18);
        sunLight.intensity = 0.5;
        ambientLight.intensity = 0.5;
        atmosphereMaterial.opacity = 0.28;
    }

    function limparTempestade() {
        limparChuva();

        scene.background = null;
        sunLight.intensity = 2;
        ambientLight.intensity = 1.2;
        atmosphereMaterial.opacity = 0.16;
    }

    const rainButton = document.getElementById("rain3DButton");
    const clearButton = document.getElementById("clear3DButton");
    const stormButton = document.getElementById("storm3DButton");

    if (rainButton) {
        rainButton.addEventListener("click", () => {
            criarChuva();
        });
    }

    if (clearButton) {
        clearButton.addEventListener("click", () => {
            limparTempestade();
        });
    }

    if (stormButton) {
        stormButton.addEventListener("click", () => {
            ativarTempestade();
        });
    }

    let mouseX = 0;
    let mouseY = 0;

    container.addEventListener("mousemove", event => {
        const rect = container.getBoundingClientRect();

        mouseX =
            ((event.clientX - rect.left) / rect.width - 0.5) * 2;

        mouseY =
            ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    });

    function animar() {
        requestAnimationFrame(animar);

        earthGroup.rotation.y += 0.0015;

        earthGroup.rotation.x +=
            (mouseY * 0.15 - earthGroup.rotation.x) * 0.03;

        earthGroup.rotation.z +=
            (mouseX * 0.15 - earthGroup.rotation.z) * 0.03;

        cloudGroup.rotation.y += 0.0025;

        atualizarChuva();

        renderer.render(scene, camera);
    }

    window.addEventListener("resize", () => {
        const width = container.clientWidth;
        const height = container.clientHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
    });

    animar();
}

document.addEventListener("DOMContentLoaded", () => {
    iniciarSimulacao3D();
});
