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

    //link per ottenere il nome della repository
    var name = request['name'];
    fetchRepositoryName(name);
  });
}



function fetchRepositoryName(name){
  var request = $.get(contributors_url, function() {}).done(function () {
    request = request.responseJSON;

    var repositoryName = request.name;
    creaDivRepositoryName(repositoryName);
  });
}
//Funzione che dai contribuitori prende tutti i dati che voglio mostrare nella nuova pagina quando cliccoSottometti
function getRepository(nameRepo){
  var container = document.getElementById("nomeRepository");

  var containerHtml="";
  containerHtml += "<h1 class=\"masthead-heading text-uppercase mb-0\">"+nameRepo+"<\/h1>";

  container.innerHTML = container.innerHTML + containerHtml;
}


function creaDivRepositoryName(repositoryName){

  var container = document.getElementById("nomeRepository");

  var containerHtml = "";
  containerHtml += "<h4>Repository name: <b>"+repositoryName+"<\/b><\/h4>";

  container.innerHTML = container.innerHTML + containerHtml;
}



//Funzione che prende in input contributors_url e produce come risposta un JSON
function fetchContributors(contributors_url){

  var request = $.get(contributors_url, function () {}).done(function () {
    request = request.responseJSON;

    for(var i = 0; i < request.length; i++){
      var name = request[i].login;
      var image = request[i].avatar_url;
      var commit = request[i].contributions;
      creaDiv(image, name, commit);
    }
  });
}
//Funzione che dai contribuitori prende tutti i dati che voglio mostrare nella nuova pagina quando cliccoSottometti
function creaDiv(image, name, commit, insertLine, removeLine, graphic){

    //Trasformo l'HTML in stringhe in modo da generarlo dinamicamente

    var container = document.getElementById("containerCollaboratori");
<<<<<<< HEAD

    var containerHtml = "";
    containerHtml += "                    <div class=\"container\">";
    containerHtml += "                            <div class=\"row\">";
    containerHtml += "                              <div class=\"col-lg-4 ms-auto\">";
    containerHtml += "                                <img class=\"img-fluid\" src=\""+image+" + alt=\"...\" \/>";
    containerHtml += "                              <\/div>";
    containerHtml += "                              <div class=\"col-lg-8 mt-4 pt-lg-0 content\">";
    containerHtml += "                                <h4>Developer username: <b>"+name+"<\/b><\/h4>";
    containerHtml += "                                <h5>Commit number: <b>"+commit+"<\/b><\/h5>";
    containerHtml += "                                <h5>Code line embedded: <b>"+insertLine+"<\/b><\/h5>";
    containerHtml += "                                <h5>Code line removed: <b>"+removeLine+"<\/b><\/h5>";
    containerHtml += "                              <\/div>";
    containerHtml += "                            <\/div>";
    containerHtml += "                    <\/div>";

=======
    
>>>>>>> parent of 116f0b4 (Front end modifier)
    container.innerHTML = container.innerHTML + containerHtml;
}

//Funzione che permette di ottenere dall'URL l'ownerName e la repositoryName
function extractNameRepo(){
  var url = window.location.hash;
  const myArray = url.split("/");

    fetchRepository(myArray[3], myArray[4]);
}

//Retrieves Repository name
/*function getNameRepository(){
  var url = window.location.hash;
  const myArray = url.split("/");

    fetchRepository(myArray[4]);
    console.log(url);
}*/
