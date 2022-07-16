window.onload = function(){
  extractNameRepo();
}

//Funzione che prende in input il proprietario della repository e la repository stessa producendo come risposta un JSON
function fetchRepository(ownerName, repositoryName){

  var requestURL = "https://api.github.com/repos/" + ownerName + "/"+repositoryName;
  var request = $.get(requestURL, function () {}).done(function () {
    request = request.responseJSON;
    //In request c'è la risposta alla fetch della repository

    //link per informazioni sui collaboratori
    var contributors_url = request['contributors_url'];
    fetchContributors(contributors_url);
  });
}

//Funzione che prende in input contributors_url e produce come rispiìosta un JSON
function fetchContributors(contributors_url){
  
  var request = $.get(contributors_url, function () {}).done(function () {
    request = request.responseJSON;
    
    for(var i = 0; i < request.length; i++){
      var name = request[i].login;
      var image = request[i].avatar_url;
      var  commit = request[i].contributions;
      creaDiv(image, name, commit);
    }

  });
}

//Funzione che dai contribuitori prende tutti i dati che voglio mostrare nella nuova pagina quando cliccoSottometti
function creaDiv(image, name, commit, InsertLine, removeLine, graphic){
    
    //Trasformo l'HTML in stringhe in modo da generarlo dinamicamente

    var container = document.getElementById("containerCollaboratori");
    
    /*var containerHtml = "        <div class=\"flip-card\" style=\"position:relative; float:left;\">";
    containerHtml += "          <div class=\"flip-card-inner\">";
    containerHtml += "            <div class=\"flip-card-front\">";
    containerHtml += "              <img src=\""+image+" + alt=\"Avatar\" style=\"width:300px;height:300px;\">";
    containerHtml += "            <\/div>";
    containerHtml += "            <div class=\"flip-card-back\">";
    containerHtml += "              <h1>"+name+"<\/h1> ";
    containerHtml += "              <p>Numero commit:"+commit+"<\/p>";
    containerHtml += "              <p>Linee di codice aggiunte<\/p>";
    containerHtml += "              <p>Linee di codice eliminate<\/p>";
    containerHtml += "              <p>Gafico <\/p>";
    containerHtml += "              <p><\/p>";
    containerHtml += "            <\/div>";
    containerHtml += "          <\/div>";
    containerHtml += "        <\/div>   ";*/

    var containerHtml="";
    containerHtml += "<div class=\"col-md-6 col-lg-4 mb-5\">";
    containerHtml += "                        <div class=\"portfolio-item mx-auto\" data-bs-toggle=\"modal\" data-bs-target=\"#portfolioModal1\">";
    containerHtml += "                            <div class=\"portfolio-item-caption d-flex align-items-center justify-content-center h-100 w-100\">";
    containerHtml += "                                <div class=\"portfolio-item-caption-content text-center text-white\"><i class=\"fas fa-plus fa-3x\"><\/i><\/div>";
    containerHtml += "                            <\/div>";
    containerHtml += "                            <img class=\"img-fluid\" src=\""+image+" + alt=\"...\" \/>";
    containerHtml += "              <p>Linee di codice aggiunte<\/p>";
    containerHtml += "                        <\/div>";
    containerHtml += "                    <\/div>";
    

    container.innerHTML = container.innerHTML + containerHtml;

}

//Funzione che permette di ottenere dall'URL l'ownerName e la repositoryName
function extractNameRepo(){
  var url = window.location.hash;
  const myArray = url.split("/");

    fetchRepository(myArray[3], myArray[4]);
}