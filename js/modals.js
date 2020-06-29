// Get the modal and various modal elements
const modal = document.querySelectorAll(".modal");
const modalTitle = document.querySelector("#modal-title");

const fbModal = document.querySelector('#feedback-modal');
const confirmBtn = document.querySelector("#confirm-btn");

const modalFeedbackList = document.querySelector("#modal-feedback-list");
//When the page loads, hide the modal and add the
//cancel and sumbit event listeners
$(() => {
    hideDialog();
    hideRegister();
    hideStatus();
    $("#dialog-cancel").click((e) => hideDialog());
    $("#dialog-submit").click((e) => handleSubmit(e));
    $("#reg-cancel-button").click((e) => hideRegister());
    $("#close-status-btn").click((e) => hideStatus());
})

//function that gets the mode from the hidden input in the dialog modal
//then gets the message from the second hidden input in the dialog modal
//If mode is send, send the message to the sendMessage function
//If mode is delete, send the message to the deleteMessage function
//At the end hide the modal
function handleSubmit(event) {
    event.preventDefault();

    const mode = $("#dialog-type").val();
    const message = $("#dialog-message").val();
    const dialogSubmitBtn = $("#dialog-submit");
    if (mode === "SEND") {
        sendMessage(message);
    } else if (mode === "DELETE") {
        deleteMessage(message);
    }

    hideDialog();
}

//Function that calls the function to write the message into the database
function sendMessage(message) {
    checkUserAndWriteDailyText(message);
}

//Function that deletes the parameter message from the database
//Then it updates the created quick messages by calling populateUserMessages
function deleteMessage(message) {
    userCollectionRef.doc(getUser().uid).update({
        quickMessages: firebase.firestore.FieldValue.arrayRemove(message)
    }).then(function () {
        populateUserMessages(getUser());
    }).catch(function (error) {
        createFeedbackPopup("Noe gikk galt, kunne ikke slette beskjed");
    });
}

//Function that resets the values in the form
//and then hides the dialog modal
function hideDialog() {
    $("#dialog-form").trigger("reset");
    $("#confirm-dialog").hide();
}

//Function that resets the values in the form
//and then hides the register modal
function hideRegister() {
    $("#register-form").trigger("reset");
    $("#reg-modal").hide();
}

//Function to hide status modal
function hideStatus() {
    $("#status-modal").hide();
}

//Function that sets the information of the dialog modal
//using an object thats created when either clicking the 
//User created messages or the X in said messages
//Style modal buttons depending on the modal mode
//Finally call jquery function on the dialog modal to show it
function showDialog(dialogObject) {
    const { title, text, mode, submitText, message, type } = dialogObject;

    $("#dialog-title").text(title);
    $("#dialog-body").text(text);
    $("#dialog-type").val(mode);
    $("#dialog-submit").val(submitText);
    $("#dialog-message").val(message);

    if (type === "show") {
        $(".lds-spinner-modal").show();
        $("#dialog-submit").attr("type", "hidden");
        $("#dialog-cancel").attr("value", "Ok");
        $("#dialog-content").removeClass("modal-content");
        $("#dialog-content").addClass("dialog-content");
        $("#confirm-dialog").removeClass("modal");
        $("#confirm-dialog").addClass("dialog-modal");
    } else if (type === "hide") {
        $(".lds-spinner-modal").hide();
        $("#dialog-submit").attr("type", "submit");
        $("#dialog-cancel").attr("value", "Avbryt")
        $("#dialog-content").removeClass("dialog-content");
        $("#dialog-content").addClass("modal-content");
        $("#confirm-dialog").removeClass("dialog-modal");
        $("#confirm-dialog").addClass("modal");
    }

    const dialogSubmitBtn = $("#dialog-submit");
    const dialogCancelBtn = $("#dialog-cancel");
    if (mode === "SEND" || mode === "DELETE") {
        dialogCancelBtn.removeClass("success-btn");
    }

    if (mode === "SEND") {
        if (dialogSubmitBtn.hasClass("error-btn")) {
            dialogSubmitBtn.removeClass("error-btn");
            dialogSubmitBtn.addClass("success-btn");
        }
    } else if (mode === "DELETE") {
        if (dialogSubmitBtn.hasClass("success-btn")) {
            dialogSubmitBtn.removeClass("success-btn");
            dialogSubmitBtn.addClass("error-btn");
        }
    }

    $("#confirm-dialog").show();
}

