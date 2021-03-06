<div id="wizvato" class="enable_materialize">

    <script type="text/x-envato-wishlist-template" id="template_wizvato_welcome_button">
        <div class="col s12 m6 l4">
            <div class="card welcome_card" data-category="{{category}}" data-site="{{site}}" data-title-text="{{title}}">
                <div class="card-image waves-effect waves-block waves-light">
                    <div class="">
                        <div class="col s12 m8 offset-m2 center">
                            <i class="{{icon}} grey-text text-darken-3"></i>
                        </div>
                    </div>

                </div>
                <div class="card-content center">
                  <span class="card-title activator grey-text text-darken-4">{{title}} </span>
                <p style="padding:2em 0">
                   <a href="#" class="button_link waves-effect waves-light btn orange"><span class="white-text">Select</span></a>
                    </p>
                </div>
              </div>
        </div>
    </script>
    <script type="text/x-envato-wishlist-template" id="template_wizvato_section">
        <li class="envatosection" data-section="{{section_name}}" {{section_attrib}}>
          <div class="collapsible-header">
              <i class="{{section_icon}}"></i>
              <span class="large-title">{{section_title}}</span>
              <span class="small-title">{{section_title_small}}</span>
          </div>
          <div class="collapsible-body">
              <div class="d" style="padding: 20px">
                  <div class="loading_anim center">
                      <div class="preloader-wrapper big active">
                        <div class="spinner-layer spinner-blue-only">
                          <div class="circle-clipper left">
                            <div class="circle"></div>
                          </div><div class="gap-patch">
                            <div class="circle"></div>
                          </div><div class="circle-clipper right">
                            <div class="circle"></div>
                          </div>
                        </div>
                      </div>
                  </div>
                  <div class="row inner-content">
                      {{section_option}}
                  </div>
              </div>
          </div>
        </li>
    </script>
    <script type="text/x-envato-wishlist-template" id="template_wizvato_search">
        <form class="search_form"></form>
        <div class="search_results">
            <div class="loading_anim center">
              <div class="preloader-wrapper big active">
                <div class="spinner-layer spinner-blue-only">
                  <div class="circle-clipper left">
                    <div class="circle"></div>
                  </div><div class="gap-patch">
                    <div class="circle"></div>
                  </div><div class="circle-clipper right">
                    <div class="circle"></div>
                  </div>
                </div>
              </div>
          </div>
          <div class="row inner-content">
              <!-- results show here -->
          </div>
        </div>
    </script>
    <script type="text/x-envato-wishlist-template" id="template_wizvato_category">
        <div class="collection category_items"></div>
    </script>
    <script type="text/x-envato-wishlist-template" id="template_wizvato_category_item">
        <a class="collection-item waves-effect waves-light"><i class="mdi-navigation-arrow-forward right"></i>{{category_name}}</a>
    </script>
    <script type="text/x-envato-wishlist-template" id="template_wizvato_item">
        <div class="col s12 m12 l6">
            <div class="card medium item_card like-{{like}}" data-item-id="{{id}}">
                <div class="card-image waves-effect waves-block waves-light">
                  <img class="open_details" src="{{preview}}" />
                </div>
                <div class="card-content">
                  <span class="card-title open_details grey-text text-darken-4">
                        {{name}}
                  </span>
                    <div class="row center item_stats">
                      <div class="col s4 stars rating-{{rating}}">{{rating}}/5 <span>stars</span></div>
                        <div class="col s4 sales">{{number_of_sales}} <span>sales</span></div>
                        <div class="col s4 price">${{price}} <span>price</span></div>
                    </div>
                 <div class="row center">
                      <div class="col s12 notes grey-text"></div>
                    </div>
                </div>
                <div class="card-action">
                      <!-- <a href="{{live_site}}" class="preview_link" target="_blank">Preview</a> -->
                      <a href="#" class="open_details">Details</a>
                    <div class="right yesnocheck">
                    <form>
                        <input class="with-gap" name="yesno1{{id}}" type="radio" id="check1{{id}}" value="no" />
                        <label for="check1{{id}}" class="no">Hide</label>
                        <input class="with-gap" name="yesno1{{id}}" type="radio" id="check2{{id}}" value="yes" />
                        <label for="check2{{id}}" class="yes">Like</label>
                    </form>
                    </div>
                </div>
              </div>
        </div>
    </script>
    <script type="text/x-envato-wishlist-template" id="template_wizvato_item_page">
        <div class="row item_navigation">
            <div class="col s6">
                <a class="waves-effect waves-light btn left item_nav" data-direction="prev"><i class="mdi-navigation-arrow-back left"></i>Previous</a>
            </div>
            <div class="col s6">
                <a class="waves-effect waves-light btn right item_nav" data-direction="next"><i class="mdi-navigation-arrow-forward right"></i>Next</a>
            </div>
        </div>
        <div class="row">
            <div class="col s12 m8">

                <div class="preview_image center">
                    <img src="{{preview}}" />
                </div>
                <div class="item_actions">
                    <div class="s12 m8 offset-m2 l6 offset-l3 center">
                        <a href="{{live_site}}?ref={{ref}}" class="live-preview-link waves-effect waves-light btn center" target="_blank">Live Preview</a>
                        <a href="{{url}}?ref={{ref}}" class="waves-effect waves-light btn center" target="_blank">View Item Page</a>
                    </div>
                </div>

                <h4 class="center">{{name}}</h4>
                <p>{{description}}</p>
                <p><a href="{{url}}?ref={{ref}}" class="" target="_blank">(view full item description)</a></p>

            </div>
            <div class="col s12 m4">

                <div class="card-panel grey lighten-5 z-depth-1">
                  <div class="row valign-wrapper">
                    <div class="col s4">
                      <img src="{{author_image}}" alt="" class="circle responsive-img">
                    </div>
                    <div class="col s8">
                      <span class="black-text">
                        Author: <a href="{{author_url}}?ref={{ref}}" target="_blank">{{author_username}}</a>
                      </span>
                    </div>
                  </div>
                  <div class="row rating-{{rating}}"> <div class="col s4"> Rating:</div> <div class="col s8"> {{rating}}/5 </div> </div>
                  <div class="row"> <div class="col s4"> Sales:</div> <div class="col s8"> {{number_of_sales}} </div> </div>
                  <div class="row"> <div class="col s4"> Price:</div> <div class="col s8"> ${{price}} </div> </div>
                  <div class="row"> <div class="col s4"> Updated:</div> <div class="col s8"> {{updated_date}} </div> </div>
                    <div class="row">
                        <div class="item_actions">
                            <div class="center">
                                <a href="{{url}}?ref={{ref}}" class="waves-effect waves-light btn center" target="_blank">Buy Now</a>
                                <!-- <form action="http://codecanyon.net/cart/add/{{id}}?ref={{ref}}&redirect_back=true" method="post" target="_blank">
                                    <input type="hidden" name="utf8" value="âœ“">
                                    <input type="hidden" name="license" value="regular">
                                    <input type="hidden" name="purchasable_regular" value="source">
                                    <input type="hidden" name="purchasable_extended" value="source">
                                    <input type="submit" class="waves-effect waves-light btn center" value="Add To Cart"/>
                                </form> -->
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card-panel grey lighten-5 z-depth-1">
                  <div class="row">
                    <div class="col s4">
                        You like?
                    </div>
                    <div class="col s8">
                      <div class="yesnocheck">
                        <input class="with-gap" name="yesno2{{id}}" type="radio" value="no" id="checki1{{id}}" />
                        <label for="checki1{{id}}" class="no">Hide &amp; Next</label>
                        <input class="with-gap" name="yesno2{{id}}" type="radio" value="yes" id="checki2{{id}}"  />
                        <label for="checki2{{id}}" class="yes">Like</label>
                        </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col s12 input-field">
                        <i class="mdi-editor-mode-edit prefix"></i>
                          <textarea id="item_notes" class="envato_item_notes materialize-textarea"></textarea>
                    </div>
                  </div>
                </div>
            </div>
        </div>
    </script>

    <ul class="collapsible section_holder" data-collapsible="accordion">
    </ul>


