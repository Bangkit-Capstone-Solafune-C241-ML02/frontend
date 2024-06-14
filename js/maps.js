// createInputFields()
(async g => {
  var h, a, k, p = "The Google Maps JavaScript API", c = "google", l = "importLibrary", q = "__ib__", m = document, b = window;
  b = b[c] || (b[c] = {});
  var d = b.maps || (b.maps = {}), r = new Set, e = new URLSearchParams, u = () => h || (h = new Promise(async (f, n) => {
    await (a = m.createElement("script"));
    e.set("libraries", [...r] + "");
    for (k in g) e.set(k.replace(/[A-Z]/g, t => "_" + t[0].toLowerCase()), g[k]);
    e.set("callback", c + ".maps." + q);
    a.src = `https://maps.${c}apis.com/maps/api/js?` + e;
    d[q] = f;
    a.onerror = () => h = n(Error(p + " could not load."));
    a.nonce = m.querySelector("script[nonce]")?.nonce || "";
    m.head.append(a);
  }));
  d[l] ? console.warn(p + " only loads once. Ignoring:", g) : d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n))
})({
  key: "AIzaSyA67rdNaV_KiISNaX2wCeHEkR3FOzmKuQI", // Place your Google Maps API key here
  v: "weekly",
  libraries: 'places'
});

let map;
let marker;

