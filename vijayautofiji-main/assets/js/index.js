(function ($, window, document, undefined) {

	// our plugin constructor
	var OnePageNav = function (elem, options) {
		this.elem = elem;
		this.$elem = $(elem);
		this.options = options;
		this.metadata = this.$elem.data('plugin-options');
		this.$win = $(window);
		this.sections = {};
		this.didScroll = false;
		this.$doc = $(document);
		this.docHeight = this.$doc.height();
	};

	// the plugin prototype
	OnePageNav.prototype = {
		defaults: {
			navItems: 'a',
			currentClass: 'current',
			changeHash: false,
			easing: 'swing',
			filter: '',
			scrollSpeed: 750,
			scrollThreshold: 0.5,
			begin: false,
			end: false,
			scrollChange: false
		},

		init: function () {
			// Introduce defaults that can be extended either
			// globally or using an object literal.
			this.config = $.extend({}, this.defaults, this.options, this.metadata);

			this.$nav = this.$elem.find(this.config.navItems);

			//Filter any links out of the nav
			if (this.config.filter !== '') {
				this.$nav = this.$nav.filter(this.config.filter);
			}

			//Handle clicks on the nav
			this.$nav.on('click.onePageNav', $.proxy(this.handleClick, this));

			//Get the section positions
			this.getPositions();

			//Handle scroll changes
			this.bindInterval();

			//Update the positions on resize too
			this.$win.on('resize.onePageNav', $.proxy(this.getPositions, this));

			return this;
		},

		adjustNav: function (self, $parent) {
			self.$elem.find('.' + self.config.currentClass).removeClass(self.config.currentClass);
			$parent.addClass(self.config.currentClass);
		},

		bindInterval: function () {
			var self = this;
			var docHeight;

			self.$win.on('scroll.onePageNav', function () {
				self.didScroll = true;
			});

			self.t = setInterval(function () {
				docHeight = self.$doc.height();

				//If it was scrolled
				if (self.didScroll) {
					self.didScroll = false;
					self.scrollChange();
				}

				//If the document height changes
				if (docHeight !== self.docHeight) {
					self.docHeight = docHeight;
					self.getPositions();
				}
			}, 250);
		},

		getHash: function ($link) {
			return $link.attr('href').split('#')[1];
		},

		getPositions: function () {
			var self = this;
			var linkHref;
			var topPos;
			var $target;

			self.$nav.each(function () {
				linkHref = self.getHash($(this));
				$target = $('#' + linkHref);

				if ($target.length) {
					topPos = $target.offset().top - 62;//$('.header').outerHeight()
					self.sections[linkHref] = Math.round(topPos);
				}
			});
		},

		getSection: function (windowPos) {
			var returnValue = null;
			var windowHeight = Math.round(this.$win.height() * this.config.scrollThreshold);

			for (var section in this.sections) {
				if ((this.sections[section] - windowHeight) < windowPos) {
					returnValue = section;
				}
			}

			return returnValue;
		},

		handleClick: function (e) {
			var self = this;
			var $link = $(e.currentTarget);
			var $parent = $link.parent();
			var newLoc = '#' + self.getHash($link);

			if (!$parent.hasClass(self.config.currentClass)) {
				//Start callback
				if (self.config.begin) {
					self.config.begin();
				}

				//Change the highlighted nav item
				self.adjustNav(self, $parent);

				//Removing the auto-adjust on scroll
				self.unbindInterval();

				//Scroll to the correct position
				self.scrollTo(newLoc, function () {
					//Do we need to change the hash?
					if (self.config.changeHash) {
						window.location.hash = newLoc;
					}

					//Add the auto-adjust on scroll back in
					self.bindInterval();

					//End callback
					if (self.config.end) {
						self.config.end();
					}
				});
			}

			e.preventDefault();
		},

		scrollChange: function () {
			var windowTop = this.$win.scrollTop();
			var position = this.getSection(windowTop);
			var $parent;

			//If the position is set
			if (position !== null) {
				$parent = this.$elem.find('a[href$="#' + position + '"]').parent();

				//If it's not already the current section
				if (!$parent.hasClass(this.config.currentClass)) {
					//Change the highlighted nav item
					this.adjustNav(this, $parent);

					//If there is a scrollChange callback
					if (this.config.scrollChange) {
						this.config.scrollChange($parent);
					}
				}
			}
		},

		scrollTo: function (target, callback) {
			var offset = $(target).offset().top;
			offset = offset - 58;//$('.header').outerHeight()
			$('html, body').animate({
				scrollTop: offset
			}, this.config.scrollSpeed, this.config.easing, callback);
		},

		unbindInterval: function () {
			clearInterval(this.t);
			this.$win.unbind('scroll.onePageNav');
		}
	};

	OnePageNav.defaults = OnePageNav.prototype.defaults;

	$.fn.onePageNav = function (options) {
		return this.each(function () {
			new OnePageNav(this, options).init();
		});
	};

})(jQuery, window, document);










/* =====================================================
	 ScrollTo Jquery
===================================================== */

