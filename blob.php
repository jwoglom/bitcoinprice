<?php
ini_set('user_agent', 'MSIE 6.0');
$now = time();
$st = round(microtime(true) * 1000);
$maxage = 30;
if(file_exists("blob-latest.txt")) {
    list($timestamp, $latest) = explode("\n", file_get_contents("blob-latest.txt"), 2);
    $diff = ($now - $timestamp);
    if($diff < $maxage) {
        $refresh = $maxage - $diff;
        echo '{"now_ts":' . $now . ',"cache_ts":' . $timestamp . ',"refresh_in":' . $refresh . ',"gen_ms":' . (round(microtime(true) * 1000) - $st) . ',' . substr($latest, 1);
        die();
    }
    
}

function f($url) { return json_decode(file_get_contents($url)); }
$data = array();
$data["prices"] = array();
$data["prices"]["bitstamp"] = f("https://www.bitstamp.net/api/ticker/");

$data["prices"]["bitfinex"] = f("https://api.bitfinex.com/v1/ticker/btcusd/");
$data["prices"]["bitfinex"]->last = $data["prices"]["bitfinex"]->last_price;

$data["prices"]["btce"] = f("https://btc-e.com/api/2/btc_usd/ticker");
$data["prices"]["btce"] = $data["prices"]["btce"]->ticker;

$data["prices"]["itbit"] = f("https://www.itbit.com/api/feeds/ticker/XBTUSD");
$data["prices"]["itbit"]->last = $data["prices"]["itbit"]->close;

$coinbase = array();
$coinbase["buy"] = f("https://coinbase.com/api/v1/prices/buy");
$coinbase["sell"] = f("https://coinbase.com/api/v1/prices/sell");
$data["prices"]["coinbase"] = array(
    "buy" => $coinbase["buy"]->amount,
    "sell" => $coinbase["sell"]->amount,
    "last" => "".(floatval($coinbase["buy"]->amount) + floatval($coinbase["sell"]->amount)) / 2
);


$enc = json_encode($data);
file_put_contents("blob-latest.txt", time()."\n".$enc);
echo '{"now_ts":' . $now . ',"cache_ts":' . $now . ',"refresh_in":' . $maxage . ',"gen_ms":' . (round(microtime(true) * 1000) - $st) . ',' . substr($enc, 1);

?>