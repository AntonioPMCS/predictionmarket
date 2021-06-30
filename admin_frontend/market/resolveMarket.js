var market;

// Page init is called at $document.onReady by connectionBar.js
function pageInit() {
  const urlParams = new URLSearchParams(window.location.search);
    market = {
        conditionId: urlParams.get('conditionId'),
        questionId: urlParams.get('questionId'),
        title: urlParams.get('title'),
        oracle: urlParams.get('oracle'),
    }

    document.getElementById("marketTitle").innerText = market.title;
    document.getElementById("marketConditionId").innerText = market.conditionId;
    document.getElementById("marketOracle").innerText = market.oracle;
}

/**
 * @notice A payout is a number given to each outcome. A market can have several outcomes with 1 as a payout. 
 * This means more than 1 option is true in the end. At least one outcome must have a payout of 1.
 * In its simplest form:
 * - If it is 0, the outcome is false.
 * - If it is 1, the outcome is true.
 * However, this number is actually used to calculate the proportion of the reward attributed to each outcome. 
 * For example, if payout[A] = 0 and payout[B] = 1 then holders of outcome A get all of the reward and B gets 0.
 * For example, if payout[A] = 1 and payout[B] = 1 the reward is distributed fifty-fifty.
 * For example, if payout[A] = 1 and payout[B] = 2 then B gets double the reward as A. So B gets 2/3 and A gets 1/3.  
 */
function _resolveMarket() {  
    try {
      if (market.oracle !== session.getAccount())  {
        throw Error("Only the market's oracle address can resolve a market. Connect the oracle on Metamask and try again.")
      } else {
        let payoutYes= document.getElementById("resolveYesPayout").value;
        let payoutNo= document.getElementById("resolveNoPayout").value;
        let payouts = [0,0];
        payouts[YESINDEX] = payoutYes;
        payouts[NOINDEX] = payoutNo;
      
        reportPayouts(market.questionId, payouts)
        .then(res => {
          console.log(res)
          DB.resolveMarket(market.conditionId)
          .then(res => {
            console.log(res);
            window.location.replace("../index.html")
          })
        })
      } 
    } catch(error) {
      alert(error)
      throw Error(error);
    }   
}