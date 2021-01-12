var userOptions = {
  filters: []
};
var properties = {};
var map;
function getMFILevel(yearlyIncome, householdSize) {
  if (!yearlyIncome || !householdSize || householdSize === 0) {
    return 0;
  }
  let size = householdSize;
  if (householdSize > 8) {
    size = 8;
  }
  let householdIncomeLimits = incomeLimits[size];
  let income = 0;
  let incomes = _.keys(householdIncomeLimits);
  incomes.sort(function(a, b) {
    return a - b;
  });
  for (var thisIncome of incomes) {
    if (yearlyIncome <= parseInt(thisIncome)) {
      income = thisIncome;
      break;
    }
  }
  
  if (Math.floor(yearlyIncome) == yearlyIncome) {
     yearlyIncome = Math.floor(yearlyIncome)
  }

  if (size < 1 || income < yearlyIncome) {
    var mfi = 200;
  } else if (income === 0) {
    var mfi = 20;
  } else {
    var mfi = incomeLimits[size][income];
  }
  return mfi;
}

function getMFILevel2(base) {
  let allMfiLevels = [30, 40, 50, 60, 65, 80, 100, 120, 140];
  if (base < 140) {
    var found = allMfiLevels.find(function(mfi) {
      return mfi > base;
    });
  } else {
    var found = 140;
  }
  return found;
}



$(document).ready(function() {
  getAllProperties();
  /*
    function getUrlVars() {
        var vars = {};
        var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
            vars[key] = value;
        });
        return vars;
        }*/

  // show/hide the search container whenver we click the header
  $(".top-header").click(function() {
    toggleSearch();
  });

  $("#legend-container").click(function() {
      toggleMapLegendDetail();
      toggleMapLegendBanner();
  });

  // show the detailed legend initially?
  toggleMapLegendBanner();

  $(".done-btn").click(function() {
    // hide search container
    toggleMapLegendDetail();
    //toggleMapLegendBanner();
    toggleSearch();

    renderMarkers2(map, 0);
  });

  $("#search-again").click(function() {
    toggleSearch();
    $("#no-results-modal").hide();
  })

  $(".skip-link").click(function() {
    // hide search container
    toggleMapLegendDetail();
    //toggleMapLegendBanner();
    toggleSearch();
    renderMarkers2(map, 1);
  });

  function toggleSearch() {
    // shows/hides the search function
    $("#search-container").toggle("slide", { direction: "up" }, 300);
  }

  function toggleMapLegendBanner() {
    $("#map-legend-banner").toggle("slide", { direction: "down" }, 200);
    $("#map-legend-banner").children().toggle("slide", { direction: "down" }, 200);
  }

  function toggleMapLegendDetail() {
    $("#legend-container").toggle("slide", { direction: "down" }, 200);
  }

  // init map
  map = initMap();
  var titleLayer = initTitleLayer();

  L.control
    .zoom({
      position: "bottomright"
    })
    .addTo(map);
  titleLayer.addTo(map);
  $("#map-legend-banner").click(function() {
    toggleMapLegendBanner();
    toggleMapLegendDetail();
  });

  $("#hide-bottom-footer").click(function() {
    $(".bottom-footer").hide();
    $(".bottom-footer").animate({ height: "0px" }, 300);
  });

  $("#wheelchair").click(function(e) {
    if (document.getElementById("wheelchair").checked) {
      userOptions["ADA"] = "YES";
    } else {
      userOptions["ADA"] = "NO";
    }
  });

  $("#select-voucher").click(function(e) {
    if (document.getElementById("select-voucher").checked) {
      userOptions["section8"] = "YES";
    } else {
      userOptions["section8"] = "NO";
    }
  });

  $("#accept_terms").click(function(e) {
    if (document.getElementById("accept_terms").checked) {
      document.getElementById("done-btn").disabled = false;
    } else {
      document.getElementById("done-btn").disabled = true;
    }
  });

  $("#yearly-income-input").blur(function(e) {
    userOptions["income"] = $(e.target).val();
  });

  $("#household-size").blur(function(e) {
    userOptions["household-size"] = $(e.target).val();
  });

  // prevent zooming on mobile
  $(".next-btn").bind("touchend", function(e) {
    e.preventDefault();
    $(this).click();
  });
});

