/**
 * ebs :日期插件
 *   
 */
define(function(require, exports, module) {
	var $ = require('jquery');
	require('moment');
	var daterangepicker = require('daterangepicker');
	
	exports.init= function initPlugin(dateConfig){
		var id =dateConfig.id;
		var dateRangePicker=createPickerObj(dateConfig);
		var dateObj=$("#"+id).daterangepicker(dateRangePicker, 
			function(start, end, label) {
				applayPicker(start, end, label, dateConfig);
		  });
		showDaterangepicker(dateConfig,id);
		hideDaterangepicker(dateConfig,id);
		setDisplayDate(dateConfig);
		cancelDaterangepicker(id);	
		outsideClickDaterangepicker(id);
	}
	/**
	 * 日历控件显示所触发时间，添加时间最大值、最小值，支持直接传入时间和传入多个id两种方式
	 */
	var minDateValue = '';
	var maxDateValue = '';
	function showDaterangepicker(dateConfig,id){
		$('#'+id).on('show.daterangepicker', function(ev, picker) {
			if(dateConfig.minDate && dateConfig.minDate.match(/^[\\_0-9-]+/)==null){
				var minDateArray = dateConfig.minDate.split(',');
				if(minDateArray.length == 1 && $("#"+dateConfig.minDate).val()!=undefined){
					minDateValue = $("#"+dateConfig.minDate).val();
					picker.minDate = moment($("#"+dateConfig.minDate).val());
				} else {
					minDateValue = '';
				}
				if(minDateArray.length > 1 ){
					var minDateValueArr = minDateArray.filter(function(item){return $("#"+item).val(); }).map(function(item){
						return $("#"+item).val(); 
					});
					if(minDateValueArr.length > 0){
						var max=minDateValueArr[0];
				        for(var i=1;i<minDateValueArr.length; i++) {
				            if(max < minDateValueArr[i]) { max = minDateValueArr[i]; }
				        }
				        minDateValue = max;
				        picker.minDate = moment(max);
					} else {
						picker.minDate = moment('');
						minDateValue = '';
					}
				}
			}
			if(dateConfig.maxDate && dateConfig.maxDate.match(/^[\\_0-9-]+/)==null){
				var maxDateArray = dateConfig.maxDate.split(',');
				if(maxDateArray.length == 1 && $("#"+dateConfig.maxDate).val()!=undefined){
					maxDateValue = $("#"+dateConfig.maxDate).val();
					if($("#"+dateConfig.maxDate).val()) {
						picker.maxDate = moment($("#"+maxDateArray).val() > minDateValue ? $("#"+maxDateArray).val() : minDateValue);
					}else {
						picker.maxDate = moment('');
					}
				} else {
					maxDateValue = '';
				}
				if(maxDateArray.length > 1 ){
					var maxDateValueArr = maxDateArray.filter(function(item){return $("#"+item).val()}).map(function(item){
						return $("#"+item).val();
					});
					if(maxDateValueArr.length > 0){
						var min=maxDateValueArr[0];
				        for(var i=1;i<maxDateValueArr.length; i++) {
				            if(min > maxDateValueArr[i]) { min = maxDateValueArr[i]; }
				        }
				        picker.maxDate = moment(min > minDateValue ? min : minDateValue);
				        maxDateValue = min;
					}else{
						picker.maxDate = moment('');
						maxDateValue = '';
					}
				}
			}
			/*
			 * 添加时间最大值、最小值，传入单个id
			if(dateConfig.minDate && dateConfig.minDate.match(/^[\\_0-9-]+$/)==null && $("#"+dateConfig.minDate).val()!=undefined){
				picker.minDate = moment($("#"+dateConfig.minDate).val());
			}
			if(dateConfig.maxDate && dateConfig.maxDate.match(/^[\\_0-9-]+/)==null && $("#"+dateConfig.maxDate).val()!=undefined){
				picker.maxDate = moment($("#"+dateConfig.maxDate).val());
			}
			*/
			if(dateConfig.singleDatePicker==true){
				if($("#"+id).val()!=""){
					picker.startDate = moment($("#"+id).val());
				}
			}else{
				var date = $("#"+id).val();
				var maxDateVal = $("#"+dateConfig.maxDate).val();
				if(date != ""&&maxDateVal!=""){
					picker.endDate = moment(date.substring(date.indexOf('~')+1));
					//picker.startDate=picker.maxDate;
					picker.startDate = moment(date.substring(0,date.indexOf('~')));
				}else{
					picker.endDate=moment(new Date());//picker.maxDate;
					picker.startDate=moment(new Date());
				}
			}
			if(picker.maxDate && picker.maxDate.isBefore(picker.startDate)){
				picker.startDate = picker.maxDate;
			}
			if(picker.minDate && picker.minDate.isAfter(picker.startDate)){
				picker.startDate = picker.minDate;
			}
		});
	}
	/**
	 * 日历控件的hide所触发事件，去除日历控件点击清除，页面数据未真实清除bug，后未复现，先注释
	 */
	function hideDaterangepicker(dateConfig,id){
		$('#'+id).on('hide.daterangepicker', function(ev, picker) {
			applayPicker(picker.startDate, picker.endDate, picker.chosenLabel, dateConfig);
		});
	}
	
	/**
	 * 清除日期
	 * @param id
	 * @returns
	 */
	function cancelDaterangepicker(id){
		$('#'+id).on('cancel.daterangepicker', function(ev, picker) {
			  $('#'+id).val('');
			  $("#"+id+"_startDate").val('');
			  $("#"+id+"_endDate").val('')
			  $('#'+id).trigger("blur");
			  $("#"+id+"_startDate").trigger("blur");
			  $("#"+id+"_endDate").trigger("blur");
		});
	}
	
	/**
	 * 实现 outsideclick 方法
	 * @param id
	 * @returns
	 */
	function outsideClickDaterangepicker(id){
		$('#'+id).on('outsideClick.daterangepicker', function(ev, picker) {
			var startDate=$("#"+id+"_startDate").val();
			var endDate=$("#"+id+"_endDate").val();
			var dateHtml='';
			if(startDate && startDate!='Invalid date'){
				dateHtml+=startDate;	
			}else{
				$("#"+id+"_startDate").val('');
				$("#"+id+"_startDate").trigger("blur");
			}
			if(endDate && endDate!='Invalid date'){
				dateHtml=dateHtml+'~'+endDate;
			}else{
				$("#"+id+"_endDate").val('')
				$("#"+id+"_endDate").trigger("blur");
			}
			$("#"+id).val(dateHtml)	
			$('#'+id).trigger("blur");
		});
	}
	
	/**
	 * 设置页面显示展示的时间，仅仅只用于展示
	 */
	function setDisplayDate(dateConfig){
		var id =dateConfig.id;
		var startDate=$("#"+id+"_startDate").val();
		var endDate=$("#"+id+"_endDate").val();
		var dateHtml='';
		if(startDate && startDate!='Invalid date')
			dateHtml+=startDate;
		if(endDate && endDate!='Invalid date' && !dateConfig.singleDatePicker)
			dateHtml=dateHtml+'~'+endDate;
		$("#"+id).val(dateHtml)	
	}
	
	/**
	 * 确定后回调
	 */
	function applayPicker(start,end,label,dateConfig){
		var id =dateConfig.id;
		var returnFormat=dateConfig.format ? dateConfig.format : 'YYYY-MM-DD HH:mm:ss';
		var startDate =start.format(returnFormat);
		var endDate=end.format(returnFormat);
		var days=dateConfig.days;
		var flag =checkDateValidate(start, end, days);
		if(!flag){
			$("#"+id+"_startDate").val('');
			$("#"+id+"_endDate").val('');
			$("#"+id).val('');
			jAlert("时间少于"+days+"天");
		}else{
			$("#"+id+"_startDate").val(startDate);
			$("#"+id+"_endDate").val(endDate);
			setDisplayDate(dateConfig);
		}
		if(minDateValue && maxDateValue && minDateValue > maxDateValue) {
			$("#"+id+"_startDate").val('');
			$("#"+id+"_endDate").val('');
			$("#"+id).val('');
		}
		$('#'+id).trigger("blur");
		$("#"+id+"_startDate").trigger("blur");
		$("#"+id+"_endDate").trigger("blur");
	}
	
	/**
	 * 校验时间是否少于最小长度限制
	 * 后续研究插件源码，最好能够在日期框架上进行限制
	 */
	function checkDateValidate(start,end,days){
		var returnFlag=true;
		if(days){
			var spacingDays=Math.abs((end-start))/(1000*60*60*24); 
			if(days>spacingDays){
				return false;
			}
		}
		return true;
	}
	
	/**
	 * 初始化日期控件对象
	 */
	function createPickerObj(dateConfig){
		var obj =dateConfig;
		var id =dateConfig.id;
		var startDate=$("#"+id+"_startDate").val();
		var endDate=$("#"+id+"_endDate").val();
		
		var singleDatePicker = dateConfig.singleDatePicker;
		obj.singleDatePicker = singleDatePicker;
		obj.autoApply = true;
		obj.linkedCalendars = false;
		var targetDom = $("#"+id);
		if(targetDom.offset()){
			obj.opens = targetDom.offset().left>($(document.body).width()*0.50)?'left':'right';
		}
		obj.startDate= startDate ? startDate : moment().startOf('minute');
		obj.endDate= endDate ? endDate : moment().startOf('minute');
		obj.timePickerIncrement =obj.timePickerIncrement? obj.timePickerIncrement : 1;//设置时间增长为5分钟
		var format =dateConfig.format ? dateConfig.format : 'YYYY-MM-DD HH:mm:ss';
		if(format=='YYYY-MM-DD HH:mm:ss' || format=='YYYY-MM-DD HH:mm'){
			obj.timePicker=true;
		}else{
			obj.timePicker=false;
		}
		var is12Hour = dateConfig.is12Hour ? dateConfig.is12Hour : false;//设置默认时间24小时
		obj.timePicker24Hour =is12Hour ? false : true;
		obj.showDropdowns = true;
		
		/**
		 * 设置展现的样式 
		 */
		var locale = new Object();
		locale.format=format;
		locale.applyLabel='确定';
		locale.cancelLabel='清空';
		locale.daysOfWeek=[ '日', '一', '二', '三', '四', '五', '六' ];
		locale.monthNames=[ '一月', '二月', '三月', '四月', '五月', '六月','七月', '八月', '九月', '十月', '十一月', '十二月' ];
		obj.locale=locale;
		return obj
	}
	
	
	
});