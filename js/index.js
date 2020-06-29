//Initiate user value object
let existingUserValues = {
    name: {
        first: undefined,
        last: undefined
    },
    email: undefined
};

//Various variables to get references to HTML elements throughout Javascript page
const userGreeting = document.querySelector("#welcome-msg");
const userProfileEmail = document.querySelector("#profile-email");
const userProfileFName = document.querySelector("#profile-first-name");
const userProfileLName = document.querySelector("#profile-last-name");
const userProfileRoomNr = document.querySelector("#profile-room-nr");
const userProfileMessages = document.querySelector("#stored-messages");

const createUserMessage = document.querySelector("#create-message-input");
const submitUserMessage = document.querySelector("#create-message-btn");

const indexForm = document.querySelector("#edit-form");
const quickMessageForm = document.querySelector("#index-form-create-quick");

const feedbackModal = document.querySelector("#feedback-modal");
const feedbackModalText = document.querySelector("#modal-feedback-list");


//Function that retrieves user created quick messages and makes elements from them
function populateUserMessages(user) {
    //Query to get quick messages created by user and creating a select input field out of each value
    userCollectionRef.where("uid", "==", user.uid)
        .get()
        .then(function (snapshot) {
            if (snapshot.empty) {
                createFeedbackPopup("Kunne ikke finne brukeprofil");
            } else {
                userProfileMessages.innerHTML = "";

                snapshot.forEach(function (doc) {
                    const userMessages = doc.data().quickMessages;
                    userMessages.forEach(message => {

                        const messageElement = document.createElement("li");
                        const messageDelElement = document.createElement("div");
                        const messageText = document.createElement("span");

                        messageElement.setAttribute("class", "saved-message");
                        messageText.textContent = message;
                        messageDelElement.textContent = "x";
                        messageDelElement.setAttribute("class", "delete-message");
                        messageText.setAttribute("class", "message-text");
                        messageElement.appendChild(messageText);
                        messageElement.appendChild(messageDelElement);
                        userProfileMessages.appendChild(messageElement);
                    });

                    //If user has 10 or more message hide the create message input, button, checkbox and label
                    //Otherwise run show input function
                    if (userMessages.length >= 10) {
                        createUserMessage.style.display = "none";
                        submitUserMessage.style.display = "none";
                        $("#save-message-label").hide();
                        $("#save-message").hide();
                    } else {
                        showQuickCreateInput();
                    }

                });

                createUserMessage.value = "";

            }
        })
        .catch(function (error) {
            createFeedbackPopup("Kunne ikke finne bruker");
        });
}

//Function that displays create user quick message elements
function showQuickCreateInput() {
    const inputElement = document.querySelector("#create-message-input");
    const btnElement = document.querySelector("#create-message-btn");
    inputElement.style.display = "block";
    btnElement.style.display = "block";
    $("#save-message-label").show();
    $("#save-message").show();
}

//Function that retrieves current weekly and daily messages from
//raspberrypi database collection then displays them in status modal
function populateSigns(db, ref) {
    db.collection("raspberrypi").doc(ref)
        .onSnapshot((doc) => {
            let messageDaily = doc.data().textDaily;
            let messageWeekly = doc.data().textWeekly;
            $("#sign-info-status-day").text(messageDaily);
            $("#sign-info-status-week").text(messageWeekly);
        })
}

//Function that checks to see if the sign is updating through a listener and runs functions depending on the value
//of the document field refreshingdisplay
function checkIfSignIsUpdating(db, ref) {
    db.collection("raspberrypi")
        .doc(ref)
        .collection("additional")
        .doc("data")
        .onSnapshot((doc) => {
            let bool = doc.data().refreshingdisplay;
            if (bool === true) {
                showSignIsUpdatingModal();
            } else if (bool === false) {
                showSignIsDoneUpdatingModal();
            }
        })
}

//Listener that listens to changes to the firebase authentication user
firebase.auth().onAuthStateChanged((user) => {
    //if user is logged in, proceed
    if (user) {
        const { currentUser } = firebase.auth();
        //Each time a change is detected run these two functions
        populateUserProfile(currentUser);
        populateUserMessages(currentUser);

        //Event listener that checks to see if user has input information correctly
        //and if it has adds a new quick message
        submitUserMessage.addEventListener("click", (e) => {
            let val = createUserMessage.value;
            if (inputHasValue(val) && val.length >= 3) {
                addNewQuickMessage(val);
            } else {
                createFeedbackPopup("Vennigst fyll inn beskjed-felt!");
            }
        })

        //Hides the loading icon in loading modal
        $(".lds-dual-ring").hide();
        //Query that gets the rpiserialnr from the current user's collection and
        //Proceeds to give that information to two functiond
        userCollectionRef.doc(getUser().uid)
            .get()
            .then((doc) => {
                if (doc.exists) {
                    let ref = doc.data().rpiSerialnr;
                    populateSigns(db, ref);
                    checkIfSignIsUpdating(db, ref);
                }
            })

        //Adds click event listener to the unordered list that contains the
        //Saved "quick" messages list items, if you click the list item in any way
        //It checks to see if you want to send the message the list item portrays
        //And if you press the small div element X, it deletes the message from the 
        //Database and deletes the list item
        userProfileMessages.addEventListener("click", (e) => {
            if (e.target && (e.target.className === "saved-message" || e.target.className === "message-text")) {
                const val = e.target.childNodes ? e.target.childNodes[0].textContent : e.target.textContent;
                const messageToHandle = {
                    title: "Send beskjed",
                    text: "Vil du sende inn denne beskjeden?",
                    submitText: "Send beskjed",
                    mode: "SEND",
                    message: val,
                    type: "hide"
                };
                showDialog(messageToHandle);
            } else if (e.target && e.target.className == "delete-message") {
                const textVal = e.target.parentNode.childNodes[0].textContent;
                const messageToHandle = {
                    title: "Slett beskjed",
                    text: "Vil du slette denne beskjeden?",
                    submitText: "Slett beskjed",
                    mode: "DELETE",
                    message: textVal,
                    type: "hide"
                };
                showDialog(messageToHandle);
            }
        })

    } else {
        // No user is signed in.
        window.location.replace("log-in.html");
    }
});