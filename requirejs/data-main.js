(function(){
	require.config({
		baseUrl : "javascripts",
	    paths : {
	        "jquery" : ["jquery/jquery-3.2.1.min","http://libs.baidu.com/jquery/2.0.3/jquery", "js/jquery"]
	    }
	})
	console.log('require config');
})()