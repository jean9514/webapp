	//	globale variabeler
	let events = [];
	let eventTemplate = document.querySelector("[data-template]");
	let eventContainer = document.querySelector("[data-container]");

	//	hent og gem URL variabeler
	let urlParams = new URLSearchParams(window.location.search);
	let preload = urlParams.get("preload");

	//	føj css-ok navn til id-nummer
	let id = urlParams.get("id");
	id = "event_" + id;
	console.log("urlParams id er: " + id)

	//	preload img-url fra link, så accordion højde passer
	let preloadImage = new Image();
	preloadImage.src = preload;

	//	dokument DOM loadet
	document.addEventListener("DOMContentLoaded", hentJson);

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

	        //	udtræk dag og fjern evt. 0 i start af streng
	        let eventDag = str.substring(6, 8).replace(/^0+/, '');

	        console.log("EventDag: " + eventDag);

	        // indsæt id, så kommende events på forsiden går til rette sted
	        klon.querySelector(".accordion").id = "event_" + event.id;

	        // Indsæt eventlisteners m.m. for accordion
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

	        // Hvis der er link til billetsalg, så indsæt knap med dette - ellers salg i døren
	        if (event.acf.kob != "") {
	            klon.querySelector("[data-kob-knap]").innerHTML = "<a href='' class='event_buy' target='_blank' data-kob>Køb billet</a>";
	            klon.querySelector("[data-kob]").setAttribute("href", event.acf.kob);
	        } else {
	            klon.querySelector("[data-kob-knap]").innerHTML = "<div class='event_door'>Køb billet<br>i døren</div>";
	        }

	        // Hvis arrangementet er text-string "gratis", så flyt det til sidste kolonne
	        if (event.acf.pris == "Gratis") {
	            klon.querySelector("[data-pris]").textContent = "";
	            klon.querySelector("[data-kob-knap]").innerHTML = "<div class='event_door'>Gratis</div>";
	        }

	        klon.querySelector("[data-billede]").setAttribute("src", event.acf.billede);
	        klon.querySelector("[data-billede]").setAttribute("alt", "Eventbillede for: " + event.title.rendered);
	        klon.querySelector("[data-content]").innerHTML = event.content.rendered;
	        klon.querySelector("[data-sted]").textContent = event.acf.sted;

	        // tilføj html DOM
	        eventContainer.appendChild(klon);
	        console.log("loop er kørt");
	    });

	    //	hop til id ved link fra forsiden og fold tilsvarende accordion ud
	    if (id !== null) {
	        window.location.hash = "#" + id;
	        console.log("Hop til id: " + id);

	        //	Sæt accordion til aktiv
	        document.querySelector("#" + id).classList.toggle("active");
	        console.log("sæt " + id + " til aktiv");

	        let panel = document.querySelector("#" + id).nextElementSibling;
	        if (panel.style.maxHeight) {
	            panel.style.maxHeight = null;
	        } else {
	            panel.style.maxHeight = panel.scrollHeight + "px";
	        }
	    } else {
	        console.log("Der er ikke noget id");
	    }
	}

	//-------------------------

	//Accordian-style generel
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