async function initMap() {
  const { Map } = await google.maps.importLibrary("maps");
  const { SearchBox } = await google.maps.importLibrary("places");
  const myLatlng = { lat: -6.701968812934916, lng: 107.33482749094013 };
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 15,
    center: myLatlng,
    mapTypeId: google.maps.MapTypeId.SATELLITE
  });
  let infoWindow = new google.maps.InfoWindow({
    content: "Click the map to get Lat/Lng!",
    position: myLatlng,
  });

  infoWindow.open(map);

  const input = document.getElementById("pac-input");
  const searchBox = new google.maps.places.SearchBox(input);

  map.addListener("bounds_changed", () => {
    searchBox.setBounds(map.getBounds());
  });

  searchBox.addListener("places_changed", () => {
    const places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    let bounds = new google.maps.LatLngBounds();
    places.forEach((place) => {
      if (!place.geometry || !place.geometry.location) {
        console.log("Returned place contains no geometry");
        return;
      }

      if (!marker) {
        marker = new google.maps.Marker({
          map,
          title: place.name,
          position: place.geometry.location,
        });
      } else {
        marker.setPosition(place.geometry.location);
      }

      const latLng = place.geometry.location.toJSON();
      document.getElementById("lat").textContent = "Latitude: " + latLng.lat;
      document.getElementById("lng").textContent = "Longitude: " + latLng.lng;

      window.selectedCoordinates = latLng;

      if (place.geometry.viewport) {
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });

  map.addListener("click", (mapsMouseEvent) => {
    infoWindow.close();
    infoWindow = new google.maps.InfoWindow({
      position: mapsMouseEvent.latLng,
    });
    infoWindow.setContent(
      JSON.stringify(mapsMouseEvent.latLng.toJSON(), null, 2)
    );
    // infoWindow.open(map);

    const latLng = mapsMouseEvent.latLng.toJSON();
    document.getElementById("lat").textContent = "Latitude: " + latLng.lat;
    document.getElementById("lng").textContent = "Longitude: " + latLng.lng;

    window.selectedCoordinates = latLng;

    if (!marker) {
      marker = new google.maps.Marker({
        map,
        position: mapsMouseEvent.latLng,
      });
    } else {
      marker.setPosition(mapsMouseEvent.latLng);
    }
  });
}

document.getElementById('sendBtn').addEventListener('click', async () => {
  const sendBtn = document.getElementById('sendBtn');
  const sendText = document.getElementById('sendText');
  const sendSpinner = document.getElementById('sendSpinner');
  const latLng = window.selectedCoordinates;

  sendBtn.disabled = true;
  sendText.textContent = "Loading...";
  sendSpinner.style.display = "inline-block";

  if (latLng) {
      fileError.style.display = 'none';
      await sendCoordinates(latLng.lat, latLng.lng);
      createInputFields();
  } else {
      console.warn('No coordinates selected.');
      const fileError = document.getElementById('fileError');
      fileError.style.display = 'block';
  }

  // Reset button
  sendText.textContent = "Send";
  sendSpinner.style.display = "none";
  sendBtn.disabled = false;
});


function createInputFields() {
  document.getElementById('SelectBand').style.display = 'block';
  const container = document.getElementById('dynamicFields');
  container.innerHTML = '';

  const bandOptions = [
    'B1 (Aerosols)',
    'B2 (Blue)',
    'B3 (Green)',
    'B4 (Red)',
    'B5 (Red Edge 1)',
    'B6 (Red Edge 2)',
    'B7 (Red Edge 3)',
    'B8 (NIR)',
    'B8A (Red Edge 4)',
    'B9 (Water vapor)',
    'B11 (SWIR 1)',
    'B12 (SWIR 2)',
  ];

  const defaultValues = ['B1 (Aerosols)', 'B2 (Blue)', 'B3 (Green)'];

  for (let i = 1; i <= 3; i++) {
    const select = document.createElement('select');
    select.classList.add('form-select', 'my-2');
    select.id = `dropdownField${i}`;

    bandOptions.forEach(optionText => {
      const option = document.createElement('option');
      option.value = optionText;
      option.textContent = optionText;
      if (optionText === defaultValues[i - 1]) {
        option.selected = true;
      }
      select.appendChild(option);
    });

    container.appendChild(select);
  }

  // Create Convert Button
  const convertButtonContainer = document.getElementById('convertButtonContainer');
  convertButtonContainer.innerHTML = ''; // Clear previous button if any

  const convertBtn = document.createElement('button');
  convertBtn.id = 'convertBtn';
  convertBtn.classList.add('btn', 'btn-primary', 'my-2');
  convertBtn.innerHTML = '<span id="convertText">Convert</span><span id="convertSpinner" class="spinner-border spinner-border-sm" role="status" aria-hidden="true" style="display: none;"></span> <i class="bi bi-arrow-repeat" id="convertIcon"></i>';

  convertBtn.addEventListener('click', async () => {
    const convertText = document.getElementById('convertText');
    const convertSpinner = document.getElementById('convertSpinner');
    const convertIcon = document.getElementById('convertIcon');

    convertBtn.disabled = true;
    convertText.textContent = "Loading...";
    convertIcon.style.display = "none";
    convertSpinner.style.display = "inline-block";

    const selectedValues = [];
    for (let i = 1; i <= 3; i++) {
      const dropdown = document.getElementById(`dropdownField${i}`);
      selectedValues.push(dropdown.value);
    }

    await sendDropdownValues(mapDropdownValues(selectedValues));

    // Reset button
    convertText.textContent = "Convert";
    convertSpinner.style.display = "none";
    convertIcon.style.display = "inline-block";
    convertBtn.disabled = false;
  });

  convertButtonContainer.appendChild(convertBtn);
}

async function sendDropdownValues(values) {
  const config = await loadConfig();
  const endpoint = `${config.BASE_URL}${config.ENDPOINTS.CONVERT_SENTINEL}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values: values, uid: getUID() })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const blob = await response.blob();
    const imgUrl = URL.createObjectURL(blob);

    const imgElement = document.getElementById('map-image');
    imgElement.src = imgUrl;
    imgElement.style.display = 'block';
  } catch (error) {
    console.error('Error sending dropdown values:', error);
  }
}


function mapDropdownValues(values) {
  const mapping = {
    'B1 (Aerosols)': 0,
    'B2 (Blue)': 1,
    'B3 (Green)': 2,
    'B4 (Red)': 3,
    'B5 (Red Edge 1)': 4,
    'B6 (Red Edge 2)': 5,
    'B7 (Red Edge 3)': 6,
    'B8 (NIR)': 7,
    'B8A (Red Edge 4)': 8,
    'B9 (Water vapor)': 9,
    'B11 (SWIR 1)': 10,
    'B12 (SWIR 2)': 11
};

  return values.map(value => mapping[value]);
}

// Fungsi umum untuk mengubah posisi peta
function updateMapPosition(lat, lng) {
  const newLatLng = new google.maps.LatLng(lat, lng);
  map.setCenter(newLatLng);
  map.setZoom(15);

  if (!marker) {
    marker = new google.maps.Marker({
      map,
      position: newLatLng,
    });
  } else {
    marker.setPosition(newLatLng);
  }

  const infoWindow = new google.maps.InfoWindow({
    position: newLatLng,
    content: JSON.stringify({ lat, lng }, null, 2)
  });
  // infoWindow.open(map);

  document.getElementById("lat").textContent = "Latitude: " + lat;
  document.getElementById("lng").textContent = "Longitude: " + lng;

  window.selectedCoordinates = { lat, lng };
}

document.addEventListener('DOMContentLoaded', () => {
  fetch('./json/coordinates.json')
    .then(response => response.json())
    .then(data => {
      const items = data.items;
      const dropdownMenu = document.querySelector('.dropdown-menu');
      const dropdownButton = document.getElementById('dropdownMenuButton');
      dropdownMenu.innerHTML = '';

      items.forEach(item => {
        const menuItem = document.createElement('a');
        menuItem.className = 'dropdown-item';
        menuItem.id = item.id;
        menuItem.dataset.lat = item.lat;
        menuItem.dataset.lng = item.lng;
        menuItem.textContent = item.text;
        menuItem.addEventListener('click', () => {
          updateMapPosition(item.lat, item.lng, item.text);
          dropdownButton.textContent = item.text; // Ubah teks tombol dropdown
        });
        const listItem = document.createElement('li');
        listItem.appendChild(menuItem);
        dropdownMenu.appendChild(listItem);
      });
    })
    .catch(error => console.error('Error loading coordinates:', error));
});


// Fungsi untuk mengirim koordinat ke server
async function sendCoordinates(lat, lng) {
  const config = await loadConfig();
  const endpoint_download = `${config.BASE_URL}${config.ENDPOINTS.DOWNLOAD}`;
  const endpoint_mask = `${config.BASE_URL}${config.ENDPOINTS.MASK_SENTINEL}`;
  const endpoint_painting = `${config.BASE_URL}${config.ENDPOINTS.PAINTING_SENTINEL}`;
  const endpoint_statistic = `${config.BASE_URL}${config.ENDPOINTS.STATISTIC}`;

  try {
    // Request download
      const response_download = await fetch(endpoint_download, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ latitude: lat, longitude: lng, uid: getUID() })
      });

      if (!response_download.ok) {
          throw new Error('Network response was not ok');
      }

      const blob_download = await response_download.blob();
      const imgUrl_download = URL.createObjectURL(blob_download);

      sendText.textContent = "Detecting...";

      // Request mask
      const response_mask = await fetch(endpoint_mask, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({uid: getUID() })
      });

      if (!response_mask.ok) {
          throw new Error('Network response was not ok');
      }

      const blob_mask = await response_mask.blob();
      const imgUrl_mask = URL.createObjectURL(blob_mask);
      
      // Request painting
      const response_painting= await fetch(endpoint_painting, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
      },
         body: JSON.stringify({uid: getUID() })
      });

      if (!response_painting.ok) {
          throw new Error('Network response was not ok');
      }

      const blob_painting = await response_painting.blob();
      const imgUrl_painting = URL.createObjectURL(blob_painting);

      // Request statistic
      const response_statistic = await fetch(endpoint_statistic, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
      },
         body: JSON.stringify({uid: getUID() })
      });

      if (!response_statistic.ok) {
          throw new Error('Network response was not ok');
      }

      // Mengambil data statistik
      const data = await response_statistic.json();
      const { pixel, area, power } = data;

      const imgElement = document.getElementById('map-image');
      imgElement.src = imgUrl_download;
      imgElement.style.display = 'block';

      const imgElementMask = document.getElementById('mask-image');
      imgElementMask.src = imgUrl_mask;
      imgElementMask.style.display = 'block'

      const imgElementPainting = document.getElementById('painting-image');
      imgElementPainting.src = imgUrl_painting;
      imgElementPainting.style.display = 'block'

      showDiv();
      forecast(lat,lng);
      statistics(pixel, area, power);
      document.getElementById('dynamics').style.display = 'block';
      document.getElementById('statistics').style.display = 'block';

  } catch (error) {
      console.error('Error sending coordinates:', error);
  }
}

// Fungsi untuk memuat konfigurasi dari file config.json
async function loadConfig() {
  const response = await fetch('./json/config.json');
  const config = await response.json();
  return config;
}

// Fungsi untuk menampilkan modal
function setupModal(imageId, modalId, modalImgId, captionId) {
  var modal = document.getElementById(modalId);
  var img = document.getElementById(imageId);
  var modalImg = document.getElementById(modalImgId);
  var captionText = document.getElementById(captionId);

  img.onclick = function(){
    modal.style.display = "block";
    modalImg.src = this.src;
    captionText.innerHTML = this.alt;
  }

  var span = modal.getElementsByClassName("close")[0];
  span.onclick = function() { 
    modal.style.display = "none";
  }
}

// Fungsi untuk menampilkan modal opening
document.addEventListener('DOMContentLoaded', () => {
  const modalOpening = new bootstrap.Modal(document.getElementById('modalOpening'));
  const lastModalShownTime = localStorage.getItem('lastModalShownTime');
  const currentTime = new Date().getTime();

  // Check if modal should be shown based on time and storage
  if (!lastModalShownTime || currentTime - parseInt(lastModalShownTime) > 5*60*1000) {
    modalOpening.show();
    localStorage.setItem('lastModalShownTime', currentTime.toString());
  }

  // Close the modal
  document.querySelector('[data-bs-dismiss="modal"]').addEventListener('click', () => {
    modalOpening.hide();
  });
});


// Fungsi untuk menyembunyikan 
function hideDiv() {
    var div = document.getElementById("image-container");
    div.style.display = "none";
}

function showDiv() {
    var div = document.getElementById("image-container");
    div.style.display = "flex"; // Revert to default 'block' if originalDisplayStyle is undefined
}


async function forecast(lat, lon) {
  const apiKey = 'd2f50901f43c3edecd250f380e7ea6a0';
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&cnt=32`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    const noonForecasts = data.list.filter(item => item.dt_txt.endsWith("12:00:00"));

    // Update nama kota
    const locationNameElement = document.getElementById('locationName');
    if (locationNameElement) {
      locationNameElement.innerHTML = `<strong>Weather Forecast for ${data.city.name}</strong>`;
    }

    // Container untuk menambahkan elemen cuaca
    const forecast = document.getElementById('forecast');
    const forecastBox = document.getElementById('box');
    
    // Kosongkan container sebelumnya
    forecast.style.display = 'block';
    forecastBox.innerHTML = '';

    // Analisis optimal days
    const optimalDaysCount = analyzeSolarPanelOptimality(noonForecasts);
    const optimalDays = document.getElementById('optimalDays');

    if (optimalDays) {
      optimalDays.innerHTML = `<strong>Optimal Days: ${optimalDaysCount}</strong>`;
    }

    noonForecasts.forEach((forecast, index) => {
      // Format tanggal
      const date = new Date(forecast.dt_txt);
      const options = { weekday: 'short', month: 'short', day: 'numeric' };
      const formattedDate = date.toLocaleDateString('en-US', options);

      // URL ikon
      const iconUrl = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`;

      // Buat elemen untuk setiap hari
      const dayDiv = document.createElement('div');
      dayDiv.classList.add('flex-column');
      dayDiv.id = `day${index + 1}`;
      
      // Isi elemen dengan data cuaca
      dayDiv.innerHTML = `
        <p class="small"><strong>${formattedDate}</strong></p>
        <img src="${iconUrl}" alt="Weather Icon" class="mb-3" style="width: 50px; height: 50px;">
        <p class="mb-0"><strong>${forecast.weather[0].description}</strong></p>
        <p class="mb-0" style="color:#B9B9B9;font-size:10px;">cloud coverage</p>
        <p class="mb-0"><strong>${forecast.clouds.all}%</strong></p>
      `;

      // Tambahkan elemen ke dalam container
      forecastBox.appendChild(dayDiv);
    });

  } catch (error) {
    console.error('Ada masalah dengan permintaan fetch:', error);
  }
}

function analyzeSolarPanelOptimality(noonForecasts) {
  let optimalDays = 0;

  noonForecasts.forEach(forecast => {
    const description = forecast.weather[0].description;
    const cloudCoverage = forecast.clouds.all;
    const rainVolume = forecast.rain ? forecast.rain['3h'] : 0;
    const temperature = forecast.main.temp; // Suhu dalam Celsius

    console.log(`Date: ${forecast.dt_txt}`);
    console.log(`Description: ${description}`);
    console.log(`Cloud Coverage: ${cloudCoverage}%`);
    console.log(`Rain Volume: ${rainVolume}mm`);
    console.log(`Temperature: ${temperature.toFixed(2)}°C`);

    // Tentukan optimalitas
    if (
      (description.includes('clear') || description.includes('few clouds') || description.includes('scattered clouds')) &&
      cloudCoverage < 50 &&
      rainVolume === 0 &&
      temperature >= 10 && temperature <= 40 // Kisaran suhu optimal
    ) {
      console.log('Condition is optimal for solar panels.');
      optimalDays++;
    } else {
      console.log('Condition is not optimal for solar panels.');
    }
    console.log('---');
  });

  console.log(`Total optimal days: ${optimalDays}`);
  return optimalDays;
}

function statistics(pixel, area, power) {
  const statistics = document.getElementById('statistics');
  statistics.style.display = 'block';

  document.getElementById('pixel').textContent = `Pixel: ${pixel}`;
  document.getElementById('area').textContent = `Area: ${area} m²`;
  // document.getElementById('watt').textContent = `Power: ${power} MW`;

}

// Fungsi untuk mendapatkan UID
function getUID() {
  return localStorage.getItem('userUID') || 'defaultUID';
}

// Menyimpan UID di Frontend
document.addEventListener('DOMContentLoaded', () => {
  if (!localStorage.getItem('userUID')) {
    const uid = generateUID();  // Fungsi untuk membuat UID
    localStorage.setItem('userUID', uid);
  }
});

// Fungsi sederhana untuk membuat UID
function generateUID() {
  return 'uid-' + Math.random().toString(36).substr(2, 16);
}

setupModal("map-image", "modalSentinel", "img01", "caption");
setupModal("mask-image", "modalMask", "img02", "caption");
setupModal("painting-image", "modalPainting", "img03", "caption");
hideDiv();
initMap();
