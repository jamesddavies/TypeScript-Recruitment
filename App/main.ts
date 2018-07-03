/// <reference path="../Scripts/typings/knockout/knockout.d.ts" />
/// <reference path="../Scripts/typings/toastr/toastr.d.ts" />
///// <reference path="../Scripts/typings/requirejs/require.d.ts" />

// Since current version of require.d.ts does not support deifne using function() and KnockoutStatic as last paremeter,
// we use "declare" to make typescript compiler ignore the define statements below
// This trick can be used in typescript whenever typeings are missing or not up to date with the use you want.
declare var define;
declare var require;
 
// Maps the files so Durandal knows where to find these.
require.config({
    paths: {
        'text': '../Scripts/text',
        'durandal': '../Scripts/durandal',
        'plugins': '../Scripts/durandal/plugins',
        'transitions': '../Scripts/durandal/transitions'
    }
});



// Durandal 2.x assumes no global libraries. It will ship expecting 
// Knockout and jQuery to be defined with requirejs. .NET 
// templates by default will set them up as standard script
// libs and then register them with require as follows: 
define('jquery', function () { return jQuery; });
define('knockout', ko);

define(['durandal/app', 'durandal/viewLocator', 'durandal/system', 'plugins/router', 'services/logger'], boot);

function boot(app, viewLocator, system, router, logger) {

    // Enable debug message to show in the console 
    system.debug(true);

    app.title = 'My App';

    app.configurePlugins({
        router: true,
        dialog: true
    });

    app.start().then(function () {
        toastr.options.positionClass = 'toast-bottom-right';
        toastr.options.backgroundpositionClass = 'toast-bottom-right';

        // When finding a viewmodel module, replace the viewmodel string 
        // with view to find it partner view.
        // [viewmodel]s/sessions --> [view]s/sessions.html
        // Defaults to viewmodels/views/views. 
        // Otherwise you can pass paths for modules, views, partials
        viewLocator.useConvention();

        //Show the app by setting the root view model for our application.
        app.setRoot('viewmodels/shell', 'entrance');
    });
};