//Functions to show modals
function showRegForm() {
    $("#reg-modal").show();
}

function showStatus() {
    $("#status-modal").show();
}

//Event listeners to show modals
$("#register-form-button").click((e) => {
    e.preventDefault();
    showRegForm();
});

$("#status-btn").click((e) => {
    e.preventDefault();
    showStatus();
});

//Add event listener to the modal background so that you can hide it by clicking
//The background and not the modal itself
$(".modal").click(function (e) {
    e.preventDefault();

    if (e.target && (e.target.className !== "modal-content" && e.target.className === "modal")) {
        $(".modal").hide();
    }
});

//Event listener to hide modal
$("#confirm-btn").click((e) => {
    e.preventDefault();
    $(".modal").hide();
})
//Function that shows modal and fills the list of the modal
//With feedback of what was done and styles it accordingly
function showModalAndFeedback(feedbackArray) {
    fbModal.style.display = "block";
    modalFeedbackList.innerHTML = "";

    if (inputHasValue(feedbackArray)) {
        modalTitle.textContent = "Dette ble endret";
        modalTitle.style.color = "navy";
        feedbackArray.forEach(string => {
            let element = document.createElement("li");
            element.textContent = string;
            element.style.color = "navy";
            element.setAttribute("class", "modal-feedback-li");
            modalFeedbackList.appendChild(element);
        });
    } else {

        modalTitle.textContent = "Vennligst fyll inn ett eller flere felt før du prøver å oppdatere profilen";
        modalTitle.style.color = "red";
    }
}

//Function to create a small feedback popup
//that can be dismissed by clicking or it will
//remove itself after 15 seconds
function createFeedbackPopup(feedback) {
    const outerModal = document.createElement("div");
    const innerModal = document.createElement("div");
    const modalMessage = document.createElement("span");
    outerModal.setAttribute("class", "fb-modal");
    innerModal.setAttribute("class", "fb-modal-content");
    modalMessage.setAttribute("class", "fb-modal-text");
    modalMessage.textContent = feedback;
    outerModal.appendChild(innerModal);
    innerModal.appendChild(modalMessage);
    $("#popup-modal-div").append(outerModal);

    outerModal.style.display = "block";

    setTimeout(function () {
        if ($(".fb-modal" !== undefined)) {
            $("#popup-modal-div").empty(outerModal);
        }
    }, 10000);

    if ($(".fb-modal")) {
        $(".fb-modal").focus();
    }


    innerModal.addEventListener("click", (e) => {
        $("#popup-modal-div").empty(outerModal);
    })
}

//Function that show modal if sign is updating and changes elements while updating
function showSignIsUpdatingModal() {
    $("#sign-info-title").text("Skiltet oppdaterer, vennligst vent");
    $(".lds-spinner").show();
    $("#stored-messages").hide();
    $(".form-button").prop("disabled", true);
    $("#dialog-cancel").prop("disabled", true);
    $("#dialog-cancel").removeClass("success-btn");
    const messageToHandle = {
        title: "Skiltet oppdateres",
        text: "Applikasjonen vil låse seg, vennligst vent rundt 30 sekunder",
        submitText: "Ok",
        mode: "UPDATE",
        type: "show"
    };
    showDialog(messageToHandle);
}

//Function that updates updating modal when sign is finished loading
function showSignIsDoneUpdatingModal() {
    //for body
    $("#sign-info-title").text("Skiltet er oppdatert");
    $(".lds-spinner").hide();
    $("#stored-messages").show();
    $(".form-button").prop("disabled", false);
    $("#dialog-cancel").prop("disabled", false);
    $("#dialog-cancel").addClass("success-btn");
    //for modal
    $(".lds-spinner-modal").hide();
    $("#dialog-title").text("Skiltet ble oppdatert");
    $("#dialog-body").text("Appen kan nå brukes igjen");
}