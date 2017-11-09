
//When page is loaded start getLocation()
window.addEventListener("load", getLocation);

(function()
{
    //alert("onStart function");

    //code from firebase
    // Initialize Firebase
    const config =
        {
            apiKey: "AIzaSyBXBZz8ADFzd1AG-SrBcFh2ZSkdZAS7MRw",
            authDomain: "virtual-care-assistant-462a4.firebaseapp.com",
            databaseURL: "https://virtual-care-assistant-462a4.firebaseio.com",
            storageBucket: "virtual-care-assistant-462a4.appspot.com",
        };

    firebase.initializeApp(config);

    //get log out button element
    const logOutBtn = document.getElementById('logOutBtn');

    //add listener to logOutBtn
    logOutBtn.addEventListener('click', e=>
    {
        //sign out the current user
        firebase.auth().signOut();
        window.location.href = "VCA-Login.html";

	}
	);


    //realtime authorization listener // can be commented out after testing to avid running every time
    firebase.auth().onAuthStateChanged(user =>
    {
        if (user)
        {
            //logs to console user info
            console.log(user);
			//alert(user.email + " at start " + user.uid)
        }
        else
        {
			// No user is signed in
			//logs to console a message
			console.log("user logedOut/not logged in...thx obama!");
		}
	}
	);
	
	
	//references to children of the root in firebase database for patients
	var vcaPatientsRef = firebase.database().ref().child("patients");
	
	//on adding of a child referenced by vcaAdminsRef, this triggers whenever a new child is added or on loading of page
	vcaPatientsRef.on('child_added', snap =>
	{
		// variables to hold the atributes/labels of the retrieved child returned in the snap
		var fName = snap.child("fName").val();
		var lName = snap.child("lName").val();
		var email = snap.child("email").val();
		var address = snap.child("address").val();
		var id = snap.child("firebaseID").val();
		
		//alert("Name: " + fName + " Last: " + lName + " email: " + email + " address: " + address)
		
		//(jquery) append table rows and table data to the adminTableBody table with the atributes of the retrieved child and call editThis() with the firebase id as parameter
		$("#patientTableBody").append
		(
			"<tr><td>"+ fName +"</td><td>"+lName+"<\td><td>"+email+"</td><td>"+address+"</td><td id=fireID onClick = editThis(&quot;"+id+"&quot;)>"+id+"</td></tr>"
		);
		
	}
	);
	
}
()
);

//this function is called when a cell with firebase id in admin table is clicked and receives the firebase id as parameter
function editThis(fID)
{
	//for testing
	alert(fID);
	
	
}


function logOut()
{
    //alert("logOut function");
    //go to login page
    window.location.href = "VCA-Login.html"
}

function assistantAddPatient()
{
	//variables to hold input from fields for adding a user
	var fName = document.getElementById('fNameTxtField').value;
	var lName = document.getElementById('lNameTxtField').value;
	var adrs = document.getElementById('AddressTxtField').value;
	var email = document.getElementById('emailTxtField').value;
	var pass = document.getElementById('passwordTxtField').value;
	
	//variables for coordinates requested by Jack to be pushed empty to patient on create
	var longi = "";
	var lati = "";
	
	//variable to hold unique user id
	var id = "";
	
	
	//code from firebase for creating a user with email and password
	firebase.auth().createUserWithEmailAndPassword(email, pass).catch(function(error)
	{
		// Handle Errors here.
		var errorCode = error.code;
		var errorMessage = error.message;
	// ...
	});
	
	//makes a delay for firebase to do its work other wise we get the wrong user id
	setTimeout(function()
	{ 
		//shows the loader
		//document.getElementById("addUserLoader").style.display = "block"; // need a dif solution js is single thread and wont update the screen while executing code
		
		//currently logged in user 
		var user = firebase.auth().currentUser;
	
	//alert(user.email + " after adding " + user.uid)
	//if successful warn the user that they are logged in as the newly created user
	if(user)
	{
		alert("WARNING! you are now logged in as the newly created user. Some features may be restricted.");
		//this reminds me that the patients should not be able to add new patients
		//so we need another page for adding users that is only accesable to the assistants. I will make it later.
	}
	
	
	//set id to the firebase uid of the currently logged in user
	id = user.uid;
	
	//reference to the firebase database root
	var rootRef = firebase.database().ref();
	
	//reference to patients
	var patientRef = rootRef.child("patients");
	
	//reference to child of patients with push
	var patientChildRef = patientRef.push();
	
	//creates a new child in patients with unique ID made by firebase with all fields passed in and values from the user
	patientChildRef.set({firebaseID: id, fName: fName, lName: lName, address: adrs, email: email, password: pass, longitude: longi, latitude: lati});
	
	//testing input
	//alert(fName+lName+adrs+email+pass);
	
	//clear input fields at the end
	document.getElementById('fNameTxtField').value = "";
	document.getElementById('lNameTxtField').value = "";
	document.getElementById('emailTxtField').value = "";
	document.getElementById('AddressTxtField').value = "";
	document.getElementById('passwordTxtField').value = "";
	
	//Right now when we "create" a new user we add a new child to the database and then 
	//we create a new firebase user with supplied email and password, the way the .createUserWithEmailAndPassword()
	//works is it automatically signs in that user if signup was a success, not sure how much of a problem for us this is
	//but we should find a solution for this or a workaround later
	
	}, 3000);//second parameter is the amount of time to wait
	//end of setTimeout
	
	//hides the loader
	//document.getElementById("addUserLoader").style.display = "none";
	
}




//Weather variables
var wLatitude;
var wLongitude;
var wQuery;

//Get latitude and longitude of user
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(generateQuery);
    }
	else {
        document.getElementById("weather").innerHTML = "Geolocation is not supported by this browser.";
    }
}

//Generates the query for weather
function generateQuery(position) {
	wLatitude = position.coords.latitude;
	wLongitude = position.coords.longitude;
	wQuery = "http://api.apixu.com/v1/current.json?key=70977ec45a7c47b9b65142912170111&q=" + wLatitude + "," + wLongitude;
	displayWeather();
}

//Displays current location, weather condition and temperature
function displayWeather()
{
	$.getJSON(wQuery, function( json ) {
		document.getElementById("weather").innerHTML = json.location.name + "<br>" + json.current.condition.text + "<br>" + json.current.temp_c + "&#8451" ;
 });
}
