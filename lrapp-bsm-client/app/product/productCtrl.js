app.controller('ProductCtrl', ['$scope', '$uibModal', function ($scope, $uibModal) {

  $scope.openAdvancedSearch = function (position) {
    $uibModal.open({
      templateUrl: 'asideContent.html',

    });

  };

  $scope.queryConfig = {
    fields: [
      {
        name: 'name1',
        label: '单据号'
      },
      {
        name: 'name2',
        label: '单据号'
      },
      {
        name: 'name1',
        label: '单据号'
      },
      {
        name: 'name1',
        label: '单据号'
      },
      {
        name: 'name1',
        label: '单据号'
      }
    ]
  };

  $scope.mainGrid = {
    data: [
      {
        "firstName": "Cox",
        "lastName": "Carney",
        "company": "Enormo",
        "employed": true
      },
      {
        "firstName": "Lorraine",
        "lastName": "Wise",
        "company": "Comveyer",
        "employed": false
      },
      {
        "firstName": "Nancy",
        "lastName": "Waters",
        "company": "Fuelton",
        "employed": false
      }
    ],
    enableRowSelection: true,
    enableSelectAll: true,
    paginationPageSizes: [5, 10, 20],
    paginationPageSize: 20,
    columnDefs: [
      {
        field: "firstName",
        displayName: "审批状态"
      },
      {
        field: "lastName",
        displayName: "审批状态"
      },
      {
        field: "company",
        displayName: "审批状态"
      },
      {
        field: "employed",
        displayName: "审批状态"
      }
    ]
  }



}]);