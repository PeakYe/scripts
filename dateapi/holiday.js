(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Make globaly available as well
        define(['jquery'],function (jquery) {
            return (root.holiday = factory(jquery));
        });
    } else if (typeof module === 'object' && module.exports) {
    	var jQuery = (typeof window != 'undefined') ? window.jQuery : undefined;
    	if (!jQuery) {
            jQuery = require('jquery');
            if (!jQuery.fn) jQuery.fn = {};
        }
        module.exports = factory(jQuery);
    }else{
    	root.holiday = factory(jQuery);
    }
}(this, function($) {
	function getDate(datestr){
		var temp = datestr.split("-");
		var date = new Date(temp[0],temp[1],temp[2]);
		return date;
	}
	var holiday={
		days:{
			2013:{
				'01':{
					'01':true	
				}
			}
		},
		isHoliday:function(d){
			// yyyy-mm-dd
			var date=d.split("-");
			// console.log(date)
			// if(this.days[date[0]] 
			// 	&& this.days[date[0]][date[1]]
			// 	&& this.days[date[0]][date[1]][date[2]]  ){
			// 	return true;
			// }
			if(this._isHoliday(date[0],date[1],date[2])){
				return true;
			}
		},
		_isHoliday:function(y,m,d){
			if(!this.days[y] || !this.days[y][m]){
				this._getYearData(y);
			}
			if(this.days[y][m][d] ){
				return true;
			}
			return false;
		},
		_getYearData(y){
			var that=this.days;
			$.ajax({
				url:'dateapi/'+y+'.json',
				dataType:'json',
				async:false,
				success:function(data){
					that[y]={};
					var m=1;
					while(m<13){
						var sm=m<10?'0'+m:''+m;
						that[y][sm]={};
						var mdata=data[y+''+sm];
						for (var d in mdata){
							that[y][sm][d]=mdata[d];
						}
						m++;
					}
				}
			})
			window.localStorage['holidays-config']=JSON.stringify(that);
		},
		workDays:function(start,end){
			var workday=0;
			var that=this;
			this.loopDays(start,end,function(y,m,d){
				if(!that._isHoliday(y,m,d)){
					// console.log(y+m+d)
					workday++;
				}
			})
			return workday;
		},
		holidays:function(start,end){
			var holidays=0;
			var that=this;
			this.loopDays(start,end,function(y,m,d){
				if(that._isHoliday(y,m,d)){
					// console.log(y+m+d)
					holidays++;
				}
			})
			return holidays;
		},
		loopDays:function(start,end,fun){
			var startTime=new Date(start);
			var endTime=new Date(end);
			while((endTime.getTime()-startTime.getTime())>=0){
			  var year = startTime.getFullYear();
			  var m= startTime.getMonth()+1;
			  var month = m<10?"0"+m:m;
			  var day = startTime.getDate().toString().length==1?"0"+startTime.getDate():startTime.getDate();
			  startTime.setDate(startTime.getDate()+1);
			  fun(year,month,day);
			}
		}
	}


	// var url="";
	if(window.localStorage && window.localStorage['holidays-config']){
		try{
			holiday.days=JSON.parse(window.localStorage['holidays-config']);
		}catch(e){
			console.log(e);
		}
	}
	return holiday;

}));