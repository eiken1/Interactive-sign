//get the signup form and create event listener for is
const signupForm = document.querySelector("#register-form");
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    //Get user info
    const signUpUsername = signupForm['reg-username'].value;
    const signUpPassword = signupForm['reg-password'].value;
    const signUpCPassword = signupForm['c-reg-password'].value;
    const signUpFirstName = signupForm['reg-first-name'].value;
    const signUpLastName = signupForm['reg-last-name'].value;

    //Validate all the input fields
    if (inputHasValue(signUpUsername) && inputHasValue(signUpPassword) && inputHasValue(signUpPassword) && inputHasValue(signUpFirstName) && inputHasValue(signUpCPassword)) {
        //Validate password input
        if (signUpPassword === signUpCPassword && signUpPassword.length === signUpCPassword.length) {
            //sign up the user
            auth.createUserWithEmailAndPassword(signUpUsername, signUpPassword)
                .then(info => {
                    //After user is created, pass user info to variables and update database collection

                    const userUid = info.user.uid;
                    const email = info.user.email;
                    const userFirstName = signUpFirstName;
                    const userLastName = signUpLastName;

                    const account = {
                        email: email,
                        firstName: userFirstName,
                        lastName: userLastName,
                        uid: userUid
                    }
                    firebase.firestore().collection('users').doc(userUid).set(account);

                    signupForm.reset()

                    $("#reg-modal").hide();

                    createFeedbackPopup("Bruker med email " + email + " ble registrert!");

                })
                .catch(error => {
                    createFeedbackPopup("Kunne ikke registrere bruker, noe gikk feil..");
                });
        } else {
            createFeedbackPopup("Passord må være like!")
        }
    } else {
        createFeedbackPopup("Alle felt må være fylt inn!");
    }
})
