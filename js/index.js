let photos_lyr
let legendControl

document.addEventListener('DOMContentLoaded', function () {
  loadPhotoData()
})

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    document.querySelectorAll('.zoomed').forEach((x) => { x.remove() })
  }
})

var southWest = new L.LatLng(42.39, -76.9),
  northEast = new L.LatLng(42.69, -76.6),
  bounds = new L.LatLngBounds(southWest, northEast);

var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  }),
  Esri_WorldTopoMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
  });

let map

if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
  map = L.map('map', {
    dragging: false,
    scrollWheelZoom: false,
    tap: false,
    zoomControl: false,
  })
  // only zoom to full extent if there is no coords in the URL hash
  if (! location.hash) {
    map.fitBounds(bounds)
  }
} else {
  map = L.map('map', {
    dragging: true,
    tap: true,
    zoomControl: false,
  }).fitBounds(bounds)
}

var zoomHome = L.Control.zoomHome({zoomHomeTitle:"Zoom to full map extent"})
map.addControl(zoomHome)

var hash = new L.Hash(map);

var Esri_WorldTopoMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
});
Esri_WorldTopoMap.addTo(map);
map.addLayer(Esri_WorldTopoMap);



var title = '<div class="info-head"><h1>Backbone Ridge History Group</h1><h2>Interactive Map of Military Lots</h2>'
var default_text = '<div id = "info">' + title + '<div id = "info-body"><p>The New Military Tract is a group of 28 towns in central New York State that were laid out and then surveyed into one-hundred 600-acre lots from 1789-91. The military lots were used to compensate New York soldiers for their service during the Revolutionary War. The lots were awarded by random ballots, one lot for each private and multiple lots for officers. There were various set-asides and reservations.</p><p>This interactive map will allow you to follow the original survey lot lines of Ovid and Hector, the towns encompassing the Backbone Ridge, located between Seneca and Cayuga Lakes. Eventually you will have access to views of the original manuscript, the transcription of each page and other information. The current edition of the map shows the original ballotee—the soldier who was awarded the lot – and identifies the person who actually settled the lot. It also provides the surveyors’ descriptions of the forest landscape along the survey lines.</p><p>The transcription of the surveyors’ notebooks and the map planning were done by a group of volunteers as part of the Backbone Ridge History Group (BRHG), with the generous support of the Nelson B. Delavan Foundation. The BRHG is committed to preserving the history of the Backbone Ridge.</p><hr class="info-body-break"><p>We dedicate this project to the man who envisioned this interactive map, Allan Buddle. Allan passed away before we were able to share this project with the public but he was with us as we began the adventure of transcribing the field books.</p><p>We hope you enjoy using the map and might even take it along as you walk the trails that follow some of the original lot lines. Imagine, as Allan did, the old homesteads, the lowing of cattle and the serene beauty of the Backbone Ridge.</p></div></div></div>'
var default_layer_info = '<div id = "info-body"><p>Click a feature on the map</p></div>'

document.getElementById('home').innerHTML = default_text;
document.getElementById('layer_info').innerHTML = title + default_layer_info;

// Switch to layer info pane in sidebar if a layer is selected and the home pane is active
function toggleInfoTab() {
  var homeTab = document.getElementById('home-tab');
  var infoTab = document.getElementById('info-tab');
  var homePane = document.getElementById('home_pane');
  var infoPane = document.getElementById('layer_info_pane');
  if (homeTab.classList.contains('active')) {
    homeTab.classList.remove('active');
    infoTab.classList.add('active');
    homePane.classList.remove('active');
    infoPane.classList.add('active');
  }
}

