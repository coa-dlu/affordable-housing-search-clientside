var userOptions = {
  filters: []
}
var properties = {};
var map;
function getMFILevel(yearlyIncome, householdSize) {
  if (!yearlyIncome || !householdSize) {
      return null;
  }

  let size = householdSize;
  if (householdSize > 8) {
      size = 8;
  }

  let householdIncomeLimits = incomeLimits[size];
  let income = 0;

 let incomes = _.keys(householdIncomeLimits);
 incomes.sort(function(a, b) {return a - b});

 //console.log('income ' + incomes);

 for (var thisIncome of incomes) {
      if (yearlyIncome < parseInt(thisIncome)) {
          income = thisIncome;
          break;
      }
 }

 let mfi = incomeLimits[size][thisIncome];
 //console.log('mfi ' +mfi);
 return mfi;
}

function getMFILevel2(base) {
    let allMfiLevels = [20, 30, 40, 50, 60, 65, 70, 80, 100, 120, 140];
    if (base< 140) {
        var found = allMfiLevels.find(function(mfi) {
            return  mfi > base;
        });
    } else {
        var found = 140;
    }
    //console.log('upper mfi ' +found);
    return found;
}

$(document).ready(function() {
  getAllProperties();

  $('.bottom-footer').show();
  $('.bottom-footer').css('height', '0px');
  $('.bottom-footer').animate({height: '450px'}, 'slow');
  var optionsWizardNum = 1;

  $('.next-btn').click(function() {
      $('#options-wizard-' + optionsWizardNum).hide();
      optionsWizardNum = optionsWizardNum + 1;

      // skip schools for now
      if (optionsWizardNum == 7) {
          optionsWizardNum = optionsWizardNum + 1;
      }
      $('#options-wizard-' + optionsWizardNum).show();

      if (optionsWizardNum > 1) {
          $('.back-btn').show();
      }

      if (optionsWizardNum == 10) {
          $('.next-btn').hide();
          $('.done-btn').show();
      }
  });

  $('.back-btn').click(function() {
      $('#options-wizard-' + optionsWizardNum).hide();
      optionsWizardNum = optionsWizardNum - 1;

      // skip schools for now
      if (optionsWizardNum == 7) {
          optionsWizardNum = optionsWizardNum - 1;
      }
      $('#options-wizard-' + optionsWizardNum).show();

      if (optionsWizardNum < 2) {
          $('.back-btn').hide();
      }

      if (optionsWizardNum != 10) {
          $('.next-btn').show();
          $('.done-btn').hide();
      }
  });

  $('.done-btn').click(function() {
      $('#options-wizard-' + optionsWizardNum).hide();
      optionsWizardNum = 1;
      // hide welcome container
      
      $('#welcome-container').animate({height: '0%'}, 'slow', function() {
          $('.top-header').show();
          $('.top-header').css('height', '0px');
          $('.top-header').animate({height: '60px'}, 'slow');
          $('#welcome-container').hide();
      });
      
      renderMarkers2(map,0);

      // show side tabs
      $('#filter-applied-banner').show();
      $('#map-legend-banner').show();
      $('#filter-applied-banner').css('width', '30px');
      $('#map-legend-banner').css('width', '30px');
  });

  $('.skip-btn').click(function() {
    $('#options-wizard-' + optionsWizardNum).hide();
    optionsWizardNum = 1;

    // hide welcome container
    $('#welcome-container').animate({height: '0%'}, 'slow', function() {
        $('.top-header').show();
        $('.top-header').css('height', '0px');
        $('.top-header').animate({height: '60px'}, 'slow');
        $('#welcome-container').hide();
    });

    renderMarkers2(map,1);

    // show side tabs
    $('#filter-applied-banner').show();
    $('#map-legend-banner').show();
    $('#filter-applied-banner').css('width', '30px');
    $('#map-legend-banner').css('width', '30px');
});

  // init map
  map = initMap();
  var titleLayer = initTitleLayer();
  L.control.zoom({
      position: "bottomright"
  }).addTo(map);

  titleLayer.addTo(map);

  $('#map-legend-banner').click(function() {
          $('#filter-applied-banner').animate({width: '0px'}, 'slow');
          $('#map-legend-banner').animate({width: '0px'}, 'slow');
          $('#legend-container').show();
          $('#legend-container').animate({height: '80%'}, 'slow');
  });

  $('#cancel-map-legend').click(function() {
      $('#legend-container').animate({height: '0%'}, 'slow', function(){$('#legend-container').hide();});
      $('#filter-applied-banner').animate({width: '30px'}, 'slow');
      $('#map-legend-banner').animate({width: '30px'}, 'slow');
  });

  $('#hide-bottom-footer').click(function() { 
    $('.bottom-footer').hide();
    $('.bottom-footer').animate({height: '0px'}, 'slow');
  });

  $('#filter-applied-banner').click(function() {
      location.reload(); /*
      $('#filter-applied-banner').animate({width: '0%'}, 'slow');
      $('#map-legend-banner').animate({width: '0%'}, 'slow');
      $('#filter-applied-banner').hide();
      $('#map-legend-banner').hide();
      $('.top-header').hide();
      $('#welcome-container').show();
      $('#welcome-container').css('height', '0%');
      $('#welcome-container').animate({'height': '100%'}, 'slow');

      $('#options-wizard-' + 3).show();
      $('.done-btn').show();*/
      //$('.back-btn').hide();
      // $('.next-btn').show();
  });

  $('.select-lang').click(function(e) {
      userOptions['lang'] = $(e.target).text();
      $('.select-lang').removeClass('btn-select');
      $(e.target).addClass('btn-select');
      //console.log(userOptions);
  });

  $('.select-voucher').click(function(e) {
      userOptions['section8'] = $(e.target).text();
      $('.select-voucher').removeClass('btn-select');
      $(e.target).addClass('btn-select');
      //console.log(userOptions);
  });

  $('.select-public-transport').click(function(e) {
      $('.select-public-transport').removeClass('btn-select');
      $(e.target).addClass('btn-select');
  });

  $('.select-grocery').click(function(e) {
      $('.select-grocery').removeClass('btn-select');
      $(e.target).addClass('btn-select');
  });

  $('#yearly-income-input').blur(function(e) {
      userOptions['income'] = $(e.target).val();
      //console.log(userOptions);
  });

  $('#household-size').blur(function(e) {
      userOptions['household-size'] = $(e.target).val();
      //console.log(userOptions);
  });

  $('.options-big-btn').click(function(e) {
      if ($(e.target).data('field')) {
          var fieldVal = $(e.target).data('field');
          //console.log($(e.target).data('field'));
          if (!_.contains(userOptions.filters, fieldVal)) {
              userOptions.filters.push(fieldVal);
          } else {
              userOptions.filters = userOptions.filters.filter(function(x) {return x != fieldVal});
          }
          //console.log(userOptions);
      }

      if ($(e.target).hasClass('btn-select')) {
          $(e.target).removeClass('btn-select');
      } else {
          $(e.target).addClass('btn-select');
      }
  });

  // prevent zooming on mobile
  $('.options-wizard-plus-minus-btn').bind('touchend', function(e) {
      e.preventDefault();
      $(this).click();
  });

  // prevent zooming on mobile
  $('.options-big-btn').bind('touchend', function(e) {
      e.preventDefault();
      $(this).click();
  });

  // prevent zooming on mobile
  $('.next-btn').bind('touchend', function(e) {
      e.preventDefault();
      $(this).click();
  });

  // prevent zooming on mobile
  $('.back-btn').bind('touchend', function(e) {
      e.preventDefault();
      $(this).click();
  });

  $('.options-wizard-plus-minus-btn').click(function(e) {
      var operation = $(e.target).text();
      var elem = $(e.target).closest('.justify-center').find('.options-wizard-plus-minus-val');
      var val = parseInt(elem.text());
      if (operation == '-') {
          if (val > 0) {
              val = val - 1;
          }
      } else {
          val = val + 1;
      }
      $(elem).text(val);
  });
});

