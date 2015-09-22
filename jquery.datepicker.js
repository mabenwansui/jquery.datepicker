;(function( $, window ){
  var pluginName = "ympicker",
      classname  = "ympicker-js",
      document = window.document,
      defaults = {
        minYear     : null,      //设置 年份分页的开始年
        maxYear     : null,
        defaultDate : null,      //默认显示到年月，如2010或2010-8
        format      : null,
        left        : null,      //下拉框位置
        top         : null,
        iconRight   : null,      //日期图标位置
        iconTop     : null,
        zIndex      : null,
        init        : null,
        callback    : null
      };
  window[pluginName+'_id'] = 0;
  function Plugin( element, options ) {
    this.element  = element;
    this.id       = ++window[pluginName+'_id'];
    this.helper   = null;
    this.ol       = null;
    this.ul       = null;
    this.pageSize = 8;
    this.fullYear = new Date().getFullYear();
    this.year     = this.fullYear;
    this.month    = null;
    this.options  = $.extend( {}, defaults, options);
    this.options.maxYear = this.options.maxYear || this.fullYear-1 + 2 * this.pageSize;
    this.options.minYear = this.options.minYear || this.fullYear-1 - 8 * this.pageSize;    
    this.init();
  };

  Plugin.prototype.init = function(){
    this.toNumber(['minYear', 'maxYear', 'left', 'top', 'iconRight', 'iconLeft', 'zIndex']);
    this.createHtml();
    this.page();
    this.refresh();
    this.bindEvent();
    this.options.init && this.options.init.call(this, {
      inp   : this.inp,
      year  : this.year,
      month : this.month
    });    
  };

  Plugin.prototype.createHtml = function(){
    var html = [
      '<div class="'+pluginName+'-ui">',
      '  <input type="text" readonly="readonly" />',
      '  <i class="date-icon"></i>',
      '  <div class="drop-down">',
      '    <div class="year-box">',
      '      <a class="prev"></a><a class="next"></a>',
      '      <ol></ol>',
      '    </div>',
      '    <ul></ul>',
      '  </div>',
      '</div>'
    ], that = this;
    this.box    = this.element.after(html.join('')).next().css('position','relative');
    this.icon   = this.box.find('.date-icon');
    this.inp    = this.box.children('input');
    this.helper = this.box.find('.drop-down').hide().css('position','absolute');
    this.ul     = this.helper.find('ul');
    this.ol     = this.helper.find('ol');
    this.element.hide();
  }

  Plugin.prototype.page = function(){
    var that = this;
    this.totalPage = parseInt((this.options.maxYear-this.options.minYear) / this.pageSize ,10);

    if(this.options.defaultDate){
      var d = this._stringToDate(this.options.defaultDate);
      this.year = d.year;
      this.curPage = this.reCurPage(this.year);
      this.addYear(this.curPage);
      d.reallength > 1 ? this.addMonth(d.month) : this.addMonth();
    }else{
      this.curPage = this.reCurPage(this.year);
      this.addYear(this.curPage);
      this.addMonth();
    }
  }

  Plugin.prototype.addYear = function(curPage){
    curPage <= 0 ? this.helper.find('.prev').addClass('disable') : this.helper.find('.prev').removeClass('disable');
    curPage >= this.totalPage ? this.helper.find('.next').addClass('disable') : this.helper.find('.next').removeClass('disable');
    this.ol.empty();
    var y = this.options.minYear + curPage * this.pageSize, 
        $tag;
    for(var i=1; i<=this.pageSize; i++){
      $tag = $('<li data-value="'+y+'">'+(y)+'<i>年</i></li>').appendTo(this.ol);
      this.year==y && $tag.addClass('active');
      y++;
    }
  }

  Plugin.prototype.reCurPage = function(year){
    return parseInt((year-this.options.minYear) / this.pageSize, 10);
  }

  Plugin.prototype.addMonth = function(month){
    var $tag;
    this.ul.empty();
    for(var i=1; i<=12; i++){
      $tag = $('<li data-value="'+i+'">'+i+'<i>月</i></li>').appendTo( this.ul );
      if(i == month) $tag.addClass('active');
    }
  }

  Plugin.prototype.bindEvent = function(){
    var that = this;
    this.helper.find('.prev').on('click', function(){
      if($(this).hasClass('disable')) return;
      that.addYear( --that.curPage );
      that.ul.find('.active').removeClass('active');
    });

    this.helper.find('.next').on('click', function(){
      if($(this).hasClass('disable')) return;
      that.addYear( ++that.curPage );
      that.ul.find('.active').removeClass('active');
    });

    this.inp.on('focus', function(){
      that.box.addClass('active');
      (!that.helper.is(':visible') && !that.element.attr('disabled') ) && that.show();
    });

    this.icon.on('click', function(){ that.inp.triggerHandler('focus') });

    $(document).on('click.' + pluginName + that.id, function (event) {
      if (that.helper.has(event.target).length == 0 && that.helper[0] != event.target && that.icon[0] != event.target && that.inp[0] != event.target) {
        that.hide();
        that.box.removeClass('active');
      };
    });

    //选中年
    this.helper.find('ol').on('click', 'li', function(){
      that.year = $(this).attr('data-value');
      $(this).addClass('active').siblings('li').removeClass('active');
      that.ul.find('.active').removeClass('active');
    });

    //选中月
    this.helper.find('ul').on('click', 'li', function(){
      that.month = $(this).attr('data-value');
      that.inp.val( that.format() );
      that.element.val( that.year + '-' + that.pad(that.month) );
      that.hide();
      that.options.callback && that.options.callback.call(that, {
        inp   : that.inp,
        year  : that.year,
        month : that.month
      });
    });
  }

  Plugin.prototype.show = function(){
    var v = $.trim(this.element.val());
    if(v){
      var d = this._stringToDate(v);
      this.year  = d.year;
      this.month = d.month;
      this.addYear( this.reCurPage(this.year) );
      this.addMonth( this.month );
    }
    this.helper.show();
  }

  Plugin.prototype.hide = function(){
    this.helper.hide();
  }

  Plugin.prototype.refresh = function(){
    var that = this;
    this.addStyle(['class', 'disabled', 'size', 'style', 'value']);
    this.element.attr('disabled') ? this.box.addClass('disabled') : this.box.removeClass('disabled');
    setTimeout(function(){
      var padding = that.inp.outerHeight()/2 - that.icon.height()/2;
      that.icon.css({
        right : padding + (that.options.iconRight || 0),
        top   : padding + (that.options.iconTop || 0)
      });
    }, 0);

    if( this.options.zIndex ) this.box.css('z-index', this.options.zIndex);

    this.helper.css({
      left : 0 + (this.options.left || 0),
      top  : this.inp.position().top + this.inp.outerHeight() -1 + (this.options.top || 0)
    });
  }

  Plugin.prototype.destory = function(){
    this.box.remove();
    this.element.show();
    $(document).off('click.' + pluginName + this.id);
  }

  Plugin.prototype.format = function(){
    var that = this,
        str = this.options.format;
    if(str){
      str = str.replace(/y{1,4}/ig, function($1){
        var y = String(that.year);
        return y.substr( y.length - $1.length );
      }).replace(/m{1,2}/ig, function($1){
        return $1.length==2 ? that.pad(that.month) : that.month;
      });
    }else{
      str = this.year + '-' + this.month;
    }
    return str;
  }

  Plugin.prototype.addStyle = function(arr){
    var that = this;
    arr && $.each(arr, function(i,v){
      var a = that.element.attr(v);
      if(a){
        if(v == 'value') {
          var d = that._stringToDate(a);
          that.year  = d.year;
          that.month = d.month;
          that.inp.val(that.format());
        }else{
          that.inp.attr(v, a);
        }
      };
    });
    that.inp.show().addClass('clone-input');
  }

  Plugin.prototype._stringToDate = function(str){
    var d = str.split('-');
    return {
      reallength : d.length,
      year   : d[0],
      month  : d[1]
    }
  }

  Plugin.prototype.pad = function(str){
    return (str/Math.pow(10, 2)).toFixed(2).substr(2);
  }

  Plugin.prototype.toNumber = function(arr){
    var that = this;
    $.each(arr, function(i, v){
      if(that.options[v]) that.options[v] = parseInt(that.options[v], 10);
    });
  }

  $.fn[pluginName] = function ( options ) {
    if (typeof options == 'string') {
      var args=arguments, method=options;
      Array.prototype.shift.call(args);

      return this.each(function(){
        var plugin = $.data(this, 'plugin_'+pluginName);
        if(plugin && plugin[method]) plugin[method].apply(plugin, args);
      });
    }else{
      return this.each(function() {
        var plugin = $.data(this, 'plugin_'+pluginName);
        if(!plugin){
          $.data(this, 'plugin_'+pluginName, new Plugin( $(this), options ));
        }
      });
    }
  };
})( jQuery, window );

