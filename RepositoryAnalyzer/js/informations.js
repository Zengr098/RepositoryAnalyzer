window.onload = function(){
    extractNameRepo();
}

//Funzione che permette di ottenere dall'URL l'ownerName e la repositoryName
function extractNameRepo(){
    let url = window.location.hash;
    const myArray = url.split("/");
    fetchRepository(myArray[3], myArray[4]);
}

//Funzione che prende in input il proprietario della repository e la repository stessa producendo come risposta un JSON
function fetchRepository(ownerName, repositoryName){
    let requestURL = "https://api.github.com/repos/" + ownerName + "/" + repositoryName;
    let request = $.get(requestURL, function () {}).done(function () {
        request = request.responseJSON;

        let contributors_url = request['contributors_url'];
        let commits_url = request['commits_url'];
        let issues_url = requestURL + "/issues/events";
        commits_url = commits_url.slice(0, -6);

        showRepoInfo(request);
        getContributors(contributors_url, commits_url, issues_url);
    });
}

// Funzione che mostra le informazioni sulla repository
function showRepoInfo(request) {
    let createYear = request.created_at.slice(0, -16);
    let createMonth = request.created_at.slice(5, 7);
    let createDay = request.created_at.slice(8, -10);
    let createDate = createDay+"/"+createMonth+"/"+createYear;

    let updateYear = request.updated_at.slice(0, -16);
    let updateMonth = request.updated_at.slice(5, 7);
    let updateDay = request.updated_at.slice(8, -10);
    let updateDate = updateDay+"/"+updateMonth+"/"+updateYear;

    div = $(".repoName");
    nameRepo = request.name;
    nameRepo.textContent = request.name;
    div.append(nameRepo);

    if(request.description){
        div = $(".description");
        description = request.description;
        description.textContent = request.description;
        div.append(description);
    }

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
    let request = $.get(contributors_url, function () {}).done(function () {
        request = request.responseJSON;
        let contributors = [];
        let data = [];
    
        for(let i = 0; i < request.length; i++){
            let name = request[i].login;
            let image = request[i].avatar_url;
            let ncommit = request[i].contributions;
            
            let contributor = {
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
                bugpercentage: 0,
                whiteline: 0,
                comments: 0,
                codelines: 0,
                lines: 0            
            };

            data.push(image);
            contributors.push(contributor);
        }
        fetchIssues(contributors, commits_url, issues_url, data);
    });
}

