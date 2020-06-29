//get the login form from the login page and create event listener for it
const loginForm = document.querySelector("#login-form");
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const loginUsername = loginForm['login-username'].value;
    const loginPassword = loginForm['login-password'].value;

    //Run firebase authentication method to log in user with form values
    auth.signInWithEmailAndPassword(loginUsername, loginPassword).then(cred => {
        loginForm.reset();
        window.location.replace("index.html");

    }).catch(function (err) {
        createFeedbackPopup("Brukernavn eller passord stemte ikke!");
    })

})