;(function( $, window ){
  var pluginName = "datepicker",
      classname  = "datepicker-js",
      document = window.document,
      defaults = {
        startDate   : null,      //设置能选择日期的范围  格式 2015-06-01
        endDate     : null,
        defaultDate : null,      //第一次打开的默认日期
        format      : null,      //格式化日期显示  如 yyyy年mm月dd日
        left        : null,      //下拉框位置
        top         : null,
        iconRight   : null,      //日期图标位置
        iconTop     : null,
        zIndex      : null,
        init        : null,
        callback    : null
      };
  window[pluginName+'_id'] = 0;
  function Plugin( element, options ) {
    this.element = element;
    this.id      = ++window[pluginName+'_id'];
    this.year    = null;
    this.month   = null;
    this.date    = null;
    this.helper  = null;
    this.ul      = null;
    this.options = $.extend( {}, defaults, options);
    this.init();
  };

  Plugin.prototype.init = function(){
    this.toNumber(['left', 'top', 'iconRight', 'iconLeft', 'zIndex']);
    this.options.startDate = this.element.attr('data-startDate') || this.options.startDate;
    this.options.endDate = this.element.attr('data-endDate') || this.options.endDate;
    this.createHtml();
    this.refresh();
    this.bindEvent();
    this.options.init && this.options.init.call(this, {
      inp   : this.inp,
      year  : this.year,
      month : this.month,
      day   : this.day
    });
  };

  Plugin.prototype.createHtml = function(){
    var that = this, 
        html = [ 
        '<div class="'+pluginName+'-ui-default">',
        '  <input type="text" readonly="readonly" />',
        '  <i class="date-icon"></i>',
        '  <div class="drop-down">',
        '    <div class="title">',
        '      <div class="year-box"><a href="javascript:;" class="prev"></a><h2></h2><a href="javascript:;" class="next"></a></div>',
        '      <div class="month-box"><a href="javascript:;" class="prev"></a><h2></h2><a href="javascript:;" class="next"></a></div>',
        '    </div>',
        '    <ol>',
        '      <li>一</li>',
        '      <li>二</li>',
        '      <li>三</li>',
        '      <li>四</li>',
        '      <li>五</li>',
        '      <li class="week_end">六</li>',
        '      <li class="week_end">日</li>',
        '    </ol>',
        '    <ul></ul>',
        '  </div>',
        '</div>' 
      ];
    this.box    = this.element.after(html.join('')).next().css('position','relative');
    
    this.icon   = this.box.find('.date-icon');
    this.inp    = this.box.children('input');
    this.helper = this.box.find('.drop-down').css('position','absolute').hide();
    this.ul     = this.helper.find('ul');
    this.element.hide();
    if(this.options.defaultDate){
      var d = this._stringToDate(this.options.defaultDate);
      this.addDate(d.year, d.month, d.day);
    }else{
      this.addDate();
    }
  }

  Plugin.prototype.addStyle = function(arr){
    var that = this;
    arr && $.each(arr, function(i,v){
      var a = that.element.attr(v);
      if(a){
        if(v == 'value') {
          var d = that._stringToDate(a);
          that.year  = d.year;
          that.month = d.month;
          that.day   = d.day;
          that.inp.val(that.format());
        }else{
          that.inp.attr(v, a);
        }
      };
    });
    that.inp.show().addClass('clone-input');
  }

  Plugin.prototype.addDate = function(year, month, day){   //data格式为 2014或2014-05
    var that = this;
    var d = new Date();

    if(arguments.length>0){
      d.setYear(year);
      month && d.setMonth(month, 0);
    }else{
      d.setMonth(d.getMonth()+1, 0);
    }
    this.year  = d.getFullYear();
    this.month = d.getMonth()+1;
    this.day   = day;

    //设置年月
    that.helper.find('.year-box h2').html( this.year + '年' );
    that.helper.find('.month-box h2').html( this.month + '月' );
    that.ul.empty();

    //设置星期几前的空格
    !function(year, month){   
      var d = new Date(), w;
      d.setYear( year );
      d.setMonth( --month, 1 );
      w = d.getDay();
      if(w == 0) w=7; w--;
      for(var i=0; i<w; i++){
        that.ul.prepend('<li class="disable" />');
      }
    }(this.year, this.month);

    //填充日期
    for(var i=0, total=d.getDate(); i<total; i++){
      that.ul.append( $('<li data-value="'+(i+1)+'">'+(i+1)+'</li>') )
    };

    this._adddisable();

    //选中状态
    !function(day){
      var d = new Date();
      day = day || d.getDate();
      that.ul.find('li').each(function(){
        if( !$(this).hasClass('disable') && $(this).html()==day ){
          $(this).addClass('active');
          return false;
        }
      })
    }(day);
  }

  Plugin.prototype._adddisable = function(){
    if( this.options.startDate ){
      var start = this._stringToDate(this.options.startDate);
      if( this.year < start.year || ( start.year == this.year && this.month < start.month ) ){
        this.ul.find('li').addClass('disable');
      }else if( this.year == start.year && this.month == start.month ){
        this.ul.find('li').each(function(){
          if( $(this).html() < start.day ) $(this).addClass('disable');
        });
      }
    }
    if( this.options.endDate ){
      var end = this._stringToDate(this.options.endDate);
      if( this.year > end.year || ( end.year == this.year && this.month > end.month ) ){
        this.ul.find('li').addClass('disable');
      }else if( this.year == end.year && this.month == end.month ){
        this.ul.find('li').each(function(){
          if( $(this).html() > end.day ) $(this).addClass('disable');
        });
      }
    }
  }

  Plugin.prototype.bindEvent = function(){
    var that = this;
    this.inp.on('focus', function(){
      that.box.addClass('active');
      (!that.helper.is(':visible') && !that.element.attr('disabled') ) && that.show();
    });

    this.icon.on('click', function(){ that.inp.triggerHandler('focus') });

    $(document).on('click.' + pluginName + that.id, function (event) {
      if (that.helper.has(event.target).length == 0 && that.helper[0] != event.target && that.icon[0] != event.target && that.inp[0] != event.target) {
        that.hide();
        that.box.removeClass('active');
      };
    });


    this.helper.find('.year-box .prev').on('click', function(){
      that.addDate(--that.year, that.month);
    });
    this.helper.find('.year-box .next').on('click', function(){
      that.addDate(++that.year, that.month);
    });
    this.helper.find('.month-box .prev').on('click', function(){
      that.month--;
      if(that.month <= 0){
        that.month = 12;
        that.year--;
      }
      that.addDate(that.year, that.month);
    });
    this.helper.find('.month-box .next').on('click', function(){
      that.month++;
      if(that.month > 12){
        that.month = 1;
        that.year++;
      }
      that.addDate(that.year, that.month);
    });

    this.ul.on('click', 'li', function(){    //点击日
      if( $(this).hasClass('disable') ) return;
      that.day = $(this).attr('data-value');
      that.inp.val(that.format());
      that.element.val( that.year+'-'+that.pad(that.month)+'-'+that.pad(that.day) );
      that.hide();
      that.options.callback && that.options.callback.call(that, {
        inp   : that.inp,
        year  : that.year,
        month : that.month,
        day   : that.day
      });
    })
  }

  Plugin.prototype.show = function(){
    var v = $.trim(this.element.val());
    if(v){
      var date = this._stringToDate(v);
      this.addDate(date.year, date.month, date.day);
    }
    this.helper.show();
  }

  Plugin.prototype.hide = function(){
    this.helper.hide();
  }

  Plugin.prototype.refresh = function(){
    var that = this;
    this.addStyle(['class', 'disabled', 'size', 'style', 'value']);

    this.element.attr('disabled') ? this.box.addClass('disabled') : this.box.removeClass('disabled');

    setTimeout(function(){
      var padding = that.inp.outerHeight()/2 - that.icon.height()/2;
      that.icon.css({
        right : padding + (that.options.iconRight || 0),
        top   : padding + (that.options.iconTop || 0)
      });
    }, 0);

    if( this.options.zIndex ) this.box.css('z-index', this.options.zIndex);
    
    this.helper.css({
      left : 0 + (this.options.left || 0),
      top  : this.inp.position().top + this.inp.outerHeight() -1 + (this.options.top || 0)
    });
  }

  Plugin.prototype.destory = function(){
    this.box.remove();
    this.element.show();
    $(document).off('click.' + pluginName + this.id);
  }

  Plugin.prototype._stringToDate = function(str){
    var d = new Date(Date.parse(str.replace(/-/g, "/")));
    return {
      d     : d,
      year  : d.getFullYear(),
      month : d.getMonth() + 1,
      day   : d.getDate()
    }
  }

  Plugin.prototype.format = function(){
    var that = this,
        str = this.options.format;
    if(str){
      str = str.replace(/y{1,4}/ig, function($1){
        var y = String(that.year);
        return y.substr( y.length - $1.length );
      }).replace(/m{1,2}/ig, function($1){
        return $1.length==2 ? that.pad(that.month) : that.month;
      }).replace(/d{1,2}/ig, function($1){
        return $1.length==2 ? that.pad(that.day) : that.day;
      });
    }else{
      str = this.year + '-' + this.month + '-' + this.day;
    }
    return str;
  }

  Plugin.prototype.pad = function(str){
    return (str/Math.pow(10, 2)).toFixed(2).substr(2);
  }

  Plugin.prototype.toNumber = function(arr){
    var that = this;
    $.each(arr, function(i, v){
      if(that.options[v]) that.options[v] = parseInt(that.options[v], 10);
    });
  }  

  $.fn[pluginName] = function ( options ) {
    if (typeof options == 'string') {
      var args=arguments, method=options;
      Array.prototype.shift.call(args);

      return this.each(function(){
        var plugin = $.data(this, 'plugin_'+pluginName);
        if(plugin && plugin[method]) plugin[method].apply(plugin, args);
      });
    }else{
      return this.each(function() {
        var plugin = $.data(this, 'plugin_'+pluginName);
        if(!plugin){
          $.data(this, 'plugin_'+pluginName, new Plugin( $(this), options ));
        }
      });
    }
  };
})( jQuery, window );