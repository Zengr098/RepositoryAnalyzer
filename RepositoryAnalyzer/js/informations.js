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
        commits_url = commits_url.slice(0, -6); 

        showRepoName(request);
        getContributors(contributors_url, commits_url);
    });
}

// Funzione che mostra il nome della repository
function showRepoName(request) {
    div = $(".repoName");
    nameRepo = request.name;
    nameRepo.textContent = request.name;
    div.append(nameRepo);

    div = $(".description");
    description = request.description;
    description.textContent = request.description;
    div.append(description);
}

//Funzione che mette i contributors e i commit in un array
function getContributors(contributors_url, commits_url){
    var request = $.get(contributors_url, function () {}).done(function () {
        request = request.responseJSON;
        var contributors = [];
        var data = [];
    
        for(var i = 0; i < request.length; i++){
            var name = request[i].login;
            var image = request[i].avatar_url;
            var ncommit = request[i].contributions;
            
            var contributor = {
                name: name,
                ncommit: ncommit,
                total: 0,
                additions: 0,
                deletions: 0
            };

            data.push(image);
            contributors.push(contributor);
        }
        getCommits(contributors, commits_url);
        showImageContributors(data);
    });
}

//Funzione che accede alle informazioni di ogni singolo commit
function getCommits(contributors, commits_url){
    var request = $.get(commits_url, function () {}).done(function () {
        request = request.responseJSON;
        var url = [];
            
        for(var i=0; i < request.length; i++){
            var commit = request[i].url;
            url.push(commit);
        }
        fetchCommits(contributors, url);
    });
}

//Funzioone che effettua la richiesta per prendere le informazioni di un singolo commit
function request(commits, sha){
    var request = $.get(sha, function () {}).done(function () {
        request = request.responseJSON;
            
        var name = request.commit.author.name;
        var total = request.stats.total;
        var additions = request.stats.additions;
        var deletions = request.stats.deletions;
        
        var commit = {
            name: name,
            total: total,
            additions: additions,
            deletions: deletions
        };
        
        return commits.push(commit);
    });
}

//Funzione che salva i dati di tutti i commit in un array
function fetchCommits(contributors, url){
    var commits = [];
    for(var i=0; i<url.length; i++){
        var sha = url[i];
        commits = request(commits, sha);
    }
    updateInformation(contributors, commits);
}

//Funzione che prende le linee di codice di ogni contributors
function updateInformation(contributors, commits){
    for(var i=0; i<commits.length; i++){
        for(var j=0; j<contributors.length; j++){
            if(commits[i].name == contributors[j].name){
                contributors[j].total += commits[i].total;
                contributors[j].additions += commits[i].additions;
                contributors[j].deletions += commits[i].deletions;
            }
        }
    }
    showCodeLines(contributors);
}

// Funzione che mostra le linee di codice totali, inserite e rimosse
function showCodeLines(contributors) {
    div = $("#containerContributors");
    pname = div.children(".username")[0];
    pcommit = div.children(".commit")[0];
    ptotal = div.children(".total")[0];
    pembedded = div.children(".embedded")[0];
    premoved = div.children(".removed")[0];

    contributors.forEach(c => {
        newname = pname.cloneNode(true);
        newname.textContent = "Developer username: "+c.name;
        div.append(newname);
        
        newcommit = pcommit.cloneNode(true);
        newcommit.textContent = "Number of commit: "+c.ncommit;
        div.append(newcommit);
        
        newtotal = ptotal.cloneNode(true);
        newtotal.textContent = "Total code lines: "+c.total;
        div.append(newtotal);

        newembedded = pembedded.cloneNode(true);
        newembedded.textContent = "Added code lines: "+c.additions;
        div.append(newembedded);
        
        newremoved = premoved.cloneNode(true);
        newremoved.textContent = "Removed code lines: "+c.deletions;
        div.append(newremoved);
    });

    pname.remove();
    pcommit.remove();
    ptotal.remove();
    pembedded.remove();
    premoved.remove();
}

// Funzione che mostra l'immagine dello sviluppatore
function showImageContributors(data) {
    for(var i=0; i<data.length; i++){
        var container = document.getElementById("containerContributors");
        
        var containerHtml="";
        containerHtml += "<img class=\"img-fluid\" src=\""+data[i]+" alt=\"...\" \/>";

        container.innerHTML = container.innerHTML + containerHtml;
    }
}