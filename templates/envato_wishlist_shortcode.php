<div id="envato_wishlist" class="enable_materialize">
	<section step="welcome">
		<h3>Buy: <span></span></h3>
		<h2>What would you like to buy?</h2>
		<ul>
			<li>
				<a href="#" data-site="themeforest" data-category="wordpress">WordPress Themes</a>
			</li>
			<li>
				<a href="#" data-site="codecanyon" data-category="wordpress">WordPress Plugins</a>
			</li>
			<li>
				<a href="#" data-site="themeforest">Website Templates</a>
			</li>
			<li>
				<a href="#" data-site="codecanyon">Scripts, Apps or Plugins</a>
			</li>
			<li>
				<a href="#" data-site="photodune">Stock Photographs</a>
			</li>
		</ul>
	</section>
	<section step="category">
		<h3>Category: <span></span></h3>
		<h2>Choose a Category:</h2>
		<ul>

		</ul>
	</section>
	<section step="search">
		<h3>Search: <span></span></h3>
		<h2>Narrow your results:</h2>
		<form action="">

		</form>
		<ul>

		</ul>
	</section>
	<section step="item">
		<h2>View Item: <span></span></h2>

	</section>
	<div>
		<?php if(get_option('envato_wishlist_material',0)){ ?>
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
		<?php }else{ ?>
		Loading
		<?php } ?>
	</div>
</div>