//Funzione che accede alle informazioni di ogni singola issue
function fetchIssues(contributors, commits_url, issues_url, data){
    let request = $.get(issues_url, function () {}).done(function () {
        request = request.responseJSON;
        let issues = [];
    
        for(let i = 0; i < request.length; i++){
            let open = request[i].issue.user.login;
            let close = request[i].actor.login;
            
            let issue = {
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
    let request = $.get(commits_url, function () {}).done(function () {
        request = request.responseJSON;
        let url = [];
            
        for(let i=0; i < request.length; i++){
            let commit = request[i].url;
            url.push(commit);
        }
        fetchCommits(contributors, url, issues, data);
    });
}

//Funzioone che effettua la richiesta per prendere le informazioni di un singolo commit
function requestCommit(sha){
    let request = $.get(sha, function () {}).done(function () {
        request = request.responseJSON;
    });
    return request;
}

//Funzione che salva i dati di tutti i commit in un array
async function fetchCommits(contributors, url, issues, data){
    let commits = [];
    for(let i=0; i<url.length; i++){
        let sha = url[i];
        const request = await requestCommit(sha);
        
        let name = request.committer.login;
        let total = request.stats.total;
        let additions = request.stats.additions;
        let deletions = request.stats.deletions;
        let nfile = request.files.length;
        let whiteline = 0;
        let comments = 0;
        let code = 0;

        for(let j=0; j<request.files.length; j++){
            let lines = [];
            if(request.files[j].patch){
                let file = request.files[j].patch.replaceAll(' ', '');
                lines = lines.concat(file.split("\n"));
                for(let k=0; k<lines.length; k++){
                    //controllo se la riga è una riga aggiunta
                    if(lines[k].startsWith("+")){
                        lines[k] = lines[k].substring(1);
                        if(lines[k].startsWith("//")){
                            comments++;
                            lines.splice(k, 1);
                            k--;
                        }
                        else if(lines[k] == ""){
                            whiteline++;
                            lines.splice(k, 1);
                            k--;
                        }
                        else if(lines[k].startsWith("/*")){
                            for(let l=k; l<lines.length; l++){
                                if(lines[l].includes("*/")){
                                   comments++;
                                   lines.splice(l, 1);
                                   l--;
                                   break;
                                }
                                else{
                                    comments++;
                                    lines.splice(l, 1);
                                    l--;
                                }
                            }
                        }
                        else if(lines[k].startsWith("<!--")){
                            for(let m=k; m<lines.length; m++){
                                if(lines[m].includes("--!")){
                                   comments++;
                                   lines.splice(m, 1);
                                   m--;
                                   break; 
                                }
                                else{
                                    comments++;
                                    lines.splice(m, 1);
                                    m--;
                                }
                            }
                        }
                        else{
                            code++;
                            lines.splice(k, 1);
                            k--;
                        }
                    }
                }
            }
        }

        let nlines = whiteline+comments+code;
        let commit = {
            name: name,
            total: total,
            additions: additions,
            deletions: deletions,
            nfile: nfile,
            whiteline: whiteline,
            comments: comments,
            code: code,
            lines: nlines
        }

        commits.push(commit);
    }
    updateInformation(contributors, commits, issues, data);
}

//Funzione che prende le linee di codice di ogni contributors
function updateInformation(contributors, commits, issues, data){
    for(let i=0; i<commits.length; i++){
        for(let j=0; j<contributors.length; j++){
            let total = contributors[j].total;
            let additions = contributors[j].additions;
            let deletions = contributors[j].deletions;
            let nfile = contributors[j].nfile;
            let whiteline = contributors[j].whiteline;
            let comments = contributors[j].comments;
            let codelines = contributors[j].codelines;
            let lines = contributors[j].lines;

            let newtotal = commits[i].total;
            let newadditions = commits[i].additions;
            let newdeletions = commits[i].deletions;
            let newfile = commits[i].nfile;
            let newwhite = commits[i].whiteline;
            let newcomments = commits[i].comments;
            let newcode = commits[i].code;
            let newlines = commits[i].lines;

            if(commits[i].name == contributors[j].name){
                contributors[j].total = total + newtotal;
                contributors[j].additions = additions + newadditions;
                contributors[j].deletions = deletions + newdeletions;
                contributors[j].nfile = nfile + newfile;
                contributors[j].whiteline = whiteline + newwhite;
                contributors[j].comments = comments + newcomments;
                contributors[j].codelines = codelines + newcode;
                contributors[j].lines = lines + newlines;
            }
        }
    }

    for(let t=0; t<issues.length; t++){
        for(let l=0; l<contributors.length; l++){
            if(issues[t].open == contributors[l].name){
                contributors[l].openissue ++;
            }
            else if(issues[t].close == contributors[l].name){
                contributors[l].closedissue ++;
            }
        }
    }

    let total = 0;
    let bug = 0;
    for (let k=0; k<contributors.length; k++){
        contributors[k].lineforcommit = (contributors[k].additions/contributors[k].ncommit).toFixed(2);
        contributors[k].nfile = (contributors[k].nfile/contributors[k].ncommit).toFixed(2);

        total += contributors[k].additions;
        bug += contributors[k].closedissue;
    }

    for (let h=0; h<contributors.length; h++){
        contributors[h].contributepercentage = ((contributors[h].additions * 100) / total).toFixed(2);
        contributors[h].bugpercentage = ((contributors[h].closedissue * 100) / bug).toFixed(2);
        contributors[h].whiteline = ((contributors[h].whiteline * 100) / contributors[h].lines).toFixed(2);
        contributors[h].comments = ((contributors[h].comments * 100) / contributors[h].lines).toFixed(2);
        contributors[h].codelines = ((contributors[h].codelines * 100) / contributors[h].lines).toFixed(2);
    }
    showInformations(contributors, data);
}

// Funzione che mostra a video tutte le informazioni
function showInformations(contributors, data) {
    let container = document.getElementById("containerParent");

    for(let i=0; i<contributors.length; i++){
        let divClone = container.cloneNode(true);
        let id = "containerParent-" + i;
        divClone.id = id;

        let divImage = divClone.getElementsByClassName("containerImages")[0];
        showImageContributors(divImage, data[i]);
        
        let divContributor = divClone.getElementsByClassName("containerContributors")[0];

        pname = divContributor.querySelector(".username");
        pcommit = divContributor.querySelector(".commit");
        ptotal = divContributor.querySelector(".total");
        pembedded = divContributor.querySelector(".embedded");
        premoved = divContributor.querySelector(".removed");
        plineforcommit = divContributor.querySelector(".lineforcommit");
        pnfile = divContributor.querySelector(".nfile");
        popen = divContributor.querySelector(".open");
        pclose = divContributor.querySelector(".close");
        pcontribute = divContributor.querySelector(".contribute");
        pbug = divContributor.querySelector(".bug");
        pcode = divContributor.querySelector(".codelines");
        pcomments = divContributor.querySelector(".comments");
        pwhite = divContributor.querySelector(".whitelines");

        pname.textContent = "Developer username: "+ contributors[i].name;
        pcommit.textContent = "Number of commit: "+contributors[i].ncommit;
        ptotal.textContent = "Total code lines: "+contributors[i].total;
        pembedded.textContent = "Added code lines: "+contributors[i].additions;
        premoved.textContent = "Removed code lines: "+contributors[i].deletions;
        plineforcommit.textContent = "Average code lines added for commit: "+contributors[i].lineforcommit;
        pnfile.textContent = "Average file changed for commit: "+contributors[i].nfile;
        popen.textContent = "Number of opened issues: "+contributors[i].openissue;
        pclose.textContent = "Number of closed issue: "+contributors[i].closedissue;
        pcontribute.textContent = "Contribute percentage: "+contributors[i].contributepercentage+"%";
        let bug = contributors[i].bugpercentage;
        let codelines = contributors[i].codelines;
        let comments = contributors[i].comments;
        let whitelines = contributors[i].whiteline;
        if(isNaN(bug)){
            pbug.textContent = "Issues fixed percentage: 0.00%";
        }
        else{
            pbug.textContent = "Issues fixed percentage: "+bug+"%";
        }
        if(isNaN(codelines)){
            pcode.textContent = "Code lines percentage: 0.00%";
        }
        else{
            pcode.textContent = "Code lines percentage: "+codelines+"%";
        }
        if(isNaN(comments)){
            pcomments.textContent = "Documentation percentage: 0.00%";
        }
        else{
            pcomments.textContent = "Documentation percentage: "+comments+"%";
        }
        if(isNaN(whitelines)){
            pwhite.textContent = "White lines percentage: 0.00%";
        }
        else{
            pwhite.textContent = "White lines percentage: "+whitelines+"%";
        }


        document.getElementById("fill").append(divClone);
    }
    container.remove();
}

// Funzione che mostra l'immagine dello sviluppatore
function showImageContributors(divImage, data) {
    let containerHtml="<br><img class=\"img-fluid\" src=\""+data+" alt=\"...\" \/>";
    divImage.innerHTML = divImage.innerHTML + containerHtml;
}