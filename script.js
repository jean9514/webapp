//serviceworkes fra PWA-builder.com

//This is the service worker with the Cache-first network

var CACHE = 'pwabuilder-precache';
var precacheFiles = [
      /* Add an array of files to precache for your app */
    ];

//Install stage sets up the cache-array to configure pre-cache content
self.addEventListener('install', function (evt) {
	console.log('[PWA Builder] The service worker is being installed.');
	evt.waitUntil(precache().then(function () {
		console.log('[PWA Builder] Skip waiting on install');
		return self.skipWaiting();
	}));
});


//allow sw to control of current page
self.addEventListener('activate', function (event) {
	console.log('[PWA Builder] Claiming clients for current page');
	return self.clients.claim();
});

self.addEventListener('fetch', function (evt) {
	console.log('[PWA Builder] The service worker is serving the asset.' + evt.request.url);
	evt.respondWith(fromCache(evt.request).catch(fromServer(evt.request)));
	evt.waitUntil(update(evt.request));
});


function precache() {
	return caches.open(CACHE).then(function (cache) {
		return cache.addAll(precacheFiles);
	});
}

function fromCache(request) {
	//we pull files from the cache first thing so we can show them fast
	return caches.open(CACHE).then(function (cache) {
		return cache.match(request).then(function (matching) {
			return matching || Promise.reject('no-match');
		});
	});
}

function update(request) {
	//this is where we call the server to get the newest version of the
	//file to use the next time we show view
	return caches.open(CACHE).then(function (cache) {
		return fetch(request).then(function (response) {
			return cache.put(request, response);
		});
	});
}

function fromServer(request) {
	//this is the fallback if it is not in the cache to go to the server and get it
	return fetch(request).then(function (response) {
		return response
	});
}


//	globale variabeler
let events = [];
let eventTemplate = document.querySelector("[data-template]");
let eventContainer = document.querySelector("[data-container]");
let TO;


//	dokument DOM loadet
document.addEventListener("DOMContentLoaded", hentJson);

document.addEventListener("DOMContentLoaded", start);

function start() {
	TO = setTimeout(showPage, 3000);
}

function showPage() {
	document.querySelector("#baggrund").style.display = "none";
}

//	hent json
async function hentJson() {
	console.log("hentJson");

	//	Hent wordpress content fra flere custom post types (multiple-post-type plugin endpoint)
	let jsonData = await fetch("http://erik-crg.dk/kea/07-cms/huset-kbh/wordpress/wp-json/wp/v2/multiple-post-type?&type[]=musikevents&type[]=filmevents&type[]=ordevent&type[]=teaterevents&type[]=scenekunst&per_page=100");

	events = await jsonData.json();

	//	test json-import
	console.log(events);

	//	sortér efter event-dato fra acf
	events.sort(function (a, b) {
		return a.acf.dato - b.acf.dato;
	});


	visEvents();
}

//	Event-loop
function visEvents() {

	//	Kør loop med json-data
	events.forEach(event => {
		console.log(event);

		//	Klon? ja tak
		let klon = eventTemplate.cloneNode(true).content;

		//	udtræk dato fra acf
		let str = event.acf.dato;
		console.log("hel dato: " + str);

		//	omform måned fra tal til 3 bugstaver - fjern evt. 0 i start af streng
		let eventMaaned = str.substring(4, 6).replace(/^0+/, '');

		if (eventMaaned == 1) {
			eventMaaned = "jan";
		}
		if (eventMaaned == 2) {
			eventMaaned = "feb";
		}
		if (eventMaaned == 3) {
			eventMaaned = "mar";
		}
		if (eventMaaned == 4) {
			eventMaaned = "apr";
		}
		if (eventMaaned == 5) {
			eventMaaned = "maj";
		}
		if (eventMaaned == 6) {
			eventMaaned = "jun";
		}
		if (eventMaaned == 7) {
			eventMaaned = "jul";
		}
		if (eventMaaned == 8) {
			eventMaaned = "aug";
		}
		if (eventMaaned == 9) {
			eventMaaned = "sep";
		}
		if (eventMaaned == 10) {
			eventMaaned = "okt";
		}
		if (eventMaaned == 11) {
			eventMaaned = "nov";
		}
		if (eventMaaned == 12) {
			eventMaaned = "dec";
		}

		// test
		console.log("EventMaaned: " + eventMaaned);

		//	vis dag og fjern evt. 0 i start af datovisningen
		let eventDag = str.substring(6, 8).replace(/^0+/, '');

		// test
		console.log("EventDag: " + eventDag);

		// Indsætter eventlisteners m.m. for accordion på eventlisten.
		klon.querySelector(".accordion").addEventListener("click", function () {
			this.classList.toggle("active");
			let panel = this.nextElementSibling;
			if (panel.style.maxHeight) {
				panel.style.maxHeight = null;
			} else {
				panel.style.maxHeight = panel.scrollHeight + "px";
			}
		});

		klon.querySelector("[data-dato]").textContent = eventDag;
		klon.querySelector("[data-maaned]").textContent = eventMaaned;

		klon.querySelector("[data-tid]").textContent = event.acf.tid;
		klon.querySelector("[data-genre]").textContent = event.acf.genre;
		klon.querySelector("[data-title]").textContent = event.title.rendered;
		klon.querySelector("[data-pris]").textContent = event.acf.pris;

		// Hvis der er link til billetsalg, så indsættes knap med dette - ellers vises "salg i døren"
		if (event.acf.kob != "") {
			klon.querySelector("[data-kob-knap]").innerHTML = "<a href='' class='event_buy' target='_blank' data-kob>Køb billet</a>";
			klon.querySelector("[data-kob]").setAttribute("href", event.acf.kob);
		} else {
			klon.querySelector("[data-kob-knap]").innerHTML = "<div class='event_door'>Køb billet<br>i døren</div>";
		}

		// Hvis eventet er "gratis", så flyt det til sidste kolonne
		if (event.acf.pris == "Gratis") {
			klon.querySelector("[data-pris]").textContent = "";
			klon.querySelector("[data-kob-knap]").innerHTML = "<div class='event_door'>Gratis</div>";
		}

		klon.querySelector("[data-billede]").setAttribute("src", event.acf.billede);
		klon.querySelector("[data-billede]").setAttribute("alt", "Eventbillede for: " + event.title.rendered);
		klon.querySelector("[data-content]").innerHTML = event.content.rendered;
		klon.querySelector("[data-sted]").textContent = event.acf.sted;

		// tilføj html til DOM
		eventContainer.appendChild(klon);
		console.log("loop er kørt");
	});

}

//-------------------------

//Accordian-style, generel
var acc = document.getElementsByClassName("accordion");
var i;

for (i = 0; i < acc.length; i++) {
	acc[i].addEventListener("click", function () {
		this.classList.toggle("active");
		var panel = this.nextElementSibling;
		if (panel.style.maxHeight) {
			panel.style.maxHeight = null;
		} else {
			panel.style.maxHeight = panel.scrollHeight + "px";
		}
	});
}
//-------------------------
