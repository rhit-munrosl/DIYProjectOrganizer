/**
 * @fileoverview
 * Provides the JavaScript interactions for all pages.
 *
 * @author 
 * PUT_YOUR_NAME_HERE
 */

/** namespace. */
var rhit = rhit || {};

/** globals */
rhit.variableName = "";

/** function and class syntax examples */
rhit.functionName = function () {
	/** function body */
};

rhit.ClassName = class {
	constructor() {

	}

	methodName() {

	}
}

rhit.FB_COLLECTION_PART = "Components";
rhit.FB_KEY_PART_NAME = "name";
rhit.FB_KEY_PART_DESC = "description";
rhit.FB_KEY_PART_LINK = "link";
rhit.FB_KEY_PART_CATEGORY = "category";
rhit.FB_KEY_PART_PRICE = "price";

rhit.FB_COLLECTION_CATEGORY = "Category";
rhit.FB_KEY_CAT_NAME = "name";

rhit.FB_COLLECTION_PROJECT = "Projects";
rhit.FB_KEY_PROJECT_NAME = "name";
rhit.FB_KEY_PROJECT_DESC = "description";
rhit.FB_KEY_PROJECT_RESOURCES = "resources";
rhit.FB_KEY_PROJECT_PARTS = "components";
rhit.FB_KEY_PROJECT_COST = "totalPrice";

rhit.FB_COLLECTION_RESOURCE = "Resource";
rhit.FB_KEY_RESOURCE_CONTENT = "content";
rhit.FB_KEY_RESOURCE_NAME = "name";
rhit.FB_KEY_RESOURCE_DESC = "description";

rhit.FB_KEY_AUTHOR = "author";

rhit.fbAuthManager = null;
rhit.partsManager = null;
rhit.resourcesManager = null;
rhit.categoryManager = null;
rhit.projectsManager = null;
rhit.projectManager = null;

function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}

rhit.Project = class {
	constructor(id, name, desc, cost, parts, resources) {
		this.id = id;
		this.name = name;
		this.desc = desc;
		this.cost = cost;
		this.parts = parts;
		this.resources = resources;
	}
}

rhit.Resource = class {
	constructor(id, name, desc, content) {
		this.id = id;
		this.name = name;
		this.desc = desc;
		this.content = content;
	}
}

rhit.Category = class {
	constructor(id, name) {
		this.id = id;
		this.name = name;
	}
}

rhit.Part = class {
	constructor(id, name, desc, price, link, cat) {
		this.id = id;
		this.name = name;
		this.desc = desc;
		this.price = price;
		this.link = link;
		this.cat = cat;
	}
}

rhit.FbAuthManager = class {
	constructor() {
		this._user = null;
	}
	beingListening(changeListener) {
		firebase.auth().onAuthStateChanged((user) => {
			this._user = user;
			changeListener();
		});
	}
	signIn() {
		const inputEmail = document.querySelector("#userInput");
		const inputPass = document.querySelector("#passwordInput");

		firebase.auth().signInWithEmailAndPassword(inputEmail.value, inputPass.value).catch(function (error) {
			// Handle Errors here.
			var errorCode = error.code;
			var errorMessage = error.message;
			// ...
			console.log("Login error occured", error);
			window.location.href = "/";
		});
	}

	signOut() {
		firebase.auth().signOut().catch((error) => {
			console.log("Signout error");
		});
	}
	get isSignedIn() {
		return !!this._user;
	}
	get uid() {
		return this._user.uid;
	}

	get email() {
		return this._user.email;
	}

}

rhit.PartsLibraryManager = class {
	constructor(userid) {
		this._uid = userid;
		this._searchQuery = "";
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_PART);
		this._unsubscribe = null;
	}

	addPart(n, d, p, l, c) {
		this._ref.add({
			[rhit.FB_KEY_PART_NAME]: n,
			[rhit.FB_KEY_PART_DESC]: d,
			[rhit.FB_KEY_PART_LINK]: l,
			[rhit.FB_KEY_PART_PRICE]: p,
			[rhit.FB_KEY_PART_CATEGORY]: c,
			[rhit.FB_KEY_AUTHOR]: this._uid,
		}).catch(function (error) {
			console.log(error);
		});
	}

	updatePart(id, n, d, p, l, c) {
		this._ref.doc(id).update({
			[rhit.FB_KEY_PART_NAME]: n,
			[rhit.FB_KEY_PART_DESC]: d,
			[rhit.FB_KEY_PART_LINK]: l,
			[rhit.FB_KEY_PART_PRICE]: p,
			[rhit.FB_KEY_PART_CATEGORY]: c,
		}).catch((err) => {
			console.log("error");
		});
	}

	deletePart(id) {
		return this._ref.doc(id).delete();
	}

	beginListening(category, changeListener) {
		let query = this._ref.orderBy(rhit.FB_KEY_PART_NAME, "desc").limit(20).where(rhit.FB_KEY_AUTHOR, "==", this._uid);
		if (category)
			query = query.where(rhit.FB_KEY_PART_CATEGORY, "==", category);
		this._unsubscribe = query.onSnapshot((querySnapshot) => {
			this._documentSnapshots = querySnapshot.docs;
			if (changeListener)
				changeListener();
		});
	}

	stopListenting() {
		this._unsubscribe;
	}

	getPartAtIndex(index) {
		const docSnap = this._documentSnapshots[index];
		const part = new rhit.Part(
			docSnap.id,
			docSnap.get(rhit.FB_KEY_PART_NAME),
			docSnap.get(rhit.FB_KEY_PART_DESC),
			docSnap.get(rhit.FB_KEY_PART_PRICE),
			docSnap.get(rhit.FB_KEY_PART_LINK),
			docSnap.get(rhit.FB_KEY_PART_CATEGORY),
		);

		return part;
	}

	getPartByID(id) {
		this._ref.doc(id).get().then((doc) => {
			return doc.data();
		});
	}

	get length() {
		return this._documentSnapshots.length;
	}

}



