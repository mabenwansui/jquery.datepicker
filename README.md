# jquery.datepicker
日期插件

##datepicker
    $('#simple-calendar').datepicker({
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
    });
     
##ympicker
    $('#simple-calendar').ympicker({
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
    });