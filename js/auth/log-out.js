//Get the log out button element
const logout = document.querySelector(".log-out-button");

//Add event listener to log out button
logout.addEventListener('click', (e) => {
    e.preventDefault();
    //Run firebase authentication method to sign out the user and then route to log in page
    auth.signOut().then(() => {
        window.location.replace("log-in.html");
    })
})