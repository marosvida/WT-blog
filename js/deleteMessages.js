import Mustache from "./mustache.js";

export default function deleteOldMessages(event){
    event.preventDefault();

    let formRecords = [];
    if(localStorage.myRecords){
        formRecords = JSON.parse(localStorage.myRecords);
    }

    //filter messages that are older than one day and remove them from array
    formRecords = formRecords.filter(record => Date.now() - new Date(record.created) < 60*1000); //zmaze spravy, ktore si tu dlhsie ako 1 min

    localStorage.clear();

    localStorage.myRecords = JSON.stringify(formRecords);


    if(localStorage.myRecords){
        formRecords = JSON.parse(localStorage.myRecords);
        formRecords.forEach(record => {
            record.imgUrl = record.imgUrl === "" ? "Žiaden obrázok :'(" : record.imgUrl;
            record.gender = record.gender === "muz" ? "Muž" : record.gender === 'zena' ? "Žena" : record.gender === 'ine' ? "Iné" : "Pohlavie neudané";
            record.news = record.news === true ? "Chce dostávať emaily" : "Nechce dostávať emaily";
            record.category = record.category === "" ? "Nemám obľúbený žáner" : record.category;
            record.created = (new Date(record.created)).toDateString();
        });
    }

    document.getElementById("router-view").innerHTML = Mustache.render(
        document.getElementById("template-article3").innerHTML,
        formRecords
    );
}