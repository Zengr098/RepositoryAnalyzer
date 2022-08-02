//Permette di passare i dati alla nuova pagina che si apre quando clicco sottometti
window.onload = function(){
    document.getElementById("sottometti").addEventListener("click", afterClick);
  }

  function afterClick(){
    document.getElementById("sottometti").href = "contribuenti.html"+"#"+document.getElementById('textName').value;
  }