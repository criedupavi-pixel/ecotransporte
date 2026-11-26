var map = L.map('main_map').setView([14.0818, -87.2068], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

if (typeof vehiculosData !== 'undefined' && vehiculosData.length > 0) {
  vehiculosData.forEach(function(v) {
    if (v.ubicacion && v.ubicacion.length === 2) {
      L.marker(v.ubicacion)
        .addTo(map)
        .bindPopup('<b>Vehiculo #' + v.code + '</b><br>' + v.modelo + ' - ' + v.color);
    }
  });
} else {
  L.marker([14.0818, -87.2068])
    .addTo(map)
    .bindPopup('EcoTransporte - Tegucigalpa');
}
