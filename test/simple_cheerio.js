var
	http = require('http'),
	https = require('https');

var _get = function(url,opts,handler) {

	var
		args = Array.prototype.slice.call(arguments, 0),
		httpMod,
		zipDecoder,
		content = "",
		start = new Date();

	url = args.shift()    || null;
	handler = args.pop()  || null;
	opts = args.shift()   || { followRedirects: 3, charsetEncoding: "utf-8" };
	if ( !url )
		throw new Error("No URL to GET");
	if ( !handler )
		throw new Error("No callback");

	// GET
	httpMod = url.match(/^https:/) ? https : http;
	httpMod.get(url,function(res){
		if ( res.statusCode > 400 )
			return handler(new Error("Got HTTP status code "+res.statusCode),null,res);
		if ( res.statusCode >= 300 && res.statusCode < 400 ) {
			if ( res.headers['location'] != null && res.headers['location'].match(/^((https?)?:\/\/.+|\/)/) && opts.followRedirects ) {
				opts.followRedirects--;
				return _get(res.headers['location'],handler);
			}
			return handler(new Error("Found redirect without Location header"),null,res);
		}

		// Watch content encoding
		if ( res.headers['content-encoding'] ) {
			var enc = res.headers['content-encoding'].toString().toLowerCase().replace(/^\s*|\s*$/g,"");
			if ( enc == "gzip" )
				zipDecoder = zlib.createGunzip();
			else if ( enc == "deflate" )
				zipDecoder = zlib.createInflate();
			else
				return handler(new Error("Unsupported document encoding '"+enc+"'"),null);
			res.pipe(zipDecoder);
		}

		// GET data
		(zipDecoder || res).setEncoding(opts.charsetEncoding || "utf-8");
		(zipDecoder || res).on('data',function(d){ content += d.toString(); });
		(zipDecoder || res).on('end',function(){
			if ( opts.debug )
				console.log("HTTP GET: took "+(new Date()-start)+" ms");
			return handler(null,content,res);
		});
	})
	.on('error',function(err){
		return handler(err,null,null);
	});

};


var cheerio = require('cheerio');

_get("https://www.kernel.org/",{debug:true},function(err,data){
	var start = new Date();
	var $ = cheerio.load(data);
	console.log("Cheerio init: ",(new Date()-start)+" ms");
	console.log("Latest Linux Kernel: ",$("article #latest_link > a").text());
	console.log("Released: ",$("article #releases tr:first-child td:nth-child(3)").text());
});