rhit.PartsLibraryController = class {

	constructor() {

		this.focusedPart = null;
		this.selectedCat;

		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);

		//User buttons
		document.querySelector("#submitAddPart").onclick = (event) => {
			let name = document.querySelector("#addPartName").value;
			let desc = document.querySelector("#addPartDesc").value;
			let price = parseFloat(document.querySelector("#addPartPrice").value);
			let link = document.querySelector("#addPartLink").value;
			let cat = document.querySelector("#categoryDropdownAddPart").innerHTML;
		
			rhit.partsManager.addPart(name, desc, price.toFixed(2), link, cat);
		}

		document.querySelector("#submitAddCat").onclick = (event) => {
			let name = document.querySelector("#addCatName").value;
			rhit.categoryManager.addCategory(name);
		}

		document.querySelector("#submitDeletePart").onclick = (event) => {
			this.deletePart();
		}

		document.querySelector("#submitDeleteCat").onclick = (event) => {
			rhit.categoryManager.deleteCategory(urlParams.get("id")).then(() => {
				window.location.href = "/partsLibrary.html";
			});
		}

		document.querySelector("#submitEditPart").onclick = (event) => {
			this.updatePart();

		}

		document.querySelector("#clearSearch").onclick = (event) => {
			this.selectedCat = "";
			window.location.href = `/partsLibrary.html`;
		}


		if (urlParams.get("cat")) {
			this.selectedCat = urlParams.get("cat");
			document.querySelector('#categoryDropdown').innerHTML = this.selectedCat;
			document.querySelector("#catDelete").visible = true;
		} else {
			document.querySelector("#catDelete").hidden = true;
		}

		rhit.partsManager.beginListening(this.selectedCat, this.updateGrid.bind(this));
		rhit.categoryManager.beginListening(this.updateDropdowns.bind(this));
		if (rhit.projectManager)
			rhit.projectManager.beginListening();
	}

	_createPart(part) {
		return htmlToElement(`<div class="part">
		<h4 class="p-name">${part.name}</h4>
		<h6 class="p-desc">${part.desc}</h6>
		<hr>
		<h6 class="p-desc">$${part.price}</h6>
	  </div>`);
	}

	updateGrid() {
		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		const container = document.querySelector("#partInfo");
		const newList = htmlToElement('<div id="partsList" class="grid-container grid-child"></div>');
		for (let i = 0; i < rhit.partsManager.length; i++) {
			const part = rhit.partsManager.getPartAtIndex(i);
			const newCard = this._createPart(part);

			if (urlParams.get("action")) {
				let retId = urlParams.get("id");
				newCard.onclick = (event) => {
					rhit.projectManager.setPartsList(part.id, retId);
				};
			} else {
				newCard.onclick = (event) => {
					this.updateFocus(part);
				};
			}
			newList.appendChild(newCard);
		}

		const oldList = document.querySelector("#partsList");
		container.appendChild(oldList);
		oldList.removeAttribute("id");
		oldList.hidden = true;

		oldList.parentElement.appendChild(newList);
		oldList.parentElement.appendChild(document.querySelector("#partContainer"));

		if (rhit.partsManager.length > 0) {
			this.updateFocus(rhit.partsManager.getPartAtIndex(0));
			document.querySelector("#partContainer").style.display = "block";
		} else {
			document.querySelector("#partContainer").style.display = "none";
		}
	}

	updateDropdowns() {

		const containerAdd = document.querySelector("#addDropdown");
		const containerEdit = document.querySelector("#editDropdown");
		const containerSearch = document.querySelector("#selectDropdown");

		const newAddList = htmlToElement('<ul id="addCatList" class="dropdown-menu" aria-labelledby="dropdownMenuButton"></ul>');
		const newEditList = htmlToElement('<ul id="editCatList" class="dropdown-menu" aria-labelledby="dropdownMenuButton"></ul>');
		const newSelectList = htmlToElement('<ul id="selectCat" class="dropdown-menu" aria-labelledby="dropdownMenuButton"></ul>');

		const addBtn = htmlToElement('<a id="addCat" class="dropdown-item" data-toggle="modal" href="#" data-target="#addCatDialog"><i class="material-icons">add</i></a>');
		newSelectList.appendChild(addBtn);

		for (let i = 0; i < rhit.categoryManager.length; i++) {
			const cat = rhit.categoryManager.getCategoryAtIndex(i);
			const newCatSearch = htmlToElement(`<li class="dropdown-item catName" name="${cat.id}">${cat.name}</li>`);
			const newCatModalAdd = htmlToElement(`<li class="dropdown-item catName" name="${cat.id}">${cat.name}</li>`);
			const newCatModalEdit = htmlToElement(`<li class="dropdown-item catName" name="${cat.id}">${cat.name}</li>`);
			newSelectList.appendChild(newCatSearch);
			newAddList.appendChild(newCatModalEdit);
			newEditList.appendChild(newCatModalAdd);
		}

		const oldAddList = document.querySelector("#addCatList");
		const oldEditList = document.querySelector("#editCatList");
		const oldSelectList = document.querySelector("#selectCat");

		containerAdd.appendChild(oldAddList);
		containerEdit.appendChild(oldEditList);
		containerSearch.appendChild(oldSelectList);

		oldAddList.parentElement.appendChild(newAddList);
		oldEditList.parentElement.appendChild(newEditList);
		oldSelectList.parentElement.appendChild(newSelectList);

		oldAddList.remove();
		oldEditList.remove();
		oldSelectList.remove();

		$('#addCatList li').on('click', function () {
			document.querySelector('#categoryDropdownAddPart').innerHTML = $(this).text();
		});

		$('#editCatList li').on('click', function () {
			document.querySelector('#categoryDropdownEditPart').innerHTML = $(this).text();
		});

		$('#selectCat li').on('click', function () {
			//console.log($(this).attr('name'));
			window.location.href = `/partsLibrary.html?cat=${$(this).text()}&id=${$(this).attr("name")}`;
		});

		//

	}

	updateFocus(part) {
		this.focusedPart = part;
		document.querySelector("#partName").innerHTML = part.name;
		document.querySelector("#partDesc").innerHTML = part.desc;
		document.querySelector("#partNav").text = part.link;
		document.querySelector("#partNav").href = part.link;
		document.querySelector("#partPrice").innerHTML = "$" + part.price;
		document.querySelector("#partCat").innerHTML = part.cat;

		document.querySelector("#inputPartName").value = part.name;
		document.querySelector("#inputPartDesc").value = part.desc;
		document.querySelector("#inputPartPrice").value = part.price;
		document.querySelector("#inputPartLink").value = part.link;
		document.querySelector("#categoryDropdownEditPart").innerHTML = part.cat;

	}

	deletePart() {
		rhit.partsManager.deletePart(this.focusedPart.id);
	}

	updatePart() {
		let newName = document.querySelector("#inputPartName").value;
		let newDesc = document.querySelector("#inputPartDesc").value;
		let newLink = document.querySelector("#inputPartLink").value;
		let newPrice = parseFloat(document.querySelector("#inputPartPrice").value);
		let newCat = document.querySelector("#categoryDropdownEditPart").innerHTML;
		rhit.partsManager.updatePart(this.focusedPart.id, newName, newDesc, newPrice.toFixed(2),newLink, newCat);
	}
}