function getAllProperties() {
  $.get(data_hub_api_endpoint, function(response) {
    var propertiesTemp = response.data;
    for (var property of propertiesTemp) {
      if (property.lat && property.longitude) {
        properties[property.id] = property;
      }
    }
  });
}

function renderMarkers2(map, range) {
  let size = userOptions["household-size"];
  let mfiLevel = getMFILevel(userOptions.income, size);
  console.log('mfi:' + mfiLevel);
  if (mfiLevel === 200) {
    var mfiLevel2 = 200;
  } else {
    var mfiLevel2 = getMFILevel2(mfiLevel);
  }
  let mfiPropertyMatches = [];
  let mfiPropertyUpperMatches = [];
  let allMfiLevels = [30, 40, 50, 60, 65, 80, 100, 120, 140];
  // Generate property list based on search criteria
  if (mfiLevel) {
    let tempMFILevel = mfiLevel;
    let tempMFILevel2 = mfiLevel2;
    for (var pr in properties) {
      var property = properties[pr];
      var x = "num_units_mfi_" + tempMFILevel;
      var y = "num_units_mfi_" + tempMFILevel2;
      //Wheelchair checked. Shows only community_disabled properties and total_accessible_ir_units > 1 properties. Pass everything else.
      if (userOptions.ADA === "YES") {
        if (property.community_disabled !== 1 && property.total_accessible_ir_units < 1) {
          continue; // skip this property. no need to check futher.
        }
      }

      //Passed ADA criteria. Now consider voucher
      if (userOptions.section8 === "YES") {
        //visitor has voucher. show places with vouchers that has units in higher MFI levels in green
        if (parseInt(property[x]) > 0) { //matching units
          mfiPropertyMatches.push(property.id);
        } else if (property.accepts_section_8 === 1) {//no units in current level but property accepts voucher
          let allMfi = [40, 50, 60, 65, 80];
          for (l in allMfi) {
            if (allMfi[l] > tempMFILevel) {
              var z = "num_units_mfi_" + allMfi[l];
              if (parseInt(property[z]) > 0) {
                mfiPropertyMatches.push(property.id);
                continue;
              }
            }
          }
        } else if (parseInt(property[y]) > 0) { //matching units in upper level
          mfiPropertyUpperMatches.push(property.id);
        }
      } else { //visitor has no voucher. only show matches and upper level property
        if (parseInt(property[x]) > 0) {
          mfiPropertyMatches.push(property.id);
        }
        if (parseInt(property[y]) > 0) {
          mfiPropertyUpperMatches.push(property.id);
        }
      }
    }
    let mfiLevelIndex = allMfiLevels.findIndex(function(mfi) {
      return mfi == tempMFILevel;
    });

    var tempMFILevelIndex = mfiLevelIndex + 1;

    if (tempMFILevelIndex > allMfiLevels.length - 1) {
      doneMatching = true;
    } else {
      tempMFILevel = allMfiLevels[tempMFILevelIndex];
    }
  } else if (userOptions.section8 || userOptions.ADA) {//mfi is 0. no income level entered.
    for (var pr in properties) {
      var property = properties[pr];
      if (userOptions.section8 && userOptions.ADA) { //ADA criteria. Shows only community_disabled properties. Pass everything else.
        if ((property.community_disabled || property.total_accessible_ir_units ) && property.accepts_section_8) {
          mfiPropertyMatches.push(property.id);
        }
      } else if (userOptions.ADA === "YES" && (property.community_disabled ||property.total_accessible_ir_units )) {
          mfiPropertyMatches.push(property.id);
      } else if (userOptions.section8 && property.accepts_section_8) {
        mfiPropertyMatches.push(property.id);
      }
    }
  }
  var markers = new L.FeatureGroup();
  for (var p in properties) {
    var property = properties[p];
    properties[property.id] = property;
  }

  var propertiesList = _.sortBy(properties, "id");
  var numAvailableAffordableUnits = 0;
  var numSection8Units = 0;

  //Property list is ready. set icon colors based on search or show all
  if (!range && (mfiPropertyMatches.length || mfiPropertyUpperMatches.length)) { // search with some result.
    for (var property of propertiesList) {
      if (_.contains(mfiPropertyMatches, property.id)) {
        var marker = L.marker(
          [parseFloat(property.lat), parseFloat(property.longitude)],
          { icon: assignMarker("green") }
        );
        properties[property.id].color = "green";
        marker.markerID = property.id;
        marker.on("click", markerOnClick);
        markers.addLayer(marker);
      } else if (_.contains(mfiPropertyUpperMatches, property.id)) {
        var marker = L.marker(
          [parseFloat(property.lat), parseFloat(property.longitude)],
          { icon: assignMarker("orange") }
        );
        properties[property.id].color = "orange";
        marker.markerID = property.id;
        marker.on("click", markerOnClick);
        markers.addLayer(marker);
      }
      if (property.has_available_affordable_units) {
        numAvailableAffordableUnits = numAvailableAffordableUnits + 1;
      }
      if (property.accepts_section_8) {
        numSection8Units = numSection8Units + 1;
      }
    }
  } else if (range) { //"show all" button
    for (var property of propertiesList) {
      if (userOptions.section8 && userOptions.ADA) {
        if ((property.community_disabled || property.total_accessible_ir_units ) && property.accepts_section_8) {
          var marker = L.marker(
            [parseFloat(property.lat), parseFloat(property.longitude)],
            { icon: assignMarker("green") }
          );
          properties[property.id].color = "green";
        } else {
          var marker = L.marker(
            [parseFloat(property.lat), parseFloat(property.longitude)],
            { icon: assignMarker("blue") }
          );
          properties[property.id].color = "blue";
        }
      } else if (userOptions.ADA === "YES" && (property.community_disabled || property.total_accessible_ir_units)) {
        var marker = L.marker(
          [parseFloat(property.lat), parseFloat(property.longitude)],
          { icon: assignMarker("green") }
        );
        properties[property.id].color = "green";
      } else if (userOptions.section8 && property.accepts_section_8) {
        var marker = L.marker(
          [parseFloat(property.lat), parseFloat(property.longitude)],
          { icon: assignMarker("green") }
        );
        properties[property.id].color = "green";
      } else {
        var marker = L.marker(
          [parseFloat(property.lat), parseFloat(property.longitude)],
          { icon: assignMarker("blue") }
        );
        properties[property.id].color = "blue";
      }
      //properties[property.id].color = "blue";
      marker.markerID = property.id;
      marker.on("click", markerOnClick);
      markers.addLayer(marker);
    }
  } else {  //search button with no result; show no match message.
    // Get the modal
    var modal = document.getElementById("no-results-modal");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    modal.style.display = "block";

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
      modal.style.display = "none";
    };

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    };
  }
  map.addLayer(markers);
}

