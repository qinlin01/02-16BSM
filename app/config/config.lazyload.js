// lazyload config


/**
 * jQuery plugin config use ui-jq directive , config the js and css files that required
 * key: function name of the jQuery plugin
 * value: array of the css js file located
 */
app.constant('JQ_CONFIG', {
        // easyPieChart:   ['/jquery/charts/easypiechart/jquery.easy-pie-chart.js'],
        // sparkline:      ['/jquery/charts/sparkline/jquery.sparkline.min.js'],
        // plot:           ['/jquery/charts/flot/jquery.flot.min.js',
        //     '/jquery/charts/flot/jquery.flot.resize.js',
        //     '/jquery/charts/flot/jquery.flot.tooltip.min.js',
        //     '/jquery/charts/flot/jquery.flot.spline.js',
        //     '/jquery/charts/flot/jquery.flot.orderBars.js',
        //     '/jquery/charts/flot/jquery.flot.pie.min.js'],
        // slimScroll:     ['/jquery/slimscroll/jquery.slimscroll.min.js'],
        // sortable:       ['/jquery/sortable/jquery.sortable.js'],
        // nestable:       ['/jquery/nestable/jquery.nestable.js',
        //     '/jquery/nestable/nestable.css'],
        // filestyle:      ['/jquery/file/bootstrap-filestyle.min.js'],
        // slider:         ['/jquery/slider/bootstrap-slider.js',
        //     '/jquery/slider/slider.css'],
        chosen: ['modules/chosen/chosen.jquery.min.js',
            'modules/chosen/chosen.css']
        // TouchSpin:      ['/jquery/spinner/jquery.bootstrap-touchspin.min.js',
        //     '/jquery/spinner/jquery.bootstrap-touchspin.css'],
        // wysiwyg:        ['/jquery/wysiwyg/bootstrap-wysiwyg.js',
        //     '/jquery/wysiwyg/jquery.hotkeys.js'],
        // dataTable:      ['/jquery/datatables/jquery.dataTables.min.js',
        //     '/jquery/datatables/dataTables.bootstrap.js',
        //     '/jquery/datatables/dataTables.bootstrap.css'],
        // vectorMap:      ['/jquery/jvectormap/jquery-jvectormap.min.js',
        //     '/jquery/jvectormap/jquery-jvectormap-world-mill-en.js',
        //     '/jquery/jvectormap/jquery-jvectormap-us-aea-en.js',
        //     '/jquery/jvectormap/jquery-jvectormap.css'],
        // footable:       ['/jquery/footable/footable.all.min.js',
        //     '/jquery/footable/footable.core.css']
    }
)
    // oclazyload config
    .config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
        // We configure ocLazyLoad to use the lib script.js as the async loader
        $ocLazyLoadProvider.config({
            debug:  false,
            events: true,
            modules: [
                {
                    name: 'ngGrid',
                    files: [
                        'modules/ng-grid/ng-grid.min.js'
                    ]
                },
               
                {
                    name:'angularFileUpload',
                    files: [
                        'modules/angular-file-upload/angular-file-upload.min.js'
                    ]
                },
                {
                    name:'ui.calendar',
                    files: ['modules/angular-ui-calendar/calendar.js']
                },
                {
                    name: 'ngImgCrop',
                    files: [
                        'modules/ngImgCrop/ng-img-crop.js',
                        'modules/ngImgCrop/ng-img-crop.css'
                    ]
                },
                {
                    name: 'angularBootstrapNavTree',
                    files: [
                        'modules/angular-bootstrap-nav-tree/abn_tree_directive.js',
                        'modules/angular-bootstrap-nav-tree/abn_tree.css'
                    ]
                },
                {
                    name: 'toaster',
                    files: [
                        'modules/angularjs-toaster/toaster.js',
                        'modules/angularjs-toaster/toaster.css'
                    ]
                },
                {
                    name: 'textAngular',
                    files: [
                        'modules/textAngular/textAngular-sanitize.min.js',
                        'modules/textAngular/textAngular.min.js'
                    ]
                },
                {
                    name: 'vr.directives.slider',
                    files: [
                        'modules/angular-slider/angular-slider.min.js',
                        'modules/angular-slider/angular-slider.css'
                    ]
                },
                {
                    name: 'com.2fdevs.videogular',
                    files: [
                        'modules/videogular/videogular.min.js'
                    ]
                },
                {
                    name: 'com.2fdevs.videogular.plugins.controls',
                    files: [
                        'modules/videogular/plugins/controls.min.js'
                    ]
                },
                {
                    name: 'com.2fdevs.videogular.plugins.buffering',
                    files: [
                        'modules/videogular/plugins/buffering.min.js'
                    ]
                },
                {
                    name: 'com.2fdevs.videogular.plugins.overlayplay',
                    files: [
                        'modules/videogular/plugins/overlay-play.min.js'
                    ]
                },
                {
                    name: 'com.2fdevs.videogular.plugins.poster',
                    files: [
                        'modules/videogular/plugins/poster.min.js'
                    ]
                },
                {
                    name: 'com.2fdevs.videogular.plugins.imaads',
                    files: [
                        'modules/videogular/plugins/ima-ads.min.js'
                    ]
                }
            ]
        });
    }])
;
