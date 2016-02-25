(function(angular) {

  'use strict';

  angular.module('appDirectives').directive('directionsMap', function(){
    
    return { 
      restrict: 'E',
      scope: true,
      template: '<div id="directions-map" flex layout-fill></div>',
      controller: ['$scope', function($scope){

      }],
      
      link: function ($scope, element, attrs) {
        var maps = $scope.$parent.maps;
        var directionsService,
            directionsDisplay,
            icons,
            map;
            
        (function initializeDirectionsMap() {
          directionsService = new maps.DirectionsService();
          directionsDisplay = new maps.DirectionsRenderer({ suppressMarkers: true });
          generateMarkerIcons();
          var styledMap = new maps.StyledMapType($scope.map.options.secondaryStyles, {name: 'Styled Map'});
          var mapOptions = {
            zoom: 16,
            scrollwheel: false,
            center: new maps.LatLng($scope.map.myLocationMarker.coords.latitude, $scope.map.myLocationMarker.coords.longitude),
            mapTypeControlOptions: {
              mapTypeIds: [maps.MapTypeId.ROADMAP, 'light_dream']
            }
          };
          map = new maps.Map(element.children()[0], mapOptions);
          directionsDisplay.setMap( map );
          map.mapTypes.set('light_dream', styledMap);
          map.setMapTypeId('light_dream');
        })();

        function generateMarkerIcons() {
          icons = {
            start: new maps.MarkerImage('/img/icons/user-marker.svg',
              // (width,height)
              new maps.Size( 48, 48 ),
              // The origin point (x,y)
              new maps.Point( 0, 0 ),
              // The anchor point (x,y)
              new maps.Point( 24, 39 ) ),
            end: new maps.MarkerImage('/img/icons/park-marker.svg',
             // (width,height)
             new maps.Size( 48, 48 ),
             // The origin point (x,y)
             new maps.Point( 0, 0 ),
             // The anchor point (x,y)
             new maps.Point( 25, 46 ) )
          };
        };

        function calcRoute(park) {
          var travelMode = getBestTravelMode(park);

          var request = {
              origin: new maps.LatLng($scope.map.myLocationMarker.coords.latitude, $scope.map.myLocationMarker.coords.longitude),
              destination: new maps.LatLng(park.latitude, park.longitude),
              travelMode: travelMode,
          };
          directionsService.route(request, displayDirections);
        };

        function getBestTravelMode(park) {
          var a = Math.abs(park.latitude - $scope.map.myLocationMarker.coords.latitude);
          var b = Math.abs(park.longitude - $scope.map.myLocationMarker.coords.longitude);
          var dist = Math.sqrt( Math.pow(a, 2) + Math.pow(b, 2) );
          $scope.travelMode = { 'fa-car': dist > 0.012, 'fa-male': dist <= 0.012 };
          return (dist <= 0.012) ? maps.TravelMode.WALKING : maps.TravelMode.DRIVING;
        };

        function displayDirections(response, status) {
          if (status === maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
            placeCustomMarkers(response);
            extractDirectionsInfo(response);
          } else {
            console.log('Error', status, response);
          }
        };


        function placeCustomMarkers(response) {
          var leg = response.routes[0].legs[0];
          makeMarker( leg.start_location, icons.start, 'You' );
          makeMarker( leg.end_location, icons.end, 'Park' );
        };

        var startEndMarkers = [];

        function makeMarker( position, icon, title ) {
          if (startEndMarkers[startEndMarkers.length - 2]) { startEndMarkers[startEndMarkers.length - 2].setMap(null); }
          var marker = new maps.Marker({
            position: position,
            map: map,
            icon: icon,
            title: title,
            animation: maps.Animation.DROP
          });
          startEndMarkers.push(marker);
        };

        function extractDirectionsInfo(response) {
          var r = response.routes[0].legs[0];
          var dt = r.distance.text;
          var dur = r.duration.text;
          // Other valuable information may include waypoints, steps, coordinates, etc.
          $scope.routeData = {
            distance: dt,
            duration: dur
          };

          // Color code the dist / dur text
          var a = parseInt(dt);
          var b = parseInt(dur);
          $scope.distanceColoring = { 'text-success': a <= 3 || dt.substring(dt.length - 2, dt.length) === 'ft', 'text-warn': a > 3 && a <= 10 && dt.substring(dt.length - 2, dt.length) !== 'ft', 'text-danger': a > 10 && dt.substring(dt.length - 2, dt.length) !== 'ft' };
          $scope.durationColoring = { 'text-success': b <= 10, 'text-warn': b > 10 && b <= 20, 'text-danger': b > 20 };

        };
      }
    };

  });

})(window.angular);