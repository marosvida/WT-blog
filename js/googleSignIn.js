let auth2 = {};

function signOut() {
    if(auth2.signOut){
        auth2.signOut();
    }
    if(auth2.disconnect){
        auth2.disconnect();
    }
}

function userChanged(user){
    document.getElementById("userName").innerHTML=user.getBasicProfile().getName();

    const userNameInputElm = document.getElementById("author-nazor");
    const userNameAddArt = document.getElementById("author-add-article");
    const userNameAddComm = document.getElementById("author-add-comment");

    if(userNameInputElm){
        userNameInputElm.value=user.getBasicProfile().getName();
    } else if(userNameAddArt){
        userNameAddArt.value=user.getBasicProfile().getName();
    } else if(userNameAddComm){
        userNameAddComm.value=user.getBasicProfile().getName();
    }
}

function updateSignIn() {
    const sgnd = auth2.isSignedIn.get();
    if (sgnd) {
        document.getElementById("SignInButton").classList.add("hiddenElm");
        document.getElementById("SignedIn").classList.remove("hiddenElm");
        document.getElementById("userName").innerHTML=auth2.currentUser.get().getBasicProfile().getName();
    }else{
        document.getElementById("SignInButton").classList.remove("hiddenElm");
        document.getElementById("SignedIn").classList.add("hiddenElm");
    }

    const userNameInputElm = document.getElementById("author-nazor");
    const userNameAddArt = document.getElementById("author-add-article");
    const userNameAddComm = document.getElementById("author-add-comment");

    if(userNameInputElm){
        if (sgnd) {
            userNameInputElm.value=auth2.currentUser.get().getBasicProfile().getName();
        }else{
            userNameInputElm.value="";
        }
    } else if(userNameAddArt){
        if (sgnd) {
            userNameAddArt.value=auth2.currentUser.get().getBasicProfile().getName();
        }else{
            userNameAddArt.value="";
        }
    } else if(userNameAddComm){
        if (sgnd) {
            userNameAddComm.value=auth2.currentUser.get().getBasicProfile().getName();
        }else{
            userNameAddComm.value="";
        }
    }

}

function startGSingIn() {
    gapi.load('auth2', function() {
        gapi.signin2.render('SignInButton', {
            'width': 240,
            'height': 50,
            'longtitle': true,
            'theme': 'dark',
            'onsuccess': onSuccess,
            'onfailure': onFailure
        });
        gapi.auth2.init().then( //zavolat po inicializĂˇcii OAuth 2.0  (called after OAuth 2.0 initialisation)
            function (){
                console.log('init');
                auth2 = gapi.auth2.getAuthInstance();
                auth2.currentUser.listen(userChanged);
                auth2.isSignedIn.listen(updateSignIn);
                auth2.then(updateSignIn); //tiez po inicializacii (later after initialisation)
            });
    });

}

function onSuccess(googleUser) {
    console.log('Logged in as: ' + googleUser.getBasicProfile().getName());
}
function onFailure(error) {
    console.log(error);
}