rhit.CategoryManager = class {
	constructor(userid) {
		this._uid = userid;
		this._searchQuery = "";
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_CATEGORY);
		this._unsubscribe = null;
	}

	addCategory(n) {
		this._ref.add({
			[rhit.FB_KEY_CAT_NAME]: n,
			[rhit.FB_KEY_AUTHOR]: this._uid,
		}).then(() => {
			window.location.reload();
		}).catch(function (error) {
			console.log(error);
		});
	}

	deleteCategory(id) {
		return this._ref.doc(id).delete();
	}

	beginListening(changeListener) {
		let query = this._ref.orderBy(rhit.FB_KEY_CAT_NAME, "desc").limit(20).where(rhit.FB_KEY_AUTHOR, "==", this._uid);
		this._unsubscribe = query.onSnapshot((querySnapshot) => {
			this._documentSnapshots = querySnapshot.docs;
			if (changeListener)
				changeListener();
		});
	}

	stopListenting() {
		this._unsubscribe;
	}

	getCategoryAtIndex(index) {
		const docSnap = this._documentSnapshots[index];
		const category = new rhit.Category(
			docSnap.id,
			docSnap.get(rhit.FB_KEY_CAT_NAME),
		);

		return category;
	}

	get length() {
		return this._documentSnapshots.length;
	}

}