function returnMap() {
  return map;
}

function initMap() {
  mymap = L.map("mapid", { zoomControl: false }).setView(
    [30.2613, -97.7408],
    12.5
  );
  return mymap;
}

function initTitleLayer() {
  return L.tileLayer(
    'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', 
    {
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: 'mapbox/streets-v11',
      accessToken: mapbox_public_key
    }
  );
}

// heart, home, or star are icon types
function assignMarker(color, iconType = "home") {
  return L.AwesomeMarkers.icon({
    icon: iconType,
    markerColor: color,
    iconSize: [35, 45]
  });
}

var tempMarker = null;
var tempLat = null;
var tempLong = null;
var tempMarkerId = null;

function removeSelectedMarker() {
  var property = properties[tempMarkerId];
  var map = returnMap();
  map.removeLayer(tempMarker);
  var marker = L.marker(
    [parseFloat(property.lat), parseFloat(property.longitude)],
    { icon: assignMarker(property.color) }
  );
  marker.on("click", markerOnClick);
  marker.markerID = property.id;
  map.addLayer(marker);
}

function markerOnClick() {
  if (tempMarker) {
    removeSelectedMarker();
  }

  function shouldShowField(field) {
    if (!_.isNull(field)) {
      return true;
    } else {
      return false;
    }
  }

  var id = this.markerID;
  var property = properties[id];

  tempMarkerId = id;
  tempLat = property.lat;
  tempLong = property.longitude;
  tempMarker = L.marker(
    [parseFloat(property.lat), parseFloat(property.longitude)],
    { icon: assignMarker("red") }
  );
  tempMarker.markerID = property.id;
  tempMarker.on("click", markerOnClick);

  var map = returnMap();
  map.removeLayer(this);
  map.addLayer(tempMarker);

  var div = "";
  div += `
    <div style='margin-top: 20px;'>
        <button id='show-more'>Mostrar detalles de la vivienda</button>
        <button id='cancel-btn'>x</button>
    </div>
    `;

  if (property.has_waitlist) {
    div += `<div style='font-size: 14px; color:red; padding:10px;'> &nbsp;&nbsp; &#9888; Esta propiedad tiene una lista de espera </div>`;
  } else {
    div += `<div style='font-size: 14px; padding:10px;'>&nbsp;</div>`;
  }

  if (property.accepts_section_8) {
    div += `<div class='waitlist-flag' style='font-size: 12px;'>ACEPTA Housing Choice</div>`;
  }

  div += '<div id="property-details">';
  div += `<div style='margin-top: 10px; font-size: 15px;'>${property.property_name}</div>`;
  div += `<div style='font-size: 15px;'>${property.address} ${property.city}, ${property.state} ${property.zipcode}</div>`;

  div += '<div class="property-details-container">';
  div += `<div class='property-details-header'><img class='img-sort img-sort-right' src='/sort-right.png'/><img class='img-sort img-sort-down' src='/sort-down.png'/>Información de contacto</div>`;
  div += '<div class="property-details-group">';
  if (property.phone) {
    div += `<div>Teléfono: ${property.phone}</div>`;
  }
  if (property.email) {
    div += `<div>Correo electrónico: ${property.email}</div>`;
  }
  if (property.website) {
    div += `<div>Sitio web: <a href=${property.website} target="_blank">${property.website}</a></div>`;
  }
  
  if (property.community_disabled || property.total_accessible_ir_units) {
    div += "</div>";
    div += "</div>";

    div += '<div class="property-details-container">';
    div += `<div class='property-details-header'><img class='img-sort img-sort-right' src='/sort-right.png'/><img class='img-sort img-sort-down' src='/sort-down.png'/>Información sobre accesibilidad</div>`;
    div += '<div class="property-details-group">';
  if (property.community_disabled) {
      div += `<div>Físicamente discapacitados solamente</div>`;
  }
  if (property.total_accessible_ir_units) {
    div += `<div>Unidades con acceso para sillas de ruedas: ${property.total_accessible_ir_units}  Unidades</div>`;
  }
  }

  div += "</div>";
  div += "</div>";

  div += '<div class="property-details-container">';
  div += `<div class='property-details-header'><img class='img-sort img-sort-right' src='/sort-right.png'/><img class='img-sort img-sort-down' src='/sort-down.png'/>Comunidades servidas</div>`;
  div += '<div class="property-details-group">'; /*
  if (property.community_disabled) {
    div += `<div>Físicamente discapacitados solamente</div>`;
  }*/
  if (property.community_domestic_abuse_survivor) {
    div += `<div>Sobrevivientes de abuso doméstico solamente</div>`;
  }
  if (property.community_elderly) {
    div += `<div>Adultos mayores solamente</div>`;
  }
  if (property.community_mental) {
    div += `<div>Mentalmente discapacitados solamente</div>`;
  }
  if (property.community_military) {
    div += `<div>Militares solamente</div>`;
  }
  if (property.community_served_descriptions) {
    div += `<div>Otra información: ${property.community_served_descriptions}</div>`;
  }
  div += "</div>";
  div += "</div>";

  div += '<div class="property-details-container">';
  div += `<div class='property-details-header'><img class='img-sort img-sort-right' src='/sort-right.png'/><img class='img-sort img-sort-down' src='/sort-down.png'/>Información de accesibilidad económica</div>`;
  div += '<div class="property-details-group">';
  if (property.num_units_mfi_30) {
    div += `<div>MFI 30: ${property.num_units_mfi_30} Unidades</div>`;
  }
  if (property.num_units_mfi_40) {
    div += `<div>MFI 40: ${property.num_units_mfi_40} Unidades</div>`;
  }
  if (property.num_units_mfi_50) {
    div += `<div>MFI 50: ${property.num_units_mfi_50} Unidades</div>`;
  }
  if (property.num_units_mfi_60) {
    div += `<div>MFI 60: ${property.num_units_mfi_60} Unidades</div>`;
  }
  if (property.num_units_mfi_65) {
    div += `<div>MFI 65: ${property.num_units_mfi_65} Unidades</div>`;
  }
  if (property.num_units_mfi_70) {
    div += `<div>MFI 70: ${property.num_units_mfi_70} Unidades</div>`;
  }
  if (property.num_units_mfi_80) {
    div += `<div>MFI 80: ${property.num_units_mfi_80} Unidades</div>`;
  }
  div += "</div>";
  div += "</div>";

  div += '<div class="property-details-container">';
  div += `<div class='property-details-header'><img class='img-sort img-sort-right' src='/sort-right.png'/><img class='img-sort img-sort-down' src='/sort-down.png'/>Criterios de aceptación</div>`;
  div += '<div class="property-details-group">';
  if (property.broken_lease == "no") {
    div += `<div>No, no acepta historia de rompimiento de contrato de alquiler</div>`;
  } else if (property.broken_lease == "yes") {
    div += `<div>Sí, acepta historia de rompimiento de contrato de alquiler</div>`;
  } else if (property.broken_lease == "depends") {
    div += `<div>Acepta historia de rompimiento de contrato de alquiler en algunos casos</div>`;
    if (property.broken_lease_criteria) {
      div += `<div>Otros criterios de rompimiento de alquiler: ${property.broken_lease_criteria}</div>`;
    }
  }
  if (property.eviction_history == "no") {
    div += `<div>No, no acepta historia de desalojo</div>`;
  } else if (property.eviction_history == "yes") {
    div += `<div>Sí, acepta historia de desalojo</div>`;
  } else if (property.eviction_history == "depends") {
    div += `<div>Acepta historia de rompimiento de desalojo en algunos casos</div>`;
    if (property.eviction_history_criteria) {
      div += `<div>Otros criterios de historia de desalojo: ${property.eviction_history_criteria}</div>`;
    }
  }
  if (property.criminal_history == "no") {
    div += `<div>No, no acepta antecedentes penales</div>`;
  } else if (property.criminal_history == "yes") {
    div += `<div>Sí, acepta antecedentes penales</div>`;
  } else if (property.criminal_history == "depends") {
    div += `<div>Acepta antecedentes penales en algunos casos</div>`;
    if (property.criminal_history_criteria) {
      div += `<div>Otros criterios de antecedentes penales: ${property.criminal_history_criteria}</div>`;
    }
  }
  div += "</div>";
  div += "</div>";

  div += '<div class="property-details-container">';
  div += `<div class='property-details-header'><img class='img-sort img-sort-right' src='/sort-right.png'/><img class='img-sort img-sort-down' src='/sort-down.png'/>Servicios</div>`;
  div += '<div class="property-details-group">';
  if (property.allows_pet == "yes") {
    div += `<div>Sí, se aceptan mascotas</div>`;
  } else if (property.allows_pet == "no") {
    div += `<div>No, no se aceptan mascotas</div>`;
  }
  if (property.pet_other) {
    div += `<div>Otra información sobre mascotas: ${property.pet_other}</div>`;
  }
  if (property.has_air_conditioning == 1) {
    div += `<div>Aire acondicionado</div>`;
  } else if (property.has_air_conditioning == 0) {
    div += `<div>No hay aire acondicionado</div>`;
  }
  if (property.has_ceiling_fans == 1) {
    div += `<div>Ventiladores de techo</div>`;
  } else if (property.has_ceiling_fans == 0) {
    div += `<div>No hay ventiladores de techo</div>`;
  }
  if (property.wd_unit == 1) {
    div += `<div>Lavadora y secadora en la unidad</div>`;
  } else if (property.wd_unit == 0) {
    div += `<div>No hay conexiones para lavadora y secadora</div>`;
  }
  if (property.wd_hookups == 1) {
    div += `<div>Conexiones para lavadora y secadora</div>`;
  } else if (property.wd_hookups == 0) {
    div += `<div>No hay conexiones para lavadora y secadora</div>`;
  }
  if (property.wd_onsite == 1) {
    div += `<div>Lavadora y secadora en el edificio</div>`;
  } else if (property.wd_onsite == 0) {
    div += `<div>No hay lavadora y secadora en el edificio</div>`;
  }
  if (property.wd_other) {
    div += `<div>Otra información sobre lavadora / secadora: ${property.wd_other}</div>`;
  }
  if (property.has_off_street_parking == 1) {
    div += `<div>Tiene estacionamiento privado</div>`;
  } else if (property.has_off_street_parking == 0) {
    div += `<div>No tiene estacionamiento privado</div>`;
  }
  if (property.security) {
    div += `<div>Información sobre seguridad: ${property.security}</div>`;
  }
  if (property.has_pool == 1) {
    div += `<div>Sí piscina</div>`;
  } else if (property.has_pool == 0) {
    div += `<div>No piscina</div>`;
  }
  if (property.has_playground == 1) {
    div += `<div>Sí parque infantil</div>`;
  } else if (property.has_playgound == 0) {
    div += `<div>No parque infantil</div>`;
  }
  div += "</div>";
  div += "</div>";

  div += '<div class="property-details-container">';
  div += `<div class='property-details-header'><img class='img-sort img-sort-right' src='/sort-right.png'/><img class='img-sort img-sort-down' src='/sort-down.png'/>Escuelas</div>`;
  div += '<div class="property-details-group">';
  if (property.elementary_school) {
    div += `<div>Escuela primaria: ${property.elementary_school}</div>`;
  }
  if (property.middle_school) {
    div += `<div>Escuela intermedia: ${property.middle_school}</div>`;
  }
  if (property.high_school) {
    div += `<div>Escuela secundaria: ${property.high_school}</div>`;
  }
  div += "</div>";
  div += "</div>";

  div += "</div>";

  $("#property-info").html(div);

  $(".property-details-group").each(function() {
    var propertyDetailText = $(this)
      .text()
      .trim();

    // hide dropdown container if there is not content
    if (!propertyDetailText || propertyDetailText.length == 0) {
      $(this)
        .closest(".property-details-container")
        .hide();
    }
  });


  $("#property-info").show();
  $("#property-info").animate({ height: "30%" }, 300);

  // TODO: check that this isn't adding too many handlers
  $("#show-more").click(function() {
    if ($("#show-more").text() == "Mostrar detalles de la vivienda") {
      $("#property-info").animate({ height: "80%" }, 300);
      $("#show-more").text("Esconder detalles");
    } else {
      $("#property-info").animate({ height: "30%" }, 300);
      $("#show-more").text("Mostrar detalles de la vivienda");
    }
  });

  $("#cancel-btn").click(function() {
    $("#property-info").animate({ height: "0%" }, 300, function() {
      $("#property-info").hide();
    });
    $("#show-more").text("Esconder detalles");
  });

  $(".property-details-header").click(function(e) {
    $(e.target)
      .closest(".property-details-container")
      .find(".property-details-group")
      .toggle();
    $(e.target)
      .closest(".property-details-container")
      .find(".img-sort-right")
      .toggle();
    $(e.target)
      .closest(".property-details-container")
      .find(".img-sort-down")
      .toggle();
  });
}
