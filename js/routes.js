/*
 * routes definition and handling for paramHashRouter
 */

import Mustache from "./mustache.js";
import processOpnFrmData from "./addOpinion.js";
import handleAddArticleData from "./addArticle.js";
import deleteOldMessages from "./deleteMessages.js";
import handleAddNewComm from "./addNewComm.js";
import articleFormsHandler from "./articleFormsHandler.js";

const myTag = "kniha007";

//an array, defining the routes
export default[

    {
        //the part after '#' in the url (so-called fragment):
        hash:"index",
        ///id of the target html element:
        target:"router-view",
        //the function that returns content to be rendered to the target html element:
        getTemplate: (targetElm) => {
            document.getElementById(targetElm).innerHTML = document.getElementById("template-index").innerHTML;
            document.getElementById("my-form").onsubmit=processOpnFrmData;
            updateSignIn();
        }
    },

    {
        hash:"article1",
        target:"router-view",
        getTemplate:(targetElm) =>
            document.getElementById(targetElm).innerHTML = document.getElementById("template-article1").innerHTML
    },

    {
        hash:"article2",
        target:"router-view",
        getTemplate: fetchAndDisplayArticles
    },

    {
        hash:"article3",
        target:"router-view",
        getTemplate: createHtml4opinions
    },

    {
        hash:"article",
        target:"router-view",
        getTemplate: fetchAndDisplayArticleDetail
    },

    {
        hash:"artEdit",
        target:"router-view",
        getTemplate: editArticle
    },

    {
        hash:"artDelete",
        target:"router-view",
        getTemplate: deleteArticle
    },

    {
        hash:"artInsert",
        target: "router-view",
        getTemplate: (targetElm) => {
            document.getElementById(targetElm).innerHTML = document.getElementById("template-add-article").innerHTML;
            document.getElementById("add-article-form").onsubmit=handleAddArticleData;

            updateSignIn();
        }
    }
];

function createHtml4opinions(targetElm){
    const recordsFromStorage = localStorage.myRecords;
    let records = [];

    if(recordsFromStorage){
        records = JSON.parse(recordsFromStorage);
        records.forEach(record => {
            record.imgUrl = record.imgUrl === "" ? "Žiaden obrázok :'(" : record.imgUrl;
            record.gender = record.gender === "muz" ? "Muž" : record.gender === 'zena' ? "Žena" : record.gender === 'ine' ? "Iné" : "Pohlavie neudané";
            record.news = record.news === true ? "Chce dostávať emaily" : "Nechce dostávať emaily";
            record.category = record.category === "" ? "Nemám obľúbený žáner" : record.category;
            record.created = (new Date(record.created)).toDateString();
        });
    }

    document.getElementById(targetElm).innerHTML = Mustache.render(
        document.getElementById("template-article3").innerHTML,
        records
    );

    document.getElementById("deleteBtn").addEventListener("click", ev => deleteOldMessages(ev));
}

let locCurrent;

