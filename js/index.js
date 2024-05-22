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
  key: "AIzaSyA67rdNaV_KiISNaX2wCeHEkR3FOzmKuQI",
  v: "weekly",
  libraries: 'places'
});

async function initMap() {
  const { Map } = await google.maps.importLibrary("maps");
  const { SearchBox } = await google.maps.importLibrary("places");
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

      new google.maps.Marker({
        map,
        title: place.name,
        position: place.geometry.location,
      });

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
    infoWindow.open(map);

    const latLng = mapsMouseEvent.latLng.toJSON();
    document.getElementById("lat").textContent = "Latitude: " + latLng.lat;
    document.getElementById("lng").textContent = "Longitude: " + latLng.lng;

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

    const blob = await response.blob();
    const imgUrl = URL.createObjectURL(blob);

    const imgElement = document.getElementById('map-image');
    imgElement.src = imgUrl;
    imgElement.style.display = 'block';

  } catch (error) {
    console.error('Error sending coordinates:', error);
  }
}

document.getElementById('sendBtn').addEventListener('click', () => {
  const latLng = window.selectedCoordinates;
  if (latLng) {
    sendCoordinates(latLng.lat, latLng.lng);
  } else {
    console.warn('No coordinates selected.');
  }
});

var modal = document.getElementById("myModal");
var img = document.getElementById("map-image");
var modalImg = document.getElementById("img01");
var captionText = document.getElementById("caption");
img.onclick = function(){
  modal.style.display = "block";
  modalImg.src = this.src;
  captionText.innerHTML = this.alt;
}

var span = document.getElementsByClassName("close")[0];
span.onclick = function() { 
  modal.style.display = "none";
}

initMap();
