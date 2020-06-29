//Run function when page is loaded
$(() => {

    //Get references to the inputs from the profile page
    const emailInput = $("#email-input");
    const fNameInput = $("#first-name-input");
    const lNameInput = $("#last-name-input");
    const pwInput = $("#password-input");
    const cpwInput = $("#c-password-input");

    //Set all profile inputs to be disabled by default
    $(".profile-input").attr("disabled", true);
    $(".profile-input-small").attr("disabled", true);

    //Get references to all the save changes buttons from the profile page and hide them by default
    const confirmEmailBtn = $("#confirm-email-btn");
    const confirmFNameBtn = $("#confirm-fname-btn");
    const confirmLNameBtn = $("#confirm-lname-btn");
    const confirmPWBtn = $("#confirm-pw-btn");

    confirmEmailBtn.hide();
    confirmFNameBtn.hide();
    confirmLNameBtn.hide();
    confirmPWBtn.hide();

    //Get refernces to the edit buttons on the profile page
    const editEmailBtn = $("#edit-email-btn");
    const editFNameBtn = $("#edit-fname-btn");
    const editLNameBtn = $("#edit-lname-btn");
    const editPWBtn = $("#edit-pw-btn");

    //Add event listener to all edit buttons that run editClicked function
    editEmailBtn.click(() => editClicked(editEmailBtn, confirmEmailBtn, [emailInput]));
    editFNameBtn.click(() => editClicked(editFNameBtn, confirmFNameBtn, [fNameInput]));
    editLNameBtn.click(() => editClicked(editLNameBtn, confirmLNameBtn, [lNameInput]));
    editPWBtn.click(() => editClicked(editPWBtn, confirmPWBtn, [pwInput, cpwInput]));

    //Asynchronous eventlistener to email save button
    confirmEmailBtn.click(async (event) => {
        const returnObject = await updateEmail(sanitize(emailInput.val()));
        if (returnObject.status === "SUCCESS") {
            confirmSuccessful(editEmailBtn, confirmEmailBtn, [emailInput])
        }
        if ("LikVerdi" !== returnObject.message) {
            showModalAndFeedback([returnObject.message]);
            populateUserProfile(getUser());
        }
    })

    //Asynchronous eventlistener to first name save button
    confirmFNameBtn.click(async () => {
        const returnObject = await updateName(sanitize(fNameInput.val()), "firstname");
        if (returnObject.status === "SUCCESS") {
            confirmSuccessful(editFNameBtn, confirmFNameBtn, [fNameInput]);
        }
        if ("LikVerdi" !== returnObject.message) {
            showModalAndFeedback([returnObject.message]);
            populateUserProfile(getUser());
        }
    })

    //Asynchronous eventlistener to last name save button
    confirmLNameBtn.click(async () => {
        const returnObject = await updateName(sanitize(lNameInput.val()), "lastname")
        if (returnObject.status === "SUCCESS") {
            confirmSuccessful(editLNameBtn, confirmLNameBtn, [lNameInput]);
        }
        if ("LikVerdi" !== returnObject.message) {
            showModalAndFeedback([returnObject.message]);
            populateUserProfile(getUser());
        }
    })

    //Asynchronous eventlistener to password save button
    confirmPWBtn.click(async () => {
        const returnObject = await updatePassword(sanitize(pwInput.val()), sanitize(cpwInput.val()))
        if (returnObject.status === "SUCCESS") {
            confirmSuccessful(editLNameBtn, confirmLNameBtn, [pwInput, cpwInput]);
        }
        showModalAndFeedback([returnObject.message]);
        populateUserProfile(getUser());
    });


})

//Function that hides the edit button and shows save button, while un-disabling the input fields
function editClicked(editBtn, confirmBtn, inputFields) {
    editBtn.hide();
    confirmBtn.show();
    inputFields.forEach(field => {
        field.attr("disabled", false);
    });
}

