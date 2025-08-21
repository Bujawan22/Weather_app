// === MAP ===
function initMap() {
    var map = L.map('map').setView([-6.200000, 106.816666], 5); // default Indonesia

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    map.on('click', function(e) {
        if (window.lastMarker) {
            map.removeLayer(window.lastMarker);
        }

        var marker = L.marker(e.latlng).addTo(map);
        window.lastMarker = marker;

        marker.bindPopup(`
          <button onclick="pilihKota(${e.latlng.lat}, ${e.latlng.lng})"
            class="px-2 py-1 bg-blue-500 text-white rounded">
            Pilih kota ini
          </button>
        `).openPopup();
    });
}

function pilihKota(lat, lon) {
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`)
        .then(res => res.json())
        .then(location => {
            let namaKota = location.address.county ||
                           location.address.city ||
                           location.address.town ||
                           location.address.village || "Tidak diketahui";

            fetch(`/weather_by_coord?lat=${lat}&lon=${lon}`)
                .then(res => res.json())
                .then(data => {
                    // Update card utama + card Air Conditions
                    document.getElementById("weather-result").innerHTML = `
                        <!-- Card utama -->
                        <div class="p-6 text-white rounded-2xl shadow-2xl"
                             style="background: radial-gradient(circle at top left, #a0d1bf, #1b4fa2);">
                            <h2 class="text-4xl font-bold text-center">${namaKota}</h2>
                            <img src="http://openweathermap.org/img/wn/${data.icon}@4x.png"
                                 alt="icon cuaca"
                                 class="mx-auto w-32 h-32 filter brightness-150 saturate-200 hue-rotate-30">

                            <div class="text-2xl capitalize text-center font-bold">${data.kondisi}</div>
                            <p class="text-l mt-1 text-center">${data.tanggal}</p>
                            <p class="text-5xl text-center font-bold mt-10 mb-8">${data.suhu}°C</p>
                        </div>
                    `;

                    document.querySelector("#air-humidity").textContent = data.kelembapan + "%";
                    document.querySelector("#air-clouds").textContent = data.awan + "%";
                    document.querySelector("#air-rain").textContent = data.hujan + " mm";
                });
        });
}



// === CLOCK + BACKGROUND ===
function updateClock() {
    const now = new Date();

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('clock').textContent = `${hours}:${minutes}:${seconds}`;

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: '2-digit' };
    const dateString = now.toLocaleDateString('en-US', options).toUpperCase();
    document.getElementById('date').textContent = dateString;

    setBackgroundByTime(now.getHours());
}

function setBackgroundByTime() {
    const hour = new Date().getHours();

    // path gambar
    const images = {
        morning: "/static/assets/morning.jpg",
        afternoon: "/static/assets/afternoon.jpg",
        evening: "/static/assets/evening.jpg",
        night: "/static/assets/night.jpg"
    };

    let bgImage;
    if (hour >= 7 && hour < 12) {
        bgImage = images.morning;
    } else if (hour >= 12 && hour < 16) {
        bgImage = images.afternoon;
    } else if (hour >= 16 && hour < 19) {
        bgImage = images.evening;
    } else {
        bgImage = images.night;
    }

    // Ambil elemen
    let bgDiv = document.getElementById("time-bg");
    let bgDivBlur = document.getElementById("time-bg-blur");

    // Layer utama (proporsional tapi agak zoom)
    bgDiv.style.backgroundImage = `url('${bgImage}')`;
    bgDiv.style.backgroundSize = "120%";   // agak zoom, tidak terlalu dekat
    bgDiv.style.backgroundRepeat = "no-repeat";
    bgDiv.style.backgroundPosition = "center";

    // Layer blur (full cover)
    bgDivBlur.style.backgroundImage = `url('${bgImage}')`;
    bgDivBlur.style.backgroundSize = "cover";
    bgDivBlur.style.backgroundRepeat = "no-repeat";
    bgDivBlur.style.backgroundPosition = "center";
}

// === START APP ===
window.onload = function () {
    updateClock();
    setInterval(updateClock, 1000);
    initMap();
};
