

var envato_wishlist = (function () {
    // copyright @dtbaker

    var config = {
        api_url: 'https://api.envato.com/v1/',
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
            $section.find('h3 span').text(jQuery(this).text());
            envato_wishlist.ui.loadstep('category', step_category);
            return false;
        });
        if(typeof callback == 'function')callback($section, stepname);
        else envato_wishlist.ui.loadstep(stepname);
    }
    function step_category($section, stepname, callback){
        slug(stepname + '=' + envato_wishlist.get_config('site'));
        //alert(config['site']);
        // grab the list of categories for this site via the new api.
        envato_wishlist.api('market/categories:' + envato_wishlist.get_config('site') + '.json',false,function(api_result){
            var top_level_categories = [];
            if(api_result && typeof api_result.categories != 'undefined'){
                // find top level categories.
                $section.find('ul li').remove();
                for(var i = 0; i < api_result.categories.length; i++){
                    if( !api_result.categories[i].path.match(/\//) ){
                        api_result.categories[i].link = jQuery('<a href="#">' + api_result.categories[i].name + '</a>');
                        api_result.categories[i].link.data('category',api_result.categories[i]);
                        top_level_categories.push(api_result.categories[i]);
                        var li = jQuery('<li/>')
                            .addClass('market-category')
                            .appendTo($section.find('ul'));
                        api_result.categories[i].link.appendTo(li);
                        api_result.categories[i].link.click(function(){
                            envato_wishlist.set_config('category',jQuery(this).data('category').path);
                            $section.find('h3 span').text(jQuery(this).data('category').name);
                            envato_wishlist.ui.loadstep('search', step_search);
                            return false;
                        });
                    }
                }


            }else{
                console.log('Error from API in step_category');
            }
            if(typeof callback == 'function')callback($section, stepname);
            else envato_wishlist.ui.loadstep(stepname);
        });
    }
    function step_search($section, stepname, callback){
        slug(stepname);
        // grab the list of categories for this site via the new api.
        envato_wishlist.api('discovery/search/search/item',{
            site: envato_wishlist.get_config('site') + '.net',
            page_size: 40,
            sort_by: 'trending'
        },function(api_result){
            var top_level_categories = [];
            if(api_result && typeof api_result.matches != 'undefined' && api_result.matches.length > 0){
                // find top level categories.
                var $results_ul = $section.find('ul');
                var $results_form = $section.find('form');
                $results_ul('li').remove();
                $results_form.find('div').remove();
                for(var a in api_result.aggregations){
                    // build up aggregation in the form.
                    if(api_result.aggregations.hasOwnProperty(a)){
                        var d = jQuery('div');
                        // dave you're up to here!
                    }

                }
                for(var i = 0; i < api_result.matches.length; i++){
                    api_result.matches[i].link = jQuery('<a/>');
                    for(var x in api_result.matches[i]){
                        if(api_result.matches[i].hasOwnProperty(x) && typeof api_result.matches[i][x] == 'string'){
                            jQuery('<span class="item-' + x + '">' + api_result.matches[i][x] + '</span>').appendTo(api_result.matches[i].link);
                        }
                    }
                    jQuery('<span class="item-rating">' + api_result.matches[i].rating.rating + '</span>').appendTo(api_result.matches[i].link);
                    var thumb = false, preview = false;
                    for(var th in api_result.matches[i].previews){
                        if(api_result.matches[i].previews.hasOwnProperty(th)){
                            if(typeof api_result.matches[i].previews[th].icon_url != 'undefined'){
                                thumb = api_result.matches[i].previews[th].icon_url;
                            }
                            if(typeof api_result.matches[i].previews[th].landscape_url != 'undefined'){
                                preview = api_result.matches[i].previews[th].landscape_url;
                            }
                        }
                    }
                    if(thumb){
                        jQuery('<img class="item-thumb" src="' + thumb + '" />').appendTo(api_result.matches[i].link);
                    }
                    if(preview){
                        jQuery('<img class="item-preview" src="' + preview + '" />').appendTo(api_result.matches[i].link);
                    }

                    api_result.matches[i].link.data('item',api_result.matches[i]);
                    var li = jQuery('<li/>')
                        .addClass('market-item')
                        .appendTo($section.find('ul'));
                    api_result.matches[i].link.appendTo(li);
                    api_result.matches[i].link.click(function(){

                        return false;
                    });
                }


            }else{
                alert('No results sorry, please try a different category.');
                envato_wishlist.ui.loadstep('category');
                return false;
            }
            if(typeof callback == 'function')callback($section, stepname);
            else envato_wishlist.ui.loadstep(stepname);
        });
    }

    var current_step = false;

    envato_wishlist.ui = {
        init: function(){
            $wishlist_dom = jQuery('#envato_wishlist');
            $loading_dom = $wishlist_dom.find('div').first();
            $wishlist_dom.on('click','section.completed',function(){
                envato_wishlist.ui.loadstep(jQuery(this).attr('step'));
            });
            envato_wishlist.ui.loadstep('welcome', step_welcome);
        },
        loadstep: function(stepname, loadcode, callback) {
            if(current_step){

            }
            $section = false;
            $wishlist_dom.find('section').each(function(){
                if(jQuery(this).attr('step') == stepname){
                    $section = jQuery(this);
                }else{
                    jQuery(this).removeClass('shown');
                    if(!$section){
                        jQuery(this).addClass('completed');
                    }
                }
            });
            current_step = stepname;
            //$wishlist_dom.find('section').removeClass('shown').removeClass('completed');
            $loading_dom.show();

            if(typeof loadcode == 'function'){
                loadcode($section, stepname, callback);
            }else{
                $section.addClass('shown');
                //$section.prevAll('section').addClass('completed');
                $loading_dom.hide();
            }
        }

    };

    envato_wishlist.add_init(envato_wishlist.ui.init);

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
            type: "GET",
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