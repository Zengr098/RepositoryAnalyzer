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

    var requestURL = "https://api.github.com/repos/" + ownerName + "/"+repositoryName;
    var request = $.get(requestURL, function () {}).done(function () {
      request = request.responseJSON;
      //In request c'è la risposta alla fetch della repository
  
      //link per informazioni sui collaboratori
      var contributors_url = request['contributors_url'];
      fetchContributors(contributors_url);
    });
}

//Funzione che prende in input contributors_url e produce come risposta un JSON
function fetchContributors(contributors_url){

    var request = $.get(contributors_url, function () {}).done(function () {
    request = request.responseJSON;
    var contributors = [];
  
      for(var i = 0; i < request.length; i++){
        var name = request[i].login;
        var image = request[i].avatar_url;
        var ncommit = request[i].contributions;
        
        var contributor = {
            name: name,
            image: image,
            commit: ncommit
        };
        
        contributors.push(contributor);
      }

      showNameContributors(contributors);
      showCommitContributors(contributors)
    });
  }

// Funzione che mostra il nome dello sviluppatore
function showNameContributors(contributors) {
    div = $("#containerContributors");
    pname = div.children(".username")[0];
    pcommit = div.children(".commit")[0];

    contributors.forEach(c => {
        newname = pname.cloneNode(true);
        newname.textContent = "Developer username: "+c.name;
        div.append(newname);
        
        newcommit = pcommit.cloneNode(true);
        newcommit.textContent = "Number of commit: "+c.commit;
        div.append(newcommit);
    });

    pname.remove();
    pcommit.remove();
}