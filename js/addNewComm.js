export default function handleAddNewComm(artId){
    const myForm = document.getElementById("add-comment-form");
    const urlBase = `https://wt.kpi.fei.tuke.sk/api/article/${artId}/comment`;

    //create new article data
    const newComment = {
        author: myForm.elements["author"].value.trim(),
        text: myForm.elements["text"].value.trim()
    }

    const postReqSettings = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify(newComment)
    };

    fetch(urlBase, postReqSettings)
        .then(response =>{
            if(response.ok){
                window.alert("Comment successfully added to article");
            } else {
                return Promise.reject(
                    new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })
        .catch(error => { ////here we process all the failed promises
            window.alert(`Failed to save the article on server. ${error}`);
        })
        .finally(() => window.location.hash = `#article/${artId}`);

    //rest the form fields
    myForm.reset();
}