// score indicates degree to which property is a match, acceptence critieria (i.e. broken lease, etc.) and section 8 are prioritized in terms of weights
/*
function addMatchScore(property) {
  var matchScore = 0;

  for (var f of userOptions.filters) {
      if (_.contains(['broken_lease', 'eviction_history', 'criminal_history'], f)) {
          if (property[f] == 'yes') {
              matchScore = matchScore + 10;
          } else if (property[f] == 'depends') {
              matchScore = matchScore + 5;
          }
      } else {
          if (property[f] == 1) {
              matchScore = matchScore + 10;
          }
      }
  }

  if (userOptions.section8 == 'YES') {
      if (property['accepts_section_8'] == 1) {
          matchScore = matchScore + 25;
      }
  }

  property.matchScore = matchScore;

  return property;
}
*/
function getAllProperties() {
  $.get(
      data_hub_api_endpoint,
      function(response) {
          //console.log(response.data);
          var propertiesTemp = response.data;

          for (var property of propertiesTemp) {
              if (property.lat && property.longitude) {
                  properties[property.id] = property;

              }
          }
      }
  )
}

function renderMarkers2(map,range) {
  //console.log(range);
  let size = userOptions['household-size'];
  let mfiLevel = getMFILevel(userOptions.income, size);
  let mfiLevel2 = getMFILevel2(mfiLevel);
  let mfiPropertyMatches = [];
  let mfiPropertyUpperMatches = [];
  let allMfiLevels = [20, 30, 40, 50, 60, 65, 70, 80, 100, 120, 140];
  //console.log('mfilevel: ' + mfiLevel)
  if (mfiLevel) {
    let tempMFILevel = mfiLevel;
    let tempMFILevel2 = mfiLevel2;
    for (var pr in properties) {
        var property = properties[pr];
        var x = 'num_units_mfi_' + tempMFILevel;
        var y = 'num_units_mfi_' + tempMFILevel2;
        //console.log(tempMFILevel);

        if (parseInt(property[x]) > 0 ) {
            mfiPropertyMatches.push(property.id);
        } 
        if (parseInt(property[y]) > 0 ) {
            mfiPropertyUpperMatches.push(property.id);
        }
    } 

    let mfiLevelIndex = allMfiLevels.findIndex(function(mfi) {
        return mfi == tempMFILevel;
    });

    var tempMFILevelIndex = mfiLevelIndex + 1;

    if (tempMFILevelIndex > (allMfiLevels.length - 1)) {
        doneMatching = true;
    } else {
        tempMFILevel = allMfiLevels[tempMFILevelIndex];
    }
} 
  var markers = new L.FeatureGroup();
  for (var p in properties) {
      var property = properties[p];
      properties[property.id] = property;
  }

  var propertiesList = _.sortBy(properties, 'id');
  var numAvailableAffordableUnits = 0;
  var numSection8Units = 0;

  console.log('mfiPropertyMatches: '+ mfiPropertyMatches.length);
  console.log('UpperMatches: '+ mfiPropertyUpperMatches.length);
  if (mfiPropertyMatches.length || mfiPropertyUpperMatches.length) {
    //console.log(markers);
    for (var property of propertiesList) {
            if (_.contains(mfiPropertyMatches, property.id)) {
                var marker = L.marker([parseFloat(property.lat), parseFloat(property.longitude)], {icon: assignMarker("green")});
                properties[property.id].color = 'green';
                marker.markerID = property.id;
                marker.on("click", markerOnClick)
                markers.addLayer(marker);
                } else if (_.contains(mfiPropertyUpperMatches, property.id)){
                    var marker = L.marker([parseFloat(property.lat), parseFloat(property.longitude)], {icon: assignMarker("orange")});
                    properties[property.id].color = 'orange';
                    marker.markerID = property.id;
                    marker.on("click", markerOnClick)
                    markers.addLayer(marker);
                } 
            if (property.has_available_affordable_units) {
                numAvailableAffordableUnits = numAvailableAffordableUnits + 1;
            }
            if (property.accepts_section_8) {
                numSection8Units = numSection8Units + 1;
            }
        }
  } else if(range){ //"show all" button
        for (var property of propertiesList) {
                var marker = L.marker([parseFloat(property.lat), parseFloat(property.longitude)], {icon: assignMarker("blue")});
                properties[property.id].color = 'blue';
                marker.markerID = property.id;
                marker.on("click", markerOnClick)
                markers.addLayer(marker);
        }
  } else {//search button with no criteria; show no match message.
      // Get the modal
        var modal = document.getElementById("myModal");

        // Get the <span> element that closes the modal
        var span = document.getElementsByClassName("close")[0];

        modal.style.display = "block";

        // When the user clicks on <span> (x), close the modal
        span.onclick = function() {
        modal.style.display = "none";
        }

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
        } 
    }
  
  map.addLayer(markers);
}

