var market;

// Page init is called at $document.onReady by connectionBar.js
function pageInit() {
  const urlParams = new URLSearchParams(window.location.search);
    market = {
        conditionId: urlParams.get('conditionId'),
        questionId: urlParams.get('questionId'),
        title: urlParams.get('title'),
        description: urlParams.get('desc'),
        resolutionSource: urlParams.get('res'),
        endDate: urlParams.get('enddate'),
        state: urlParams.get('state'),
    }

    document.getElementById("marketTitle").innerText = market.title;
    document.getElementById("marketConditionId").innerText = market.conditionId;

    document.getElementById("editTitle").value = market.title;
    document.getElementById("editDescription").value = market.description;
    document.getElementById("editResSource").value = market.resolutionSource;
    document.getElementById("editEndDate").value = market.endDate;
}

function _editMarket() {
     //Collect formdata in a market object
     let newMarket = {
          "conditionId": market.conditionId,
          "title": document.getElementById("editTitle").value,
          "description": document.getElementById("editDescription").value,
          "resolutionSource": document.getElementById("editResSource").value,
          "endDate": document.getElementById("editEndDate").value,
          "state": document.getElementById("editState").value,
     }
     //Send that formdata to the Backend
     DB.editMarket(newMarket);
     //Redirect user to the markets page
     window.location.replace("../index.html")
}