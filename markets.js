$(document).ready(async () => {
  
   session = new Session();
   // This design pattern overcomes the limitations of not being able to 
   // run async operations inside an object's constructor
   session.init(() => {
     console.log("Account: "+session.getAccount());
     console.log("Chain: "+session.getChain());
 
     document.getElementById("connectedAddress").innerHTML = session.getAccount();
     document.getElementById("connectBtn").style.display="none";
 
     $("#output").append(">>> Connected to "+session.getChain()+"<br>");
     document.getElementById("connectedNetwork").innerHTML = session.getChain();

     session.getTokenContract().methods.balanceOf(session.getAccount()).call()
     .then(res => { console.log(`Logged account ${TOKENNAME} balance: `, web3.utils.fromWei(res))})
   });

   _loadMarkets();
 
 })


function _loadMarkets () {
   getMarkets()
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
        var rowNode = document.createElement("tr");
        // Market Title 
        var cellNode = document.createElement("td");
        var anchorNode = document.createElement("a");
        anchorNode.setAttribute("href", "/market/market.html?conditionId="+chosenMarkets[i].id
                                 +"&questionId="+chosenMarkets[i].questionId
                                 +"&fpmm="+chosenMarkets[i].marketMakerAddress
                                 +"&yesPositionId="+chosenMarkets[i].yesPositionID
                                 +"&noPositionId="+chosenMarkets[i].noPositionID)
        var textNode = document.createTextNode(chosenMarkets[i].title);
        anchorNode.appendChild(textNode) 
        cellNode.appendChild(anchorNode);
        rowNode.appendChild(cellNode);

        // Market Liquidity
        let mm = new MarketMaker(fpmmABI, chosenMarkets[i].marketMakerAddress)
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
        console.log(chosenMarkets[i])
        textNode = document.createTextNode(chosenMarkets[i].endDate);
        cellNode.appendChild(textNode);
        rowNode.appendChild(cellNode);

        newBody.appendChild(rowNode);
     }

     tableBody.parentNode.replaceChild(newBody, tableBody)
     newBody.setAttribute("id", state+"marketsBoardBody");
     return Promise.resolve();
 }