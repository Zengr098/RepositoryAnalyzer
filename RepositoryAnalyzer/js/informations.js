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
        var issues_url = requestURL + "/issues/events";
        commits_url = commits_url.slice(0, -6);

        showRepoInfo(request);
        getContributors(contributors_url, commits_url, issues_url);
    });
}

// Funzione che mostra le informazioni sulla repository
function showRepoInfo(request) {
    var createYear = request.created_at.slice(0, -16);
    var createMonth = request.created_at.slice(5, 7);
    var createDay = request.created_at.slice(8, -10);
    var createDate = createDay+"/"+createMonth+"/"+createYear;

    var updateYear = request.updated_at.slice(0, -16);
    var updateMonth = request.updated_at.slice(5, 7);
    var updateDay = request.updated_at.slice(8, -10);
    var updateDate = updateDay+"/"+updateMonth+"/"+updateYear;

    div = $(".repoName");
    nameRepo = request.name;
    nameRepo.textContent = request.name;
    div.append(nameRepo);

    div = $(".description");
    description = request.description;
    description.textContent = request.description;
    div.append(description);

    div = $(".create");
    create = createDate;
    create.textContent = createDate;
    div.append(create);

    div = $(".update");
    update = updateDate;
    update.textContent = updateDate;
    div.append(update);
}

//Funzione che mette i contributors e i commit in un array
function getContributors(contributors_url, commits_url, issues_url){
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
                deletions: 0,
                lineforcommit: 0,
                nfile: 0,
                openissue: 0,
                closedissue: 0,
                contributepercentage: 0,
                bugpercentage: 0
            };

            data.push(image);
            contributors.push(contributor);
        }
        fetchIssues(contributors, commits_url, issues_url, data);
    });
}

//Funzione che accede alle informazioni di ogni singola issue
function fetchIssues(contributors, commits_url, issues_url, data){
    var request = $.get(issues_url, function () {}).done(function () {
        request = request.responseJSON;
        var issues = [];
    
        for(var i = 0; i < request.length; i++){
            var open = request[i].issue.user.login;
            var close = request[i].actor.login;
            
            var issue = {
                open: open,
                close: close
            };

            issues.push(issue);
        }
        getCommits(contributors, commits_url, issues, data);
    });
}

//Funzione che accede alle informazioni di ogni singolo commit
function getCommits(contributors, commits_url, issues, data){
    var request = $.get(commits_url, function () {}).done(function () {
        request = request.responseJSON;
        var url = [];
            
        for(var i=0; i < request.length; i++){
            var commit = request[i].url;
            url.push(commit);
        }
        fetchCommits(contributors, url, issues, data);
    });
}

//Funzioone che effettua la richiesta per prendere le informazioni di un singolo commit
function requestCommit(sha){
    var request = $.get(sha, function () {}).done(function () {
        request = request.responseJSON;
    });
    return request;
}

//Funzione che salva i dati di tutti i commit in un array
async function fetchCommits(contributors, url, issues, data){
    var commits = [];
    for(var i=0; i<url.length; i++){
        var sha = url[i];
        const request = await requestCommit(sha);
        
        var name = request.committer.login;
        var total = request.stats.total;
        var additions = request.stats.additions;            
        var deletions = request.stats.deletions;
        var nfile = request.files.length;

        var commit = {
            name: name,
            total: total,
            additions: additions,
            deletions: deletions,
            nfile: nfile
        }

        commits.push(commit);
    }
    updateInformation(contributors, commits, issues, data);
}

//Funzione che prende le linee di codice di ogni contributors
function updateInformation(contributors, commits, issues, data){
    for(var i=0; i<commits.length; i++){
        for(var j=0; j<contributors.length; j++){
            var total = contributors[j].total;
            var additions = contributors[j].additions;
            var deletions = contributors[j].deletions;
            var nfile = contributors[j].nfile;

            var newtotal = commits[i].total;
            var newadditions = commits[i].additions;
            var newdeletions = commits[i].deletions;
            var newfile = commits[i].nfile;

            if(commits[i].name == contributors[j].name){
                contributors[j].total = total + newtotal;
                contributors[j].additions = additions + newadditions;
                contributors[j].deletions = deletions + newdeletions;
                contributors[j].nfile = nfile + newfile;
            }
        }
    }

    for(var t=0; t<issues.length; t++){
        for(var l=0; l<contributors.length; l++){
            if(issues[t].open == contributors[l].name){
                contributors[l].openissue ++;
            }
            else if(issues[t].close == contributors[l].name){
                contributors[l].closedissue ++;
            }
        }
    }

    var total = 0;
    var bug = 0;
    for (var k=0; k<contributors.length; k++){
        contributors[k].lineforcommit = (contributors[k].additions/contributors[k].ncommit).toFixed(2);
        contributors[k].nfile = (contributors[k].nfile/contributors[k].ncommit).toFixed(2);

        total += contributors[k].additions;
        bug += contributors[k].closedissue;
    }

    for (var h=0; h<contributors.length; h++){
        contributors[h].contributepercentage = ((contributors[h].additions * 100) / total).toFixed(2);
        contributors[h].bugpercentage = ((contributors[h].closedissue * 100) / bug).toFixed(2);
    }
    showInformations(contributors, data);
}

// Funzione che mostra a video tutte le informazioni
function showInformations(contributors, data) {
    var container = document.getElementById("containerParent");

    for(var i=0; i<contributors.length; i++){
        var divClone = container.cloneNode(true);
        var id = "containerParent-" + i;
        divClone.id = id;

        var divImage = divClone.getElementsByClassName("containerImages")[0];
        showImageContributors(divImage, data[i]);
        
        var divContributor = divClone.getElementsByClassName("containerContributors")[0];

        pname = divContributor.querySelector(".username");
        pcommit = divContributor.querySelector(".commit");
        ptotal = divContributor.querySelector(".total");
        pembedded = divContributor.getElementsByClassName(".embedded");
        premoved = divContributor.querySelector(".removed");
        plineforcommit = divContributor.querySelector(".lineforcommit");
        pnfile = divContributor.querySelector(".nfile");
        popen = divContributor.querySelector(".open");
        pclose = divContributor.querySelector(".close");
        pcontribute = divContributor.querySelector(".contribute");
        pbug = divContributor.querySelector(".bug");

        pname.textContent = "Developer username: "+ contributors[i].name;
        pcommit.textContent = "Number of commit: "+contributors[i].ncommit;
        ptotal.textContent = "Total code lines: "+contributors[i].total;
        pembedded.textContent = "Added code lines: "+contributors[i].additions;
        premoved.textContent = "Removed code lines: "+contributors[i].deletions;
        plineforcommit.textContent = "Code lines added for commit: "+contributors[i].lineforcommit;
        pnfile.textContent = "File changed for commit: "+contributors[i].nfile;
        popen.textContent = "Number of open issues: "+contributors[i].openissue;
        pclose.textContent = "Number of close issue: "+contributors[i].closedissue;
        pcontribute.textContent = "Contribute percentage: "+contributors[i].contributepercentage+"%";
        pbug.textContent = "Issues fixed percentage: "+contributors[i].bugpercentage+"%";

        container.append(divClone);
    }
    //container.remove();
}

// Funzione che mostra l'immagine dello sviluppatore
function showImageContributors(divImage, data) {
    var containerHtml="<br><img class=\"img-fluid\" src=\""+data+" alt=\"...\" \/>";
    divImage.innerHTML = divImage.innerHTML + containerHtml;
}