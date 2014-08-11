btc = {
    data: {},
    prices: {},
    pvs: {
        'bitstamp': 'Bitstamp',
        'bitfinex': 'Bitfinex',
        'btce': 'BTC-e',
        'itbit': 'itBit',
        'coinbase': 'Coinbase'
    },
    curPv: 'bitstamp',
    timer: null,
    init: function() {
        this.initfetch();
        $(".refresh").click(function() {
            btc.checkfetch();
            clearInterval(btc.timer);
            btc.startTimer();
        });
        this.startTimer();
    },
    startTimer: function() {
        this.timer = setInterval(function() {
            console.debug("Timer: checking");
            btc.checkfetch();
        }, 15000);
    },
    callback: function() {
        this.fill();
        this.add();
        this.triggers();
        $(".card.price.btc > input").val("1.00");
        this.showBTC(1.00);
    },
    fill: function() {
        $p = $(".card.pvs");
        for(var i in this.pvs) {
            this.prices[i] = this.getconv(i);
            $p.append("<div class='bottom-button pv "+i+"' data-pv='"+i+"'>"+this.pvs[i]+"</div>");
            $p.css("height", parseInt($p.css("height")) + 40);
        }
        $(".pv."+this.curPv).addClass("cur");
        $(".pv").click(this.clickChange);
        console.log(this.prices);
    },
    clickChange: function() { // bound to button
        var pv = $(this).attr("data-pv");
        btc.curPv = pv;
        $(".pv").removeClass("cur");
        $(".pv."+this.curPv).addClass("cur");
        btc.regen();
    },
    add: function() {
        $(".card.price-top").addClass("usd").attr("data-currency", "usd");
        $(".card.price-bot").addClass("btc").attr("data-currency", "btc");
    },
    triggers: function() {
        $(".card.price.btc > input").keyup(function() {
            btc.showBTC($(this).val());
            btc.runSize();
        });
        $(".card.price.usd > input").keyup(function() {
            btc.showUSD($(this).val());
            btc.runSize();
        });
        $(".card.price-top > input").keyup(this.sizeTop);
        $(".card.price-bot > input").keyup(this.sizeBot);
        $(window).resize(this.runSize);
        setTimeout(function() {
            $(window).resize()
        }, 1);
    },
    runSize: function() {
        btc.sizeTop.bind($(".card.price-top > input"))();
        btc.sizeBot.bind($(".card.price-bot > input"))();
    },
    sizeTop: function() { // bound to input
        var sw = $(document).width();
        var snapStart = 68; // width needed for 1 place
        var snapInt = 51; // width needed for each additional place
        var p = parseInt((sw - snapStart) / snapInt); // number of places to show
        var l = (""+parseFloat($(this).val().replace(/,/g,'').replace('.',''))).length; // number of places
        var s = 80 * p/l;
        if(s > 80) s = 80;
        // console.debug(p, l, s);
        $(this).css("font-size", s+"px");
    },
    sizeBot: function() { // bound to input
        var sw = $(document).width();
        var snapStart = 26; // width needed for 1 place
        var snapInt = 18; // width needed for each additional place
        var p = parseInt((sw - snapStart) / snapInt); // number of places to show
        var l = (""+parseFloat($(this).val().replace(/,/g,'').replace('.',''))).length; // number of places
        var s = 26 * p/l;
        if(s > 26) s = 26;
        // console.debug(p, l, s);
        $(this).css("font-size", s+"px");
    },
    placeval: function(val, pv) {
        return (parseInt(val * Math.pow(10,pv)) / Math.pow(10,pv)).toLocaleString();
    },
    showBTC: function(btcs) {
        var amo = parseFloat(btcs);
        var conv = this.prices[this.curPv];
        var r = amo * conv;
        if(r == NaN || !(r<0 || r>=0)) return;
        // console.info(btcs+"BTC = "+r+"USD");
        $(".card.price.usd > input").val(this.placeval(r, 2));
        $(".card.price.usd > input").attr("data-val", r);
    },
    showUSD: function(usds) {
        var amo = parseFloat(usds);
        var conv = this.prices[this.curPv];
        var r = amo * (1 / conv);
        if(r == NaN || !(r<0 || r>=0)) return;
        // console.info(usds+"USD = "+r+"BTC");
        $(".card.price.btc > input").val(this.placeval(r, 6));
        $(".card.price.btc > input").attr("data-val", r);
    },
    initfetch: function() {
        this.fetchamount(function() {
            btc.callback.bind(btc)();
        });
    },
    checkfetch: function() {
        this.fetchamount(function() {
            btc.regen();
        });
    },
    fetchamount: function(cb) {
        var _st = +new Date;
        $(".refresh").addClass("rotating");
        $.get("blob.php", {}, function(d) {
            btc.data = JSON.parse(d);
            console.log(btc.data);
            cb();
            $(".refresh").removeClass("rotating");
        }, "text");
    },
    getconv: function(pv) {
        return parseFloat(this.data.prices[pv].last);
    },
    regen: function() {
        $(".card.price.btc > input").keyup();
    }
};