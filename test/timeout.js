var
	jscrap = require('../jscrap'),
	start = new Date();

jscrap.scrap("https://www.kernel.org/",{timeout:50},function(err,$){
	if ( err ) {
		console.log("Error: ",err);
		return process.exit(-1);
	}
	console.log("Latest Linux Kernel: ",$("article #latest_link > a").text());
	console.log("Released: ",$("article #releases tr:first-child td:nth-child(3)").text());
});