</div>

<script type="text/javascript">

    // trying to keep materializecss stuff out of the core js file so I'm not reliant on materialize
    jQuery('#wizvato').on('envato.loading','.envatosection',function(){
        var $h = jQuery(this).find('.collapsible-header');
        if(!$h.parents('.envatosection').first().hasClass('active')) $h.click();
    });
    jQuery(function(){
        // start the magic:
        wizvato.set_config({
            result_count: 40,
            envato_personal_token: '<?php echo esc_attr($envato_personal_token);?>',
            ref: '<?php echo esc_attr($ref);?>',
            buttons: [
                {
                    title: 'WordPress Themes',
                    description: '',
                    icon: 'mdi-hardware-desktop-mac',
                    category: 'wordpress',
                    site: 'themeforest'
                },
                {
                    title: 'WordPress Plugins',
                    description: '',
                    icon: 'mdi-av-my-library-add',
                    category: 'wordpress',
                    site: 'codecanyon'
                },
                {
                    title: 'Scripts, Apps or Snippets',
                    description: '',
                    icon: 'mdi-action-settings-applications',
                    category: '',
                    site: 'codecanyon'
                },
                {
                    title: 'Logos, Brochures or Graphics',
                    description: '',
                    icon: 'mdi-image-brush',
                    category: '',
                    site: 'graphicriver'
                },
                {
                    title: 'Video Effects or Footage',
                    description: '',
                    icon: 'mdi-av-videocam',
                    category: '',
                    site: 'videohive'
                },
                {
                    title: 'Stock Photography',
                    description: '',
                    icon: 'mdi-image-camera-alt',
                    category: '',
                    site: 'photodune'
                }
            ]
        });
        wizvato.init();
        // re-run materialize collapsible
        jQuery('.section_holder').collapsible();
        // start the welcome step:
        wizvato.ui.start();
    });
</script>