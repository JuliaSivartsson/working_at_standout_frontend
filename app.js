"use strict";

var App = {

	categoriesArray: ["Milk", "Bread", "Meat", "Other", "See all"],
    defaultLat: 63.0,
    defaultLong: 13.0,
	defaultZoom: 5,
	openStreetMapUrl: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
	jsonUrl: 'db.json',
	markers: [],
	map: {},

	init: function(){
		
		//Create map
        App.map = new L.Map('map', {
            center: [App.defaultLat, App.defaultLong], zoom: App.defaultZoom
        });
		
		//Create tile layer with attribution
        var osmAttribute = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors | <a href="http://www.openstreetmap.org/copyright/en">CC BY-SA</a>';
        var openStreetMap = new L.TileLayer(App.openStreetMapUrl, {attribution: osmAttribute});
		
		//Set it to Sweden
        App.map.setView(new L.LatLng(App.defaultLat, App.defaultLong), App.defaultZoom);
        App.map.addLayer(openStreetMap);
						
		App.renderSuppliers();
		App.renderCategories();
		
		//If user presses the resetButton then reset application
        var resetButton = document.getElementById('reset');
        resetButton.addEventListener('click', function(){
           App.resetMap();
            App.renderSuppliers();
            //App.map.closePopup();

            //Remove all "active" classes
            $("a").each(function() {
                if (this.classList.contains('active')) {
                    this.className = "categoryLink";
                }
            });

            //Set "See all" as default value
            $("span").children().last().removeClass("categoryLink").addClass("active");
        });
		
		//If user presses button to show new supplier form
		var showFormButton = document.getElementById("showForm");
		showFormButton.addEventListener('click', function(){
			App.toggleVisibility(document.getElementById("newSupplier"));
		});
		
		
		//TEST CREATE FORM
		var form = document.createElement("form");
		
		var div1 = document.createElement("div");
		div1.setAttribute("class", "form-group");
		var nameLabel = document.createElement("label");
		nameLabel.innerHTML = "Name :";
		var nameInput = document.createElement("input");
		nameInput.setAttribute("type", "text");
		nameInput.setAttribute("id", "newName");
		div1.appendChild(nameLabel);
		div1.appendChild(nameInput);
		
		var div2 = document.createElement("div");
		div2.setAttribute("class", "form-group");
		var addressLabel = document.createElement("label");
		addressLabel.innerHTML = "Address :";
		var addressInput = document.createElement("input");
		addressInput.setAttribute("type", "text");
		addressInput.setAttribute("id", "newAddress");
		div2.appendChild(addressLabel);
		div2.appendChild(addressInput);
		
		var div3 = document.createElement("div");
		div3.setAttribute("class", "form-group");
		var phoneLabel = document.createElement("label");
		phoneLabel.innerHTML = "Phone :";
		var phoneInput = document.createElement("input");
		phoneInput.setAttribute("type", "text");
		phoneInput.setAttribute("id", "newPhone");
		div3.appendChild(phoneLabel);
		div3.appendChild(phoneInput);
		
		var div4 = document.createElement("div");
		div4.setAttribute("class", "form-group");
		var categoryLabel = document.createElement("label");
		categoryLabel.innerHTML = "Category :";
		//Fill select list with categories
		var categoryInput = document.createElement("select");
		categoryInput.setAttribute("id", "newSupplierCategory");
		
		App.categoriesArray.forEach(function(category, i){
			if(category !== 'See all'){
				var opt = document.createElement('option');
				opt.id = i;
				opt.value = category;
				opt.innerHTML = category;
				categoryInput.appendChild(opt);
			}
		});
		div4.appendChild(categoryLabel);
		div4.appendChild(categoryInput);
		
		var createButton = document.createElement("button");
		createButton.setAttribute("id", "createNewSupplier");
		createButton.setAttribute("class", "btn btn-primary");
		createButton.innerHTML = "Create new supplier";
		
		form.appendChild(div1);
		form.appendChild(div2);
		form.appendChild(div3);
		form.appendChild(div4);
		form.appendChild(createButton);
		
		document.getElementById("newSupplier").appendChild(form);
		
		

		
		//If user presses button to create new supplier
		var createSupplierButton = document.getElementById("createNewSupplier");
		createSupplierButton.addEventListener('click', function(){
			var name = document.getElementById("newName").value;
			var address = document.getElementById("newAddress").value;
			var phone = document.getElementById("newPhone").value;
			var category = document.getElementById("newSupplierCategory");
			var categoryId = category[category.selectedIndex].id;
			
			//If values are empty
			switch("") {
				case name:
					alert("Name cannot be empty!");
					break;
				case address:
					alert("Address cannot be empty!");
					break;
				case phone:
					alert("Phone number cannot be empty!");
					break;
				case category:
					alert("You must choose a category");
					break;
				default:
				    var url = "https://maps.googleapis.com/maps/api/geocode/json";
					url += "?address=" + address;
					url += "&key=AIzaSyCoa-xvr_TPQiur6N9GbVdV9WV5GRf6ffo";
					$.get(url, function (response) {
						if(response.status === "OK"){
							var location = response.results[0].geometry.location;
							App.createNewSupplier(name, address, phone, categoryId, location.lat, location.lng);
						}
					});
			}
		});
	},
	
	createNewSupplier: function(name, address, phone, category, lat, long){
		console.log(category);
		$.post("http://localhost:3000/suppliers", {
			name: name,
			address: address,
			phone: phone,
			category: category,
			latitude: lat,
			longitude: long
		});
		location.reload();
	},
	
	toggleVisibility: function(e) {
       if(e.style.display == 'block')
          e.style.display = 'none';
       else
          e.style.display = 'block';
    },
	
	resetMap: function(){
        App.map.setView([App.defaultLat, App.defaultLong], App.defaultZoom);
    },
	
	renderInfo: function(suppliers){
		
        var listOfSuppliersContainer = document.getElementById("listOfSuppliers");

        //If list is rendered clear it
        listOfSuppliersContainer.innerHTML = "";

        //For each message render it under category
        suppliers.forEach(function(supplier){
			
			var deleteButton = document.createElement("input");
			deleteButton.setAttribute("type", "button");
			deleteButton.setAttribute("value", "Delete");
			deleteButton.setAttribute("class", "btn btn-danger deleteButton");
			deleteButton.setAttribute("data-id", supplier.id);
			deleteButton.addEventListener("click", function (e) {
				e.stopPropagation();
				App.deleteSupplier(this.getAttribute("data-id"), supplier.name);
			}, false);
			
            var incidentText = "Address: " + supplier.address + "</b><br />" + "Phone: " + supplier.phone + "<br />Category: " + App.categoriesArray[supplier.category] + "<br/>";
			

            var supplierLink = document.createElement("div");
            supplierLink.innerHTML = "<a href='#'>" + supplier.name + "</a>";
			
            var messageText = document.createElement("p");
            messageText.setAttribute("class", "supplierDetails");
            messageText.innerHTML = incidentText;
			messageText.appendChild(deleteButton);
			
            supplierLink.appendChild(messageText);
            listOfSuppliersContainer.appendChild(supplierLink);

            //Hide details
            $(".supplierDetails").hide();

            //If user clicks on incident then show details
            supplierLink.addEventListener('click', function(){
               App.renderDetails(this, supplier);
            });
        });
    },
	
	renderDetails: function(link, supplier){
		
        //Hide other details so only one can show
        $(".supplierDetails").hide(link);
        $(link).children().show();

        //Set view and open popup
        App.map.setView([supplier.latitude, supplier.longitude], 12);
    },
	
	deleteSupplier: function(id, name){
		var confirmDialog = confirm("Are you sure you want to delete supplier " + name);
		if (confirmDialog === true) {
			$.ajax({
			url: "http://localhost:3000/suppliers/" + id,
			type: "DELETE"
			});
			location.reload();
		}
		else{
			console.log("Cancel");
		}
	},
	
	renderCategories: function(){
      var div = document.getElementById('categories');
        var id = 0;
        App.categoriesArray.forEach(function(value){
            var span = document.createElement('span');
            span.setAttribute('class', 'spanClass');
            var a = document.createElement('a');
            a.href = "#";
            a.setAttribute('id', id++);
            a.setAttribute('class', 'categoryLink');
            a.innerHTML = value;
            span.appendChild(a);

            a.addEventListener('click', function(){
                $("a").each(function() {
                    if(this.classList.contains('active')){
                        this.className = "categoryLink";
                    }
                });
                a.setAttribute('class', 'active');
               App.changeCategory(a.innerHTML);
            });
            div.appendChild(span);
        });

        //Set "See all" as default value
        $("span").children().last().removeClass("categoryLink").addClass("active");
    },
	
	renderSuppliers: function(value){
		
		$.get("http://localhost:3000/suppliers", function(suppliers){
			if(suppliers.length > 0){
				App.renderMarkers(App.filterResponse(suppliers, value));
				App.renderInfo(App.filterResponse(suppliers, value));
			}
			else{
				document.getElementById("noSuppliers").style.display = "block";
			}
		});
	},
	
	//Sort suppliers based on category
    filterResponse: function(suppliers, value){
        if(value !== undefined && value !== 'See all'){
            suppliers = jQuery.grep(suppliers, function(supplier){
                var incidentCategory = supplier.category;
                return App.categoriesArray[incidentCategory] === value;
            });
        }
        return suppliers;
    },
	
	changeCategory: function(category){
        App.renderSuppliers(category);
    },
	
	renderMarkers: function(supplier){
        
		//Remove existing markers
        App.markers.forEach(function (marker) {
            App.map.removeLayer(marker);
        });

        //For each supplier
        supplier.forEach(function(info){

            //Create icon from https://github.com/coryasilva/Leaflet.ExtraMarkers
            var icon = L.ExtraMarkers.icon({
                icon: 'fa-info',
                markerColor: 'orange',
                shape: 'square',
                prefix: 'fa'
            });
			
            var marker = L.marker([info.latitude, info.longitude], {icon: icon}).addTo(App.map);
            App.markers.push(marker);

        });
    },
};

window.onload = App.init;