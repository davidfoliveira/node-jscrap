# jscrap: A very easy-to-use and lighweight web scrapper

`jscrap` is a very fast and easy-to-use web scrapper for node.js

# Installing

	npm install jscrap

# Having fun

	var
	    jscrap = require('jscrap');

	jscrap.scrap("https://www.kernel.org/",function(err,$){
	    console.log("Latest Linux Kernel: ",$("article #latest_link > a").text().trim());
	    console.log("Released: ",$("article #releases tr:first-child td:nth-child(3)").text());
	});

# Supported selectors:

`jscrap` supports all the [zcsel](https://www.npmjs.org/package/zcsel) selectors and functions.
Watch out [zcsel](https://www.npmjs.org/package/zcsel) documentation.

# Options

The `scrap()` function supports these options:

`debug` : Activates the debug mode. Defaults to `false`.
`followRedirects` : Number of redirects to follow. Defaults to `3`.
`charsetEncoding` : Document charset. Default to `utf-8`.
