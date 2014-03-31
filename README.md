# jscrap: A very easy-to-use web scrapper

`jscrap` is a very fast and easy-to-use web scrapper for node.js

# Installing

	npm install jscrap

# Having fun

	var
	    jscrap = require('jscrap');

	jscrap.scrap("https://www.npmjs.org/package/zcsel",function(err,$){
	    console.log("Done: "+$("h1#zcsel-z-css-selectors-a-jquery-kind-of-css-selectors").text().trim());
	});

# Supported selectors:

`jscrap` supports all the [zcsel](https://www.npmjs.org/package/zcsel) selectors and functions.
Watch out [zcsel](https://www.npmjs.org/package/zcsel) documentation.
