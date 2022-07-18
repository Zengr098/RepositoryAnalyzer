function fillprogram(jsontalks) {
    div = $("#talk-list");
    ptitle = div.children(".talk-title")[0];
    pspeaker = div.children(".talk-speaker")[0];
    jsontalks.forEach(talk => {
        newtitle = ptitle.cloneNode(true);
        newtitle.textContent = talk.title;
        div.append(newtitle);
        newspeaker = pspeaker.cloneNode(true);
        newspeaker.textContent = talk.name + " " + talk.surname + ", " + talk.affiliation;
        div.append(newspeaker);
    });
    ptitle.remove();
    pspeaker.remove();
}