rhit.ResourcesManager = class {
	constructor(userid) {
		this._uid = userid;
		this._searchQuery = "";
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_RESOURCE);
		this._unsubscribe = null;
	}

	addResource(n, d, l) {
		this._ref.add({
			[rhit.FB_KEY_RESOURCE_NAME]: n,
			[rhit.FB_KEY_RESOURCE_DESC]: d,
			[rhit.FB_KEY_RESOURCE_CONTENT]: l,
			[rhit.FB_KEY_AUTHOR]: this._uid,
		}).catch(function (error) {
			console.log(error);
		});
	}

	updateResource(id, n, d, l) {
		this._ref.doc(id).update({
			[rhit.FB_KEY_RESOURCE_NAME]: n,
			[rhit.FB_KEY_RESOURCE_DESC]: d,
			[rhit.FB_KEY_RESOURCE_CONTENT]: l,
		}).catch((err) => {
			console.log("error");
		});
	}

	deleteResource(id) {
		return this._ref.doc(id).delete();
	}

	beginListening(changeListener) {
		let query = this._ref.orderBy(rhit.FB_KEY_RESOURCE_NAME, "desc").limit(20).where(rhit.FB_KEY_AUTHOR, "==", this._uid);
		this._unsubscribe = query.onSnapshot((querySnapshot) => {
			this._documentSnapshots = querySnapshot.docs;
			if (changeListener)
				changeListener();
		});
	}

	stopListenting() {
		this._unsubscribe;
	}

	getResourceAtIndex(index) {
		const docSnap = this._documentSnapshots[index];
		const res = new rhit.Resource(
			docSnap.id,
			docSnap.get(rhit.FB_KEY_RESOURCE_NAME),
			docSnap.get(rhit.FB_KEY_RESOURCE_DESC),
			docSnap.get(rhit.FB_KEY_RESOURCE_CONTENT),
		);

		return res;
	}

	getResourceByID(id) {
		let res = id;
		this._ref.doc(id).get().then((doc) => {
			res = new rhit.Resource(id, doc.data().name, doc.data().desc, doc.data().content);
			console.log(res);
			return res;
		});
	}

	get length() {
		return this._documentSnapshots.length;
	}

}

rhit.ResourcesController = class {

	constructor() {

		this.focusedResource = null;

		//User buttons
		document.querySelector("#submitAddResource").onclick = (event) => {
			let name = document.querySelector("#addResourceName").value;
			let desc = document.querySelector("#addResourceDesc").value;
			let content = document.querySelector("#addResourceLink").value;
			rhit.resourcesManager.addResource(name, desc, content);
		}

		document.querySelector("#submitDeleteResource").onclick = (event) => {
			this.deleteResource();
		}

		document.querySelector("#submitEditResource").onclick = (event) => {
			this.updateResource();
		}

		rhit.resourcesManager.beginListening(this.updateList.bind(this));
		if (rhit.projectManager)
			rhit.projectManager.beginListening();
	}

	_createResource(res) {
		return htmlToElement(`<div class="resource">
		<h4 class="p-name">${res.name}</h4>
		<h6 class="p-desc">${res.desc}</h6>
		<hr>
		<h6 class="p-desc"><a href = "${res.content}" target = "_blank">${res.content}</a></h6>
	    </div>`);
	}

	updateList() {
		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		const container = document.querySelector("#resourceInfo");
		const newList = htmlToElement('<div id="resourcesList" class="grid-container grid-child"></div>');
		for (let i = 0; i < rhit.resourcesManager.length; i++) {
			const resource = rhit.resourcesManager.getResourceAtIndex(i);
			const newCard = this._createResource(resource);

			if (urlParams.get("action")) {
				let retId = urlParams.get("id");
				newCard.onclick = (event) => {
					rhit.projectManager.setResourceList(resource.id, retId);
				};
			} else {
				newCard.onclick = (event) => {
					this.updateFocus(resource);
				};
			}


			newList.appendChild(newCard);
		}

		const oldList = document.querySelector("#resourcesList");
		container.appendChild(oldList);
		oldList.removeAttribute("id");
		oldList.hidden = true;

		oldList.parentElement.appendChild(newList);
		oldList.parentElement.appendChild(document.querySelector("#resourceContainer"));

		if (rhit.resourcesManager.length > 0) {
			this.updateFocus(rhit.resourcesManager.getResourceAtIndex(0));
			document.querySelector("#resourceContainer").style.display = "block";
		} else {
			document.querySelector("#resourceContainer").style.display = "none";
		}
	}

	updateFocus(res) {
		this.focusedResource = res;
		document.querySelector("#resourceName").innerHTML = res.name;
		document.querySelector("#resourceDesc").innerHTML = res.desc;
		document.querySelector("#resourceNav").text = res.content;
		document.querySelector("#resourceNav").href = res.content;

		document.querySelector("#inputResourceName").value = res.name;
		document.querySelector("#inputResourceDesc").value = res.desc;
		document.querySelector("#inputResourceLink").value = res.content;
	}

	deleteResource() {
		rhit.resourcesManager.deleteResource(this.focusedResource.id);
	}

	updateResource() {
		let newName = document.querySelector("#inputResourceName").value;
		let newDesc = document.querySelector("#inputResourceDesc").value;
		let newContent = document.querySelector("#inputResourceLink").value;
		rhit.resourcesManager.updateResource(this.focusedResource.id, newName, newDesc, newContent);
	}
}

