var market;
var condition;
var currentAccount;
var session;

function _loadMarket(market) {
  printCondition(market)
  _loadMM(market.fpmm)
  _updateMMBalances(market.fpmm.getAddress())
}


$(document).ready(async () => {
  session = new Session();
  // This design pattern overcomes the limitations of not being able to 
  // run async operations inside an object's constructor
  session.init(() => {
    console.log("Account: "+session.getAccount());
    console.log("Chain: "+session.getChain());

    document.getElementById("connectedAddress").innerHTML = session.getAccount();
    document.getElementById("connectBtn").style.display="none";

    document.getElementById("connectedNetwork").innerHTML = session.getChain();

    session.getTokenContract().methods.balanceOf(session.getAccount()).call()
     .then(res => { console.log(`Logged account ${TOKENNAME} balance: `, web3.utils.fromWei(res))})

     $("#output").append(`<br> // ${TOKENNAME} address: `+COLLATERALTOKENCONTRACT+"<br>");
  });


  const urlParams = new URLSearchParams(window.location.search);
  console.log(urlParams.get('questionId'))
  market = {
    conditionId: urlParams.get('conditionId'),
    questionId: urlParams.get('questionId'),
    fpmm: new MarketMaker(fpmmABI, urlParams.get('fpmm')),
    positions: {
      collateralNo: urlParams.get('noPositionId'),
      collateralYes: urlParams.get('yesPositionId')
    },
  }
  console.log(market);  
  _loadMarket(market);
});

function printCondition(condition) {
  document.getElementById("marketConditionId").innerText = condition.conditionId;
  
  $("#output").append("<br> // -> Condition ID: "+condition.conditionId+"<br>");
  //$("#output").append("<br> // -> Collection ( YES ) ID: "+condition.collections.yes);
  $("#output").append(`<br> // -> Position ( ${TOKENNAME}:YES ) ID: `+condition.positions.collateralYes+"<br>");
  //$("#output").append("<br> // -> Collection ( NO ) ID: "+condition.collections.no);
  $("#output").append(`<br> // -> Position ( ${TOKENNAME}:NO ) ID: `+condition.positions.collateralNo+"<br>");
}

function _loadMM(marketMaker) {
  console.log("Market's mmAddress: "+marketMaker.getAddress())
  document.getElementById("marketFPMM").innerText = marketMaker.getAddress();
  $("#mmContractAddress").text(marketMaker.getAddress());
  _totalSupply();
  _updatePrices();
  _updateAccBalances();
}

function _totalSupply() {
  market.fpmm.totalSupply().then((result) => {
    document.getElementById("marketPanelLiquidity").innerText=(Number(web3.utils.fromWei(result)).toFixed(2)+" LP Token Supply");
  })
}

function _updatePrices() {
  market.fpmm.calcSharePrice(YESINDEX).then((result) => {
    document.getElementById("marketPanelYesPrice").innerText = Number.parseFloat(result).toFixed(2) +" " + TOKENNAME;
  })
  market.fpmm.calcSharePrice(NOINDEX).then((result) => {
    document.getElementById("marketPanelNoPrice").innerText = Number.parseFloat(result).toFixed(2) +" " + TOKENNAME;
  })
}

/**
 * 
 * @param {*} mmAccount 
 * @description Prints the amount fo shares of each type the MM owns.
 */
function _updateMMBalances(mmAccount = market.fpmm.getAddress()) {
  let yesPos = market.positions.collateralYes;
  let noPos = market.positions.collateralNo;
  getAccBalance(mmAccount, yesPos, noPos).then((result) => {
    document.getElementById("mmYesBalance").innerText = Number.parseFloat(web3.utils.fromWei(result[YESINDEX])).toFixed(2);
    document.getElementById("mmNoBalance").innerText = Number.parseFloat(web3.utils.fromWei(result[NOINDEX])).toFixed(2);
  })
}

function _getAccPosition(outcomeIndex) {
  let positionId;
  let elementId;
  if (outcomeIndex === YESINDEX) {
    positionId = condition.positions.collateralYes;
    outcome = "Yes"
  } else {
    positionId = condition.positions.collateralNo;
    outcome = "No"
  }
  
  getAccPosition(currentAccount, positionId)
  .then(res => {
    document.getElementById("Sell"+outcome+"Shares").value = web3.utils.fromWei(res);
    _calcSellCollateral(document.getElementById("Sell"+outcome+"Shares"), outcomeIndex);
  })
}

function _updateAccBalances() {
  $("#marketPanelAcc").text("Account: "+currentAccount); 

  //Get current account SHARE balance
  getAccBalance(currentAccount, market.positions.collateralYes, market.positions.collateralNo).then((result) => {
    document.getElementById("YesSharesBalance").innerHTML = "<strong>YES SHARES: </strong>"+Number.parseFloat(web3.utils.fromWei(result[YESINDEX])).toFixed(2);
    document.getElementById("NoSharesBalance").innerHTML = "<strong>NO SHARES: </strong>"+Number.parseFloat(web3.utils.fromWei(result[NOINDEX])).toFixed(2);
    console.log("Yes Balance: ", result[YESINDEX]);
    console.log("No Balance: ", result[NOINDEX]);
  }) 

    //Get Liquidity provided by current account
  market.fpmm.getAccLiquidity(currentAccount).then((result) => {
    document.getElementById("marketPanelLPTokens").innerText = "LP Tokens: " + web3.utils.fromWei(result);
  })
}