// Open sidebar if it is collapsed when a layer is selected
function openSidebar() {
  var sidebar = document.getElementById('sidebar');
  var infoTab = document.getElementById('info-tab');
  var infoPane = document.getElementById('layer_info_pane');
  var homeTab = document.getElementById('home-tab');
  var homePane = document.getElementById('home_pane');

  if (sidebar.classList.contains('collapsed') && window.matchMedia("(min-width: 756px)").matches) {
    sidebar.classList.remove('collapsed');
    infoTab.classList.add('active');
    infoPane.classList.add('active');
    homeTab.classList.remove('active');
    homePane.classList.remove('active');
    map.panBy([250, 0]);
  } else if (sidebar.classList.contains('collapsed') && window.matchMedia("(max-width: 756px)").matches) {
    sidebar.classList.remove('collapsed');
    infoTab.classList.add('active');
    infoPane.classList.add('active');
    homeTab.classList.remove('active');
    homePane.classList.remove('active');
    map.panBy([0, 0]);
  }
}


var sidebar = L.control.sidebar('sidebar', {
  position: 'left'
}).addTo(map);

function loadPhotoData() {
  // URL for CSV version of the Google Spreadsheet "Backbone Ridge Photos"
  // which can be edited at https://docs.google.com/spreadsheets/d/1ShUDiRpW_t_C6RUwkKxcUR4WKdkfWqF0mEbiWhCGDX0/edit?gid=0#gid=0
  url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQSxhWmMdAHDp5x0TeXNHuuWT0EYbC7V8XViMTcciF8eJTgjQIwWnjEOsx9pzIw5MHoammseMAHyebU/pub?gid=0&single=true&output=csv'
  fetch(url)
    .then((response) => {
      if (response.ok) response.text().then((csvtext) => {
        // L.geoCsv won't see the last record without a final newline
        csvtext += '\n'
        // remove any existing photos from map
        if (photos_lyr) {
          map.removeLayer(photos_lyr)
        }
        photos_lyr = L.geoCsv(csvtext, {
          firstLineTitles: true,
          fieldSeparator: ',',
          latitudeTitle: 'latitude',
          longitudeTitle: 'longitude',
          onEachFeature: function(feature, layer) {
            layer.on({
              click: html_photo
            })
          },
          pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, style_photo(feature))
              .bindTooltip('Photo: ' + (feature.properties.title || '(no caption)'))
          }
        })
        map.addLayer(photos_lyr)
        addLegend()
      })
    })
}

function update_obs(feature, layer) {
  layer.on({
    mouseout: resetHighlight,
    mouseover: highlightFeature,
    click: html_obs
  });
}

function update_photo(feature, layer) {
  layer.on({
    click: html_photo
  })
}

function update_lots(feature, layer) {
  layer.on({
    mouseout: resetHighlight,
    mouseover: highlightFeature,
    click: html_lots
  });

  layer.bindTooltip(
    (feature.properties.township_name[0] + feature.properties.lot_number), {
      permanent: true,
      direction: 'center',
      className: 'lot_label'
    }
  );
}


function renderData(v, msg='<i>No data</i>') {
  // if v is null, undefined, empty, or 'NA'
  // returns 'No data' (or an optional msg)
  // otherwise returns v unchanged
  if (v === null || v === undefined || v === '' || v === 'NA') {
    return msg
  }
  else {
    return v
  }
}

function zoomImage(e) {
  let img = e.target
  let zoomed = document.createElement('img')
  zoomed.setAttribute('src', img.getAttribute('src'))
  zoomed.setAttribute('class', 'zoomed')
  zoomed.setAttribute('onclick', 'this.remove()')
  document.querySelector('body').append(zoomed)
}

function html_photo(e) {
  // remove any existing zoom photo
  let zoomed = document.querySelector('.zoomed')
  if (zoomed) {
    zoomed.remove()
  }
  let layer = e.target
  layer.bringToBack() // to allow any overlapping features to be clicked next
  let coords = layer.feature.geometry.coordinates
  let p = layer.feature.properties
  //let url = `../photos/${p.town}/${p.filename}`
  let url = `https://raw.githubusercontent.com/backbone-ridge/photos/main/${p.town}/${p.filename}`
  let popupContent = `
    <div id="info-body">
      <h3>Photo</h3>
      <figure>
        <figcaption>${p.title || '(no caption)'}</figcaption>
        <img class="photo" onclick="zoomImage(event)" src="${url}">
        <p>(click image to enlarge)<p>
        <div>File: ${p.town}/${p.filename}</div>
        <div>Coordinates: ${coords[0]}, ${coords[1]}</div>
      </figure>
    </div>`
  document.getElementById('layer_info').innerHTML = popupContent;
  toggleInfoTab();
  openSidebar();
}