rhit.ProjectsManager = class {
	constructor(userid) {
		this._uid = userid;
		this._searchQuery = "";
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_PROJECT);
		this._unsubscribe = null;
	}

	addProject(n, d, c, p, r) {
		this._ref.add({
			[rhit.FB_KEY_PROJECT_NAME]: n,
			[rhit.FB_KEY_PROJECT_DESC]: d,
			[rhit.FB_KEY_PROJECT_COST]: c,
			[rhit.FB_KEY_PROJECT_PARTS]: p,
			[rhit.FB_KEY_PROJECT_RESOURCES]: r,
			[rhit.FB_KEY_AUTHOR]: this._uid,
		}).catch(function (error) {
			console.log(error);
		});
	}

	updateProject(id, n, d) {
		this._ref.doc(id).update({
			[rhit.FB_KEY_PROJECT_NAME]: n,
			[rhit.FB_KEY_PROJECT_DESC]: d,
		}).catch((err) => {
			console.log("error");
		});
	}

	deleteProject(id) {
		return this._ref.doc(id).delete();
	}

	beginListening(changeListener) {
		let query = this._ref.orderBy(rhit.FB_KEY_PROJECT_NAME, "desc").limit(20).where(rhit.FB_KEY_AUTHOR, "==", this._uid);
		this._unsubscribe = query.onSnapshot((querySnapshot) => {
			this._documentSnapshots = querySnapshot.docs;
			if (changeListener)
				changeListener();
		});
	}

	beginListeningHome(changeListener) {
		let query = this._ref.orderBy(rhit.FB_KEY_PROJECT_NAME, "desc").limit(4).where(rhit.FB_KEY_AUTHOR, "==", this._uid);
		this._unsubscribe = query.onSnapshot((querySnapshot) => {
			this._documentSnapshots = querySnapshot.docs;
			if (changeListener)
				changeListener();
		});
	}

	stopListenting() {
		this._unsubscribe;
	}

	getProjectAtIndex(index) {
		const docSnap = this._documentSnapshots[index];
		const project = new rhit.Project(
			docSnap.id,
			docSnap.get(rhit.FB_KEY_PROJECT_NAME),
			docSnap.get(rhit.FB_KEY_PROJECT_DESC),
			docSnap.get(rhit.FB_KEY_PROJECT_COST),
			docSnap.get(rhit.FB_KEY_PROJECT_PARTS),
			docSnap.get(rhit.FB_KEY_PROJECT_RESOURCES),
		);

		return project;
	}

	get length() {
		return this._documentSnapshots.length;
	}

}

rhit.ProjectsController = class {

	constructor() {
		document.querySelector("#submitAddProj").onclick = (event) => {
			let name = document.querySelector("#addProjName").value;
			let desc = document.querySelector("#addProjDesc").value;
			let cost = 0;
			let parts = [];
			let resources = [];
			rhit.projectsManager.addProject(name, desc, cost, parts, resources);
		}

		document.querySelector("#projSearch").onclick = (event) => {
			let searchQ = document.querySelector("#projSearchInput").value;
			//local vs online
			//http://localhost:5001/diyprojectorganizer/us-central1/api
			//https://us-central1-diyprojectorganizer.cloudfunctions.net/api
			fetch(`https://us-central1-diyprojectorganizer.cloudfunctions.net/api/projSearch/${searchQ}`)
			.then(response=>response.json())
			.then(data=>{
				console.log(data);
			});
		}

		rhit.projectsManager.beginListening(this.updateList.bind(this));
	}

	_createProj(project) {
		return htmlToElement(`<div class="project">
		<h3>${project.name}</h3>
		<br>
		<h5 class="p-desc">${project.desc}</h6>
		<br>
		<h5 class="p-price">$${project.cost}</h5>
		<h5 class="p-price">Components: ${project.parts.length}</h5>
		<h5 class="p-price">Resources: ${project.resources.length}</h5>
	  </div>`);
	}

	updateList() {
		const container = document.querySelector("#projectsContainer");
		const newList = htmlToElement('<div id="projectsGrid"></div>');
		for (let i = 0; i < rhit.projectsManager.length; i++) {
			const project = rhit.projectsManager.getProjectAtIndex(i);
			const newCard = this._createProj(project);
			newCard.onclick = (event) => {
				window.location.href = `/project.html?id=${project.id}`;
			};
			newList.appendChild(newCard);
		}

		const oldList = document.querySelector("#projectsGrid");
		container.appendChild(oldList);
		oldList.removeAttribute("id");
		oldList.hidden = true;

		oldList.parentElement.appendChild(newList);
	}
}

