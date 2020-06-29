//Code that initializes and connect the application to the firebase database
firebase.initializeApp({
    apiKey: "AIzaSyC-bx85XiK794JsR5d__mL5_FZwgEjBUa4",
    authDomain: "office-signage-5f156.firebaseapp.com",
    databaseURL: "https://office-signage-5f156.firebaseio.com",
    projectId: "office-signage-5f156",
    storageBucket: "office-signage-5f156.appspot.com",
    messagingSenderId: "669009601761",
    appId: "1:669009601761:web:9be6e839233aad2074c3a0",
    measurementId: "G-FX6HWTR8K1"
});

const db = firebase.firestore();
const auth = firebase.auth();

let welcomeMessage = document.querySelector('#welcome-msg');

const indexTextClass = document.querySelectorAll('.msg-text');

const indexDailyText = document.querySelector("#sign-text-daily");
const indexWeeklyText = document.querySelector("#sign-text-weekly");

var userCollectionRef = db.collection('users');

//Function to use in input fields validation
function inputHasValue(value) {
    return value && value != "" && value != undefined;
}

//Function to sanitize user inputs
function sanitize(string) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        "/": '&#x2F;',
    };
    const reg = /[&<>"'/]/ig;
    return string.replace(reg, (match) => (map[match]));
}

logoutButton = document.querySelector(".log-out-button");

//Function to get current user
function getUser() {
    return firebase.auth().currentUser;
}

//Listener that checks if user is logged in, if user is logged in show logout button
//If user is not logged in and on the index page, redirect them to log-in page
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        //Bruker er logget inn
        logoutButton.style = "display: true;";
        var loggedInUser = firebase.auth().currentUser;

    } else {
        if (window.location.href.match("index.html")) {
            window.location.replace("log-in.html");
        }
    }
})

//When user clicks daily submit button check to validate message and if message is validated run message functions
//If saveInput.checked is true save the quick message in the current user's collection
//And if not just send a regular message
$('#submitbtn-daily').click((event) => {
    event.preventDefault()

    let message = document.getElementById("sign-text-daily").value;
    let saveInput = document.getElementById("save-message");

    if (message != "" /*&& saveInput.checked != true*/ && message.length >= 5 && message.length <= 250) {
        checkUserAndWriteDailyText(message);
    } /*else if (message != "" && saveInput.checked == true && message.length >= 5 && message.length <= 250) {
        checkUserAndWriteDailyText(message);
        addNewQuickMessage(message);*/
    else if (message == "" || message.length <= 5 || message.length >= 250) {
        createFeedbackPopup("Melding må være mellom 5 og 250 tegn lang!!");
    } else {
        createFeedbackPopup("Melding kunne ikke bli sendt..");
    }
});

//When user clicks weekly submit button check to validate message and if the message is validated run message functions
$('#submitbtn-weekly').click((event) => {
    event.preventDefault()

    let message = document.getElementById("sign-text-weekly").value;
    if (message != "" && message.length >= 5 && message.length <= 250) {
        checkUserAndWriteWeeklyText(message);
    } else if (message == "" || message.length <= 10 || message.length >= 250) {
        createFeedbackPopup("Melding må være mellom 5 og 250 tegn lang!");
    } else {
        createFeedbackPopup("Melding kunne ikke bli sendt...");
    }
});


// Fetch logged in user info and fetch sign serial number for updating correct collection
//If the user's collection exists run the write daily message function
function checkUserAndWriteDailyText(message) {
    let loggedInUser = firebase.auth().currentUser.uid;
    let userRef = db.collection("users").doc(loggedInUser);

    userRef.get().then(function (doc) {
        if (doc.exists) {
            dbWriteDaily(message, doc.data().rpiSerialnr);
        } else {
            createFeedbackPopup("Kunne ikke finne bruker for å skrive beskjed");
        }
    }).catch(function (error) {
        createFeedbackPopup("Det oppsto en feil: ", error);
    });
}

//Fetch logged in user info and fetch sign serial number for updating correct collection
//If the user's collection exists run the write weekly message function
function checkUserAndWriteWeeklyText(message) {
    let loggedInUser = firebase.auth().currentUser.uid;
    let userRef = db.collection("users").doc(loggedInUser);

    userRef.get().then(function (doc) {
        if (doc.exists) {
            dbWriteWeekly(message, doc.data().rpiSerialnr);
        } else {
            createFeedbackPopup("Kunne ikke finne bruker og sende beskjed");
        }
    }).catch(function (error) {
        createFeedbackPopup("Det oppsto en feil: ", error)
    });
}

// Function to update value in database for textDaily
function dbWriteDaily(message, rpiSerial) {
    // Write daily text to registered signed in user
    let today = new Date();
    //Line that replaces 0 in date strings with an actual 0, so date strings become 05:04 instead of 05:4
    let todayMinutes = ('0' + today.getMinutes()).slice(-2);
    let todayNow = today.getHours() + ":" + todayMinutes;
    db.collection("raspberrypi").doc(rpiSerial).update({
        textDaily: sanitize(message),
        sentAtDaily: todayNow,
        sentByDaily: getUser().uid
    })
        .then(function (docRef) {
            indexDailyText.value = "";
            createFeedbackPopup("Melding: " + "«" + sanitize(message) + "»" + ", ble sendt, klokkeslett: " + todayNow);
        })
        .catch(function (error) {
            createFeedbackPopup("Noe gikk feil, meldingen ble ikke sendt");
        });
}

//Function to update value in database for textWeekly
function dbWriteWeekly(message, rpiSerial) {
    //Write daily text to a registered and signed in user
    let today = new Date();
    //Line that replaces 0 in date strings with an actual 0, so date strings become 05:04 instead of 05:4
    let todayMinutes = ('0' + today.getMinutes()).slice(-2);
    let todayNow = (today.getMonth() + 1) + "/" + today.getDate() + " " + today.getHours() + ":" + todayMinutes;
    db.collection("raspberrypi").doc(rpiSerial).update({
        textWeekly: sanitize(message),
        sentAtWeekly: todayNow,
        sentByWeekly: getUser().uid
    })
        .then(function (docRef) {
            indexWeeklyText.value = "";
            createFeedbackPopup("Melding: " + "«" + sanitize(message) + "»" + ", ble sendt på: " + todayNow);
        })
        .catch(function (error) {
            createFeedbackPopup("Noe gikk feil, meldingen ble ikke sendt");
        })
}

//Function to save a quick message in the current user's collection
function addNewQuickMessage(message) {
    let loggedInUser = firebase.auth().currentUser;
    let userRef = db.collection("users").doc(loggedInUser.uid);

    userRef.update({
        quickMessages: firebase.firestore.FieldValue.arrayUnion(sanitize(message))
    }).then(function () {
        createFeedbackPopup("Beskjeden ble laget!");
        populateUserMessages(loggedInUser);
    }).catch(function (error) {
        createFeedbackPopup("Noe gikk feil, beskjed ble ikke laget!");
    });
}