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
      console.log("Latitude: ", latLng.lat);
      console.log("Longitude: ", latLng.lng);
    });
  }
  
  initMap();
  