function fetchAndDisplayArticles(targetElm, current){
    const cur = parseInt(current)

    if(!cur) current = 1;
    else locCurrent = parseInt(current);

    if (locCurrent) current = locCurrent;

    const perPage = 20;

    let offset = (current - 1) * 20;
    if(current === 1) offset = 0;

    const data4rendering={
        currPage: current,
    }

    if(current>1){
        data4rendering.prevPage=current-1;
    }

    const url = "http://wt.kpi.fei.tuke.sk/api/article";
    const urlOffset = `http://wt.kpi.fei.tuke.sk/api/article?tag=${myTag}&max=${perPage}&offset=${offset}`;

    fetch(urlOffset)
        .then(response =>{
            if(response.ok){
                return response.json();
            }else{ //if we get server error
                return Promise.reject(
                    new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })
        .then(responseJSON => {
            //pridavam daco nove
            addArtDetailLink2ResponseJson(responseJSON);

            data4rendering.articleList = responseJSON.articles;
            data4rendering.pageCount = Math.ceil((responseJSON.meta.totalCount)/perPage);
            if(current<data4rendering.pageCount){
                data4rendering.nextPage=current+1;
            }
            return Promise.resolve();
        })
        .then( () => {
            let contentRequests = data4rendering.articleList.map(
                article => fetch(`${url}/${article.id}`)
            );

            return Promise.all(contentRequests);
        })
        .then(responses =>{
            let failed="";
            for(let response of responses) {
                if(!response.ok) failed+=response.url+" ";
            }
            if(failed===""){
                return responses;
            }else{
                return Promise.reject(new Error(`Failed to access the content of the articles with urls ${failed}.`));
            }
        })
        .then(responses => Promise.all(responses.map(resp => resp.json())))
        .then(articles => {
            articles.forEach((article,index) =>{
                data4rendering.articleList[index].content=article.content;
                data4rendering.articleList[index].tags=article.tags.filter(tag => tag !== myTag);
            });
            return Promise.resolve();
        })
        .then( () =>{
            document.getElementById(targetElm).innerHTML =
                Mustache.render(
                    document.getElementById("template-articles").innerHTML,
                    data4rendering
                );
        })
        .catch (error => { ////here we process all the failed promises
            const errMsgObj = {errMessage:error};
            document.getElementById(targetElm).innerHTML =
                Mustache.render(
                    document.getElementById("template-articles-error").innerHTML,
                    errMsgObj
                );
        });

}

function addArtDetailLink2ResponseJson(responseJSON){
    responseJSON.articles = responseJSON.articles.map(
        article =>(
            {
                ...article,
                detailLink:`#article/${article.id}/${responseJSON.meta.offset}/${responseJSON.meta.totalCount}`
            }
        )
    );
}

function fetchAndDisplayArticleDetail(targetElm,artIdFromHash,offsetFromHash,totalCountFromHash, currComm) {
    fetchAndProcessArticle(...arguments,false);
}

/**
 * Gets an article record from a server and processes it to html according to
 * the value of the forEdit parameter. Assumes existence of the urlBase global variable
 * with the base of the server url (e.g. "https://wt.kpi.fei.tuke.sk/api"),
 * availability of the Mustache.render() function and Mustache templates )
 * with id="template-article" (if forEdit=false) and id="template-article-form" (if forEdit=true).
 * @param targetElm - id of the element to which the acquired article record
 *                    will be rendered using the corresponding template
 * @param artIdFromHash - id of the article to be acquired
 * @param offsetFromHash - current offset of the article list display to which the user should return
 * @param totalCountFromHash - total number of articles on the server
 * @param forEdit - if false, the function renders the article to HTML using
 *                            the template-article for display.
 *                  If true, it renders using template-article-form for editing.
 */
const urlBase = "https://wt.kpi.fei.tuke.sk/api";
let currArtId;

function fetchAndProcessArticle(targetElm,artIdFromHash,offsetFromHash,totalCountFromHash, curComm, forEdit){
    const url = `${urlBase}/article/${artIdFromHash}`;
    let currentComm;
    if(!curComm) currentComm = 1;
    else currentComm = parseInt(curComm);

    const comPerPage = 10;

    let commOffset = (currentComm - 1) * comPerPage;
    if(currentComm === 1) commOffset = 0;

    let nextComm;
    let prevComm;

    if(currentComm > 1) prevComm = currentComm -1;

    fetch(url)
        .then(response =>{
            if(response.ok){
                return response.json();
            }else{ //if we get server error
                return Promise.reject(
                    new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })
        .then(responseJSON => {
            responseJSON.tags=responseJSON.tags.filter(tag => tag !== myTag);
            if(forEdit){
                responseJSON.formTitle="Article Edit";
                responseJSON.submitBtTitle="Save article";
                responseJSON.backLink=`#article/${artIdFromHash}/${offsetFromHash}/${totalCountFromHash}`;

                document.getElementById(targetElm).innerHTML =
                    Mustache.render(
                        document.getElementById("template-article-form").innerHTML,
                        responseJSON
                    );
                if(!window.artFrmHandler){
                    window.artFrmHandler= new articleFormsHandler("https://wt.kpi.fei.tuke.sk/api");
                }
                window.artFrmHandler.assignFormAndArticle("articleForm","hiddenElm",artIdFromHash,offsetFromHash,totalCountFromHash);
            }else{
                responseJSON.backLink=`#article2`;
                responseJSON.editLink=
                    `#artEdit/${responseJSON.id}/${offsetFromHash}/${totalCountFromHash}`;
                responseJSON.deleteLink=
                    `#artDelete/${responseJSON.id}/${offsetFromHash}/${totalCountFromHash}`;

                currArtId = responseJSON.id;

                fetch(`${url}/comment?max=${comPerPage}&offset=${commOffset}`)
                    .then(response =>{
                        if(response.ok){
                            return response.json();
                        }else{ //if we get server error
                            return Promise.reject(
                                new Error(`Server answered with ${response.status}: ${response.statusText}.`));
                        }
                    })
                    .then(responseComment =>{
                        if(currentComm < (Math.ceil((responseComment.meta.totalCount)/comPerPage))){
                            nextComm = currentComm+1;
                        }

                        responseJSON.comments = responseComment.comments;
                        responseJSON.prevPageCommLink=`#article/${artIdFromHash}/${offsetFromHash}/${totalCountFromHash}/${prevComm}`;
                        responseJSON.nextPageCommLink=`#article/${artIdFromHash}/${offsetFromHash}/${totalCountFromHash}/${nextComm}`;
                        responseJSON.currCommPage=currentComm;
                        responseJSON.commTotalPages = Math.ceil((responseComment.meta.totalCount)/comPerPage);

                        document.getElementById(targetElm).innerHTML =
                            Mustache.render(
                                document.getElementById("template-article").innerHTML,
                                responseJSON
                            );

                        cancelAddComm();

                        document.getElementById("showAddCommFormBtn").onclick=showAddCommForm;


                    })
                    .catch(error => {
                        console.log(error);
                    })
            }
        })
        .catch (error => { ////here we process all the failed promises
            const errMsgObj = {errMessage:error};
            document.getElementById(targetElm).innerHTML =
                Mustache.render(
                    document.getElementById("template-articles-error").innerHTML,
                    errMsgObj
                );
        });
}

function editArticle(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash) {
    fetchAndProcessArticle(...arguments, null, true);
}

function deleteArticle(targetElm, artIdFromHash) {
    fetch(`${urlBase}/article/${artIdFromHash}`, { method: 'DELETE'})
        .then(response =>{
            if(response.ok){
                window.alert("Article successfully deleted from server");
            } else {
                return Promise.reject(
                    new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })
        .catch (error => { ////here we process all the failed promises
            const errMsgObj = {errMessage:error};
            document.getElementById(targetElm).innerHTML =
                Mustache.render(
                    document.getElementById("template-articles-error").innerHTML,
                    errMsgObj
                );
        })
        .finally(() => window.location.hash = `#article2`);

}

function showAddCommForm(){
    document.getElementById("addComment").innerHTML = document.getElementById("template-addCommForm").innerHTML;
    document.getElementById("cancelComm").onclick=cancelAddComm;
    document.getElementById("add-comment-form").onsubmit=handleAddNewCommSubm;
    updateSignIn();
}

function handleAddNewCommSubm(){
    handleAddNewComm(currArtId);
    cancelAddComm();
}

function cancelAddComm(){
    document.getElementById("addComment").innerHTML = document.getElementById("template-addCommBtn").innerHTML;
    document.getElementById("showAddCommFormBtn").onclick=showAddCommForm;
}
