

var envato_wishlist = (function ($) {
    // copyright @dtbaker

    var config = {
        api_url: 'https://api.envato.com/v1/',
        ref: '',
        buttons: [],
        result_count: '',
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
        get_storage: function(name){
            var s = localStorage.getItem(name);
            if(s)return JSON.parse(s);
            return false;
        },
        set_storage: function(name,value){
            localStorage.setItem(name, JSON.stringify(value));
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
            },
            ucwords: function(str){
                //  discuss at: http://phpjs.org/functions/ucwords/
              // original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
              // improved by: Waldo Malqui Silva
              // improved by: Robin
              // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
              // bugfixed by: Onno Marsman
              //    input by: James (http://www.james-bell.co.uk/)
              //   example 1: ucwords('kevin van  zonneveld');
              //   returns 1: 'Kevin Van  Zonneveld'
              //   example 2: ucwords('HELLO WORLD');
              //   returns 2: 'HELLO WORLD'

              return (str + '')
                .replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function($1) {
                  return $1.toUpperCase();
                });
            }
        }
    };

})(jQuery);


// UI / swapping screens around etc..
(function (envato_wishlist,$) {

    var $wishlist_dom = false;

    var search_site = false;
    var search_category = false;
    var item_id = false;
    var item_details = {};
    var item_prefs = {};

    var enable_material = false;

    function slug(slugname){
        window.location.hash = slugname;
    }

    function save_item_prefs(item_id, key, val){
        if(typeof item_prefs[item_id] == 'undefined'){
            item_prefs[item_id] = {};
        }
        item_prefs[item_id][key] = val;
        envato_wishlist.set_storage('item_prefs',item_prefs);
    }
    function get_item_prefs(item_id, key, pref_default){
        if(typeof item_prefs[item_id] != 'undefined' && typeof item_prefs[item_id][key] != 'undefined'){
            return item_prefs[item_id][key];
        }
        return pref_default;
    }

    function step_welcome($section, stepname, callback){
        slug(stepname);
        $section.find('.welcome_card').off('click.envato_wishlist');
        $section.find('.welcome_card').on('click.envato_wishlist', function(){
            search_site = $(this).data('site');
            search_category = $(this).data('category');
            $section.find('.small-title-text').text($(this).data('title-text'));
            $section.addClass('completed');
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
            var template_cat_item = $('#template_envato_wishlist_category_item').html();
            if(api_result && typeof api_result.categories != 'undefined'){
                // find top level categories.
                $section.find('.category_items').children().remove();
                for(var i = 0; i < api_result.categories.length; i++){
                    //console.log("Checking category: "+api_result.categories[i].path);
                    if( ( !search_category && !api_result.categories[i].path.match(/\//) )
                        ||
                        ( search_category && api_result.categories[i].path.indexOf(search_category) == 0 && (
                            api_result.categories[i].path == search_category ||
                            api_result.categories[i].path.match(/^\w+\/\w+$/)
                        ) )
                    ){

                        top_level_categories.push(api_result.categories[i]);
                        var link = template_cat_item;
                        link = link.replace('{{category_name}}',(api_result.categories[i].path == search_category ? "All " : "") + api_result.categories[i].name);
                        var $link = $(link);
                        if(!$link.is('a')){
                            var $linkclick = $link.find('a');
                        }else{
                            var $linkclick = $link;
                        }
                        $linkclick.data('category',api_result.categories[i]).click(function(){
                            search_category = $(this).data('category').path;
                            $section.find('.small-title-text').text($(this).data('category').name);
                            $section.addClass('completed');
                            envato_wishlist.ui.loadstep('search', step_search);
                            return false;
                        });
                        $link.appendTo($section.find('.category_items'));
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
    var $selected_item = false;
    var result_count = 0;

    function step_search($section, stepname, callback){
        slug(stepname);
        // grab the list of categories for this site via the new api.
        var doing_search_filter = !!search_params;

        if(!search_params)search_params = {};
        search_params.site = search_site + '.net';
        search_params.page_size = envato_wishlist.get_config('result_count');
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
                result_count = api_result.matches.length;
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
                            // todo: template this so it doesn't rely on materialize:
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
                                text: envato_wishlist.util.ucwords(a.replace('_',' '))
                            }).appendTo($d);
                            $d.appendTo($results_form);
                        }
                    }
                }

                $section.find('.small-title-text').text(api_result.matches.length + ' items');

                for(var i = 0; i < api_result.matches.length; i++){
                    var item_html = template_search_results_item;
                    var item_variables = {
                        live_site: '',
                        rating: '',
                        updated_date: '',
                        like: 'undecided',
                        ref: envato_wishlist.get_config('ref')
                    };

                    if(typeof item_prefs[api_result.matches[i].id] != 'undefined'){
                        // we have notes or ratings for this one.
                        if(typeof item_prefs[api_result.matches[i].id].like != 'undefined'){
                            item_variables.like = item_prefs[api_result.matches[i].id].like;
                        }
                    }

                    for(var x in api_result.matches[i]){
                        if(api_result.matches[i].hasOwnProperty(x) && (typeof api_result.matches[i][x] == 'string' || typeof api_result.matches[i][x] == 'number')){
                            item_variables[x] = api_result.matches[i][x];
                        }
                    }
                    item_variables.description = item_variables.description.replace(/(\r\n|\n\r|\r|\n)+/g, '<br/><br/>');
                    item_variables.description = item_variables.description + '...';
                    item_variables.rating = typeof api_result.matches[i].rating != 'undefined' && typeof api_result.matches[i].rating.rating != 'undefined' ? api_result.matches[i].rating.rating : 0;
                    var thumb = false, preview = false;
                    for(var th in api_result.matches[i].previews){
                        if(api_result.matches[i].previews.hasOwnProperty(th)){
                            if(typeof api_result.matches[i].previews[th].icon_url != 'undefined'){
                                item_variables.thumb = api_result.matches[i].previews[th].icon_url;
                            }
                            if(typeof api_result.matches[i].previews[th].landscape_url != 'undefined'){
                                item_variables.preview = api_result.matches[i].previews[th].landscape_url;
                            }
                        }
                    }
                    if(!preview){
                        // look for square_url
                        for(var th in api_result.matches[i].previews){
                            if(api_result.matches[i].previews.hasOwnProperty(th)){
                                if(typeof api_result.matches[i].previews[th].square_url != 'undefined'){
                                    item_variables.preview = api_result.matches[i].previews[th].square_url;
                                }
                            }
                        }
                    }
                    item_variables.price = Math.floor(api_result.matches[i].price_cents / 100);
                    if(typeof api_result.matches[i].updated_at != 'undefined'){
                        var datetime = api_result.matches[i].updated_at.split('T');
                        item_variables.updated_date = datetime[0];
                    }
                    if(typeof api_result.matches[i].previews.live_site != 'undefined'){
                        item_variables.live_site = api_result.matches[i].previews.live_site.url;
                    }
                    for(var iv in item_variables){
                        if(item_variables.hasOwnProperty(iv)){
                            item_html = item_html.replace(new RegExp('{{' + iv + '}}', 'g'),item_variables[iv]);
                        }
                    }

                    $results_list.append(item_html);
                    var $b = $results_list.find('[data-item-id='+api_result.matches[i].id+']');
                    $b.data('item_variables',item_variables);
                    $b.find('.notes').text(get_item_prefs(api_result.matches[i].id,'notes',''));
                    if(get_item_prefs(api_result.matches[i].id,'like',false)){
                       $b.find('.yesnocheck input[value='+get_item_prefs(api_result.matches[i].id,'like',false)+']').prop('checked',true);
                    }
                }


            }else{
                alert('No results sorry, please try a different search.');
                envato_wishlist.ui.loadstep('category');
                return false;
            }

            $section.find('.open_details').off('click.envato_wishlist');
            $section.find('.open_details').on('click.envato_wishlist', function(){
                $selected_item = $(this).parents('.item_card').first();
                $section.addClass('completed');
                envato_wishlist.ui.loadstep('item', step_item);
                return false;
            });

            $section.find('.yesnocheck input')
                .off('change.envato_wishlist')
                .on('change.envato_wishlist', function(){
                    var $item = $(this).parents('.item_card').first();
                    $item.removeClass('like-undecided').removeClass('like-no').removeClass('like-yes').addClass('like-'+$(this).val());
                    item_id = $item.data('item-id');
                    if($(this).val() == "no"){
                        save_item_prefs(item_id,'data',{});
                        save_item_prefs(item_id,'like','no');
                    }else if($(this).val() == "yes"){
                        save_item_prefs(item_id,'data',$item.data('item_variables'));
                        save_item_prefs(item_id,'like','yes');
                    }
                    update_fav_list();
                    return false;
                });


            if(typeof callback == 'function')callback($section, stepname);
            else envato_wishlist.ui.loadstep(stepname);

        });
    }

    var previous_item = false, next_item = false;

    function step_item($section, stepname, callback){

        console.log($selected_item);
        slug(stepname);

        if(stepname == 'favitem'){
            var selected_item_id = $selected_item ? $selected_item.data('item-id') : 0;
            update_fav_list();
            // this ^ kills our $selected_item reference, because it rebuilds the dom.
            // find it again.
            if(stepname == 'favitem'){
                $selected_item = jQuery('[data-section="favlist"]').find('[data-item-id=' + selected_item_id + ']');
            }
            result_count = jQuery('[data-section="favlist"]').attr('data-count');
            if(!$selected_item){
                envato_wishlist.ui.loadstep('favlist');
            }
        }

        // find out what item we're at.
        if($selected_item){
            item_id = $selected_item.data('item-id');
            item_details = $selected_item.data('item_variables');

            var item_count = 0, found = false, previous_item = false, next_item = false;
            $selected_item.parents('.search_results').first().find('.item_card').each(function(){
                if(!found){
                    item_count++;
                } else if (!next_item){
                    next_item = this;
                }
                if($selected_item[0] === this){
                    found=true;
                }
                if(!found) {
                    previous_item = this;
                }
            });
        }


        $section.find('.large-title-text').text(' ' + item_count + ' of ' + result_count);

        envato_wishlist.api('market/item:' + item_id + '.json',false,function(api_result) {
            var top_level_categories = [];
            var template_search_results_item = $('#template_envato_wishlist_item').html();

            if (api_result && typeof api_result.item != 'undefined') {

                var item_html = $('#template_envato_wishlist_item_page').html();
                var item_variables = item_details;

                for(var x in api_result.item){
                    if(api_result.item.hasOwnProperty(x) && (typeof api_result.item[x] == 'string' || typeof api_result.item[x] == 'number')){
                        item_variables[x] = api_result.item[x];
                    }
                }
                item_variables.rating = typeof api_result.item.rating_decimal != 'undefined' ? api_result.item.rating_decimal : 0;
                item_variables.thumb = api_result.item.thumbnail;
                for(var iv in item_variables){
                    if(item_variables.hasOwnProperty(iv)){
                        item_html = item_html.replace(new RegExp('{{' + iv + '}}', 'g'),item_variables[iv]);
                    }
                }
                $section.find('.item_details').html(item_html);

            }

            $section.find('.item_nav')
                .off('click.envato_wishlist')
                .on('click.envato_wishlist', function(){
                    if($(this).data('direction') == 'prev' && previous_item){
                        $selected_item = $(previous_item);
                        envato_wishlist.ui.loadstep(stepname, step_item);
                    }else if($(this).data('direction') == 'next' && next_item){
                        $selected_item = $(next_item);
                        envato_wishlist.ui.loadstep(stepname, step_item);
                    }else{
                        if(stepname == 'favitem'){
                            envato_wishlist.ui.loadstep('favlist');
                        }else{
                            envato_wishlist.ui.loadstep('search');
                        }
                    }
                    return false;
                });
            if(get_item_prefs(item_id,'like',false)){
               $section.find('.yesnocheck input[value='+get_item_prefs(item_id,'like',false)+']').prop('checked',true);
            }
            $section.find('.yesnocheck input')
                .off('change.envato_wishlist')
                .on('change.envato_wishlist', function(){
                    $selected_item.removeClass('like-undecided').removeClass('like-no').removeClass('like-yes').addClass('like-'+$(this).val());
                    $selected_item.find('.yesnocheck input[value='+$(this).val()+']').prop('checked',true);

                    if($(this).val() == "no"){
                        save_item_prefs(item_id,'data',{});
                        save_item_prefs(item_id,'like','no');
                        if(next_item){
                            $selected_item = $(next_item);
                            envato_wishlist.ui.loadstep(stepname, step_item);
                        }else{
                            $selected_item = false;
                            if(stepname == 'favitem'){
                                envato_wishlist.ui.loadstep('favlist');
                            }else{
                                envato_wishlist.ui.loadstep('search');
                            }
                        }
                    }else if($(this).val() == "yes"){
                        save_item_prefs(item_id,'data',item_variables);
                        save_item_prefs(item_id,'like','yes');
                    }

                    var selected_item_id = $selected_item ? $selected_item.data('item-id') : 0;
                    console.log('doing update');
                    update_fav_list();
                    // this ^ kills our $selected_item reference, because it rebuilds the dom.
                    // find it again.
                    if(stepname == 'favitem'){
                        $selected_item = jQuery('[data-section="favlist"]').find('[data-item-id=' + selected_item_id + ']');
                    }
                    return false;
                });
            $section.find('.envato_item_notes')
                .val(get_item_prefs(item_id,'notes',''))
                .off('change.envato_wishlist')
                .on('change.envato_wishlist', function(){
                    $selected_item.find('.notes').text($(this).val());
                    save_item_prefs(item_id,'notes',$(this).val());
                    return false;
                });

            if(typeof callback == 'function')callback($section, stepname);
            else envato_wishlist.ui.loadstep(stepname);

        });
    }

    var current_step = false;
    var template_section = false;
    var template_welcome_button = false;

    function build_welcome_step_ui(){
        // grab the options from config.
        var buttons = envato_wishlist.get_config('buttons');
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
        section_html = section_html.replace('{{section_attrib}}','');
        section_html = section_html.replace('{{section_name}}','welcome');
        section_html = section_html.replace('{{section_title}}','What would you like to buy?');
        section_html = section_html.replace('{{section_icon}}','mdi-av-play-arrow');
        section_html = section_html.replace('{{section_title_small}}','Buying: <span class="small-title-text">(please select an option)</span>');
        section_html = section_html.replace('{{section_option}}',button_html);
        return section_html;

    }

    function build_catgeory_step_ui(){
        var section_html = template_section;
        section_html = section_html.replace('{{section_attrib}}','');
        section_html = section_html.replace('{{section_name}}','category');
        section_html = section_html.replace('{{section_title}}','Select Category');
        section_html = section_html.replace('{{section_icon}}','mdi-action-dashboard');
        section_html = section_html.replace('{{section_title_small}}','Category: <span class="small-title-text"></span>');
        section_html = section_html.replace('{{section_option}}',$('#template_envato_wishlist_category').text());
        return section_html;
    }
    function build_search_step_ui(){
        var section_html = template_section;
        section_html = section_html.replace('{{section_attrib}}','');
        section_html = section_html.replace('{{section_name}}','search');
        section_html = section_html.replace('{{section_title}}','Search Results');
        section_html = section_html.replace('{{section_icon}}','mdi-action-search');
        section_html = section_html.replace('{{section_title_small}}','Search Results: <span class="small-title-text"></span>');
        var template_search_results = $('#template_envato_wishlist_search').html();
        section_html = section_html.replace('{{section_option}}',template_search_results);
        return section_html;
    }
    function build_item_step_ui(){
        var section_html = template_section;
        section_html = section_html.replace('{{section_attrib}}','');
        section_html = section_html.replace('{{section_name}}','item');
        section_html = section_html.replace('{{section_title}}','View Item <span class="large-title-text"></span>');
        section_html = section_html.replace('{{section_icon}}','mdi-action-shop');
        section_html = section_html.replace('{{section_title_small}}','View Item: <span class="small-title-text"></span>');
        section_html = section_html.replace('{{section_option}}','<div class="item_details"></div>');
        return section_html;
    }
    function build_fav_step_ui(){
        var section_html = template_section;
        section_html = section_html.replace('{{section_attrib}}','data-count="0"');
        section_html = section_html.replace('{{section_name}}','favlist');
        section_html = section_html.replace('{{section_title}}','Your Favourites: <span class="large-title-text"></span>');
        section_html = section_html.replace('{{section_icon}}','mdi-action-shop');
        section_html = section_html.replace('{{section_title_small}}','Favourites: <span class="small-title-text"></span>');
        var template_search_results = $('#template_envato_wishlist_search').html();
        section_html = section_html.replace('{{section_option}}',template_search_results);
        return section_html;
    }
    function build_fav_item_step_ui(){
        var section_html = template_section;
        section_html = section_html.replace('{{section_attrib}}','');
        section_html = section_html.replace('{{section_name}}','favitem');
        section_html = section_html.replace('{{section_title}}','View Favourite Item <span class="large-title-text"></span>');
        section_html = section_html.replace('{{section_icon}}','mdi-action-shop');
        section_html = section_html.replace('{{section_title_small}}','View Item: <span class="small-title-text"></span>');
        section_html = section_html.replace('{{section_option}}','<div class="item_details"></div>');
        return section_html;
    }
    function update_fav_list(){
        var $favlist_section = jQuery('[data-section="favlist"]');
        var template_search_results_item = $('#template_envato_wishlist_item').html();
        var fav_count = 0;

        var $results_list = $favlist_section.find('.search_results .inner-content');
        $results_list.html('');

        for(var i in item_prefs){
            if(item_prefs.hasOwnProperty(i) && item_prefs[i].like == 'yes' && typeof item_prefs[i].data != 'undefined') {
                fav_count++;
                var item_html = template_search_results_item;
                var item_variables = item_prefs[i].data;
                for (var iv in item_variables) {
                    if (item_variables.hasOwnProperty(iv)) {
                        item_html = item_html.replace(new RegExp('{{' + iv + '}}', 'g'), item_variables[iv]);
                    }
                }

                $results_list.append(item_html);
                var $b = $results_list.find('[data-item-id=' + item_prefs[i].data.id + ']');
                $b.data('item_variables', item_variables);
                $b.removeClass('like-undecided').removeClass('like-no').addClass('like-yes');
                $b.find('.notes').text(get_item_prefs(item_prefs[i].data.id, 'notes', ''));
                if (get_item_prefs(item_prefs[i].data.id, 'like', false)) {
                    $b.find('.yesnocheck input[value=' + get_item_prefs(item_prefs[i].data.id, 'like', false) + ']').prop('checked', true);
                }
            }
        }

        $favlist_section.find('.small-title-text').text(fav_count + ' items');
        $favlist_section.find('.large-title-text').text(fav_count + ' items');
        $favlist_section.attr('data-count',fav_count);


        $favlist_section.find('.open_details').off('click.envato_wishlist');
        $favlist_section.find('.open_details').on('click.envato_wishlist', function(){
            $selected_item = $(this).parents('.item_card').first();
            envato_wishlist.ui.loadstep('favitem', step_item);
            return false;
        });

        $favlist_section.find('.yesnocheck input')
            .off('change.envato_wishlist')
            .on('change.envato_wishlist', function(){
                var $item = $(this).parents('.item_card').first();
                item_id = $item.data('item-id');
                if($(this).val() == "no"){
                    save_item_prefs(item_id,'data',{});
                    save_item_prefs(item_id,'like','no');
                }else if($(this).val() == "yes"){
                    save_item_prefs(item_id,'data',$item.data('item_variables'));
                    save_item_prefs(item_id,'like','yes');
                }
                update_fav_list();
                return false;
            });


    }
    envato_wishlist.ui = {
        init: function(){

            // seed storage
            item_prefs = envato_wishlist.get_storage('item_prefs');
            if(!item_prefs || typeof item_prefs != 'object'){
                item_prefs = {};
                envato_wishlist.set_storage('item_prefs',item_prefs);
            }

            $wishlist_dom = $('#envato_wishlist');

            template_section = $('#template_envato_wishlist_section').html();
            template_welcome_button = $('#template_envato_wishlist_welcome_button').html();

            $wishlist_dom.find('.section_holder').append(build_fav_step_ui());
            $wishlist_dom.find('.section_holder').append(build_fav_item_step_ui());
            $wishlist_dom.find('.section_holder').append(build_welcome_step_ui());
            $wishlist_dom.find('.section_holder').append(build_catgeory_step_ui());
            $wishlist_dom.find('.section_holder').append(build_search_step_ui());
            $wishlist_dom.find('.section_holder').append(build_item_step_ui());
            update_fav_list();

            $wishlist_dom.on('click','.envatosection.completed',function(){
                envato_wishlist.ui.loadstep($(this).data('section'));
            });
        },
        start: function(){
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
                        //$(this).addClass('completed');
                    }else{
                        $(this).removeClass('completed');
                    }
                }
            });
            current_step = stepname;

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
