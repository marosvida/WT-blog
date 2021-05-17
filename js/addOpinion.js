export default function processOpnFrmData(event){
    const myForm = document.getElementById("my-form");
    //1.prevent normal event (form sending) processing
    event.preventDefault();

    //validate that required inputs are filled
    if(!validateInput()){
        return;
    }

    //2. Read and adjust data from the form (here we remove white spaces before and after the strings)
    //getting values from form fields
    const name = myForm.elements["name"].value;
    const email = myForm.elements["email"].value;
    const imgUrl = myForm.elements["imageUrl"].value;
    const gender = myForm.elements["gender"].value;
    const message = myForm.elements["message"].value;
    const news = myForm.elements["news"].checked;
    const category = myForm.elements["category"].value;

    //create new record
    const record = {
        name: name,
        email: email,
        imgUrl: imgUrl,
        gender: gender,
        message: message,
        news: news,
        category: category,
        created: new Date()
    }

    let formRecords = [];

    if(localStorage.myRecords){
        formRecords = JSON.parse(localStorage.myRecords);
    }

    formRecords.push(record);
    localStorage.myRecords = JSON.stringify(formRecords);

    //rest the form fields
    myForm.reset();

    //5. Go to the opinions
    window.location.hash="#article3";
}

function validateInput(){
    const myForm = document.getElementById("my-form");

    const nameInput = myForm.elements["name"];
    const emailInput = myForm.elements["email"];
    const messageInput = myForm.elements["message"];
    const imageUrlInput = myForm.elements["imageUrl"];

    const nameError = document.querySelector('span.error-name');
    const emailError = document.querySelector('span.error-email');
    const messageError = document.querySelector('span.error-message');
    const imageUrlError = document.querySelector('span.error-imageUrl');

    if(nameInput.value.trim() === ""){
        nameError.textContent = 'Zadajte Vaše meno, prosím';
        nameError.classList.add("text-not-valid");
        nameInput.classList.add("not-valid");
    } else {
        nameError.textContent = "";
        nameError.classList.remove("text-not-valid");
        nameInput.classList.remove("not-valid");
    }


    if(!validateEmail(emailInput.value)){
        emailError.textContent = 'Zadajte email v správnom tvare, prosím';
        if(emailInput.value === ""){
            emailError.textContent = 'Zadajte email, prosím';
        }
        emailError.classList.add("text-not-valid");
        emailInput.classList.add("not-valid");
    } else {
        emailError.textContent = "";
        emailError.classList.remove("text-not-valid");
        emailInput.classList.remove("not-valid");
    }

    if(messageInput.value.trim() === ""){
        messageError.textContent = 'Zadajte nejakú správu, prosím';
        messageError.classList.add("text-not-valid");
        messageInput.classList.add("not-valid");
    } else {
        messageError.textContent = "";
        messageError.classList.remove("text-not-valid");
        messageInput.classList.remove("not-valid");
    }

    if(!validateURL(imageUrlInput.value) && imageUrlInput.value !== ""){
        imageUrlError.textContent = 'Zadajte valídnu URL adresu, prosím';
        imageUrlError.classList.add("text-not-valid");
        imageUrlInput.classList.add("not-valid");
    } else {
        imageUrlError.textContent = "";
        imageUrlError.classList.remove("text-not-valid");
        imageUrlInput.classList.remove("not-valid");
    }

    if(nameInput.classList.contains("not-valid") || emailInput.classList.contains("not-valid") || messageInput.classList.contains("not-valid") || imageUrlInput.classList.contains("not-valid")){
        return false;
    }

    nameError.textContent = "";
    emailError.textContent = "";
    messageError.textContent = "";

    return true;
}

function validateURL(str) {
    const regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
    return regex.test(str);
}

function validateEmail(email) {
    const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    return regex.test(email);
}

