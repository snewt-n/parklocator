(function(angular) {

  'use strict';

  angular.module('appDirectives').directive('locationSelection', function () {
    
    return { 
      restrict: 'E',
      scope: {},
      templateUrl: 'views/directives/location-selection.html',
      controller: ['$scope', 'Esri', 'mapService', '$mdSidenav', function ($scope, Esri, mapService, $mdSidenav) {

        $scope.geolocate = function() {
          $mdSidenav('left').close();
          mapService.geoLocate();
        };

      }]
      
    };

  });

})(window.angular);