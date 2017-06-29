(function($) {
	$.fn.bgIframe = $.fn.bgiframe = function(s) {
		if ($.browser.msie && /6.0/.test(navigator.userAgent)) {
			s = $.extend({
				top: 'auto',
				left: 'auto',
				width: 'auto',
				height: 'auto',
				opacity: true,
				src: 'javascript:false;'
			},
			s || {});
			var prop = function(n) {
				return n && n.constructor == Number ? n + 'px': n;
			},
			html = '<iframe class="bgiframe"frameborder="0"tabindex="-1"src="' + s.src + '"' + 'style="display:block;position:absolute;z-index:-1;' + (s.opacity !== false ? 'filter:Alpha(Opacity=\'0\');': '') + 'top:' + (s.top == 'auto' ? 'expression(((parseInt(this.parentNode.currentStyle.borderTopWidth)||0)*-1)+\'px\')': prop(s.top)) + ';' + 'left:' + (s.left == 'auto' ? 'expression(((parseInt(this.parentNode.currentStyle.borderLeftWidth)||0)*-1)+\'px\')': prop(s.left)) + ';' + 'width:' + (s.width == 'auto' ? 'expression(this.parentNode.offsetWidth+\'px\')': prop(s.width)) + ';' + 'height:' + (s.height == 'auto' ? 'expression(this.parentNode.offsetHeight+\'px\')': prop(s.height)) + ';' + '"/>';
			return this.each(function() {
				if ($('> iframe.bgiframe', this).length == 0) this.insertBefore(document.createElement(html), this.firstChild);
			});
		}
		return this;
	};
})(jQuery);
(function($, root) {
	var CAP = {};
	CAP.ui = {};
	/**private**/
	CAP.ui.BasicDiaglog = function(options) {
		this.init(options);
	}
	function now() {
		return new Date().getTime();
	}
	function bind(obj, func) {
		return function() {
			return func.apply(obj, arguments);
		};
	}
	$.extend(CAP.ui.BasicDiaglog.prototype, {
		constructor: CAP.ui.BasicDiaglog,
		init: function(options) {
			var self = this,
			tpl = '<h3 class="yzm-tit" style="line-height:30px;padding-left:10px;font-size:12px;font-weight:bold;background-color:#f2f2f2;color:#333;">请输入验证码</h3><a href="javascript:void(0);" class="close-a">关闭</a>',
			$window = $(window);
			self.ie6 = !!window.ActiveXObject && !window.XMLHttpRequest;
			self.options = $.extend({
				content: "......",
				width: 0,
				height: 0,
				zIndex: 10001,
				esc: false,
				hidden: true,
				noDrag: true,
				isBg: true,
				isHover: false,
				isTitle: true,
				isClose: true,
				bgColor: "#000",
				opacity: .4,
				onClose: function() {}
			},options || {});
			var options = self.options;
			self._drag = null;
			options.isBg && self.setMask(options.zIndex, options.hidden);
			self._$node = $('<div class="yzm-box" style="position:absolute;background-color:#fff;color:#333;">'+tpl+options.content+'</div>');
			self._$node.appendTo("body");
			if (options.zIndex) {
				self._$node.css("z-index", options.zIndex);
			};
			if (options.hidden) {
				self._$node.css("visibility", "hidden");
			};
			if (self.ie6) {
				self._$node.bgIframe && self._$node.bgIframe();
			};
			self._$btnClose = self._$node.find(".close-a");
			self._bindClose = bind(self, self._setBtnClose);
			self._$btnClose.bind("click", self._bindClose);
			self._$btnMove = {};
			self._$btnMove["resize"] = function() {
				self.resize();
			};
			self._$btnMove["scroll"] = function() {
				self.scroll();
			};
			self._$btnMove["keydown"] = function(event) {
				if (options.esc) {
					return;
				};
				if (!self._$btnMove) {
					return;
				};
				var p = event.keyCode;
				if (p === 27) {
					self.close()
				};
			};
			!options.isHover && self.setMiddle();
			if (options.hidden) {
				self._$node.css("visibility", "hidden");
				self.focusTarget = self._$btnClose;
			} else {
				self._$node.css("visibility", "visible");
				self._$btnClose.focus().blur();
			};
			if (!options.isTitle) {
				self._$btnMove.hide();
			};
			if (!options.isClose) {
				self._$btnClose.hide();
			};
			$window.bind({
				"resize": self._$btnMove["resize"],
				"scroll": self._$btnMove["scroll"]
			});
			$(document).bind("keydown", self._$btnMove["keydown"]);
		},
		_setBtnClose: function() {
			var self=this;
			self.close();
			return false;
		},
		distory: function() {
			var self = this,
			options = self.options;
			if (self._distory) {
				return;
			};
			$(window).unbind({
				"resize": self._$btnMove["resize"],
				"scroll": self._$btnMove["scroll"]
			});
			self._drag && self._drag.destory();
			self._$btnClose.unbind("click", self._bindClose);
			self._$btnClose = null;
			self._$node.remove();
			self._$mask && self._$mask.remove();
			self._$node = null;
			self._$btnMove["resize"] = null;
			self._$btnMove["scroll"] = null;
			self._$btnMove["close"] = null;
			self._$btnMove = null;
			self._destory = true;
			self._close = true;
		},
		close: function() {
			var self = this,
			options = self.options;
			if (self._close) {
				return;
			};
			setTimeout(function() {
				options.onClose();
			},0);
			self.distory();
		},
		show: function() {
			var self = this,
			options = self.options;
			if (!self._$node) {
				return;
			};
			self._$node.css("visibility", "visible");
			if (self._$mask) {
				self._$mask.css("visibility", "visible");
			};
			if (self.focusTarget) {
				self.focusTarget.focus()
			};
			if (self._$mask && self.ie6) {
				var html = document.getElementsByTagName('html')[0];
				if (document.body.currentStyle.backgroundAttachment !== 'fixed') {
					html.style.backgroundImage = 'url(about:blank)';
					html.style.backgroundAttachment = 'fixed';
				};
			};
			self.resize();
			!options.isHover && self.setMiddle();
		},
		setMask: function(z, hidden) {
			var self = this,
			options = self.options;
			self._$mask = $("<div class=\"setFixedIE6\"></div>").appendTo("body");
			if (hidden) {
				self._$mask.css("visibility", "hidden");
			}
			self._$mask.css({
				position: "fixed",
				backgroundColor: options.bgColor,
				width: "100%",
				height: "100%",
				zIndex: parseInt(z),
				opacity: options.opacity
			});
			if (self.ie6) {
				self._$mask.bgIframe && self._$mask.bgIframe();
				self._$mask.css({
					"position": "absolute"
				});
			} else {
				self._$mask.css({
					left: 0,
					top: 0
				});
			}
		},
		resize: function() {
			var self = this,
			options = self.options;
			self.setMiddle();
			if (self._$mask) {
				if (self.ie6) {
					self._setIE6Scroll();
				}
			}
		},
		_setIE6Scroll: function() {
			var self = this,
			$window = $(window);
			if (self._$mask && self.ie6) {
				self._$mask.css({
					"width": $window.width() + "px",
					"height": $window.height() + "px"
				});
			}
		},
		scroll: function() {
			var self = this;
			self.setMiddle();
			self._setIE6Scroll();
		},
		setMiddle: function() {
			var self = this,
			options = self.options,
			w = self._$node.outerWidth(),
			h = self._$node.outerHeight(),
			$window = $(window),
			s = $window.scrollTop(),
			b = {
				width: $window.width(),
				height: $window.height()
			},
			a = s + (b.height - h) / 2,
			c = (b.width - w) / 2;
			self._$node.css({
				"left": c + "px",
				"top": a < 20 ? 20: a + "px"
			});
		}
	});
	/**private**/
	CAP.ui.normal_captcha = function( options ) {
		var obj = {},
			self = this,
			url='http://vote.act.city.sina.com.cn/interface/captcha/captcha_img.php?',
			tpl = '<div class="yzm-con2">',
			btn_id = "btn_" + now(),
			_dialog = null,
			$btn = null;
		tpl += '<p><input type="text" class="yzm-text" value="" placeholder="按下图输入验证码，不区分大小写" title="按下图输入验证码，不区分大小写"/></p>';
		tpl += '<p><img src="" alt="" />看不清？<a href="javascript:void(0);" class="chose-btn-vote">换一张</a></p><p class="tc">';
		tpl += '<input type="button" class="sub-btn" value="提交" id="'+btn_id+'" /></p></div>';
		obj.content = tpl;
		_dialog = new CAP.ui.BasicDiaglog(obj);

		var $img = _dialog._$node.find('img'),
			$chose = _dialog._$node.find('a.chose-btn-vote');
		var g = function () {
			var $im = $img.get(0);
			$im.src = url+'&r='+now()+'&height='+options.height+'&width='+options.width+'&act_id='+options.act_id;
		};

		$img.bind('click',g);
		$chose.bind('click',g);
		$img.trigger('click');

		self.dialog = _dialog;
		self.btn = $("#" + btn_id);
		return self;
	};
	/**private**/
	CAP.ui.ads_captcha = function( options ){
		var obj = {},
			self = this,
			url='http://vote.act.city.sina.com.cn/interface/captcha/json_get_ads_captcha.php?',
			tpl = '<div class="yzm-con">',
			btn_id = "btn_" + now(),
			_dialog = null,
			$btn = null,
			loading = 'http://act.city.sina.com.cn/images/loading2.gif';
		self.options = $.extend({
			ok_callback: function() {}
		},
		options || {});
		tpl += '<p><a href="javascript:void(0);" class="chose-btn chose-btn-adcaptcha">换一张</a><i class="icon-q captcha-q">&nbsp;</i><span>请输入下图中本期访谈嘉宾的姓名是什么？</span></p>';
		tpl += '<div class="yzm-img" style="text-align:center;"><img src="'+loading+'" alt="" /></div><p><i class="icon-a">&nbsp;</i><input type="text" class="yzm-text" value="" placeholder="请在此输入正确答案" title="请在此输入正确答案"/></p><p class="tc">';
		tpl += '<span class="captcha-error" style="color:red;"></span><input type="button" class="sub-btn" value="提交" id="'+btn_id+'" /></p></div>';
		obj.content = tpl;
		_dialog = new CAP.ui.BasicDiaglog(obj);
		var $act_id = self.options.act_id,
			$img = _dialog._$node.find('img'),
			$chose = _dialog._$node.find('a.chose-btn-adcaptcha'),
			$question = _dialog._$node.find('i.captcha-q').next(),
			$error = _dialog._$node.find('span.captcha-error');

		var g = function(){
			var $im = $img.get(0);
			$im.src=loading;
			$.getJSON(url+'&callback=?&r='+now(),{'act_id':$act_id},function(json){
				if( json.error==0 ) {
					var data = json.data;
					$im.src = data.img;
					$question.text(data.question);
				} else {
					$error.text(json.errmsg);
				};
			});
		};
		$img.bind('click',g);
		$chose.bind('click',g);
		$img.trigger('click');

		self.dialog = _dialog;
		self.btn = $("#" + btn_id);
		return self;
	};
	/**public**/
	CAP.ui.captcha = function(options){
		var self = this,obj = {},_dialog = null,
			err = function(content){
				_dialog = new CAP.ui.BasicDiaglog({'content':content});
				_dialog.show();
			};
		self.cap = {};
		var options = $.extend({
			ok_callback: function() {}
		},options || {});
		var exec = function(){
			var $btn = self.cap.btn,
				_dialog = self.cap.dialog,
				_$node = self.cap.dialog._$node;
			var cap_text = _$node.find(':text')

			cap_text.focus(function(){
				if($(this).hasClass("icon-failure")){
					$(this).val('').removeClass("icon-failure icon-succeed");
				}
			});

			var sub = function() {
				$.get("http://vote.act.city.sina.com.cn/interface/captcha/json_check_captcha.php", {"captcha":cap_text.val(),"act_id":options.act_id}, function(json){
					if(json.error==1){
						cap_text.addClass("icon-failure");
					}else{
						cap_text.addClass("icon-succeed");
						close();
						options.ok_callback.call(self,cap_text.val(),'');
						
					}
					on_progress = false;
				},'jsonp')
			};
			var close = function() {
				$btn.unbind("click", arguments.callee);
				$btn = null;
				_dialog.close();
				self.cap = null;
				$(document).unbind("keyup", r);
				return false;
			}
			var r = function(event) {
				var x = event,
				w = x.target,
				tagName = w.tagName.toUpperCase();
				if (w.nodeType == 3) {
					w = w.parentNode;
				};
				if (w.tagName == "input" || w.tagName == "textarea") {
					return;
				};
				switch (x.keyCode) {
				case 27:
					close();
					break;
				case 13:
					sub();
				};
			};
			$btn.bind("click", sub);
			$(document).bind("keyup", r);
			_dialog.show();
		};


		//获取活动信息
		var act_info = null;
		$.get("http://vote.act.city.sina.com.cn/interface/activity/json_get_act_info.php?act_id="+options.act_id, {}, function(json){
			if(json.error==1){
				err('<span style="color:red;">'+json.errmsg+'</span>');
			}else{
				act_info = json.data;
				if(!act_info){
					err('<span style="color:red;">活动不存在</span>');
					return false;
				};
				//增加验证码类型参数;默认为投票类型;
				var capType = options.type || 'vote';
				if ( capType === 'vote' ) {
					cap = act_info.vote_captcha;
				} else if ( capType === 'work' ) {
					cap = act_info.work_captcha;
				};
				if( cap == 1 )
				{
					obj.height = options.height || 0;
					obj.width  = options.width || 0;
					obj.act_id = act_info.id;
					self.cap = new CAP.ui.normal_captcha(obj);
					exec();
				}else if( cap == 2 ) {
					obj.ok_callback = options.ok_callback || function(){};
					obj.act_id = act_info.id;
					self.cap = new CAP.ui.ads_captcha(obj);
					exec();
				}else{
					$.get("http://vote.act.city.sina.com.cn/interface/common/get_token.php", {"act_id":options.act_id,"work_id":options.work_id}, function(json){
							if(json.error==1){
								err('<span style="color:red;">'+json.errmsg+'</span>');
							}else{
					  			options.ok_callback.call(self,'',json.token);
					 		}
							on_progress = false;
					},'jsonp')
				};
			}
		}, 'jsonp');

		return self;
	};
	//将CAP添加到命名空间
	root.CAP = CAP;
})(jQuery,window);