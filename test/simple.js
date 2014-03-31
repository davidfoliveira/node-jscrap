var
	jscrap = require('../jscrap');

jscrap.scrap("https://www.npmjs.org/package/zcsel",function(err,$){
	console.log("Done: "+$("h1#zcsel-z-css-selectors-a-jquery-kind-of-css-selectors").text().trim());
});
