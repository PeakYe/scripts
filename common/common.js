(function(w){

	var server={
		server_host:'',
		html_prefix:'html/'
	}
	if(w.config){
		if(w.config.server){
			server.server_host=w.config.server;
		}
	}
	var app={
		server:server,
		ajax:function(param){
			var url;
			// if(param.url.indexOf('/')==0){
			// 	url=param.url;
			// }else{
				url=this.server.server_host+param.url;
			// }
			$.ajax({
				url:url,
				data:param.data,
				method:'post',
				dataType:'json',
				async:param.async==null?true:param.async,
				success:function(data,status){
					if(data.success){
						//debugger;
						param.success(data);
					}else{
						if(typeof(param.failure)=='function'){
							param.failure(data);
						}else{
							//layer.alert(data.message)
							layer.alert(data.message, {icon: 5});
						}
					}
				},
				error:function(status,data){
					if(param.error){
						param.error(status,data);
						return;
					}else
					if(typeof(toastr)!='undefined'){
						console.log(status);
						toastr.error(status.status+': '+status.responseJSON.error);
					}else if(typeof(layer)!='undefined'){
						console.log(status);
						layer.alert(status.status+': '+status.statusText, {icon: 5});
					}
				},
				complete:function(data,status){
					if(typeof(param.complete)=='function'){
						param.complete(data,status);
					}
					//layer.complete(status,data);
				},
				beforeSend:function(){
					if(typeof(param.before)=='function'){
						param.before();
					}
				}
			})
		},
		toPage:function(url){
			location.href=server.html_host+server.html_prefix+url;
		},
		openPage:function(url){
			window.open(server.html_host+server.html_prefix+url);
		},
		getUrlParam:function (name) {
		    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
		    var r = window.location.search.substr(1).match(reg);
		    if (r != null) return unescape(r[2]); return null;
		},
		getUrlParamter:function(name){
			return this.getUrlParam(name);
		},
		escapeHtml:function(string) {
		    var entityMap = {
		        "&": "&amp;",
		        "<": "&lt;",
		        ">": "&gt;",
		        '"': '&quot;',
		        "'": '&#39;',
		        "/": '&#x2F;'
		    };
		    return String(string).replace(/[&<>"'\/]/g, function (s) {
		        return entityMap[s];
		    });
		}
	}

	if ( typeof define === "function" && define.amd) {
		define( "c", [], function () { return app; } );
	}else{
		w.c=app;
	}
})(window)