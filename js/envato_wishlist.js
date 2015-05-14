

var envato_wishlist = (function () {
    // copyright @dtbaker

    var config = {
        api_url: 'https://api.envato.com/v1/market/',
        envato_personal_token: '',
        site: '',
        app_version: 1
    };
    var consoleHolder = console;
    var init_callbacks = [];



    return {
        get_config: function(name){return typeof name != 'undefined' ? config[name] : config;},
        set_config: function(name,value){
            if(typeof name == 'object'){
                for(var i in name){
                    if(name.hasOwnProperty(i)){
                        this.set_config(i, name[i]);
                    }
                }
            }
            if(typeof config[name] != 'undefined') {
                config[name] = value;
            }
        },
        init: function () {
            // code

            this.debug(true);

            while(init_callbacks.length > 0){
                var f = init_callbacks.pop();
                if(typeof f == 'function'){
                    f();
                }
            }

            this.ui.init();

            return true;
        },
        add_init: function(func){
            init_callbacks.push(func);
        },
        debug: function(bool){
            if(!bool){
                consoleHolder = console;
                console = {};
                console.log = function(){};
                console.debug = function(){};
            }else
                console = consoleHolder;
        },
        util: {
            getParameterByName: function(name) {
                name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
                var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                    results = regex.exec(location.search);
                return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
            }
        }
    };

})();


// UI / swapping screens around etc..
(function (envato_wishlist) {

    var $wishlist_dom = false;
    var $loading_dom = false;

    function slug(slugname){
        window.location.hash = slugname;
    }
    function step_welcome($section, stepname, callback){
        slug(stepname);
        $section.find('a').off('click.envato_wishlist');
        $section.find('a').on('click.envato_wishlist', function(){
            envato_wishlist.set_config('site',jQuery(this).data('site'));
            envato_wishlist.ui.loadstep('category', step_category);
            return false;
        });
        if(typeof callback == 'function')callback($section, stepname);
        else envato_wishlist.ui.loadstep(stepname);
    }
    function step_category($section, stepname, callback){
        slug(stepname);

        //alert(config['site']);
        // grab the list of categories for this site via the new api.
        envato_wishlist.api('categories:themeforest.json');

        if(typeof callback == 'function')callback($section, stepname);
        else envato_wishlist.ui.loadstep(stepname);
    }


    envato_wishlist.ui = {
        init: function(){

            $wishlist_dom = jQuery('#envato_wishlist');
            $loading_dom = $wishlist_dom.find('div').first();

            this.loadstep('welcome', step_welcome);

        },
        loadstep: function(stepname, loadcode, callback) {

            $wishlist_dom.find('section').hide();
            $loading_dom.show();
            var $section = $wishlist_dom.find('[step=' + stepname + ']');
            if(typeof loadcode == 'function'){
                loadcode($section, stepname, callback);
            }else{
                $section.show();
                $loading_dom.hide();
            }

        }


    };
    return envato_wishlist;
})(envato_wishlist || {});

// API
// todo: clean this up and release it as a separate 3rd party module that others can use to access the API
(function (envato_wishlist) {
    envato_wishlist.api = function(endpoint, data, callback){
        var t = this;
        console.log("API call");
        console.log(data);
        jQuery.ajax({
            type: data ? "POST" : "GET",
            url: t.get_config('api_url') + endpoint,
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", 'Bearer ' + t.get_config('envato_personal_token'));
            },
            data: data,
            success: function (result) {
                if (result.status == 'error') {
                    console.log('API error: ', false);
                    console.log(result, false);
                }
                if (typeof callback == 'function') {
                    callback(result);
                }
            },
            error: function () {
                console.log('API js error', false);
                if (typeof callback == 'function') {
                    callback(false);
                }
            },
            dataType: 'json'
        });
    };
    return envato_wishlist;
})(envato_wishlist || {});

if(typeof envato_wishlist_options != 'undefined'){
    // options set by wp localize script.
    envato_wishlist.set_config(envato_wishlist_options);
}
envato_wishlist.init();