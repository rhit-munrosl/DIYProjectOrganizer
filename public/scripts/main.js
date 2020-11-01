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

rhit.fbAuthManager = null;

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

rhit.CreateAccountController = class {
	constructor() {
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
}

/* Main */
/** function and class syntax examples */
rhit.main = function () {
	console.log("Ready");

	rhit.fbAuthManager = new rhit.FbAuthManager();
	rhit.fbAuthManager.beingListening(() => {
		console.log("Check for redirects and init the page.");
		console.log("isSignedIn = ", rhit.fbAuthManager.isSignedIn);
		rhit.initPage();
	});

};

rhit.main();