rhit.ProjectDetailManager = class {
	constructor(id) {
		this._documentSnapshot = {};
		this.id = id;
		this._unsubscribe = null;
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_PROJECT).doc(id);
	}

	beginListening(changeListener) {
		this._ref.onSnapshot((doc) => {
			if (doc.exists) {
				this._documentSnapshot = doc;
				if (changeListener)
					changeListener();
			} else {
				console.log("does not exist")
			}
		});
	}

	stopListening() {
		this._unsubscribe();
	}

	updateProject(name, desc) {
		this._ref.update({
			[rhit.FB_KEY_PROJECT_NAME]: name,
			[rhit.FB_KEY_PROJECT_DESC]: desc,
		}).
		then(function () {
			console.log("Document was updated!");
		}).
		catch(function (error) {
			console.error("Error adding document");
		});
	}

	delete() {
		return this._ref.delete();
	}

	get name() {
		return this._documentSnapshot.get(rhit.FB_KEY_PROJECT_NAME);
	}

	get desc() {
		return this._documentSnapshot.get(rhit.FB_KEY_PROJECT_DESC);
	}

	get cost() {
		return this._documentSnapshot.get(rhit.FB_KEY_PROJECT_COST);
	}

	get parts() {
		return this._documentSnapshot.get(rhit.FB_KEY_PROJECT_PARTS);
	}

	get resources() {
		return this._documentSnapshot.get(rhit.FB_KEY_PROJECT_RESOURCES);
	}

	get author() {
		return this._documentSnapshot.get(rhit.FB_KEY_AUTHOR);
	}

	setResourceList(n, retId) {
		let reslist = this.resources;
		reslist.push(n);
		this._ref.update({
			[rhit.FB_KEY_PROJECT_RESOURCES]: reslist,
		}).
		then(function () {
			console.log("Document was updated!");
			window.location.href = "/project.html?id=" + retId;
		}).
		catch(function (error) {
			console.error("Error adding document");
		});
	}

	removeResource(i) {
		let reslist = this.resources;
		reslist.splice(i, 1);
		this._ref.update({
			[rhit.FB_KEY_PROJECT_RESOURCES]: reslist,
		}).
		then(function () {
			console.log("Document was updated!");
			window.location.reload();
		}).
		catch(function (error) {
			console.error("Error adding document");
		});
	}

	setPartsList(n, retId) {
		let partslist = this.parts;
		partslist.push(n);
		this._ref.update({
			[rhit.FB_KEY_PROJECT_PARTS]: partslist,
		}).
		then(function () {
			console.log("Document was updated!");
			window.location.href = "/project.html?id=" + retId;
		}).
		catch(function (error) {
			console.error("Error adding document");
		});
	}

	updateCost(cost) {
		this._ref.update({
			[rhit.FB_KEY_PROJECT_COST]: cost,
		}).
		then(function () {
			console.log("Document was updated!");
		}).
		catch(function (error) {
			console.error("Error adding document");
		});
	}

	removePart(i) {
		let partslist = this.parts;
		partslist.splice(i, 1);
		this._ref.update({
			[rhit.FB_KEY_PROJECT_PARTS]: partslist,
		}).
		then(function () {
			console.log("Document was updated!");
			window.location.reload();
		}).
		catch(function (error) {
			console.error("Error adding document");
		});
	}
}

