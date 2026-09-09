/* =====================================================
   INICIALIZAÇÃO
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const locationBtn = document.getElementById("locationBtn");

    if (!locationBtn) {
        console.error("Botão locationBtn não encontrado no HTML.");
        return;
    }

    locationBtn.addEventListener("click", getLocation);

});


/* =====================================================
   GET LOCATION
===================================================== */

function getLocation() {

    const status = document.getElementById("connectionStatus");

    if (!status) {
        console.error("Elemento connectionStatus não encontrado.");
        return;
    }

    status.textContent = "● Obtendo localização...";


    if (!navigator.geolocation) {

        status.textContent =
            "● Geolocalização não suportada";

        return;
    }


    navigator.geolocation.getCurrentPosition(

        // ==========================================
        // SUCESSO
        // ==========================================

        async (position) => {

            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            console.log("Latitude:", latitude);
            console.log("Longitude:", longitude);


         
            const coordinates =
                document.getElementById("coordinates");

            if (coordinates) {

                coordinates.textContent =
                    `Latitude: ${latitude.toFixed(5)} | ` +
                    `Longitude: ${longitude.toFixed(5)}`;

            }


            // ==========================================
            // BUSCAR CIDADE
            // ==========================================

            await getCityName(
                latitude,
                longitude
            );


            // ==========================================
            // BUSCAR CLIMA
            // ==========================================

            if (typeof getWeather === "function") {

                await getWeather(
                    latitude,
                    longitude
                );

            } else {

                console.error(
                    "A função getWeather() não existe."
                );

                status.textContent =
                    "● Localização encontrada, mas clima não carregado";

                return;
            }


            status.textContent =
                "● Dados atualizados";

        },


        // ==========================================
        // ERRO
        // ==========================================

        (error) => {

            console.error(
                "Erro de localização:",
                error
            );


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


        // ==========================================
        // CONFIGURAÇÕES
        // ==========================================

        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 300000
        }

    );

}


/* =====================================================
   DESCOBRIR CIDADE
===================================================== */

async function getCityName(latitude, longitude) {

    const cityElement =
        document.getElementById("city");


    if (!cityElement) {

        console.error(
            "Elemento #city não encontrado."
        );

        return;
    }


    try {

        const url =
            `https://nominatim.openstreetmap.org/reverse` +
            `?format=json` +
            `&lat=${latitude}` +
            `&lon=${longitude}` +
            `&zoom=10` +
            `&addressdetails=1`;


        const response =
            await fetch(url, {
                headers: {
                    "Accept-Language": "pt-BR"
                }
            });


        if (!response.ok) {

            throw new Error(
                `Erro HTTP: ${response.status}`
            );

        }


        const data =
            await response.json();


        console.log(
            "Local encontrado:",
            data
        );


        const address =
            data.address || {};


        // ==========================================
        // ENCONTRAR CIDADE
        // ==========================================

        const city =
            address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            address.county ||
            "Local desconhecido";


        const state =
            address.state || "";


        const country =
            address.country || "";


        // ==========================================
        // MOSTRAR CIDADE
        // ==========================================

        cityElement.textContent = city;


        // Guarda informações
        cityElement.dataset.state = state;
        cityElement.dataset.country = country;


        console.log(
            `Local: ${city}, ${state}, ${country}`
        );

    }


    catch (error) {

        console.error(
            "Erro no reverse geocoding:",
            error
        );


        cityElement.textContent =
            "Localização encontrada";

    }

}
