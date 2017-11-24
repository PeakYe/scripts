(function(){
	define(function(){
		return $.noConflict(true);  
	});

	seajs.config({
		base:'http://localhost/javascripts/',
		alias: {
			'jquery':'jquery/jquery-3.2.1.min.js',
			'layer':'layer/layer.js'
		}
		// preload:['jquery','layer']
	});
})();