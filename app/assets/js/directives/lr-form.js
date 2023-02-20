/**
 * Created by wangdao on 2016/7/31.
 */

angular.module("lrApp")
  .directive('lrForm', function ($compile) {

    function generateInput(field) {
      var $input = $('<input class="form-control" name="'+ field['name'] +'" />');

      var type = field.type || 'text';

      if (type === "datetime") {
        $input.attr("datetimepicker", "");
      } else {
        $input.attr("type", type);
      }

      var name = field.name;
      if (!name) {
        $input.attr("ng-model", name);
      }


      return $input;
    }

    function getTemplate($scope) {
      var lrForm = $scope.lrForm;
      var fields = lrForm && lrForm.fields || [];
      var i = 0;

      // var $formFields = $('<div></div>');

      var $form = $('<form class="form-horizontal"></form>');

      var $formGroup = $('<div class="form-group"></div>');
      for(; i < fields.length; i++) {
        var field = fields[i];

        var $label = $('<label class="col-md-4 control-label">' + field["label"] + '：</label>');

        var $inputWrapper = $('<div class="col-md-8"></div>');
        var $input = generateInput(field);

        $inputWrapper.append($input);

        var $formFieldWrapper = $('<div class="col-md-4"></div>');
        $formFieldWrapper.append($label).append($inputWrapper);

        $formGroup.append($formFieldWrapper);


        if ( ((i + 1) % 3 == 0) || (i + 1 == fields.length)) {
          $form.append($formGroup);

          $formGroup = $('<div class="form-group"></div>');
        }
      }


      return $form;
    }


    return {
      scope: {
        lrForm: '=',
      },

      restrict: 'A',
      // template: '<div ng-include="getTemplate()"></div>',
      replace: true,
      link: function (scope, element, attrs) {
        var template = $compile(getTemplate(scope))(scope);
        element.append(template);
      }
    }
  });