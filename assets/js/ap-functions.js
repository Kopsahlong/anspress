/**
 * Contain general JavaScript functions used in AnsPress
 * @author Rahul Aryan
 * @license GPL 2+
 * @since 2.0
 */
 ;(function($){

 	$.fn.aptip = function(settings) {

 		var config = $.extend( {
 			'theme': '',
 			'delay': '',
 			'title': '',
 			'before': '',
 			'ajax': '',
 			'position': 'top center'
 		}, settings);


 		this.ajax_running = false;

 		var plug = this;

 		function altertitle(el){
 			if(typeof $(el).attr('title') !== 'undefined'){
 				$(el).data('aptiptitle', $(el).attr('title'));
 				$(el).removeAttr('title');
 			}
 		}

 		function position(el){
 			var winheight 	= $(window).height();
 			var offset 	= $(el).offset();
 			var height 	= $(el).outerHeight();
 			var width 	= $(el).outerWidth();
 			var tipposition 	= $(el).data('tipposition') || false;

 			var setpos = config.position.split(/ +/);

 			if( tipposition ){
 				setpos =  tipposition.split(/ +/);
 			}

 			var x = 'top';
 			switch(setpos[0]){
 				case 'bottom':
 				x = offset.top + height + 10;
 				break;

 				case 'center':
 				x = offset.top + (height/2)  - (tip.outerHeight()/2);
 				break;

 				default:
 				x = offset.top - tip.outerHeight() - 10;
 				break;
 			}

 			var y = 'right';
 			switch(setpos[1]){
 				case 'left':
 				y = offset.left - width;
 				break;

 				case 'center':
 				y = offset.left + (width/2)  - (tip.outerWidth()/2);
 				break;

 				default:
 				y = offset.left + width;
 				break;
 			}
 			tip.addClass('x-'+ setpos[0] +' y-'+setpos[1]);

 			var s = $(document).scrollTop();
 			
 			// Keep it inside window.
 			if( y < 0 )	y = 5;
 			if( s > x )	x = offset.top + width;

 			var inside_x = $(window).scrollTop() + winheight - tip.outerHeight();

 			if( x > inside_x )
 				x = x - tip.outerHeight();
 			
 			tip.css({
 				overflow: 'absolute',
 				top: x,
 				left: y
 			});

 			tip.find('.arrow').css({
 				top: x,
 				left: y
 			});
 		}

 		function showtip(el){
 			var elm = $(el);
            var id = elm.data('userid') || elm.data('catid') || false;
            var action = elm.data('action') || false;
            var tipquery = elm.data('tipquery') || false;
            
 	 		if( id && !tipquery ){
 	 			var is_term = elm.data('catid') || false;
 	 			is_term = is_term? '&type=cat' : '';
	 			elm.data('tipquery', 'action=ap_ajax&ap_ajax_action=hover_card&id='+ id+ is_term);
                tipquery = elm.data('tipquery');
	 		}

	 		if( tipquery !== false )
	 			config.ajax = tipquery;
	 		
 			altertitle(el);

 			if(config.title == ''){
 				var title = elm.data('aptiptitle');
 			}else{
 				var title = config.title;
 			}

 			if( title.length == 0 ){
 				return;
 			}

 			tip = $('<div class="ap-tooltip '+ config.theme +'"><div class="ap-tooltip-in">'+ title +'</div></div>');

 			if(config.ajax != '' && !plug.ajax_running){
 				if ( $(elm.attr('data-ajax')).length == 0 && $('#' + id + '_card').length == 0 ) {
 					plug.ajax_running = true;
	 				$.ajax({
	                    type: 'POST',
	                    url: ajaxurl,
	                    data: config.ajax+'&ap_ajax_nonce='+ap_nonce,
	                    success: function(data) {
	                    	var dataText = $(data);
					        var data = {};

					        //Parse response text JSON
					        var textJSON = dataText.filter('#ap-response').html();
					 
					        if( typeof textJSON !== 'undefined' && textJSON.length > 2 )
					            data = JSON.parse(textJSON);
					            if( (data.apTemplate||false) && 'object' === typeof data.apTemplate )
					            
					            apLoadTemplate(data.apTemplate.name, data.apTemplate.template, function(template){
					            	apParseTemplate(data.apTemplate.name, data.apData, function(temp){
					            		var html = $(temp);
					                	var count = parseInt( $('.aptip-data').length );
					                	plug.data_id = 'aptipd-'+ (count+1);
					                	html.addClass( 'aptip-data '+ plug.data_id );
					                	elm.attr('data-ajax', '.'+plug.data_id);
					                    $('body').append(html.clone());
					                    tip.find('.ap-tooltip-in').html(html.show());
					                    position(el);
					            	});
						                    	
					            });
	                    	
	                    	
	                        plug.ajax_running = false;
	                    }
	                });
	            }else{
	            	var html = $( '#' + id + '_card' ).html();
                    tip.find('.ap-tooltip-in').html( $(html).show() );
	            }

 			}

 			if(config.before != ''){
 				var before_callback = config.before;
 				before_callback(tip, el, function(){
 					position(el);
 				});
 			}

 			tip.appendTo('body');
 			position(el);
 		}

		this.each(function() {
			$this = $(this);

			var item = this;

			$this.mouseenter(function(){
				if(config.delay != ''){
					delay = setTimeout(function() {
						showtip(item);
					}, config.delay);
				}else{
					showtip(this);					
				}

			}).mouseleave(function(){
				if(typeof tip !== 'undefined')
					tip.remove();

				if(typeof delay !== 'undefined')
					clearTimeout( delay );
			})
		});

		return this;
 	}

	//pass in just the context as a $(obj) or a settings JS object
	$.fn.autogrow = function(opts) {
		var that = $(this).css({
			overflow: 'hidden',
			resize: 'none'
		}) //prevent scrollies
		,
		selector = that.selector,
		defaults = {
				context: $(document) //what to wire events to
				,
				animate: true //if you want the size change to animate
				,
				speed: 50 //speed of animation
				,
				fixMinHeight: true //if you don't want the box to shrink below its initial size
				,
				cloneClass: 'autogrowclone' //helper CSS class for clone if you need to add special rules
				,
				onInitialize: false //resizes the textareas when the plugin is initialized
			};
			opts = $.isPlainObject(opts) ? opts : {
				context: opts ? opts : $(document)
			};
			opts = $.extend({}, defaults, opts);
			that.each(function(i, elem) {
				var min, clone;
				elem = $(elem);
			//if the element is "invisible", we get an incorrect height value
			//to get correct value, clone and append to the body.
			if (elem.is(':visible') || parseInt(elem.css('height'), 10) > 0) {
				min = parseInt(elem.css('height'), 10) || elem.innerHeight();
			} else {
				clone = elem.clone().addClass(opts.cloneClass).val(elem.val()).css({
					position: 'absolute',
					visibility: 'hidden',
					display: 'block'
				});
				$('body').append(clone);
				min = clone.innerHeight();
				clone.remove();
			}
			if (opts.fixMinHeight) {
				elem.data('autogrow-start-height', min); //set min height
			}
			elem.css('height', min);
			if (opts.onInitialize && elem.length) {
				resize.call(elem[0]);
			}
		});
			opts.context.on('keyup paste', selector, resize);

			function resize(e) {
				var box = $(this),
				oldHeight = box.innerHeight(),
				newHeight = this.scrollHeight,
				minHeight = box.data('autogrow-start-height') || 0,
				clone;
			if (oldHeight < newHeight) { //user is typing
				this.scrollTop = 0; //try to reduce the top of the content hiding for a second
				opts.animate ? box.stop().animate({
					height: newHeight
				}, opts.speed) : box.innerHeight(newHeight);
			} else if (!e || e.which == 8 || e.which == 46 || (e.ctrlKey && e.which == 88)) { //user is deleting, backspacing, or cutting
				if (oldHeight > minHeight) { //shrink!
					//this cloning part is not particularly necessary. however, it helps with animation
					//since the only way to cleanly calculate where to shrink the box to is to incrementally
					//reduce the height of the box until the $.innerHeight() and the scrollHeight differ.
					//doing this on an exact clone to figure out the height first and then applying it to the
					//actual box makes it look cleaner to the user
					clone = box.clone()
					//add clone class for extra css rules
					.addClass(opts.cloneClass)
					//make "invisible", remove height restriction potentially imposed by existing CSS
					.css({
						position: 'absolute',
						zIndex: -10,
						height: ''
					})
					//populate with content for consistent measuring
					.val(box.val());
					box.after(clone); //append as close to the box as possible for best CSS matching for clone
					do { //reduce height until they don't match
					newHeight = clone[0].scrollHeight - 1;
					clone.innerHeight(newHeight);
				} while (newHeight === clone[0].scrollHeight);
					newHeight++; //adding one back eliminates a wiggle on deletion
					clone.remove();
					box.focus(); // Fix issue with Chrome losing focus from the textarea.
					//if user selects all and deletes or holds down delete til beginning
					//user could get here and shrink whole box
					newHeight < minHeight && (newHeight = minHeight);
					oldHeight > newHeight && opts.animate ? box.stop().animate({
						height: newHeight
					}, opts.speed) : box.innerHeight(newHeight);
				} else { //just set to the minHeight
					box.innerHeight(minHeight);
				}
			}
		}
		return that;
	};

	$.fn.center = function () {

		this.css({"position":"fixed"});
		if($(window).height() > $(this).outerHeight()){
			this.css("top", Math.max(0, ($(window).height() - $(this).outerHeight()) / 2) + "px");
		}else{
			this.css("top", 50 );
			this.css("height", $(window).height()- 80 );
		}

		this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) +
			$(window).scrollLeft()) + "px");
		return this;
	}

	$.fn.apAjaxQueryString = function () {
		var query = $(this).data('query').split("::");		
		
		var newQuery = {};
	
		newQuery['action'] = 'ap_ajax';
		newQuery['ap_ajax_action'] = query[0];
		newQuery['__nonce'] = query[1];
		newQuery['args'] = {};

		var newi = 0;
		$.each(query,function(i){
			if(i != 0 && i != 1){
		   		newQuery['args'][newi] = query[i];
		   		newi++;
			}		   
		});

		return newQuery;
	}
})(jQuery);

