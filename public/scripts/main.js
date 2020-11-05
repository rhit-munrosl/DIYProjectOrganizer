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

rhit.FB_COLLECTION_RESOURCE = "Resource";
rhit.FB_KEY_RESOURCE_CONTENT = "content";
rhit.FB_KEY_RESOURCE_NAME = "name";
rhit.FB_KEY_RESOURCE_DESC = "description";

rhit.FB_KEY_AUTHOR = "author";

rhit.fbAuthManager = null;
rhit.partsManager = null;

function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
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
		}).catch((err)=>{
			console.log("error");
		});
	}

	deletePart(id) {
		return this._ref.doc(id).delete();
	}

	beginListening(changeListener) {
		let query = this._ref.orderBy(rhit.FB_KEY_PART_NAME, "desc").limit(20).where(rhit.FB_KEY_AUTHOR, "==", this._uid);
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

	get length() {
		return this._documentSnapshots.length;
	}

}



rhit.PartsLibraryController = class {

	constructor() {

		this.focusedPart = null;

		$('#addCatList li').on('click', function () {
			document.querySelector('#categoryDropdownAddPart').innerHTML = $(this).text();
		});

		$('#editCatList li').on('click', function () {
			document.querySelector('#categoryDropdownEditPart').innerHTML = $(this).text();
		});
		//User buttons
		document.querySelector("#submitAddPart").onclick = (event) => {
			let name = document.querySelector("#addPartName").value;
			let desc = document.querySelector("#addPartDesc").value;
			let price = document.querySelector("#addPartPrice").value;
			let link = document.querySelector("#addPartLink").value;
			let cat = document.querySelector("#categoryDropdownAddPart").innerHTML;
			rhit.partsManager.addPart(name, desc, price, link, cat);
		}

		document.querySelector("#submitDeletePart").onclick = (event) => {
			this.deletePart();
		}

		document.querySelector("#submitEditPart").onclick = (event) => {
			this.updatePart();
		}

		rhit.partsManager.beginListening(this.updateGrid.bind(this));
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
		const container = document.querySelector("#partInfo");
		const newList = htmlToElement('<div id="partsList" class="grid-container grid-child"></div>');
		for (let i = 0; i < rhit.partsManager.length; i++) {
			const part = rhit.partsManager.getPartAtIndex(i);
			const newCard = this._createPart(part);
			newCard.onclick = (event) => {
				this.updateFocus(part);
			};
			newList.appendChild(newCard);
		}

		const oldList = document.querySelector("#partsList");
		container.appendChild(oldList);
		oldList.removeAttribute("id");
		oldList.hidden = true;

		oldList.parentElement.appendChild(newList);
		oldList.parentElement.appendChild(document.querySelector("#partContainer"));

		if (rhit.partsManager.length > 0){
			this.updateFocus(rhit.partsManager.getPartAtIndex(0));
			document.querySelector("#partContainer").style.display = "block";
		} else {
			document.querySelector("#partContainer").style.display = "none";
		}
	}

	updateFocus(part) {
		this.focusedPart = part;
		document.querySelector("#partName").innerHTML = part.name;
		document.querySelector("#partDesc").innerHTML = part.desc;
		document.querySelector("#partNav").text = part.link;
		document.querySelector("#partNav").href = part.link;
		document.querySelector("#partPrice").innerHTML = "$"+part.price;
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
		let newLink = document.querySelector("#inputPartPrice").value; 
		let newPrice = document.querySelector("#inputPartLink").value; 
		let newCat = document.querySelector("#categoryDropdownEditPart").innerHTML; 
		rhit.partsManager.updatePart(this.focusedPart.id, newName, newDesc, newLink ,newPrice, newCat);
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
		} else {
			document.querySelector("#loginBtn").onclick = (event) => {
				rhit.fbAuthManager.signIn();
			};
			document.querySelector("#loginPage").style.display = "block";
			document.querySelector("#loggedInPage").style.display = "none";
		}
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
	const urlParams = new URLSearchParams(queryString)
	if (document.querySelector("#mySidenav")) {
		document.querySelector("#signOutBtn").onclick = (event) => {
			rhit.fbAuthManager.signOut();
		};
	}
	if (document.querySelector("#createAccPage")) {
		new rhit.CreateAccountController();
	}
	if (document.querySelector("#mainPage")) {
		new rhit.IndexPageController();
	}
	if (document.querySelector("#partsPage")) {
		rhit.partsManager = new rhit.PartsLibraryManager(rhit.fbAuthManager.uid);
		new rhit.PartsLibraryController();
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