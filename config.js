(function(){
	var cdn="http://47.94.106.96:10002/scripts/";
	require.config({
		// baseUrl : "http://47.94.106.96:10002/scripts/",
		baseUrl : "http://localhost/javascripts/",
	    paths : {
	        "jquery" : ["jquery/jquery-3.2.1.min"],
	        "bootstrap": ["bootstrap/js/bootstrap",cdn+"bootstrap/js/bootstrap"],
	        "layer": ["layer/layer",cdn+"layer/layer"],
	        "c":["common/common",cdn+"/scripts/common/common"],
	        "moment":["moment/moment"],
	        "daterangepciker":["bootstrap/js/daterangepicker"],
	        "holiday":["dateapi/holiday"]
	    },
	    preload:['jquery','bootstrap','layer','c'],
	    shim:{
	    	bootstrap:{
	    		deps:['jquery']
	    	},
	    	c:{
	    		deps:['jquery','layer']
	    	}
	    	// daterangepciker:['jquery','moment','bootstrap']
	    }
	});
	console.log('require config');
	require(['bootstrap']);
})()