/**
 * For returning default value if passed value is undefined.
 * @param  {mixed} $value   A value to check
 * @param  {mixed} $default return this if $value is undefined
 * @return {string}
 * @since 2.0
 **/
 function ap_default($value, $default){
 	if(typeof $value !== 'undefined')
 		return $value;

 	return $default;
 }

 function apLoadingDot(){
 	i = 0;
 	setInterval(function() {
 		jQuery('.ap-loading-dot').html( Array( (++i % 4)+1 ).join('.') );
 	}, 300);
 }

 function apAjaxData(param) {
 	param = param + '&action=ap_ajax';
 	return param;
 }

 function apQueryStringToJSON(string) {
 	var pairs = string.split('&');
 	var result = {};
 	pairs.forEach(function(pair) {
 		pair = pair.split('=');
 		result[pair[0]] = encodeURIComponent(pair[1] || '');
 	});
 	return JSON.parse(JSON.stringify(result));
 }

 function apGetValueFromStr(q, name) {
 	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
 	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
 	results = regex.exec(q);
 	return results == null ? false : decodeURIComponent(results[1].replace(/\+/g, " "));
 }

 function apCenterBox(elm){
 	var elm         = jQuery(elm);
 	var parent      = elm.parent();

 	parent.css({position: 'relative'});

 	elm.css("left", (parent.width()-elm.width())/2);
 	elm.css("top", (parent.height()-elm.height())/2);
 }

function apIsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function apLoadCssJs(filename, filetype){
    if (filetype=="js"){ //if filename is a external JavaScript file
        var fileref=document.createElement('script')
        fileref.setAttribute("type","text/javascript")
        fileref.setAttribute("src", filename)
    }
    else if (filetype=="css"){ //if filename is an external CSS file
        var fileref=document.createElement("link")
        fileref.setAttribute("rel", "stylesheet")
        fileref.setAttribute("type", "text/css")
        fileref.setAttribute("href", filename)
    }
    if (typeof fileref!="undefined")
        document.getElementsByTagName("head")[0].appendChild(fileref)
}

function apLoadTemplate(name, template, cb) {
	cb = cb || false;
	if(typeof window.apTemplates === 'undefined')
		window.apTemplates = {};
	
	if(typeof window.apTemplates[name] === 'undefined'){
		jQuery.get(template, function(data) {
			window.apTemplates[name] = data;
			jQuery(window.apTemplates[name]).trigger(name, template);
			if(cb) cb(data);
			return;
		});
	}	

	if(cb) cb(window.apTemplates[name]);
}

function apParseRepeatTag(template, data, repeatObj){
	var newTemplate = '';	
	jQuery.each(data[repeatObj[1]], function(index, val) {
		newdata = {};	
		newdata[repeatObj[0]] = {};
		newdata[repeatObj[0]] = jQuery.extend({}, val);
		newTemplate += apParseTemplate(false, newdata, false, template);
	});
	return newTemplate;
}

