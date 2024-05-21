(g => {
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
  key: "AIzaSyA67rdNaV_KiISNaX2wCeHEkR3FOzmKuQI",
  v: "weekly"
});

async function initMap() {
  const { Map } = await google.maps.importLibrary("maps");
  const myLatlng = { lat: -6.701968812934916, lng: 107.33482749094013 };
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 15,
    center: myLatlng,
    mapTypeId: google.maps.MapTypeId.SATELLITE
  });
  let infoWindow = new google.maps.InfoWindow({
    content: "Click the map to get Lat/Lng!",
    position: myLatlng,
  });

  infoWindow.open(map);
  map.addListener("click", (mapsMouseEvent) => {
    infoWindow.close();
    infoWindow = new google.maps.InfoWindow({
      position: mapsMouseEvent.latLng,
    });
    infoWindow.setContent(
      JSON.stringify(mapsMouseEvent.latLng.toJSON(), null, 2)
    );
    infoWindow.open(map);

    const latLng = mapsMouseEvent.latLng.toJSON();
    document.getElementById("lat").textContent = "Latitude: " + latLng.lat;
    document.getElementById("lng").textContent = "Longitude: " + latLng.lng;
    // console.log("Latitude: ", latLng.lat);
    // console.log("Longitude: ", latLng.lng);

    // Save the coordinates to use when the Send button is clicked
    window.selectedCoordinates = latLng;
  });
}

async function sendCoordinates(lat, lng) {
  const endpoint = 'http://127.0.0.1:5000/downloadTif'; // Endpoint URL goes here

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ latitude: lat, longitude: lng })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    // Mengambil blob dari respons
    const blob = await response.blob();

    // Membuat URL objek untuk blob gambar
    const imgUrl = URL.createObjectURL(blob);

    // Menampilkan gambar di halaman web
    const imgElement = document.getElementById('map-image');
    imgElement.src = imgUrl;
    imgElement.style.display = 'block';

  } catch (error) {
    console.error('Error sending coordinates:', error);
  }
}

// Add event listener for the Send button
document.getElementById('sendBtn').addEventListener('click', () => {
  const latLng = window.selectedCoordinates;
  if (latLng) {
    sendCoordinates(latLng.lat, latLng.lng);
  } else {
    console.warn('No coordinates selected.');
  }
});

initMap();