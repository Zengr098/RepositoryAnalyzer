window.onload = function(){
    extractNameRepo();
}

//Funzione che permette di ottenere dall'URL l'ownerName e la repositoryName
function extractNameRepo(){
    var url = window.location.hash;
    const myArray = url.split("/");
    fetchRepository(myArray[3], myArray[4]);
}

//Funzione che prende in input il proprietario della repository e la repository stessa producendo come risposta un JSON
function fetchRepository(ownerName, repositoryName){
    var requestURL = "https://api.github.com/repos/" + ownerName + "/" + repositoryName;
    var request = $.get(requestURL, function () {}).done(function () {
        request = request.responseJSON;

        var contributors_url = request['contributors_url'];
        var commits_url = request['commits_url'];

        getContributors(contributors_url, commits_url);
    });
}

//Funzione che mette i contributors e i commit in un array
function getContributors(contributors_url, commits_url){

    var contributors = [];
    var commits = [];

    var request = $.get(contributors_url, function () {}).done(function () {
    request = request.responseJSON;
  
      for(var i = 0; i < request.length; i++){
        var name = request[i].login;
        
        var contributor = {
            name: name,
            embedded: 0,
            removed: 0
        };
        
        contributors.push(contributor);
      }
    });

    var requestCommit = $.get(commits_url, function () {}).done(function () {
        requestCommit = requestCommit.responseJSON;
        
        for(var i = 0; i < request.length; i++){
            commits.push(request[i].url);
        }
    });

    updateCodeLine(contributors, commits);
}

//Funzione che prende le linee di codice di ogni contributors
function updateCodeLine(contributors, commits){


}

// Funzione che mostra le linee di codice
function showCodeLines(contributors) {
    div = $("#containerContributors");
    pembedded = div.children(".embedded")[0];
    premoved = div.children(".removed")[0];

    contributors.forEach(c => {
        newembedded = pembedded.cloneNode(true);
        newembedded.textContent = "Developer username: "+c.name;
        div.append(newembedded);
        
        newremoved = premoved.cloneNode(true);
        newremoved.textContent = "Number of commit: "+c.commit;
        div.append(newremoved);
    });

    pembedded.remove();
    premoved.remove();
}