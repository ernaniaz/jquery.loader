jquery.loader
=============
[![GitHub release](https://img.shields.io/github/release/ernaniaz/jquery.loader.svg?maxAge=2592000)](https://github.com/ernaniaz/jquery.loader)
[![GitHub license](https://img.shields.io/github/license/ernaniaz/jquery.loader.svg)](https://github.com/ernaniaz/jquery.loader)

This is a simple plugin that load CSS and JavaScript files into page, with dependencies and progress informations.
It's usefull to modern web based systems that didn't reload the page, and load all the required libraries at first page access.

Features
--------
* Allow code dependency load;
* Support progress monitor;
* Callback after all scripts loaded;
* Load JavaScript and CSS files.

Basic Usage
-----------
```javascript
$.loader (
{
  // Add array with JavaScript file list to be loaded. Structure must has 'name', 'src' and 'dep' informations.
  'js': [
          {
            name: 'main-javascript',
            src: 'js/main-javascript.js',
            dep: [
                   'submodule-1',
                   'submodule-2'
                 ]
          },
          {
            name: 'submodule-1',
            src: 'js/submodule1.js',
            dep: [
                   'submodule-3'
                 ]
          },
          {
            name: 'submodule-2',
            src: 'js/submodule2.js',
            dep: []
          },
          {
            name: 'submodule-3',
            src: 'js/submodule3.js',
            dep: []
          }
        ],
  // Add array with CSS file list to be loaded. Structure must has 'name' and 'src' informations.
  'css': [
           {
             name: 'main-css',
             src: 'css/main-css.css'
           }
         ],
  // Should permit or not the use of cache. If false, will be added ?_(TIMESTAMP NUMBER) to URL, to avoid browser cache.
  'cache': false,
  // Number of retries in case of failure. 0 will disable retry.
  'retryLimit': 3,
  // Timeout in miliseconds to wait for script load. 0 will disable timeout.
  'timeout': 0,
  // Callback function to be executed every time a script is loaded or failed to be loaded. Parameters will be the name of the script.
  'onupdate': function ( script)
              {
                console.log ( 'onupdate fired to script ' + script);
              },
  // Callback function to be executed every time a script is loaded. Parameters will be the number of loaded files, total of files and percentage loaded.
  'onrefresh': function ( loaded, total, percentage)
               {
                 $('.percentage').animate ( { width: percentage + '%'}, 50);
               },
  // Callback function to be executed when 100% of files was loaded. Parameter will be the total of files loaded.
  'onfinish': function ( total)
              {
                $('.application').trigger ( 'start');
              }
});
```
Dependencies
------------
* [jQuery](http://jquery.com/)

History
-------
This plugin was created when I need to create a system with modular support and that need to load JavaScript code with dependencies to correct load order.

License
-------
MIT License.
