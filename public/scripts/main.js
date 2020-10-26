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

function openNav() {
	document.getElementById("mySidenav").style.width = "250px";
	document.querySelectorAll("#mySidenav a").style.visibility = "visible"; 
}

function closeNav() {
	document.getElementById("mySidenav").style.width = "0";
	document.querySelectorAll("#mySidenav a").style.visibility = "hidden"; 

}

/* Main */
/** function and class syntax examples */
rhit.main = function () {
	console.log("Ready");
};

rhit.main();