function returnMap () {
  return map;
}

function initMap() {
  mymap = L.map('mapid', {zoomControl: false}).setView([30.2613, -97.7408], 12.5);
  return mymap;
}

function initTitleLayer() {
  return L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.streets',
      accessToken: mapbox_public_key
  });
}

// heart, home, or star are icon types
function assignMarker(color, iconType='home') {
  return L.AwesomeMarkers.icon({icon: iconType, markerColor: color, iconSize: [35, 45]})
}

var tempMarker = null;
var tempLat  = null;
var tempLong = null;
var tempMarkerId = null;

function removeSelectedMarker() {
  var property = properties[tempMarkerId];

  var map = returnMap();
  map.removeLayer(tempMarker);

  var marker = L.marker([parseFloat(property.lat), parseFloat(property.longitude)], {icon: assignMarker(property.color)});
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

  // //console.log(property);

  tempMarkerId = id;
  tempLat = property.lat;
  tempLong = property.longitude;
  tempMarker = L.marker([parseFloat(property.lat), parseFloat(property.longitude)], {icon: assignMarker("red", "heart")});

  var map = returnMap();
  map.removeLayer(this);
  map.addLayer(tempMarker);

  //console.log(id);
  //console.log(property);

  var div = '';
  div += `
  <div style='margin-top: 20px;'>
      <button id='show-more'>SHOW MORE</button>
      <button id='cancel-btn'>x</button>
  </div>
  `;

  div += `<br/>`;

  div += '<div id="property-details">'

      div += `<div style='margin-top: 10px; font-size: 15px;'>${property.property_name}</div>`;
      div += `<div style='font-size: 15px;'>${property.address} ${property.city}, ${property.state} ${property.zipcode}</div>`;
      if (property.has_waitlist) {
          div += `<div class='waitlist-flag' style='font-size: 12px; width: 100px;'>WAITLIST</div>`;
      }
      if (property.accepts_section_8) {
          div += `<div class='waitlist-flag' style='font-size: 12px;'>ACCEPTS SECTION 8</div>`;
      }

      div += '<div class="property-details-container">'
          div += `<div class='property-details-header'><img class='img-sort img-sort-right' src='/sort-right.png'/><img class='img-sort img-sort-down' src='/sort-down.png'/>Contact Information</div>`;
          div +=  '<div class="property-details-group">';
              if (property.phone) {
                  div += `<div>Phone: ${property.phone}</div>`;
              }
              if (property.email) {
                  div += `<div>Email: ${property.email}</div>`;
              }
              if (property.website) {
                  div += `<div>Website: <a href=${property.website} target="_blank">${property.website}</a></div>`;
              }
          div += '</div>';
      div += '</div>';

      div += '<div class="property-details-container">'
          div += `<div class='property-details-header'><img class='img-sort img-sort-right' src='/sort-right.png'/><img class='img-sort img-sort-down' src='/sort-down.png'/>Communities Served</div>`;
          div +=  '<div class="property-details-group">';
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
          div += '</div>';
      div += '</div>';

      
      div += '<div class="property-details-container">'
          div += `<div class='property-details-header'><img class='img-sort img-sort-right' src='/sort-right.png'/><img class='img-sort img-sort-down' src='/sort-down.png'/>Affordability Information</div>`;
          div +=  '<div class="property-details-group">';
              if (property.num_units_mfi_30) {
                  div += `<div>MFI 30: ${property.num_units_mfi_30} Units</div>`;
              }
              if (property.num_units_mfi_40) {
                div += `<div>MFI 40: ${property.num_units_mfi_40} Units</div>`;
              }
              if (property.num_units_mfi_50) {
                div += `<div>MFI 50: ${property.num_units_mfi_50} Units</div>`;
              }
              if (property.num_units_mfi_60) {
                div += `<div>MFI 60: ${property.num_units_mfi_60} Units</div>`;
              }
              if (property.num_units_mfi_70) {
                div += `<div>MFI 70: ${property.num_units_mfi_70} Units</div>`;
              }
              if (property.num_units_mfi_80) {
                div += `<div>MFI 80: ${property.num_units_mfi_80} Units</div>`;
              }
              if (property.num_units_mfi_90) {
                div += `<div>MFI 90: ${property.num_units_mfi_90} Units</div>`;
              }
              if (property.num_units_mfi_100) {
                div += `<div>MFI 100: ${property.num_units_mfi_100} Units</div>`;
              }
              if (property.num_units_mfi_110) {
                div += `<div>MFI 110: ${property.num_units_mfi_110} Units</div>`;
              }
              if (property.num_units_mfi_120) {
                div += `<div>MFI 120: ${property.num_units_mfi_120} Units</div>`;
              }
          div += '</div>';
      div += '</div>';


  div += '<div class="property-details-container">'
      div += `<div class='property-details-header'><img class='img-sort img-sort-right' src='/sort-right.png'/><img class='img-sort img-sort-down' src='/sort-down.png'/>Acceptance Criteria</div>`;
      div += '<div class="property-details-group">'
          if (property.broken_lease == 'no') {
              div += `<div>No, does not accept broken lease history</div>`;
          } else if (property.broken_lease == 'yes') {
              div += `<div>Yes, does accept broken lease history</div>`
          } else if (property.broken_lease == 'depends') {
              div += `<div>Broken lease history is accepted in some cases</div>`
              if (property.broken_lease_criteria) {
                  div += `<div>Other broken lease critiera: ${property.broken_lease_criteria}</div>`
              }
          }
          if (property.eviction_history == 'no') {
              div += `<div>No, does not accept eviction history</div>`;
          } else if (property.eviction_history == 'yes') {
              div += `<div>Yes, does accept eviction history</div>`;
          } else if (property.eviction_history == 'depends') {
              div += `<div>Eviction history accepted in some cases</div>`;
              if (property.eviction_history_criteria) {
                  div += `<div>Other eviction history critiera: ${property.eviction_history_criteria}</div>`
              }
          }
          if (property.criminal_history == 'no') {
              div += `<div>No, does not accept criminal history</div>`;
          } else if (property.criminal_history == 'yes') {
              div += `<div>Yes, does accept criminal history</div>`;
          } else if (property.criminal_history == 'depends') {
              div += `<div>Criminal history accepted in some cases</div>`;
              if (property.criminal_history_criteria) {
                  div += `<div>Other criminal history critiera: ${property.criminal_history_criteria}</div>`
              }
          }
      div += '</div>';
  div += '</div>';

  div += '<div class="property-details-container">'
      div += `<div class='property-details-header'><img class='img-sort img-sort-right' src='/sort-right.png'/><img class='img-sort img-sort-down' src='/sort-down.png'/>Amenities</div>`
      div += '<div class="property-details-group">'
          if (property.allows_pet == 'yes') {
              div += `<div>Yes, pets are allowed</div>`;
          } else if (property.allows_pet == 'no') {
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
      div += '</div>';
  div += '</div>';

  div += '<div class="property-details-container">'
      div += `<div class='property-details-header'><img class='img-sort img-sort-right' src='/sort-right.png'/><img class='img-sort img-sort-down' src='/sort-down.png'/>Schools</div>`;
      div += '<div class="property-details-group">'
          if (property.elementary_school) {
              div += `<div>Elementary School: ${property.elementary_school}</div>`;
          }
          if (property.middle_school) {
              div += `<div>Middle School: ${property.middle_school}</div>`;
          }
          if (property.high_school) {
              div += `<div>High School: ${property.high_school}</div>`;
          }
      div += '</div>';
  div += '</div>';

  div += '</div>';

  $('#property-info').html(div);

  $('.property-details-group').each(function() {
      var propertyDetailText = $(this).text().trim();

      // hide dropdown container if there is not content
      if (!propertyDetailText || propertyDetailText.length == 0) {
          $(this).closest('.property-details-container').hide();
      }
  });

  $('#filter-applied-banner').animate({width: '0px'}, 'slow', function() {$('#filter-applied-banner').hide();});
  $('#map-legend-banner').animate({width: '0px'}, 'slow', function() {$('#map-legend-banner').hide();});

  $('#property-info').show();
  $('#property-info').animate({height: '30%'}, 'slow');

  // TODO: check that this isn't adding too many handlers
  $('#show-more').click(function() {
      if ($('#show-more').text() == 'SHOW MORE') {
          $('#property-info').animate({height: '80%'}, 'slow');
          $('#show-more').text('SHOW LESS');
      } else {
          $('#property-info').animate({height: '30%'}, 'slow');
          $('#show-more').text('SHOW MORE');
      }
  });

  $('#cancel-btn').click(function() {
      $('#filter-applied-banner').show();
      $('#map-legend-banner').show();
      $('#filter-applied-banner').animate({width: '30px'}, 'slow');
      $('#map-legend-banner').animate({width: '30px'}, 'slow');

      $('#property-info').animate({height: '0%'}, 'slow', function() {$('#property-info').hide();});
      $('#show-more').text('SHOW LESS');
  });

  $('.property-details-header').click(function(e) {
      $(e.target).closest('.property-details-container').find('.property-details-group').toggle();
      $(e.target).closest('.property-details-container').find('.img-sort-right').toggle();
      $(e.target).closest('.property-details-container').find('.img-sort-down').toggle();
  });
}