//Function that hides save buttons and shows edit button, while disabling the input fields
function confirmSuccessful(editBtn, confirmBtn, inputFields) {
    editBtn.show();
    confirmBtn.hide();
    inputFields.forEach(field => {
        field.attr("disabled", true);
    })
}

//Function that updates user's email
async function updateEmail(newEmail) {
    if (!inputHasValue(newEmail)) {
        return {
            message: "Email må være fylt ut",
            status: "ERROR"
        }
    }
    if (existingUserValues.email !== newEmail) {
        return await getUser().updateEmail(newEmail)
            .then((result) => {
                userCollectionRef.doc(getUser().uid)
                    .update({ "email": newEmail })
                return {
                    message: "Email er endret",
                    status: "SUCCESS"
                };
            }).catch((error) => {
                if (error.code === "auth/invalid-email") {
                    return {
                        message: "Emailen var ikke gyldig",
                        status: "ERROR"
                    };
                } else {
                    return {
                        message: error.message,
                        status: "ERROR"
                    };
                }
            });
    } else {
        return {
            message: "LikVerdi",
            status: "SUCCESS"
        };
    }
}

//Function that updates names for users, either first name or lastname depending on fieldToUpdate parameter
async function updateName(name, fieldToUpdate) {
    let updateObject = {};
    let existingName = undefined;
    let translatedField = ""
    if (fieldToUpdate === "firstname") {
        updateObject = { "firstName": name };
        existingName = existingUserValues.name.first;
        translatedField = "Fornavn";
    } else if (fieldToUpdate === "lastname") {
        updateObject = { "lastName": name };
        existingName = existingUserValues.name.last;
        translatedField = "Etternavn";
    }

    if (!inputHasValue(name)) {
        return {
            message: `${translatedField} må være fylt ut`,
            status: "ERROR"
        };
    }

    if (existingName !== name) {
        return await userCollectionRef.doc(getUser().uid).update(updateObject)
            .then((result) => {
                return {
                    message: translatedField,
                    status: "SUCCESS"
                };
            }).catch((error) => {
                return {
                    message: error.message,
                    status: "ERROR"
                };
            });
    }

    return {
        message: "LikVerdi",
        status: "SUCCESS"
    };
}

//Functions that updates the password
async function updatePassword(newPassword, newPasswordConfirm) {
    if (!inputHasValue(newPassword)) {
        return {
            message: "Passord må være fylt inn!",
            status: "ERROR"
        };
    }
    if (newPassword === newPasswordConfirm &&
        newPassword.length === newPasswordConfirm.length) {

        return await getUser().updatePassword(newPassword)
            .then((result) => {
                return {
                    message: "Passord",
                    status: "SUCCESS"
                };
            }).catch((error) => {
                if (error.code === "auth/weak-password") {
                    return {
                        message: "Passord må være minst 6 karakterer langt",
                        status: "ERROR"
                    };
                } else {
                    return {
                        message: error.message,
                        status: "ERROR"
                    };
                }
            });
    } else {
        return {
            message: "Begge passordene må være like",
            status: "ERROR"
        };
    }
}

//Function that updates the user profile input fields with the data from the user collection
async function populateUserProfile(user) {
    //Query to get user info and fill profile page details
    await userCollectionRef.where("uid", "==", user.uid)
        .get()
        .then(function (snapshot) {
            if (snapshot.empty) {
            } else {
                snapshot.forEach(function (doc) {
                    const userFName = doc.data().firstName;
                    const userLName = doc.data().lastName;
                    userGreeting.textContent = `${userFName} ${userLName}`;

                    $("#email-input").val(user.email);
                    $("#first-name-input").val(userFName);
                    $("#last-name-input").val(userLName);
                    $("#password-input").val('');
                    $("#c-password-input").val('');

                    existingUserValues.email = user.email;
                    existingUserValues.name.first = userFName;
                    existingUserValues.name.last = userLName;
                });

            }
        })
        .catch(function (error) {
        });
}

