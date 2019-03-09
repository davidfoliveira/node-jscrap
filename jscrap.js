"use strict";

var
	http       = require('http'),
	https      = require('https'),
	zlib       = require('zlib'),
	htmlparser = require("htmlparser"),
	zcsel      = require('zcsel');

exports.scrap = function(url_or_data,opts,handler) {

	var
		self = this,
		args = Array.prototype.slice.call(arguments, 0),
		data = url_or_data,
		pHandler,
		parser,
		pstart;

	url_or_data = args.shift() || null;
	handler = args.pop()       || null;
	opts = args.shift()        || null;
	if ( !url_or_data )
		throw new Error("No URL or HTML data to scrap");
	if ( !handler )
		throw new Error("No callback");

	// Input is an URL ? Get it!
	_if ( data.match(/^https?:\/\//),
		function(next){
			self._get(url_or_data,opts,function(err,pageData,res){
				if ( err )
					return next(err,res);
				data = pageData;
				next(null,res);
			});
		},
		function(err,res) {
			if ( err )
				return handler(err,null,res);

			// Parse
			pstart = new Date();
			pHandler = new htmlparser.DefaultHandler(function(err,doc){
				if ( opts && opts.debug )
					console.log("HTML Parse: took "+(new Date()-pstart)+" ms");

				if ( err )
					return handler(err,null,res);

				// Initialize document with ZCSEL and return it
				var
					istart = new Date(),
					$ = zcsel.initDom(doc);
				if ( opts && opts.debug )
					console.log("ZCSel Init: took "+(new Date()-istart)+" ms");

				return handler(null,$,res);
			});
			parser = new htmlparser.Parser(pHandler);
			return parser.parseComplete(data);
		}
	);

};

exports._get = function(url, opts, handler) {

	var
		args = Array.prototype.slice.call(arguments, 0),
		httpMod,
		zipDecoder,
		content = "",
		start = new Date(),
		timeout = null;

	url = args.shift()    || null;
	handler = args.pop()  || null;
	opts = args.shift()   || { followRedirects: 3, charsetEncoding: "utf-8" };

	// Validation
	if ( !url )
		throw new Error("No URL to GET");
	if ( !handler )
		throw new Error("No callback");

	// Auto-complete/normalize
	if (typeof(url) == 'string') {
		url = require('url').parse(url);
	}
	if (opts.headers) {
		url.headers = opts.headers;
	}

	// Create a pseudo callback which destroys herself after being used
	var _handler = function(err,data,res){
		_handler = function(){};
		if ( timeout )
			clearTimeout(timeout);
		handler(err,data,res);
	};

	// Timeout ? Start counting..
	if ( opts.timeout ) {
		timeout = setTimeout(function(){
			_handler(new Error("HTTP request timeout after "+opts.timeout+" ms"),null,null);
		},opts.timeout);
	}

	// GET
	httpMod = url.protocol.match(/^https:/) ? https : http;
	var req = httpMod.get(url, function(res){
		if ( res.statusCode > 400 )
			return _handler(new Error("Got HTTP status code "+res.statusCode+" on "+url),null,res);
		if (res.statusCode >= 300 && res.statusCode < 400) {
			if (res.headers['location'] && res.headers['location'].replace(/^[\s\r\n]*|[\s\r\n]*$/g,"") && opts.followRedirects) {
				var location = require('url').resolve(url, res.headers['location']);
				res.headers.location = location;
				opts.followRedirects--;
				return exports._get(location, opts, _handler);
			}
			return _handler(new Error("Found redirect without Location header"), null, res);
		}

		// Watch content encoding
		if (res.headers['content-encoding']) {
			var enc = res.headers['content-encoding'].toString().toLowerCase().replace(/^\s*|\s*$/g,"");
			if ( enc == "gzip" )
				zipDecoder = zlib.createGunzip();
			else if ( enc == "deflate" )
				zipDecoder = zlib.createInflate();
			else
				return _handler(new Error("Unsupported document encoding '"+enc+"'"),null);
			res.pipe(zipDecoder);
		}

		// GET data
		(zipDecoder || res).setEncoding(opts.charsetEncoding || "utf-8");
		(zipDecoder || res).on('data',function(d){ content += d.toString(); });
		(zipDecoder || res).on('end',function(){
			if ( opts.debug )
				console.log("HTTP GET: took "+(new Date()-start)+" ms");
			return _handler(null,content,res);
		});
	})
	.on('error',function(err){
		return _handler(err,null,null);
	});

};

function _if(cond,a,b){
	return cond ? a(b) : b();
}
