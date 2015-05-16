

var envato_wishlist = (function ($) {
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

})(jQuery);


// UI / swapping screens around etc..
(function (envato_wishlist,$) {

    var $wishlist_dom = false;

    var search_site = false;
    var search_category = false;

    var enable_material = false;

    function slug(slugname){
        window.location.hash = slugname;
    }

    function step_welcome($section, stepname, callback){
        slug(stepname);
        $section.find('a').off('click.envato_wishlist');
        $section.find('a').on('click.envato_wishlist', function(){
            search_site = $(this).data('site');
            search_category = $(this).data('category');
            $section.find('.small-title-text').text($(this).data('title-text'));
            envato_wishlist.ui.loadstep('category', step_category);
            return false;
        });
        if(typeof callback == 'function')callback($section, stepname);
        else envato_wishlist.ui.loadstep(stepname);
    }
    function step_category($section, stepname, callback){
        slug(stepname + '=' + search_site);
        search_params = null; // reset any params.
        //alert(config['site']);
        console.log('Restrict category to: '+search_category);
        // grab the list of categories for this site via the new api.
        envato_wishlist.api('market/categories:' + search_site + '.json',false,function(api_result){
            var top_level_categories = [];
            if(api_result && typeof api_result.categories != 'undefined'){
                // find top level categories.
                $section.find('ul li').remove();
                for(var i = 0; i < api_result.categories.length; i++){
                    //console.log("Checking category: "+api_result.categories[i].path);
                    if( ( !search_category && !api_result.categories[i].path.match(/\//) )
                        ||
                        ( search_category && api_result.categories[i].path.indexOf(search_category) == 0 && (
                            api_result.categories[i].path == search_category ||
                            api_result.categories[i].path.match(/^\w+\/\w+$/)
                        ) )
                    ){
                        api_result.categories[i].link = $('<a href="#">' + (api_result.categories[i].path == search_category ? "All " : "") + api_result.categories[i].name + '</a>');
                        api_result.categories[i].link.data('category',api_result.categories[i]);
                        top_level_categories.push(api_result.categories[i]);
                        var li = $('<li/>')
                            .addClass('market-category')
                            .appendTo($section.find('ul'));
                        api_result.categories[i].link.appendTo(li);
                        api_result.categories[i].link.click(function(){
                            search_category = $(this).data('category').path;
                            $section.find('.small-title-text').text($(this).data('category').name);
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

    var search_params = null;

    function step_search($section, stepname, callback){
        slug(stepname);
        // grab the list of categories for this site via the new api.
        var doing_search_filter = !!search_params;

        if(!search_params)search_params = {};
        search_params.site = search_site + '.net';
        search_params.page_size = 40;
        search_params.sort_by = 'trending';
        if(search_category){
            search_params.category = search_category;
        }
        for(var i in search_params){
            if(search_params.hasOwnProperty(i) && !search_params[i]){
                delete(search_params[i]);
            }
        }

        envato_wishlist.api('discovery/search/search/item',search_params,function(api_result){
            var top_level_categories = [];
            var template_search_results_item = $('#template_envato_wishlist_item').html();

            if(api_result && typeof api_result.matches != 'undefined' && api_result.matches.length > 0){
                // find top level categories.
                var $results_list = $section.find('.search_results .inner-content');
                var $results_form = $section.find('.search_form');
                $section.find('.search_results').removeClass('loading');
                $results_list.children().remove();
                if(true){ //} || !doing_search_filter) {
                    $results_form.children().remove();
                    console.debug(api_result);

                    if(typeof api_result.aggregations['rating'] != 'undefined'){
                        api_result.aggregations['rating_min'] = api_result.aggregations['rating'];
                        delete(api_result.aggregations['rating']);
                    }
                    for (var a in api_result.aggregations) {
                        // build up aggregation in the form.
                        if (api_result.aggregations.hasOwnProperty(a) && api_result.aggregations[a] && api_result.aggregations[a].length > 1 && typeof api_result.aggregations[a][0].key != 'undefined') {
                            if (a == 'category')continue;
                            // todo: template this:
                            var $d = $('<div />', {
                                class: 'aggregation input-field col s12 m6 l3'
                            });
                            // dave you're up to here!
                            var $select = $('<select />', {
                                name: 'search',
                                id: 'search-' + a,
                                class: 'aggregation',
                                'data-aggregation': a
                            });
                            $("<option />", {
                                value: '',
                                text: 'Any'
                            }).appendTo($select);
                            $select.on('change', function () {
                                if(typeof search_params[$(this).data('aggregation')] != 'undefined' && search_params[$(this).data('aggregation')] == $(this).val())return;
                                
                                console.log($(this).data('aggregation') + ' changed to ' + $(this).val());
                                search_params[$(this).data('aggregation')] = $(this).val();
                                $section.find('.search_results').addClass('loading');
                                step_search($section, 'search');
                            });
                            for (var ax = 0; ax < api_result.aggregations[a].length; ax++) {
                                $("<option />", {
                                    value: api_result.aggregations[a][ax].key,
                                    text: api_result.aggregations[a][ax].key + ( typeof api_result.aggregations[a][ax].count != 'undefined' ? ' (' + api_result.aggregations[a][ax].count + ')' : '')
                                }).appendTo($select);
                            }
                            $select.val(typeof search_params[a] != 'undefined' ? search_params[a] : '');
                            $select.appendTo($d);
                            $('<label />', {
                                text: a
                            }).appendTo($d);
                            $d.appendTo($results_form);
                        }
                    }
                }

                for(var i = 0; i < api_result.matches.length; i++){
                    var item_html = template_search_results_item;

                    api_result.matches[i].link = $('<a/>');
                    for(var x in api_result.matches[i]){
                        if(api_result.matches[i].hasOwnProperty(x) && (typeof api_result.matches[i][x] == 'string' || typeof api_result.matches[i][x] == 'number')){
                            item_html = item_html.replace(new RegExp('{{' + x + '}}', 'g'),api_result.matches[i][x]);
                            $('<span class="item-' + x + '">' + api_result.matches[i][x] + '</span>').appendTo(api_result.matches[i].link);
                        }
                    }
                    $('<span class="item-rating">' + api_result.matches[i].rating.rating + '</span>').appendTo(api_result.matches[i].link);
                    item_html = item_html.replace(new RegExp('{{rating}}', 'g'),api_result.matches[i].rating.rating);
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
                    if(typeof api_result.matches[i].previews.live_site != 'undefined'){
                        item_html = item_html.replace(new RegExp('{{live_preview_url}}', 'g'),api_result.matches[i].previews.live_site.url);
                    }else{
                        // todo - remove live preview button completely.
                        item_html = item_html.replace(new RegExp('{{live_preview_url}}', 'g'),'#');
                    }
                    if(thumb){
                        $('<img class="item-thumb" src="' + thumb + '" />').appendTo(api_result.matches[i].link);
                        item_html = item_html.replace(new RegExp('{{thumb}}', 'g'),thumb);
                    }
                    if(preview){
                        $('<img class="item-preview" src="' + preview + '" />').appendTo(api_result.matches[i].link);
                        item_html = item_html.replace(new RegExp('{{preview}}', 'g'),preview);
                    }

                    $results_list.append(item_html);

                    api_result.matches[i].link.data('item',api_result.matches[i]);
                    /*var li = $('<li/>')
                        .addClass('market-item')
                        .appendTo($section.find('ul'));
                    api_result.matches[i].link.appendTo(li);
                    api_result.matches[i].link.click(function(){
                        return false;
                    });*/
                }


            }else{
                alert('No results sorry, please try a different search.');
                envato_wishlist.ui.loadstep('category');
                return false;
            }
            if(typeof callback == 'function')callback($section, stepname);
            else envato_wishlist.ui.loadstep(stepname);

        });
    }

    var current_step = false;
    var template_section = false;
    var template_welcome_button = false;

    function build_welcome_step_ui(){
        // grab the options from config.
        var buttons = [
            {
                title: 'WordPress Themes',
                description: 'asdfasdfasdf',
                image: 'asdfasdf',
                category: 'wordpress',
                site: 'themeforest'
            },
            {
                title: 'WordPress Plugins',
                description: 'asdfasdfasdf',
                image: 'asdfasdf',
                category: 'wordpress',
                site: 'codecanyon'
            }
        ];
        var section_html = template_section;
        var button_html = '';
        for(var i = 0; i < buttons.length; i++){
            var button = template_welcome_button;
            for(var b in buttons[i]){
                if(buttons[i].hasOwnProperty(b)){
                    button = button.replace(new RegExp('{{' + b + '}}', 'g'),buttons[i][b]);
                }
            }
            button_html = button_html + button;
        }
        section_html = section_html.replace('{{section_name}}','welcome');
        section_html = section_html.replace('{{section_title}}','What would you like to buy?');
        section_html = section_html.replace('{{section_icon}}','mdi-av-play-arrow');
        section_html = section_html.replace('{{section_title_small}}','Buying: <span class="small-title-text"></span>');
        section_html = section_html.replace('{{section_option}}',button_html);
        return section_html;

    }

    function build_catgeory_step_ui(){
        var section_html = template_section;
        section_html = section_html.replace('{{section_name}}','category');
        section_html = section_html.replace('{{section_title}}','Select Category');
        section_html = section_html.replace('{{section_icon}}','mdi-action-dashboard');
        section_html = section_html.replace('{{section_title_small}}','Category: <span class="small-title-text"></span>');
        section_html = section_html.replace('{{section_option}}','<ul></ul>');
        return section_html;
    }
    function build_search_step_ui(){
        var section_html = template_section;
        section_html = section_html.replace('{{section_name}}','search');
        section_html = section_html.replace('{{section_title}}','Search Through Results');
        section_html = section_html.replace('{{section_icon}}','mdi-action-search');
        section_html = section_html.replace('{{section_title_small}}','Search <span class="small-title-text"></span>');
        var template_search_results = $('#template_envato_wishlist_search').html();
        section_html = section_html.replace('{{section_option}}',template_search_results);
        return section_html;
    }
    function build_item_step_ui(){
        var section_html = template_section;
        section_html = section_html.replace('{{section_name}}','item');
        section_html = section_html.replace('{{section_title}}','View Item');
        section_html = section_html.replace('{{section_title_small}}','View Item: <span class="small-title-text"></span>');
        section_html = section_html.replace('{{section_option}}','<ul></ul>');
        return section_html;
    }
    envato_wishlist.ui = {
        init: function(){
            $wishlist_dom = $('#envato_wishlist');

            template_section = $('#template_envato_wishlist_section').html();
            template_welcome_button = $('#template_envato_wishlist_welcome_button').html();

            $wishlist_dom.find('.section_holder').append(build_welcome_step_ui());
            $wishlist_dom.find('.section_holder').append(build_catgeory_step_ui());
            $wishlist_dom.find('.section_holder').append(build_search_step_ui());
            $wishlist_dom.find('.section_holder').append(build_item_step_ui());

            $wishlist_dom.on('click','.envatosection.completed',function(){
                envato_wishlist.ui.loadstep($(this).data('section'));
            });
            envato_wishlist.ui.loadstep('welcome', step_welcome);
        },
        loadstep: function(stepname, loadcode, callback) {
            $section = false;
            $wishlist_dom.find('.envatosection').each(function(){
                if($(this).data('section') == stepname){
                    $section = $(this);
                }else{
                    $(this).removeClass('shown');
                    if(!$section){
                        $(this).addClass('completed');
                    }else{
                        $(this).removeClass('completed');
                    }
                }
            });
            current_step = stepname;
            //$wishlist_dom.find('section').removeClass('shown').removeClass('completed');


            if(typeof loadcode == 'function'){
                $section.addClass('loading').trigger('envato.loading');
                loadcode($section, stepname, callback);
            }else{
                $section.removeClass('loading').addClass('shown').trigger('envato.show');
                //$section.prevAll('section').addClass('completed');
            }
        }

    };

    envato_wishlist.add_init(envato_wishlist.ui.init);

    return envato_wishlist;
})(envato_wishlist || {}, jQuery);

// API
// todo: clean this up and release it as a separate 3rd party module that others can use to access the API
(function (envato_wishlist, $) {
    envato_wishlist.api = function(endpoint, data, callback){
        var t = this;
        console.log("API call");
        console.log(data);
        $.ajax({
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
})(envato_wishlist || {}, jQuery);
