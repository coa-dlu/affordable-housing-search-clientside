var properties = {};
var map;


$(document).ready(function() {
  // init map
  map = initMap();
  var titleLayer = initTitleLayer();
  L.control
    .zoom({
      position: "bottomright"
    })
    .addTo(map);

  titleLayer.addTo(map);

  getAllProperties();
}); // get_all_properties function

function getAllProperties() {
  $.get(data_hub_api_endpoint, function(response) {
    console.log(response);
    var propertiesTemp = response.data;

    for (var property of propertiesTemp) {
      console.log(property);
      if (property.lat && property.longitude) {
        properties[property.id] = property;
        var marker = L.marker([
          parseFloat(property.lat),
          parseFloat(property.longitude)
        ]).addTo(map);
        marker.markerID = property.id;
        marker.on("click", markerOnClick);
        console.log("latitude" + property.lat);
      }
    }
  });
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
    "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: "mapbox.streets",
      accessToken: mapbox_public_key
    }
  );
}

// make details on click show up
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
    {
      icon: assignMarker(
        property.color,
        property.color == "orange" ? "star" : "home"
      )
    }
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
    { icon: assignMarker("red", "heart") }
  );

  var map = returnMap();
  map.removeLayer(this);
  map.addLayer(tempMarker);

  console.log(id);
  console.log(property);

  var div = "";
  div += `
    <div style='margin-top: 20px;'>
        <button id='show-more'>SHOW MORE</button>
        <button id='cancel-btn'>x</button>
    </div>
    `;

  div += `<br/>`;

  div += '<div id="property-details">';

  div += `<div style='margin-top: 10px; font-size: 15px;'>${
    property.property_name
  }</div>`;
  div += `<div style='font-size: 15px;'>${property.address} ${property.city}, ${
    property.state
  } ${property.zipcode}</div>`;
  if (property.has_waitlist) {
    div += `<div class='waitlist-flag' style='font-size: 12px; width: 100px;'>WAITLIST</div>`;
  }
  if (property.accepts_section_8) {
    div += `<div class='waitlist-flag' style='font-size: 12px;'>ACCEPTS SECTION 8</div>`;
  }

  div += '<div class="property-details-container">';
  div += `<div class='property-details-header'><img class='img-sort img-sort-right' src='/sort-right.png'/><img class='img-sort img-sort-down' src='/sort-down.png'/>Contact Information</div>`;
  div += '<div class="property-details-group">';
  if (property.phone) {
    div += `<div>Phone: ${property.phone}</div>`;
  }
  if (property.email) {
    div += `<div>Email: ${property.email}</div>`;
  }
  if (property.website) {
    div += `<div>Website: <a href=${property.website} target="_blank">${
      property.website
    }</a></div>`;
  }
  div += "</div>";
  div += "</div>";

  div += '<div class="property-details-container">';
  div += `<div class='property-details-header'><img class='img-sort img-sort-right' src='/sort-right.png'/><img class='img-sort img-sort-down' src='/sort-down.png'/>Communities Served</div>`;
  div += '<div class="property-details-group">';
  if (property.community_disabled) {
    div += `<div>Physically Disabled Only</div>`;
  }
  if (property.community_domestic_abuse_survivor) {
    div += `<div>Domestic Abuse Survivor Only</div>`;
  }
  if (property.community_elderly) {
    div += `<div>Elderly Only</div>`;
  }
  if (property.community_mental) {
    div += `<div>Mentally Disabled Only</div>`;
  }
  if (property.community_military) {
    div += `<div>Military Only</div>`;
  }
  if (property.community_served_descriptions) {
    div += `<div>Other Info: ${property.community_served_descriptions}</div>`;
  }
  div += "</div>";
  div += "</div>";

  div += '<div class="property-details-container">';
  div += `<div class='property-details-header'><img class='img-sort img-sort-right' src='/sort-right.png'/><img class='img-sort img-sort-down' src='/sort-down.png'/>Acceptance Criteria</div>`;
  div += '<div class="property-details-group">';
  if (property.broken_lease == "no") {
    div += `<div>No, does not accept broken lease history</div>`;
  } else if (property.broken_lease == "yes") {
    div += `<div>Yes, does accept broken lease history</div>`;
  } else if (property.broken_lease == "depends") {
    div += `<div>Broken lease history is accepted in some cases</div>`;
    if (property.broken_lease_criteria) {
      div += `<div>Other broken lease critiera: ${
        property.broken_lease_criteria
      }</div>`;
    }
  }
  if (property.eviction_history == "no") {
    div += `<div>No, does not accept eviction history</div>`;
  } else if (property.eviction_history == "yes") {
    div += `<div>Yes, does accept eviction history</div>`;
  } else if (property.eviction_history == "depends") {
    div += `<div>Eviction history accepted in some cases</div>`;
    if (property.eviction_history_criteria) {
      div += `<div>Other eviction history critiera: ${
        property.eviction_history_criteria
      }</div>`;
    }
  }
  if (property.criminal_history == "no") {
    div += `<div>No, does not accept criminal history</div>`;
  } else if (property.criminal_history == "yes") {
    div += `<div>Yes, does accept criminal history</div>`;
  } else if (property.criminal_history == "depends") {
    div += `<div>Criminal history accepted in some cases</div>`;
    if (property.criminal_history_criteria) {
      div += `<div>Other criminal history critiera: ${
        property.criminal_history_criteria
      }</div>`;
    }
  }
  div += "</div>";
  div += "</div>";

  div += '<div class="property-details-container">';
  div += `<div class='property-details-header'><img class='img-sort img-sort-right' src='/sort-right.png'/><img class='img-sort img-sort-down' src='/sort-down.png'/>Amenities</div>`;
  div += '<div class="property-details-group">';
  if (property.allows_pet == "yes") {
    div += `<div>Yes, pets are allowed</div>`;
  } else if (property.allows_pet == "no") {
    div += `<div>No, pets are not allowed</div>`;
  }
  if (property.pet_other) {
    div += `<div>Other pet info: ${property.pet_other}</div>`;
  }
  if (property.has_air_conditioning == 1) {
    div += `<div>Air Conditioning</div>`;
  } else if (property.has_air_conditioning == 0) {
    div += `<div>No Air Conditioning</div>`;
  }
  if (property.has_ceiling_fans == 1) {
    div += `<div>Ceiling Fans</div>`;
  } else if (property.has_ceiling_fans == 0) {
    div += `<div>No Ceiling Fans</div>`;
  }
  if (property.wd_unit == 1) {
    div += `<div>Washer Dryer In Unit</div>`;
  } else if (property.wd_unit == 0) {
    div += `<div>No Washer Dryer In Unit</div>`;
  }
  if (property.wd_hookups == 1) {
    div += `<div>Washer Dryer Hookups</div>`;
  } else if (property.wd_hookups == 0) {
    div += `<div>No Washer Dryer Hookups</div>`;
  }
  if (property.wd_onsite == 1) {
    div += `<div>Washer Dryer Onsite</div>`;
  } else if (property.wd_onsite == 0) {
    div += `<div>No Washer Dryer Onsite</div>`;
  }
  if (property.wd_other) {
    div += `<div>Other Washer / Dryer info: ${property.wd_other}</div>`;
  }
  if (property.wd_onsite == 1) {
    div += `<div>Washer Dryer Onsite</div>`;
  } else if (property.wd_onsite == 0) {
    div += `<div>No Washer Dryer Onsite</div>`;
  }
  if (property.has_off_street_parking == 1) {
    div += `<div>Has Off Street Parking</div>`;
  } else if (property.has_off_street_parking == 0) {
    div += `<div>No Off Street Parking</div>`;
  }
  if (property.security) {
    div += `<div>Security Information: ${property.security}</div>`;
  }
  if (property.has_pool == 1) {
    div += `<div>Yes Pool</div>`;
  } else if (property.has_pool == 0) {
    div += `<div>No Pool</div>`;
  }
  if (property.has_playground == 1) {
    div += `<div>Yes Playground</div>`;
  } else if (property.has_playgound == 0) {
    div += `<div>No Playground</div>`;
  }
  div += "</div>";
  div += "</div>";

  div += '<div class="property-details-container">';
  div += `<div class='property-details-header'><img class='img-sort img-sort-right' src='/sort-right.png'/><img class='img-sort img-sort-down' src='/sort-down.png'/>Schools</div>`;
  div += '<div class="property-details-group">';
  if (property.elementary_school) {
    div += `<div>Elementary School: ${property.elementary_school}</div>`;
  }
  if (property.middle_school) {
    div += `<div>Middle School: ${property.middle_school}</div>`;
  }
  if (property.high_school) {
    div += `<div>High School: ${property.high_school}</div>`;
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

  $("#filter-applied-banner").animate({ width: "0px" }, "slow", function() {
    $("#filter-applied-banner").hide();
  });
  $("#map-legend-banner").animate({ width: "0px" }, "slow", function() {
    $("#map-legend-banner").hide();
  });

  $("#property-info").show();
  $("#property-info").animate({ height: "30%" }, "slow");

  // TODO: check that this isn't adding too many handlers
  $("#show-more").click(function() {
    if ($("#show-more").text() == "SHOW MORE") {
      $("#property-info").animate({ height: "80%" }, "slow");
      $("#show-more").text("SHOW LESS");
    } else {
      $("#property-info").animate({ height: "30%" }, "slow");
      $("#show-more").text("SHOW MORE");
    }
  });

  $("#cancel-btn").click(function() {
    $("#filter-applied-banner").show();
    $("#map-legend-banner").show();
    $("#filter-applied-banner").animate({ width: "30px" }, "slow");
    $("#map-legend-banner").animate({ width: "30px" }, "slow");

    $("#property-info").animate({ height: "0%" }, "slow", function() {
      $("#property-info").hide();
    });
    $("#show-more").text("SHOW LESS");
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
