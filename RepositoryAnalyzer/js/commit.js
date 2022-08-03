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

        getContributors(contributors_url, commits_url);
    });
}

//Funzione che mette i contributors e i commit in un array
function getContributors(contributors_url, commits_url){
    var request = $.get(contributors_url, function () {}).done(function () {
        request = request.responseJSON;
        var contributors = [];
    
        for(var i = 0; i < request.length; i++){
            var name = request[i].login;
            
            var contributor = {
                name: name,
                embedded: 0,
                removed: 0,
                total: 0
            };
            contributors.push(contributor);
        }
        getCommits(contributors, commits_url);
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

function fetchCommits(contributors, url){
    var commits = [];
    for(var i=0; i<url.length; i++){
        var request = $.get(url[i], function () {}).done(function () {
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
            
            commits.push(commit);
        });
        setTimeout(500);
    }
    //fetchCommits(contributors, commit);
}

//Funzione che prende le linee di codice di ogni contributors
/*function updateInformation(contributors, commits){
    for(var i=0; i<commits.length; i++){
        for(var j=0; j<contributors.length; j++){
            if(commits[i].author == contributors[j].name){
                contributors[j].total += commits[i].url.stats.total;
            }
        }
    }
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
}*/