(function (d) { var k = d.scrollTo = function (a, i, e) { d(window).scrollTo(a, i, e) }; k.defaults = { axis: 'xy', duration: parseFloat(d.fn.jquery) >= 1.3 ? 0 : 1 }; k.window = function (a) { return d(window)._scrollable() }; d.fn.scrollTo = function (n, j, b) { if (typeof j == 'object') { b = j; j = 0 } if (typeof b == 'function') b = { onAfter: b }; if (n == 'max') n = 9e9; b = d.extend({}, k.defaults, b); j = j || b.speed || b.duration; b.queue = b.queue && b.axis.length > 1; if (b.queue) j /= 2; b.offset = p(b.offset); b.over = p(b.over); return this._scrollable().each(function () { var q = this, r = d(q), f = n, s, g = {}, u = r.is('html,body'); switch (typeof f) { case 'number': case 'string': if (/^([+-]=)?\d+(\.\d+)?(px|%)?$/.test(f)) { f = p(f); break } f = d(f, this); case 'object': if (f.is || f.style) s = (f = d(f)).offset() }d.each(b.axis.split(''), function (a, i) { var e = i == 'x' ? 'Left' : 'Top', h = e.toLowerCase(), c = 'scroll' + e, l = q[c], m = k.max(q, i); if (s) { g[c] = s[h] + (u ? 0 : l - r.offset()[h]); if (b.margin) { g[c] -= parseInt(f.css('margin' + e)) || 0; g[c] -= parseInt(f.css('border' + e + 'Width')) || 0 } g[c] += b.offset[h] || 0; if (b.over[h]) g[c] += f[i == 'x' ? 'width' : 'height']() * b.over[h] } else { var o = f[h]; g[c] = o.slice && o.slice(-1) == '%' ? parseFloat(o) / 100 * m : o } if (/^\d+$/.test(g[c])) g[c] = g[c] <= 0 ? 0 : Math.min(g[c], m); if (!a && b.queue) { if (l != g[c]) t(b.onAfterFirst); delete g[c] } }); t(b.onAfter); function t(a) { r.animate(g, j, b.easing, a && function () { a.call(this, n, b) }) } }).end() }; k.max = function (a, i) { var e = i == 'x' ? 'Width' : 'Height', h = 'scroll' + e; if (!d(a).is('html,body')) return a[h] - d(a)[e.toLowerCase()](); var c = 'client' + e, l = a.ownerDocument.documentElement, m = a.ownerDocument.body; return Math.max(l[h], m[h]) - Math.min(l[c], m[c]) }; function p(a) { return typeof a == 'object' ? a : { top: a, left: a } } })(jQuery);








/* =====================================================
	 Parallax Jquery
===================================================== */

(function ($) {
	var $window = $(window);
	var windowHeight = $window.height();

	$window.resize(function () {
		windowHeight = $window.height();
	});

	$.fn.parallax = function (xpos, speedFactor, outerHeight) {
		var $this = $(this);
		var getHeight;
		var firstTop;
		var paddingTop = 0;

		//get the starting position of each element to have parallax applied to it		
		$this.each(function () {
			firstTop = $this.offset().top;
		});

		if (outerHeight) {
			getHeight = function (jqo) {
				return jqo.outerHeight(true);
			};
		} else {
			getHeight = function (jqo) {
				return jqo.height();
			};
		}

		// setup defaults if arguments aren't specified
		if (arguments.length < 1 || xpos === null) xpos = "50%";
		if (arguments.length < 2 || speedFactor === null) speedFactor = 0.1;
		if (arguments.length < 3 || outerHeight === null) outerHeight = true;

		// function to be called whenever the window is scrolled or resized
		function update() {
			var pos = $window.scrollTop();

			$this.each(function () {
				var $element = $(this);
				var top = $element.offset().top;
				var height = getHeight($element);

				// Check if totally above or totally below viewport
				if (top + height < pos || top > pos + windowHeight) {
					return;
				}

				$this.css('backgroundPosition', xpos + " " + Math.round((firstTop - pos) * speedFactor) + "px");
			});
		}

		$window.bind('scroll', update).resize(update);
		update();
	};
})(jQuery);










/* =====================================================
	 Caousel Jquery
===================================================== */

var BsCarousel = function () {
	// Carousel interval
	$('.carousel').carousel({
		interval: 5000
	}); 

		(function ($) {
			//Function to animate slider captions 
			function doAnimations(elems) {
				//Cache the animationend event in a variable
				var animEndEv = 'webkitAnimationEnd animationend';

				elems.each(function () {
					var $this = $(this),
						$animationType = $this.data('animation');
					$this.addClass($animationType).one(animEndEv, function () {
						$this.removeClass($animationType);
					});
				});
			}

			//Variables on page load 
			var $myCarousel = $('#carousel-example-generic'),
				$firstAnimatingElems = $myCarousel.find('.item:first').find("[data-animation ^= 'animated']");

			//Initialize carousel 
			$myCarousel.carousel();

			//Animate captions in first slide on page load 
			doAnimations($firstAnimatingElems);

			//Pause carousel  
			$myCarousel.carousel('pause');

			//Other slides to be animated on carousel slide event 
			$myCarousel.on('slide.bs.carousel', function (e) {
				var $animatingElems = $(e.relatedTarget).find("[data-animation ^= 'animated']");
				doAnimations($animatingElems);
			});

		})(jQuery);
}();