function html_obs(e) {
  var layer = e.target;
  
  // allow any overlapping features to be clicked next
  layer.bringToBack()

  // make the clicked point larger, and reset all the other markers
  //obs_lyr.resetStyle()
  layer.setStyle(style_obs_click())

  let town = layer.feature.properties['township']
  var page2digit = ('' + layer.feature.properties['page']).padStart(2,'0')

  var popupContent = `<div id="info-body"><div id="info-cnty-name">
    <h3>Surveyor&apos;s observation point</h3></div>
    <table id = "main">
    <tr>
      <td scope="row">id</td>
      <th>${renderData(layer.feature.properties['id'])}</th>
    </tr>
    <tr>
      <td scope="row">Township</td>
      <th>${renderData(layer.feature.properties['township'])}</th>
    </tr>
    <tr>
      <td scope="row">Lot No</td>
      <th>${renderData(layer.feature.properties['lot'])}</th>
    </tr>
    <tr>
      <td scope="row">Starting Corner</td>
      <th>${renderData(layer.feature.properties['start_corner'])}</th>
    </tr>
    <tr>
      <td scope="row">Direction</td>
      <th>${renderData(layer.feature.properties['direction'])}</th>
    </tr>
    <tr>
      <td scope="row">Chains</td>
      <th>${renderData(layer.feature.properties['chains'])}</th>
    </tr>
    <tr>
      <td scope="row">Links</td>
      <th>${renderData(layer.feature.properties['links'], 0)}</th>
    </tr>
    <tr>
      <td scope="row">Text</td>
      <th>${renderData(layer.feature.properties['observation'])}</th>
    </tr>
    </table>
    <div class='journalLink'>
      <a target='_blank' href="https://backbone-ridge.github.io/military-lots/town/${town.toLowerCase()}/transcription/page-${page2digit}">${town} Journal page ${renderData(layer.feature.properties['page'])}
      <img class='thumb' src='town/${town.toLowerCase()}/image/${town.toLowerCase()}-page-${page2digit}.jpg'</a>
    </div>
    </tr>
    </div>`

  document.getElementById('layer_info').innerHTML = title + popupContent;

  toggleInfoTab();
  openSidebar();

}

function html_lots(e) {
  var layer = e.target

  var popupContent = `
    <div id = "info-body">
      <div id = "info-cnty-name">
        <h3>Military Lot</h3>
      </div>
      <table id = "main">
      <tr>
          <td scope="row">Township #</td>
          <th>${renderData(layer.feature.properties['township_number'])}</th>
      </tr>
      <tr>
          <td scope="row">Township Name</td>
          <th>${renderData(layer.feature.properties['township_name'])}</th>
      </tr>
      <tr>
          <td scope="row">Lot #</td>
          <th>${renderData(layer.feature.properties['lot_number'])}</th>
      </tr>
      <tr>
          <td scope="row">Soldier Granted Patent</td>
          <th>${renderData(layer.feature.properties['soldier_granted'])}</th>
      </tr>
      <tr>
          <td scope="row">Patent Delivered To</td>
          <th>${renderData(layer.feature.properties['patent_to'])}</th>
      </tr>
      </table>
    </div>`

  document.getElementById('layer_info').innerHTML = title + popupContent;

  toggleInfoTab();
  openSidebar();
}

function highlightFeature(e) {
// Highlight, info-related
  var layer = e.target;

  if (layer.options.pane==='pane_obs') {
    layer.setStyle(style_obs_hover());
  
    if (!L.Browser.ie && !L.Browser.opera) {
      layer.bringToFront();
    }  
  }
  else if (layer.options.pane==='pane_lots') {
    layer.setStyle(style_lots_hover());  
  }
}


function resetHighlight(e) {
  for (i in e.target._eventParents) {
    e.target._eventParents[i].resetStyle(e.target);
  }
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    //click: getInfo
  });
}

