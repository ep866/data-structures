$(document).ready(function(){

    $.getJSON('http://localhost:3000/api/meetings', function( meetings){

        var when = meetings[0].when;
        var nextMeet = meetings[0].result;

        // tell user when
        $("#when").append("Meetings on " +when.day+" after " +
            when.atTime );

        // get meetings
        var meets = [];
        var markers = [];

        nextMeet.forEach(function(m, i){
            var info = "";

            info += "<h4>"+ m._id.location +"</h4>";
            info += "<div>"+ m._id.formattedLocation +"</div>";
            info += "<div> ("+ m._id.locationNotes +")</div>";
            info += "<ul>";

            _.sortBy( m.meetings, 'startTime' ).forEach(function(dets, i){
                    info += "<li>";
                    info += "<span class='bold'>" + dets.startTime + "-" + dets.endTime + "</span>";
                    info += " <span>group: " + dets.group.toLowerCase();
                    info += "</span> <span>type: " + dets.type;
                    info += "</span></li>";
                });
            info += "</ul>";

            meets.push({ latLng:[ m._id.latLong.lat, m._id.latLong.lng ], data: info });
        });




        $("#map").gmap3({
          map:{
            options:{
              center:[40.7128, -74.0059],
              zoom: 10
            }
          },
          marker:{
            values:
                meets
            ,
            options:{
              draggable: false
            },
            events:{
                click: function(marker, event, context) {
                    var map = $(this).gmap3("get"),
                      infowindow = $(this).gmap3({get:{name:"infowindow"}});
                    if (infowindow){
                      infowindow.open(map, marker);
                      infowindow.setContent(context.data);
                    } else {
                      $(this).gmap3({
                        infowindow:{
                          anchor:marker,
                          options:{content: context.data}
                        }
                      });
                    }
                }
              // mouseover: function(marker, event, context){
              //   var map = $(this).gmap3("get"),
              //     infowindow = $(this).gmap3({get:{name:"infowindow"}});
              //   if (infowindow){
              //     infowindow.open(map, marker);
              //     infowindow.setContent(context.data);
              //   } else {
              //     $(this).gmap3({
              //       infowindow:{
              //         anchor:marker,
              //         options:{content: context.data}
              //       }
              //     });
              //   }
              // },
              // mouseout: function(){
              //   var infowindow = $(this).gmap3({get:{name:"infowindow"}});
              //   if (infowindow){
              //     infowindow.close();
              //   }
              // }
            }
          }
        });


    }); //getJSON

});
