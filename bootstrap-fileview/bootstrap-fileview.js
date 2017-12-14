(function(w,$){
	

	var template={
		contain:'<div class="file-view"></div>',
		viewMain:'<div class="file-view-main"></div>',
		viewMainHead: '<div class="main-head"></div>',
		mainUl:'<ul class="main-list" deletedable></ul>',
		mainLi:'<li></li>',
		viewSub:'<div class="file-view-sub">',
		viewSubHead: '<div class="sub-head"><a href="#" class="back glyphicon glyphicon-chevron-left"></a><input type="text" class="query-input"/>\
			<p class="sortlist"><i id="common-sort" class="glyphicon glyphicon-sort-by-alphabet"></i> <i id="common-sort" class="glyphicon glyphicon-sort"></i></p>\
			</div>',
		// <li><a href="#">Home</a></li><li><a href="#">2013</a></li><li class="active">十一月</li>
		viewSubNav:'<ol class="breadcrumb">/</ol>',
		viewSubNavHome:'<li ><i class="glyphicon glyphicon-home"></i></li>',
		viewSubNavLi:'<li></li>',
		subUl:'<ul class="sub-menu-ul scroll-style-thin sbar1"></ul>',
		subLi:'<li class="sub-menu-li"></li>',
	}
	function Menu(args){
		var menu = {
			html:{
				contain:null,
				mainUl:null,
				viewSubNavHome:null
			},
			folder:{},
			eventBus:{},
			currentFolder:null,
			init:function(args) {
				var that=this;
				var contain=this.html.contain=$(template.contain);

				//first menu
				var viewMain=this.html.viewMain=$(template.viewMain);
				
				contain.append(viewMain);
				var viewMainHead=this.html.viewMainHead=$(template.viewMainHead).append(args.mainHeadHtml);
				viewMain.append(viewMainHead);
				var mainul=this.html.mainUl=$(template.mainUl);
				viewMain.append(mainul);
				for(var i in args.mainMenu){
					var $mli=$(template.mainLi).attr("main-menu-id",i).html(args.mainMenu[i].text);
					mainul.append($mli);
				}

				//second menu
				var viewSub=this.html.viewSub=$(template.viewSub);
				//返回菜单
				var viewSubHead=$(template.viewSubHead);
				viewSubHead.find('.back').click(function(){
					var folder=that.folder[that.currentFolder];
					if(folder!=null){
						if(folder!=null){
							// var parent=that.folder[folder.menuData.parent];
							// if(parent!=null){

							// }
							var parentFolder=folder.menuData.parent;
							if(parentFolder!=null){
								that.showMenu(parentFolder);
							}
						}
					}
				});

				viewSubHead.find('.query-input').keyup(function(){
					that.queryMenu($(this).val());
				})
				viewSub.append(viewSubHead);
				//面包屑导航
				var viewSubNav=$(template.viewSubNav);
				viewSub.append(viewSubNav);
				this.html.viewSubNav=viewSubNav;
				var  viewSubNavHome=$(template.viewSubNavHome);
				// viewSubNavHome.click(function(){
				// 	//回到根目录
				// 	that.showMenu(0);
				// });
				this.html.viewSubNavHome=viewSubNavHome;

				//菜单
				var subUl=this.html.subUl=$(template.subUl);
				viewSub.append(subUl);
				contain.append(viewSub);

				var fcontain=$(args.contain);
				fcontain.append(contain);

				//事件
				this.eventBus.onCreateMenu=args.onCreateMenu;
				this.eventBus.onClickMenu=args.onClickMenu;
				this.eventBus.onShowMenu=args.onShowMenu;
				this.eventBus.onDeleteMenu=args.onDeleteMenu;



				return this;
			},
			addSubMenu:function(args){
				for(var i in args){
					// var sub=$(template.subLi).html(args[i].text).attr('sub-menu-id',i);
					// sub.parentFolderId=args[i].parentFolderId;
					// this.html.subUl.append(sub);
					// this.folder[i]=sub;
					args[i].id=i;
					this.createMenu(args[i]);
				}
			},
			createMenu:function(args){
				var that=this;
				if(args.parent==null){
					
					args.parent=0;
				}
				{
					var isfolder=args.isfolder==null?true:args.isfolder;
					var content=(args.prefix?args.prefix:'<i class="glyphicon glyphicon-folder-close"></i> ')+args.text+(args.suffix?args.suffix:'');
					var sub=$(template.subLi).html(content).attr('sub-menu-id',args.id).attr('isfolder',isfolder).attr('title',args.text);
					if(args.click){
						sub.click(function(param){
							args.click(param);
						});
					}else{
						sub.click(function(){
							that.showMenu(args.id);
						});
					}
					sub.menuData=args;
					if(args.parent!=this.currentFolder){
						sub.addClass('hidden');
					}
					this.html.subUl.append(sub);
					this.folder[args.id]=sub;

					if(this.eventBus.onCreateMenu){
						this.eventBus.onCreateMenu(sub);
					}
				}
				// this.sortMenu(this.currentFolder);
			},
			showMenu:function(parentId){
				var that=this;
				that.currentFolder=parentId;
				for(var i in this.folder){
					var f=this.folder[i];
					if(f.menuData.parent==parentId){
						f.removeClass('hidden');
					}else{
						if(!f.attr('inmove')){
							f.addClass('hidden');
						}
					}
				}
				this.html.subUl.attr('sub-menu-id',parentId);
				var folder=this.folder[parentId];
				localStorage.setItem('currentFolder',parentId);
				this.html.viewSubNav.html('');
				while(folder!=null){
					var item=$(template.viewSubNavLi).append(folder.menuData.text)
						.attr('folder-id',folder.menuData.id).click(function(){
						that.showMenu($(this).attr('folder-id'));
					})
					this.html.viewSubNav.prepend(item);
					folder=this.folder[folder.menuData.parent];
				}
				this.html.viewSubNav.prepend(this.html.viewSubNavHome.click(function(){
					//回到根目录
					that.showMenu(0);
				}));
				//this.sortMenu(parentId);
			},
			deleteMenu:function(id,callback){
				var deled=this.folder[id].menuData;
				if(this.folder[id]){
					delete this.folder[id]==null;
					$('[sub-menu-id='+id+']').remove();
				}else{
					this.html.mainUl.find('[main-menu-id='+id+']').remove();
				}
				if(callback){
					callback(deled);
				}
			},
			sortMenu:function(id){
				this.html.subUl.find('li').sort(function(a,b){
					var v1=a.getAttribute('isfolder')=="true";
					var v2=b.getAttribute('isfolder')=="true";
					if(v1 && v2){
						var name1=a.getAttribute('title');
						var name2=b.getAttribute('title');
						return name1>name2?1:-1;
					}else{
						return v1?-1:1;
					}
				}).detach().appendTo(this.html.subUl);
			},
			modifyMenu:function(id,args){
				var param=this.folder[id].menuData;
				param=$.extend(param,args);
				var content=(param.prefix?param.prefix:'<i class="glyphicon glyphicon-folder-close"></i> ')+param.text+(param.suffix?param.suffix:'');
				this.folder[id].html(content).attr('title',param.text).menuData=param;
			},
			showDefault:function(){
				var currentFolder=localStorage.getItem('currentFolder');
				if(currentFolder){
					this.showMenu(currentFolder);
					// return true;
				}else{
					this.showMenu(0);
				}
				return true;
			},
			queryMenu:function(query){
				if(query==null||query.trim()==''){
					this.showMenu(this.currentFolder);
					return;
				}
				if(pinyinUtil!=null && this.isChinese(query)){
					for(var i in this.folder){
						var f=this.folder[i];
						if(f.menuData.text.indexOf(query)!=-1){
							f.removeClass('hidden');
						}else{
							f.addClass('hidden');
						}
					}
				}else{
					var querys= query.split('');
					var pattern='';
					for(var i in querys){
						pattern+=".*"+querys[i].toLowCase()+"{1}";
					}
					var exp=new RegExp(pattern);
					for(var i in this.folder){
						var f=this.folder[i];
						var py=pinyinUtil.getPinyin(f.menuData.text, '', false, false);
						if(exp.exec(py)){
							f.removeClass('hidden');
						}else{
							f.addClass('hidden');
						}
						
					}
				}
			},
			findMenu:function(id){
				for(var i in this.folder){
					var f=this.folder[i];
					if(f.menuData.id==id){
						return f;
					}
					
				}
			},
			isChinese:  function (str) {
	          var entryVal = str;
	          var entryLen = entryVal.length;
	          var cnChar = entryVal.match(/[^\x00-\x80]/g);
	          if (cnChar != null && cnChar.length > 0) return true;
	          else return false;
	        },
	        moveModel:function(movefun){
	        	var that=this;
	       		//var newlist=$('<div></div>').append(this.html.subUl);
	       		var list=$('<ul class="treeview-stack-ul sub-menu-ul"></ul>');
	       		var close=$('<i class="treeview-stack-close glyphicon glyphicon-remove-circle"></i>');
	       		close.click(function(){
	       			
	       			list.find('li').each(function(){
	       				if($(this).attr('parent')==that.currentFolder){
	       					that.html.subUl.append(this);
	       				}else{
	       					that.html.subUl.append($(this).addClass('hidden'));
	       				}
	       			});
	       			list.remove();
	       			this.remove();
	       		});
	       		this.html.viewSub.append($('<div class="treeview-stack"></div>').append(close).append(list));
	       		this.html.subUl.find('li').on("dragstart",function(e){  
	       			//console.log(e.target)
	                e.originalEvent.dataTransfer.setData("submenuid",$(e.target).attr('sub-menu-id'));  
	            }).attr("draggable","true");  
	            //允许放入  
	            list.on("dragover",function(e){  
	                e.originalEvent.preventDefault();  
	            }).on("drop",function(e){  //放下事件  
	                e.originalEvent.preventDefault;  
	                var submenuid = e.originalEvent.dataTransfer.getData("submenuid");  
	                var selected = that.folder[submenuid];
	                selected.attr('inmove','true')
	                $(this).append(selected.attr('parent',selected.menuData.parent)); 

	                // //给新加入的元素添加拖放事件  
	                // selected.on("dragstart",function(e){  
                 //    	e.originalEvent.dataTransfer.setData("submenuid",$(e.target).attr('sub-menu-id'));  
	                // });  
	            })  

	            this.html.subUl.on("dragover",function(e){  
	                e.originalEvent.preventDefault();  
	            }).on("drop",function(e){  //放下事件  
	                e.originalEvent.preventDefault;  
	                var submenuid = e.originalEvent.dataTransfer.getData("submenuid");  
	                // var selected=$('[sub-menu-id='+submenuid+']');
	                var selected = that.folder[submenuid];

	                var beforeparent=selected.menuData.parent;
	                selected.menuData.parent=that.currentFolder;
                	selected.removeAttr('inmove');
                	$(this).append(selected);

	                if(movefun && movefun(selected.menuData,that.currentFolder,function(){},function(){
	                	//error
	                	selected.menuData.parent=beforeparent;
	                	that.showMenu(that.currentFolder);
	                })){
	                	
	                }else{

	                }
	            })  

	        }
		}
		return menu.init(args);
	}
	
	w.FileView=Menu;

})(window,$)