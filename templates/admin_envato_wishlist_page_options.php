<div class="wrap">
<h2>Envato Wishlist</h2>

<form method="post" action="options.php">
    <?php settings_fields( 'envato_wishlist_group' ); ?>
    <?php do_settings_sections( 'envato_wishlist_group' ); ?>
    <table class="form-table">
        <tr valign="top">
        <th scope="row">Envato Personal Token</th>
        <td><input type="text" name="envato_personal_token" value="<?php echo esc_attr( get_option('envato_personal_token', _DEFAULT_ENVATO_PERSONAL_TOKEN) ); ?>" />
        (get one from <a href="https://build.envato.com/" target="_blank">https://build.envato.com/</a>)
        </td>
        </tr>

        <tr valign="top">
        <th scope="row">Enable Materialize Layout (adds extra CSS that might break your theme)</th>
        <td><input type="checkbox" name="envato_wishlist_material" value="1" <?php echo get_option('envato_wishlist_material', 0) ? ' checked' : ''; ?> />
        enbaled
        </td>
        </tr>

    </table>

    <?php submit_button(); ?>

</form>
</div>