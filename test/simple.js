var
	jscrap = require('../jscrap'),
	start = new Date();

jscrap.scrap("https://www.kernel.org/",{debug:true},function(err,$){
	console.log("Latest Linux Kernel: ",$("article #latest_link > a").text());
	console.log("Released: ",$("article #releases tr:first-child td:nth-child(3)").text());
});
