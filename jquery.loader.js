/**
 *      jQuery Loader Plugin v1.0
 * by Ernani Azevedo <ernaniaz@gmail.com>
 *
 * @name        jQuery Loader
 * @description Loader is a jQuery plugin that loads JS and CSS with dependencies.
 * @version     1.0
 * @requires    jQuery 1.8.0 or newer (not testes with older versions, probably works)
 * @author      Ernani Azevedo <ernaniaz@gmail.com>
 * @license     MIT
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
      if ( typeof $.loader.data[( typeof ( options.js[i].name) == 'string' ? options.js[i].name : options.js[i].src)] === 'undefined')
      {
        $.loader.data[( typeof ( options.js[i].name) == 'string' ? options.js[i].name : options.js[i].src)] = { 'type': 'js', 'status': 'unloaded', 'loaded': false, 'src': options.js[i].src, 'cache': ( typeof ( options.js[i].cache) == 'boolean' ? options.js[i].cache : options.cache), 'dep': ( options.js[i].dep || [])};
      }
    }

    // Add css styles to process list:
    for ( i in options.css)
    {
      if ( typeof $.loader.data[( typeof ( options.css[i].name) == 'string' ? options.css[i].name : options.css[i].src)] === 'undefined')
      {
        $.loader.data[( typeof ( options.css[i].name) == 'string' ? options.css[i].name : options.css[i].src)] = { 'type': 'css', 'status': 'unloaded', 'loaded': false, 'src': options.css[i].src, 'cache': ( typeof ( options.css[i].cache) == 'boolean' ? options.css[i].cache : options.cache), 'media': ( typeof ( options.css[i].media) == 'string' ? options.css[i].media : 'screen, projection')};
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
        if ( $.loader.data[i].type == 'js')
        {
          var deps = true;
          for ( j in $.loader.data[i].dep)
          {
            if ( $.loader.data[$.loader.data[i].dep[j]].status != 'loaded')
            {
              deps = false;
            }
          }
          if ( deps && $.loader.data[i].status == 'unloaded')
          {
            $.loader.loadjs ( i);
          }
        } else {
          if ( $.loader.data[i].status == 'unloaded')
          {
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
                 $('<link>').attr ( 'rel', 'stylesheet').attr ( 'type', 'text/css').attr ( 'media', $.loader.data[name].media).attr ( 'href', $.loader.data[name].src).appendTo ( 'head');
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