function apParseLoopInTemplate(template, data){
	if( jQuery('<div>'+template+'</div>').find('[ap-repeat]').length === 0 )
		return template;

	jQuery('<div>'+template+'</div>').find('[ap-repeat]').each(function(index, el) {
		var outerHtml = jQuery(el).prop('outerHTML');
		var repeatAttr = jQuery(el).attr('ap-repeat');
		var repeatObj = repeatAttr.split(' in ');
		// Apply trim to all individual items of array.
		repeatObj = jQuery.map(repeatObj, jQuery.trim);
		var html = jQuery(el).html();
		var processedRepeat = apParseRepeatTag(html, data, repeatObj);
		jQuery(el).html(processedRepeat);
		jQuery(el).removeAttr('ap-repeat');
		var newOuterHtml = jQuery(el).prop('outerHTML');	
		template = jQuery(template).prop('outerHTML');
		template = template.replace(outerHtml, newOuterHtml);
	});
	return template;
}

function apParseHideInTemplate(template, data){
	if( jQuery(template).find('[ap-hide]').length === 0 )
		return template;

	jQuery(template).find('[ap-hide]').each(function(index, el) {
		var outerHtml = jQuery(el).prop('outerHTML');
		var exp = jQuery(el).attr('ap-hide');
		var f = new Function(exp);

		if(f()){
			jQuery(el).hide();
			jQuery(el).removeAttr('ap-hide');
			var newOuterHtml = jQuery(el).prop('outerHTML');		
			template = template.replace(outerHtml, newOuterHtml);
		}
	});
	return template;
}

/* Nano Templates - https://github.com/trix/nano */
function apParseTemplate(template, data, cb, templateStr) {
	template = template || false;
	cb = cb || false;
	templateStr = templateStr || false;
	
	if(typeof window.apTemplates === 'undefined')
		window.apTemplates = {};

	if( template && !templateStr ){
		var temp = window.apTemplates[template] || '';		
	}else{
		var temp = templateStr;
	}

	if('' === temp)
		return false;

	temp = apParseLoopInTemplate(temp, data);

	temp = temp.replace(/\{([\w\.]*)\}/g, function(str, key) {
		//console.log(str, key, data);
		var keys = key.split("."), v = data[keys.shift()];
		for (var i = 0, l = keys.length; i < l; i++){
			v = v[keys[i]];
		}
		return (typeof v !== "undefined" && v !== null) ? v : "";
	});
	temp = apParseHideInTemplate(temp, data);

	if(cb) cb(temp);
	return temp;
}
