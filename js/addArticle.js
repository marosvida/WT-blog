export default function handleAddArticleData(event){
    const myForm = document.getElementById("add-article-form");

    const urlBase = "https://wt.kpi.fei.tuke.sk/api/article";
    event.preventDefault();

    //create new article data
    const newArticle = {
        title: myForm.elements["title"].value.trim(),
        content: myForm.elements["content"].value.trim(),
        imageLink: myForm.elements["imageLink"].value.trim(),
        author: myForm.elements["author"].value.trim(),
        tags: myForm.elements["tags"].value.trim()
    }

    //validate that required inputs are filled
    if(!validateInput()){
        return;
    }

    if (!newArticle.author) {
        newArticle.author = "Anonymous";
    }

    if (!newArticle.imageLink) {
        delete newArticle.imageLink;
    }

    if (!newArticle.tags) {
        newArticle.tags = "kniha007";
    } else {
        newArticle.tags = newArticle.tags.split(",");
        newArticle.tags = newArticle.tags.map(tag => tag.trim());

        newArticle.tags = newArticle.tags.filter(tag => tag);
        newArticle.tags.push("kniha007");
        if (newArticle.tags.length === 0) {
            delete newArticle.tags;
        }
    }
    
    const postReqSettings = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify(newArticle)
    };

    fetch(urlBase, postReqSettings)
        .then(response =>{
            if(response.ok){
                window.alert("Article successfully added to server");
            } else {
                return Promise.reject(
                    new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })
        .catch(error => { ////here we process all the failed promises
            window.alert(`Failed to save the article on server. ${error}`);
        })
        .finally(() => window.location.hash = `#article2`);

    //reset the form fields
    myForm.reset();

}

function validateInput(){
    const myForm = document.getElementById("add-article-form");

    const titleInput = myForm.elements["title"];
    const contentInput = myForm.elements["content"];
    const imgLinkInput = myForm.elements["imageLink"];

    const titleError = document.querySelector('span.error-title');
    const contentError = document.querySelector('span.error-content');
    const imgLinkError = document.querySelector('span.error-ImgLink');


    if(titleInput.value.trim() === ""){
        titleError.textContent = 'Zadajte názov článku, prosím';
        titleError.classList.add("text-not-valid");
        titleInput.classList.add("not-valid");
    } else {
        titleError.textContent = "";
        titleError.classList.remove("text-not-valid");
        titleInput.classList.remove("not-valid");
    }

    if(contentInput.value.trim() === ""){
        contentError.textContent = 'Zadajte nejaký obsah, prosím';
        contentError.classList.add("text-not-valid");
        contentInput.classList.add("not-valid");
    } else {
        contentError.textContent = "";
        contentError.classList.remove("text-not-valid");
        contentInput.classList.remove("not-valid");
    }

    if(!validateURL(imgLinkInput.value) && imgLinkInput.value !== ""){
        imgLinkError.textContent = 'Zadajte valídnu URL adresu, prosím';
        imgLinkError.classList.add("text-not-valid");
        imgLinkInput.classList.add("not-valid");
    } else {
        imgLinkError.textContent = "";
        imgLinkError.classList.remove("text-not-valid");
        imgLinkInput.classList.remove("not-valid");
    }


    if(titleInput.classList.contains("not-valid") || contentInput.classList.contains("not-valid") || imgLinkInput.classList.contains("not-valid")){
        return false;
    }

    titleError.textContent = "";
    contentError.textContent = "";

    return true;
}

function validateURL(str) {
    const regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
    return regex.test(str);
}