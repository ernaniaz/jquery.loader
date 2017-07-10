/**
 *      jQuery Loader Plugin v1.1
 * by Ernani Azevedo <ernaniaz@gmail.com>
 *
 * @name        jQuery Loader
 * @description Loader is a jQuery plugin that loads JS and CSS with dependencies.
 * @version     1.1
 * @requires    jQuery 1.8.0 or newer (not testes with older versions, probably works)
 * @author      Ernani Azevedo <ernaniaz@gmail.com>
 * @license     MIT
 */

/**
 * History:
 *
 * v1.0 - Released Nov/04/2013:
 * - First release
 *
 * v1.1 - Released Apr/15/2015:
 * - Fixed IE7, IE8 and IE9 CSS injection
 * - Added support to dependencies into CSS
 * - Added ID tag to JavaScripts
 * - Added ID and Class tags to CSSs
 */

;( function ( $)
{
  $.loader = function ( options)
  {
    // Sanitize css and js array:
    if ( typeof ( options.js) != 'object')
    {
      options.js = [];
    }
    if ( typeof ( options.css) != 'object')
    {
      options.css = [];
    }

    // Sanitize generic options:
    if ( typeof ( options.cache) == 'boolean')
    {
      $.loader.cache = options.cache;
    }
    if ( typeof ( options.retryLimit) == 'integer')
    {
      $.loader.retryLimit = options.retryLimit;
    }
    if ( typeof ( options.timeout) == 'integer')
    {
      $.loader.timeout = options.timeout;
    }
    if ( typeof ( options.onupdate) == 'function')
    {
      $.loader.onupdate = options.onupdate;
    }
    if ( typeof ( options.onfinish) == 'function')
    {
      $.loader.onfinish = options.onfinish;
    }
    if ( typeof ( options.onrefresh) == 'function')
    {
      $.loader.onrefresh = options.onrefresh;
    }

    // Add javascript scripts to process list:
    for ( i in options.js)
    {
      if ( typeof $.loader.data['js-' + ( typeof ( options.js[i].name) == 'string' ? options.js[i].name : options.js[i].src)] === 'undefined')
      {
        $.loader.data['js-' + ( typeof ( options.js[i].name) == 'string' ? options.js[i].name : options.js[i].src)] = { 'type': 'js', 'status': 'unloaded', 'loaded': false, 'src': options.js[i].src, 'cache': ( typeof ( options.js[i].cache) == 'boolean' ? options.js[i].cache : options.cache), 'dep': ( options.js[i].dep || []), 'id': ( typeof ( options.js[i].id) == 'string' ? options.js[i].id : '')};
      }
    }

    // Add css styles to process list:
    for ( i in options.css)
    {
      if ( typeof $.loader.data['css-' + ( typeof ( options.css[i].name) == 'string' ? options.css[i].name : options.css[i].src)] === 'undefined')
      {
        $.loader.data['css-' + ( typeof ( options.css[i].name) == 'string' ? options.css[i].name : options.css[i].src)] = { 'type': 'css', 'status': 'unloaded', 'loaded': false, 'src': options.css[i].src, 'cache': ( typeof ( options.css[i].cache) == 'boolean' ? options.css[i].cache : options.cache), 'media': ( typeof ( options.css[i].media) == 'string' ? options.css[i].media : 'screen, projection'), 'dep': ( options.css[i].dep || []), 'id': ( typeof ( options.css[i].id) == 'string' ? options.css[i].id : ''), 'class': ( typeof ( options.css[i].class) == 'string' ? options.css[i].class : '')};
      }
    };

    // Initialize and load using the refresh() method:
    $.loader.refresh ();
  };

  // Method to rescan dependencies and process it:
  $.loader.refresh = function ()
  {
    // Check every entry for dependencies:
    var loaded = 0;
    var total = 0;
    for ( i in $.loader.data)
    {
      // Get total of loaded scripts:
      if ( $.loader.data[i].status == 'loaded' || $.loader.data[i].status.substring ( 0, 6) == 'failed')
      {
        loaded++;
      }
      total++;

      // If not loaded, check and process it:
      if ( $.loader.data[i].loaded == false)
      {
        var deps = true;
        for ( j in $.loader.data[i].dep)
        {
          if ( $.loader.data[$.loader.data[i].type + '-' + $.loader.data[i].dep[j]].status != 'loaded')
          {
            deps = false;
          }
        }
        if ( deps && $.loader.data[i].status == 'unloaded')
        {
          if ( $.loader.data[i].type == 'js')
          {
            $.loader.loadjs ( i);
          } else {
            $.loader.loadcss ( i);
          }
        }
      }
    };

    // Call client refresh() event:
    $.loader.onrefresh ( loaded, total, ( loaded * 100) / total);

    if ( loaded == total)
    {
      $.loader.onfinish ( total);
    }
  };

  // Method to load javascript script files:
  $.loader.loadjs = function ( name)
  {
    $.loader.data[name].status = 'loading';
    $.loader.data[name].loaded = true;
    $.ajax (
    {
      type: 'GET',
      url: $.loader.data[name].src,
      dataType: 'script',
      timeout: $.loader.timeout,
      tryCount: 0,
      retryLimit: $.loader.retryLimit,
      cache: $.loader.data[name].cache,
      success: function ( script, textStatus)
               {
                 $.loader.data[name].status = 'loaded';
                 $.loader.onupdate ( name);
                 $.loader.refresh ();
               },
      error: function ( jqxhr, textStatus, errorThrown)
             {
               if ( textStatus == 'timeout')
               {
                 this.tryCount++;
                 if ( this.tryCount <= this.retryLimit)
                 {
                   $.ajax ( this);
                   return;
                 }
               }
               $.loader.data[name].status = 'failed: ' + textStatus;
               console.log ( 'Loader error on ' + name + ' <' + $.loader.data[name].src + '>: ' + textStatus);
               console.log ( errorThrown);
               $.loader.onupdate ( name);
               $.loader.refresh ();
             }
    });
  };

  // Method to load CSS style files:
  $.loader.loadcss = function ( name)
  {
    $.loader.data[name].status = 'loading';
    $.loader.data[name].loaded = true;
    $.ajax (
    {
      type: 'GET',
      url: $.loader.data[name].src,
      dataType: 'text',
      timeout: $.loader.timeout,
      tryCount: 0,
      retryLimit: $.loader.retryLimit,
      cache: $.loader.data[name].cache,
      success: function ( script, textStatus)
               {
                 if ( document.createStyleSheet)
                 {
                   iecss = document.createStyleSheet ( $.loader.data[name].src);
                   iecss.media = $.loader.data[name].media;
                   if ( $.loader.data[name].id != '')
                   {
                     iecss.id = $.loader.data[name].id;
                   }
                   if ( $.loader.data[name].class != '')
                   {
                     iecss.class = $.loader.data[name].class;
                   }
                 } else {
                   $('<link rel="stylesheet" type="text/css" media="' + $.loader.data[name].media + '" href="' + $.loader.data[name].src + '"' + ( $.loader.data[name].id != '' ? ' id="' + $.loader.data[name].id + '"' : '') + ( $.loader.data[name].class != '' ? ' class="' + $.loader.data[name].class + '"' : '') + ' />').appendTo ( 'head');
                 }
                 $.loader.data[name].status = 'loaded';
                 $.loader.onupdate ( name);
                 $.loader.refresh ();
               },
      error: function ( jqxhr, textStatus, errorThrown)
             {
               if ( textStatus == 'timeout')
               {
                 this.tryCount++;
                 if ( this.tryCount <= this.retryLimit)
                 {
                   $.ajax ( this);
                   return;
                 }
               }
               $.loader.data[name].status = 'failed: ' + textStatus;
               $.loader.onupdate ( name);
               $.loader.refresh ();
             }
    });
  };

  // Global plugin variables:
  $.loader.cache = true;
  $.loader.retryLimit = 3;
  $.loader.timeout = 30000;
  $.loader.data = {};
  $.loader.onfinish = function () {};
  $.loader.onupdate = function () {};
  $.loader.onrefresh = function () {};
})(jQuery);