rhit.ProjectDetailController = class {
	constructor() {

		document.querySelector("#submitEditProject").addEventListener("click", (event) => {
			const name = document.querySelector("#inputProjectName").value;
			const desc = document.querySelector("#inputProjectDesc").value;
			rhit.projectManager.updateProject(name, desc);
		});

		document.querySelector("#submitDeleteProject").addEventListener("click", (event) => {
			rhit.projectManager.delete().then(function () {
				console.log("Deleted!");
				window.location.href = "/projects.html";
			}).catch(function (error) {
				console.log(error);
			});
		});

		document.querySelector("#resAddProj").addEventListener("click", (event) => {
			window.location.href = "/resources.html?action=adding&id=" + rhit.projectManager.id;
		});

		document.querySelector("#partAddProj").addEventListener("click", (event) => {
			window.location.href = "/partsLibrary.html?action=adding&id=" + rhit.projectManager.id;
		});

		rhit.projectManager.beginListening(this.updateView.bind(this));
		rhit.resourcesManager.beginListening(this.updateResView.bind(this));
		rhit.partsManager.beginListening(null, this.updatePartsView.bind(this));

	}

	_createResource(res) {
		return htmlToElement(`<div class="resource">
		<h4 class="p-name">${res.name}</h4>
		<h6 class="p-desc">${res.desc}</h6>
		<hr>
		<h6 class="p-desc"><a href="${res.content}">${res.content}</a></h6>
		<button id="${res.id}" class="btn" type="button"><i class="material-icons">delete</i></button>
	</div>`);
	}

	_createPart(part) {
		return htmlToElement(`<div class="part" data-toggle="modal" data-target="#partCheckDialog">
		<h4 class="p-name">${part.name}</h4>
		<h6 class="p-desc">${part.desc}</h6>
		<hr>
		<h6 class="p-price">$${part.price}</h6>
		</div>`);
	}

	updateView() {
		if (rhit.projectManager.author != rhit.fbAuthManager.uid) {
			window.location.href = "/projects.html";
		}
		document.querySelector("#projName").innerHTML = rhit.projectManager.name;
		document.querySelector("#projDesc").innerHTML = rhit.projectManager.desc;
		document.querySelector("#projPrice").innerHTML = "$" + rhit.projectManager.cost;
		document.querySelector("#inputProjectName").value = rhit.projectManager.name;
		document.querySelector("#inputProjectDesc").value = rhit.projectManager.desc;
	}

	updateResView() {
		const container = document.querySelector("#resourcesContainer");
		const newList = htmlToElement('<div id="resourcesList" class="grid-container grid-child"></div>');

		for (let i = 0; i < rhit.projectManager.resources.length; i++) {
			for (let j = 0; j < rhit.resourcesManager.length; j++) {
				if (rhit.projectManager.resources[i] == rhit.resourcesManager.getResourceAtIndex(j).id) {
					let resourceX = rhit.resourcesManager.getResourceAtIndex(j);
					const newCard = this._createResource(resourceX);
					newCard.querySelector("#" + resourceX.id).onclick = (event) => {
						rhit.projectManager.removeResource(i);
					};
					newList.appendChild(newCard);
				}
			}
		}

		const oldList = document.querySelector("#resourcesList");
		container.appendChild(oldList);
		oldList.removeAttribute("id");
		oldList.hidden = true;

		oldList.parentElement.appendChild(newList);
	}

	updatePartsView() {
		const container = document.querySelector("#projPartsContainer");
		const newList = htmlToElement('<div id="partsList" class="grid-container grid-child"></div>');
		let cost = 0;
		for (let i = 0; i < rhit.projectManager.parts.length; i++) {
			for (let j = 0; j < rhit.partsManager.length; j++) {
				if (rhit.projectManager.parts[i] == rhit.partsManager.getPartAtIndex(j).id) {
					let partX = rhit.partsManager.getPartAtIndex(j);
					cost += parseFloat(partX.price);
					
					const newCard = this._createPart(partX);
					newCard.onclick = (event) => {
						document.querySelector("#partName").innerHTML = partX.name;
						document.querySelector("#partDesc").innerHTML = partX.desc;
						document.querySelector("#partPrice").innerHTML = partX.price;
						document.querySelector("#partLink").innerHTML = partX.link;
						document.querySelector("#partCategory").innerHTML = partX.cat;
						document.querySelector("#deleteButton").onclick = (event) => {
							rhit.projectManager.removePart(i);

						}
					};
					newList.appendChild(newCard);
				}
			}
		}
		rhit.projectManager.updateCost(cost.toFixed(2));

		const oldList = document.querySelector("#partsList");
		container.appendChild(oldList);
		oldList.removeAttribute("id");
		oldList.hidden = true;

		oldList.parentElement.appendChild(newList);
	}
}

rhit.CreateAccountController = class {
	constructor() {

		document.querySelector("#createBtn").onclick = (event) => {

			const inputEmail = document.querySelector("#emailInput");
			const inputPass = document.querySelector("#passwordInput");
			const inputConfirmPass = document.querySelector("#confPasswordInput");


			if (inputPass.value == inputConfirmPass.value) {
				firebase.auth().createUserWithEmailAndPassword(inputEmail.value, inputPass.value).catch(function (error) {
					// Handle Errors here.
					var errorCode = error.code;
					var errorMessage = error.message;
					console.log("Create account error occured", error);
					// ...
				});
				window.location.href = "/";
			} else {
				document.querySelector("#errorText").innerHTML = "Passwords must match";
			}
		};

	}
}