function style_obs() {
  return {
    pane: 'pane_obs',
    radius: 5,
    opacity: 1,
    color: '#ccccff',
    weight: 1,
    fill: true,
    fillOpacity: 1,
    fillColor: '#0044cc'
  }
}

function style_obs_hover() {
  return {
    weight: 8,
    color: '#0044cc'
  }
}

function style_obs_click() {
  return {
    weight: 12
  }
}

function style_photo() {
  return {
    pane: 'pane_obs',
    radius: 6,
    opacity: 1,
    color: '#000000',
    weight: 1,
    fill: true,
    fillOpacity: 1,
    fillColor: '#00cc00'
  }
}

function style_lots() {
  return {
    opacity: 1,
    color: '#ff6644',
    lineCap: 'butt',
    lineJoin: 'miter',
    weight: 2,
    fill: true,
    fillOpacity: 0.1,
    fillColor: '#ff6644'
  }
}

function style_lots_hover() {
  return {
    weight: 5
  }
}

// change min and max zoom levels and disable scrollwheel when map and sidebar are stacked
function zoomControls(x) {
  if (x.matches) {
    //map.setView([42.6007, -76.7335], 11);
    map.options.minZoom = 11;
    map.options.maxZoom = 18;
    //map.scrollWheelZoom.disable();
  } else {
    //map.setView([42.6107, -76.6735], 12);
    map.options.minZoom = 11;
    map.options.maxZoom = 18;
    map.scrollWheelZoom.enable();
  }
}

var x = window.matchMedia("(max-width: 756px)")
zoomControls(x)
x.addListener(zoomControls)



// Create map panes
map.createPane('pane_lots');
map.getPane('pane_lots').style.zIndex = 400;
map.getPane('pane_lots').style['mix-blend-mode'] = 'normal';

map.createPane('pane_obs');
map.getPane('pane_obs').style.zIndex = 403;
map.getPane('pane_obs').style['mix-blend-mode'] = 'normal';



var obs_lyr = new L.GeoJSON.AJAX('data/observations.geojson', {
  pane: 'pane_obs',
  onEachFeature: update_obs,
  pointToLayer: function(feature, latlng) {
    var context = {
      feature: feature,
      variables: {}
    };
    return L.circleMarker(latlng, style_obs(feature));
  }
});

var lots_lyr = new L.GeoJSON.AJAX('data/lots.geojson', {
  pane: 'pane_lots',
  onEachFeature: update_lots,
  style: style_lots
});





// Add layers
map.addLayer(obs_lyr)
map.addLayer(lots_lyr)


var baseMaps = {
  "Esri World Imagery": Esri_WorldImagery,
  "Esri World TopoMap": Esri_WorldTopoMap
};
let controls = L.control.layers(baseMaps, null, {
  collapsed: false
})
controls.addTo(map);

function addLegend() {
  // remove any existing legend
  if (legendControl) {
    map.removeControl(legendControl)
  }
  legendControl = L.control.Legend({
    position: "topright",
    legends: [{
        label: "Photos",
        type: "circle",
        radius: 6,
        weight: 1,
        color: '#000000',
        fillColor: "#00cc00",
        layers: photos_lyr
    },{
      label: "Observations",
      type: "circle",
      radius: 4,
      color: '#ccccff',
      fillColor: "#0088ff",
      layers: obs_lyr
    },{
      label: "Lots",
      type: "rectangle",
      color: '#ff4400',
      fillColor: "#ff440011",
      layers: lots_lyr
    }]
  })
  map.addControl(legendControl)
}

// clicking the map will copy coordinates for pasting into photo spreadsheet

map.on('click', function(e) {
  // limit coordinate precision to 5 digits
  let x = e.latlng.lng.toString().replace(/(\.\d{5})(\d+)/, "$1")
  let y = e.latlng.lat.toString().replace(/(\.\d{5})(\d+)/, "$1")
  // join with a tab character, so that it will paste into two adjacent cells
  navigator.clipboard.writeText(x + '\t' + y)
})