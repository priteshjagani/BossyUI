angular.module('BossyUIApp', [
	'ui.router',
	'ui.ace',
	'bossy'
])

    .config([function () {}])

    .run([function () {}])

	.controller('SandboxCtrl', [
		'$scope',
		'$http',
		'$compile',
		function ($scope, $http, $compile) {
			var currentDirective;
			var	selected = false;
			var	markupKey = '';
			var	optionsKey = '';

			$scope.smallEditors = false;
			$scope.editorsSize = 'glyphicon-resize-small';
			$scope.editorsCol = 'col-md-6';
			$scope.outputCol = 'col-md-6';

			$scope.optionsEditorOptions = {
				useWrapMode : true,
				theme:'twilight',
				mode: 'javascript',
				onLoad: function (optionsEditor) {
					optionsEditor.$blockScrolling = Infinity;
					$scope.optionsEditor = optionsEditor;
				},
				onChange: function () {
					localStorage[optionsKey] = $scope.optionsEditor.getValue();

					if (selected) {
						buildDirective();
					}
				}
			};

			$scope.markupEditorOptions = {
				useWrapMode : true,
				theme:'twilight',
				mode: 'html',
				onLoad: function (markupEditor) {
					markupEditor.$blockScrolling = Infinity;
					$scope.markupEditor = markupEditor;
				},
				onChange: function () {
					localStorage[markupKey] = $scope.markupEditor.getValue();

					if (selected) {
						buildDirective();
					}
				}
			};

			$scope.selectDirective = function (directive) {
				currentDirective = directive;
				markupKey = 'markup-' + directive;
				optionsKey = 'options-' + directive;

				angular.forEach($scope.directives, function(value, key) {
					$scope.directives[key].active = false;
				});

				$scope.directives[directive].active = !$scope.directives[directive].active;

				if (!localStorage[optionsKey] || !localStorage[markupKey]) {
					$http.get('/api/directives/' + directive + '/doc').then(function(results) {

						if (!localStorage[optionsKey]) {
							$scope.optionsEditor.setValue(results.data.params.join('\n'));
						} else {
							$scope.optionsEditor.setValue(localStorage[optionsKey]);
						}

						if (!localStorage[markupKey]) {
							$scope.markupEditor.setValue(results.data.markup);
						} else {
							$scope.markupEditor.setValue(localStorage[markupKey]);
						}

						buildDirective();
						selected = true;
					});
				} else {
					$scope.optionsEditor.setValue(localStorage[optionsKey]);
					$scope.markupEditor.setValue(localStorage[markupKey]);

					buildDirective();
					selected = true;
				}
			};

			$scope.refreshEditors = function () {
				 if (currentDirective) {
					 localStorage[optionsKey] = '';
					 localStorage[markupKey] = '';
					 $scope.selectDirective(currentDirective);
				 }
			};

			$scope.toggleEditorSize = function () {
				$scope.smallEditors = !$scope.smallEditors;
				$scope.editorsSize = $scope.smallEditors ? 'glyphicon-resize-full' : 'glyphicon-resize-small';
				$scope.editorsCol = $scope.smallEditors ? 'col-md-1' : 'col-md-6';
				$scope.outputCol = $scope.smallEditors ? 'col-md-11' : 'col-md-6';
			};

			function buildDirective () {
				var options = $scope.optionsEditor.getValue();
				var markup = $scope.markupEditor.getValue();

				try {
					eval(options);
				} catch (ex) {
					console.log('options syntax is incorrect');
					return;
				}

				var src = $compile(markup)($scope);
				var	dst = angular.element(document.getElementById('sandbox-output'));

				dst.empty();
				dst.append(src);
			}

			function init() {
				var module = angular.module('bossy');

				$scope.directives = {};

				angular.forEach(module.requires, function (directive) {
					$scope.directives[directive.split('.')[1]] = {
						active: false
					};
				});
			}

			init();
		}
	])
;