rhit.IndexPageController = class {
	constructor() {
		document.querySelector("#loginPage").style.display = "none";
		document.querySelector("#loggedInPage").style.display = "none";
		if (rhit.fbAuthManager.isSignedIn) {
			document.querySelector("#loggedInPage").style.display = "block";
			document.querySelector("#loginPage").style.display = "none";
			document.querySelector("#homeUserName").innerHTML = rhit.fbAuthManager.email;
			this.updateList();
		} else {
			document.querySelector("#loginBtn").onclick = (event) => {
				rhit.fbAuthManager.signIn();
			};
			document.querySelector("#loginPage").style.display = "block";
			document.querySelector("#loggedInPage").style.display = "none";
		}
		if (rhit.fbAuthManager.isSignedIn) {
			rhit.projectsManager.beginListeningHome(this.updateList.bind(this));
			rhit.categoryManager.beginListening(this.updateCatList.bind(this));
		}
	}

	_createProj(project) {
		return htmlToElement(`<div class="project">
		<h3>${project.name}</h3>
		<br>
		<h5 class="p-desc">${project.desc}</h6>
		<br>
		<h5 class="p-price">$${project.cost}</h5>
		<h5 class="p-price">Components: ${project.parts.length}</h5>
		<h5 class="p-price">Resources: ${project.resources.length}</h5>
	  </div>`);
	}

	_createCat(cat) {
		return htmlToElement(`<div id="catGridHome">
		<div class="catHome">
		  <h3>${cat.name}</h3>
		</div>
	  </div>`);
	}

	updateList() {
		const container = document.querySelector("#projectsContainer");
		const newList = htmlToElement('<div id="projectsGridHome"></div>');
		for (let i = 0; i < rhit.projectsManager.length; i++) {
			const project = rhit.projectsManager.getProjectAtIndex(i);
			const newCard = this._createProj(project);
			newCard.onclick = (event) => {
				window.location.href = `/project.html?id=${project.id}`;
			};
			newList.appendChild(newCard);
		}

		const oldList = document.querySelector("#projectsGridHome");
		container.appendChild(oldList);
		oldList.removeAttribute("id");
		oldList.hidden = true;

		oldList.parentElement.appendChild(newList);
	}

	updateCatList() {
		const container = document.querySelector("#catListContainer");
		const newList = htmlToElement('<div id="catGridHome"></div>');
		for (let i = 0; i < rhit.categoryManager.length; i++) {
			const cat = rhit.categoryManager.getCategoryAtIndex(i);
			const newCard = this._createCat(cat);
			newCard.onclick = (event) => {
				window.location.href = `/partsLibrary.html?cat=${cat.name}`;
			};
			newList.appendChild(newCard);
		}

		const oldList = document.querySelector("#catGridHome");
		container.appendChild(oldList);
		oldList.removeAttribute("id");
		oldList.hidden = true;

		oldList.parentElement.appendChild(newList);
	}
}

function openNav() {
	document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
	document.getElementById("mySidenav").style.width = "0";
}

rhit.initPage = () => {
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	if (document.querySelector("#mySidenav")) {
		document.querySelector("#signOutBtn").onclick = (event) => {
			rhit.fbAuthManager.signOut();
		};
	}
	if (document.querySelector("#createAccPage")) {
		new rhit.CreateAccountController();
	}
	if (document.querySelector("#mainPage")) {
		if (rhit.fbAuthManager.isSignedIn) {
			rhit.projectsManager = new rhit.ProjectsManager(rhit.fbAuthManager.uid);
			rhit.categoryManager = new rhit.CategoryManager(rhit.fbAuthManager.uid);
		}
		new rhit.IndexPageController();
	}
	if (document.querySelector("#partsPage")) {
		rhit.partsManager = new rhit.PartsLibraryManager(rhit.fbAuthManager.uid);
		rhit.categoryManager = new rhit.CategoryManager(rhit.fbAuthManager.uid);
		if (urlParams.get("id"))
			rhit.projectManager = new rhit.ProjectDetailManager(urlParams.get("id"));

		new rhit.PartsLibraryController();
	}
	if (document.querySelector("#resourcePage")) {
		rhit.resourcesManager = new rhit.ResourcesManager(rhit.fbAuthManager.uid);
		if (urlParams.get("id"))
			rhit.projectManager = new rhit.ProjectDetailManager(urlParams.get("id"));

		new rhit.ResourcesController();
	}
	if (document.querySelector("#projectsPage")) {
		rhit.projectsManager = new rhit.ProjectsManager(rhit.fbAuthManager.uid);
		new rhit.ProjectsController();
	}
	if (document.querySelector("#projectPage")) {
		rhit.resourcesManager = new rhit.ResourcesManager(rhit.fbAuthManager.uid);
		rhit.partsManager = new rhit.PartsLibraryManager(rhit.fbAuthManager.uid);
		if (urlParams.get("id"))
			rhit.projectManager = new rhit.ProjectDetailManager(urlParams.get("id"));
		new rhit.ProjectDetailController();
	}
}

rhit.checkForRedirects = () => {
	if (!document.querySelector("#createAccPage") && !document.querySelector("#loginPage") && !rhit.fbAuthManager.isSignedIn) {
		window.location.href = "/";
	}
};

/* Main */
/** function and class syntax examples */
rhit.main = function () {
	console.log("Ready");

	rhit.fbAuthManager = new rhit.FbAuthManager();
	rhit.fbAuthManager.beingListening(() => {
		console.log("Check for redirects and init the page.");
		console.log("isSignedIn = ", rhit.fbAuthManager.isSignedIn);
		rhit.checkForRedirects();
		rhit.initPage();
	});

};

rhit.main();