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
        fetchIssues(contributors, commits_url, issues_url);
        showImageContributors(data);
    });
}

//Funzione che accede alle informazioni di ogni singola issue
function fetchIssues(contributors, commits_url, issues_url){
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
        getCommits(contributors, commits_url, issues);
    });
}

//Funzione che accede alle informazioni di ogni singolo commit
function getCommits(contributors, commits_url, issues){
    var request = $.get(commits_url, function () {}).done(function () {
        request = request.responseJSON;
        var url = [];
            
        for(var i=0; i < request.length; i++){
            var commit = request[i].url;
            url.push(commit);
        }
        fetchCommits(contributors, url, issues);
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
async function fetchCommits(contributors, url, issues){
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
    updateInformation(contributors, commits, issues);
}

//Funzione che prende le linee di codice di ogni contributors
function updateInformation(contributors, commits, issues){
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
    showInformations(contributors);
}

// Funzione che mostra a video tutte le informazioni
function showInformations(contributors) {
    div = $("#containerContributors");
    pname = div.children(".username")[0];
    pcommit = div.children(".commit")[0];
    ptotal = div.children(".total")[0];
    pembedded = div.children(".embedded")[0];
    premoved = div.children(".removed")[0];
    plineforcommit = div.children(".lineforcommit")[0];
    pnfile = div.children(".nfile")[0];
    popen = div.children(".open")[0];
    pclose = div.children(".close")[0];
    pcontribute = div.children(".contribute")[0];
    pbug = div.children(".bug")[0];

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

        newlineforcommit = plineforcommit.cloneNode(true);
        newlineforcommit.textContent = "Code lines added for commit: "+c.lineforcommit;
        div.append(newlineforcommit);

        newfile = pnfile.cloneNode(true);
        newfile.textContent = "File changed for commit: "+c.nfile;
        div.append(newfile);

        newopen = popen.cloneNode(true);
        newopen.textContent = "Number of open issues: "+c.openissue;
        div.append(newopen);

        newclose = pclose.cloneNode(true);
        newclose.textContent = "Number of close issue: "+c.closedissue;
        div.append(newclose);

        newcontribute = pcontribute.cloneNode(true);
        newcontribute.textContent = "Contribute percentage: "+c.contributepercentage+"%";
        div.append(newcontribute);

        newbug = pbug.cloneNode(true);
        newbug.textContent = "Issues fixed percentage: "+c.bugpercentage+"%";
        div.append(newbug);
    });

    pname.remove();
    pcommit.remove();
    ptotal.remove();
    pembedded.remove();
    premoved.remove();
    plineforcommit.remove();
    pnfile.remove();
    popen.remove();
    pclose.remove();
    pcontribute.remove();
    pbug.remove();
}

// Funzione che mostra l'immagine dello sviluppatore
function showImageContributors(data) {
    for(var i=0; i<data.length; i++){
        var container = document.getElementById("containerContributors1");
        
        var containerHtml="<br>";
        containerHtml += "<img class=\"img-fluid\" src=\""+data[i]+" alt=\"...\" \/>";

        container.innerHTML = container.innerHTML + containerHtml;
    }
}