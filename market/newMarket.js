var fpmmFactory;

$(document).ready(async () => {
  
    try {
      web3 = await enableEthereum();
      console.log(">>> Connected to Metamask<br>");
  
      let network = await getNetwork(); 
      $("#output").append(">>> Connected to "+network+"<br>");
      console.log(">>> Connected to "+network);
  
      rinkebyAccount = await getAccount();
      console.log("Account: "+rinkebyAccount);
      document.getElementById("connectedAddress").innerHTML = rinkebyAccount;
      document.getElementById("connectBtn").style.display="none";
      document.getElementById("newMarketOracle").value =  rinkebyAccount;
  
    } catch (err) {
      alert(err+" Correct the issue and refresh the page.");
      throw(Error(err));
    }

    loadToken().then((res) => { 
        console.log("Logged acount LOCK balance: ", web3.utils.fromWei(res));
    })

    loadCT().then((res) => {
        console.log("ctContractAddress: "+CTCONTRACTRINKEBY);
    })

    fpmmFactory = loadMMF();
    console.log("MarketMakerFactory loaded: ", fpmmFactory.contract);   

    document.getElementById("newMarketLiquidity").value = '10000';
})


function _createMarket() {
    let market = {
      questionId: web3.utils.asciiToHex(document.getElementById("newMarketQuestion").value).padEnd(66, '0'), //32byte string
      id: "",
      title: document.getElementById("newMarketTitle").value,
      state: "OPEN",
      endDate: document.getElementById("newMarketEndDate").value,
      resolutionSource: document.getElementById("newMarketRes").value,
      description: document.getElementById("newMarketDesc").value,
      marketMakerAddress: "",
      yesPositionID: "",
      noPositionID: "",
      tradeVolume: 0,
    }

    //conditionalTokens.js: function openMarket(questionId, oracleAccount) 
    openMarket(market.questionId, rinkebyAccount)
    .then((condition) => {
        market.id = condition.conditionId;
        market.yesPositionID = condition.positions.yes;
        market.noPositionID = condition.positions.no;
        let initialLiquidity = document.getElementById("newMarketLiquidity").value;
        fpmmFactory.createMM(Math.floor(Math.random() * 1000) , CTCONTRACTRINKEBY, COLLATERALTOKENCONTRACT, [condition.conditionId], 0, web3.utils.toWei(initialLiquidity), [])
        .then((receipt) => {
            console.log("Loggin the receipt from creating the AMM")
            console.log(receipt)
            market.marketMakerAddress = receipt.events.FixedProductMarketMakerCreation.returnValues.fixedProductMarketMaker//TODO: Get from receipt
            console.log("Logging Market...")
            console.log(market)
            addMarket(market)
            .then(res => {
                //window.location.href = "/index.html";
                console.log(res);
            })
            .catch((err) => {
                
                // Catch code warns the user the market was not added to the database
                throw(err)
            })
        })
        .catch((err) => {
            // Catch code warns the user the MarketMaker wasn't created for this market
            throw(err)
        })
    })
    .catch((err) => {
        // Catch code warns the user the condition was not created in the blockchain
        throw(err)
    })
  }

