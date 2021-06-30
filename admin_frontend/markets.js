// Page init is called at $document.onReady by connectionBar.js
function pageInit() {
   _loadMarkets();
}


function _loadMarkets () {
   DB.getMarkets()
   .then((response) => {
      let markets = response.data.data;
      if (markets=== undefined) {
         throw new Error("GET request to /markets returned undefined")
      }
      console.log("Markets: ", markets)
      printMarkets(markets, 'OPEN').then(() => printMarkets(markets, 'CLOSED'))
   })
   .catch(err => {
      console.error(err)
    })
 }

 async function printMarkets(markets, state = 'OPEN') {
    let chosenMarkets = markets.filter(((item) => { return item.state == state }));
    console.log(chosenMarkets)
    const tableBody = document.getElementById(state+"marketsBoardBody");
    var newBody = document.createElement('tbody');

    for (i=0; i < chosenMarkets.length; i++) {
        let market = chosenMarkets[i];
        var rowNode = document.createElement("tr");
        // Market Title 
        var cellNode = document.createElement("td");
        var anchorNode = document.createElement("a");
        anchorNode.setAttribute("href", "/market/market.html?conditionId="+market.id
                                 +"&questionId="+market.questionId
                                 +"&title="+market.title
                                 +"&fpmm="+market.marketMakerAddress
                                 +"&yesPositionId="+market.yesPositionID
                                 +"&noPositionId="+market.noPositionID)
        var textNode = document.createTextNode(market.title);
        anchorNode.appendChild(textNode) 
        cellNode.appendChild(anchorNode);
        rowNode.appendChild(cellNode);

        // Market Liquidity
        let mm = new MarketMaker(fpmmABI, market.marketMakerAddress)
        // TODO: Add the created MM to a MM Manager who tracks every MM instance
        result = await mm.totalSupply();
        cellNode = document.createElement("td");
        textNode = document.createTextNode((Number(web3.utils.fromWei(result)).toFixed(2)));
        cellNode.appendChild(textNode);
        rowNode.appendChild(cellNode);
     
        // Yes Price
        cellNode = document.createElement("td");
        result = await mm.calcSharePrice(YESINDEX);
        textNode = document.createTextNode(Number.parseFloat(result).toFixed(2));
        
        cellNode.appendChild(textNode);
        rowNode.appendChild(cellNode);
        // No Price
        cellNode = document.createElement("td");
        result = await mm.calcSharePrice(NOINDEX);
        textNode = document.createTextNode(Number.parseFloat(result).toFixed(2));
        cellNode.appendChild(textNode);
        rowNode.appendChild(cellNode);
        // Expiration
        cellNode = document.createElement("td");
        console.log(market)
        textNode = document.createTextNode(market.endDate);
        cellNode.appendChild(textNode);
        rowNode.appendChild(cellNode);
        // Operations
        // --- EDIT
        cellNode = document.createElement("td");
        anchorNode = document.createElement("a");
        anchorNode.setAttribute("href", "/market/edit.html?conditionId="+market.id
                                 +"&title="+market.title
                                 +"&desc="+market.description
                                 +"&res="+market.resolutionSource
                                 +"&state="+market.state
                                 +"&enddate="+market.endDate);
        textNode = document.createTextNode("EDIT");
        anchorNode.appendChild(textNode) 
        cellNode.appendChild(anchorNode);
        rowNode.appendChild(cellNode);
        // --- CLOSE
        cellNode = document.createElement("td");
        anchorNode = document.createElement("a");
        anchorNode.setAttribute("href", "/market/resolve.html?conditionId="+market.id
                                 +"&title="+market.title
                                 +"&questionId="+market.questionId
                                 +"&oracle="+market.oracle);
        textNode = document.createTextNode("RESOLVE");
        anchorNode.appendChild(textNode) 
        cellNode.appendChild(anchorNode);
        rowNode.appendChild(cellNode);

        newBody.appendChild(rowNode);
     }

     tableBody.parentNode.replaceChild(newBody, tableBody)
     newBody.setAttribute("id", state+"marketsBoardBody");
     return Promise.resolve();
 }