/**
 * 
  * @param {string} input An amount of currency being used to buy
  * @param {string} outcomeIndex Which outcome is being bought 
  * @description Prints the amount of estimated shares to buy
 */ 
function _calcBuyAmount(input, outcomeIndex) {
  market.fpmm.calcBuyAmount(input, outcomeIndex).then((result) => {
    let outputId = "BuyYesEstimation";
    let shareName = "YES";
    if (outcomeIndex == NOINDEX) { 
      outputId = "BuyNoEstimation";
      shareName = "NO";
    } 
    console.log("Will buy you: ", result, " ", shareName," shares.");
    document.getElementById(outputId).innerHTML = "Will buy you "+web3.utils.fromWei(result) + " " + shareName + " shares";
  });
}

/**
 * 
  * @param {0 or 1} outcomeIndex Which outcome is being bought 
  * @description Prints the amount of estimated shares to buy
 */ 
function _buy(outcomeIndex) {
  console.log("(YESINDEX = "+YESINDEX+")Chosen outcome Index: ", outcomeIndex)
  let amount;
  if (outcomeIndex == YESINDEX) {
    amount = document.getElementById("BuyYesAmount").value;
  } else {
    amount = document.getElementById("BuyNoAmount").value;
  }
  
  market.fpmm.buy(outcomeIndex, amount).then((res) => {
    console.log("BUY TRANSACTION RECEIPT: ")
    console.log(res)
    _updatePrices();
    _updateAccBalances();
    _updateMMBalances();
  })
}

/**
 * 
  * @param {0 or 1} outcomeIndex Which outcome is being bought 
  * @description Prints the amount of estimated shares to sell
 */ 
function _calcSellShares(input, outcomeIndex) {
  console.log("Input.value: "+input.value)
  market.fpmm.calcSellAmount(input.value, outcomeIndex).then((result) => {
    let outputId = "SellYesShares";
    if (outcomeIndex == NOINDEX) outputId = "SellNoShares"; 
    console.log("Will sell for: ", result, " ", TOKENNAME);
    document.getElementById(outputId).value = web3.utils.fromWei(result);
  })
}

function _calcSellCollateral(input, outcomeIndex) {
  market.fpmm.calcSellCollateral(input.value, outcomeIndex).then(res => {
    let outputId = (outcomeIndex == YESINDEX) ? "SellYesCollateral" : "SellNoCollateral";
    document.getElementById(outputId).value = res;
  })
}

function _sell(outcomeIndex) {
  let returnAmount; 
  if (outcomeIndex == YESINDEX) {
    returnAmount = document.getElementById("SellYesCollateral").value;
  } else {
    returnAmount = document.getElementById("SellNoCollateral").value;
  }

  market.fpmm.sell(outcomeIndex, returnAmount).then(() => {
    _updatePrices();
    _updateAccBalances();
    _updateMMBalances();
  });
}



function _addFunding() {
  let amount = web3.utils.toWei(document.getElementById("AddLiquidityAmount").value);

  market.fpmm.addFunding(amount).then(() => {
    _totalSupply();
    _updatePrices();
    _updateMMBalances();
    _updateAccBalances();
  })
}

function _removeFunding() {
  let amount = web3.utils.toWei(document.getElementById("RemoveLiquidityAmount").value);
  market.fpmm.removeFunding(amount).then(receipt => {
    console.log(receipt);
    _totalSupply();
    _updateAccBalances();
    _updateMMBalances();
    _updatePrices();
  })
}


function _reportPayouts() {
  let questionId = document.getElementById("reportPayouts_questionId").value;
  let conditionId = document.getElementById("reportPayouts_conditionId").value;
  let payoutYes= document.getElementById("reportPayouts_payoutYes").value;
  let payoutNo= document.getElementById("reportPayouts_payoutNo").value;
  let payouts = [0,0];
  payouts[YESINDEX] = payoutYes;
  payouts[NOINDEX] = payoutNo;

  reportPayouts(questionId, payouts)
  .then(res => {
    console.log(res)
    resolveMarket(conditionId)
    .then(res => {
      console.log(res);
      _loadMarkets();
    })
  })

}

function _redeemPositions(){
  redeemPositions(COLLATERALTOKENCONTRACT, BYTES32ZERO,condition.conditionId, [1,2])
  .then(receipt => {
    // Get total payouts from receipt
    console.log(receipt);
    // Print total payouts to the interface
    console.log(receipt.events)
    console.log(receipt.events.PayoutRedemption)
    let redeemedTotal = receipt.events.PayoutRedemption.returnValues['5'];
    console.log("Redeemed Total: ",redeemedTotal);
    document.getElementById("redeemedTotal").textContent = "Redeemed Total: "+Number(web3.utils.fromWei(redeemedTotal)).toFixed(8);
    // Update balances
    _updateAccBalances();
  })
}