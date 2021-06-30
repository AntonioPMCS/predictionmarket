var markets = [];

// Please read the documentation @ https://docs.gnosis.io/conditionaltokens/
function openMarket(questionId, oracleAccount) {
  
  let condition = {};
  condition.collections = {};
  condition.positions = {};
  condition.outcomeSlotCount = 2;

  //solidity function signature: prepareCondition(address oracle, bytes32 questionId, uint outcomeSlotCount) 
  // The ascii representation of the questionId must have a maximum size of 32 bytes
  return session.getCT().methods.prepareCondition(oracleAccount, questionId, 2)
  .estimateGas({from: session.getAccount()})
  .then(gasEstimate => {
    return session.getCT().methods.prepareCondition(oracleAccount, questionId, 2)
    .send({from: session.getAccount(), gas: gasEstimate})
    .then((receipt) => {
      let retValues = receipt.events.ConditionPreparation.returnValues;
      console.log(retValues);
      condition.conditionId = retValues.conditionId;
      condition.questionId = retValues.questionId;

      return session.getCT().methods.getCollectionId(BYTES32ZERO, retValues.conditionId, 2).call() // 2 is the index set for Yes wins outcome
      .then((collectionId) => {
        condition.collections.yes = collectionId;
        console.log("YES collection ID = "+collectionId);

        return session.getCT().methods.getPositionId(COLLATERALTOKENCONTRACT, collectionId).call()
        .then((position) => {
          condition.positions.yes = position;

          return session.getCT().methods.getCollectionId(BYTES32ZERO, retValues.conditionId, 1).call() // 1 is the index set for No wins outcome
          .then((collectionId) => {
            console.log("NO collection ID = "+collectionId);
            condition.collections.no = collectionId;

            return session.getCT().methods.getPositionId(COLLATERALTOKENCONTRACT, collectionId).call()
            .then((position) => {
              condition.positions.no = position;
              
              return condition;
            })
          }) 
        })
      }) 
    })

  })
  
  
}


/*function BinaryMarket(_questionId, _conditionId, _positionYES, _positionNO, _collateral) {
  this.questionId = _questionId;
  this.conditionId = _conditionId;
  this.positionYES = _positionYES;
  this.positionNO = _positionNO;
}*/


function _outcomeSlotCount() {
  console.log("Inside outcomeSlotCount: ", document.getElementById("getOutcomeSlotCount_conditionId").value)
  session.getCT().methods.getOutcomeSlotCount(document.getElementById("getOutcomeSlotCount_conditionId").value)
  .call({from: session.getAccount()})
  .then((result) => {
    $("#output").prepend(">>> outcomeSlotCount: "+result+"<br>");
  })
}

function _balanceOfBatch() {
  console.log(document.getElementById("balanceOfBatch_addresses").value.split(','));
  session.getCT().methods.balanceOfBatch(document.getElementById("balanceOfBatch_addresses").value.split(','), document.getElementById("balanceOfBatch_positions").value.split(','))
  .call({from: session.getAccount()})
  .then((result) => {
    console.log(result);
    $("#output").prepend(">>> balaceOfBatch (YES): "+web3.utils.fromWei(result[YESINDEX])+"<br>");
    $("#output").prepend(">>> balaceOfBatch (NO): "+web3.utils.fromWei(result[NOINDEX])+"<br>");
  })
}

function getPositionId() {
  collectionId = document.getElementById("getPositionId_collectionId").value;
  collateralAddress = document.getElementById("getPositionId_collateralAddress").value;
  session.getCT().methods.getPositionId(collateralAddress, collectionId)
  .call({from: session.getAccount()})
  .then(res => {
    console.log(res);
  })
  .catch(err => {
    console.error(err);
  })
}

 /**
   * @param {string} account An address to get the balance of shares
   * @param {string} yesPositionId YES positionId can be obtained from the CT contract
   * @param {string} noPositionId NO positionId can be obtained from the CT contract
   * @returns {array} The account balance with great precision
*/
function getAccBalance(account, yesPositionId, noPositionId) {
  let positionIds = [0,0];
  positionIds[YESINDEX] = yesPositionId;
  positionIds[NOINDEX] = noPositionId;
  return session.getCT().methods.balanceOfBatch([account, account], positionIds).call({from: session.getAccount()})
}

function getAccPosition(account, positionId) {
  return session.getCT().methods.balanceOf(account, positionId).call({from: session.getAccount()})
}

function reportPayouts(questionId, payouts) {
  return session.getCT().methods.reportPayouts(questionId, payouts)
  .estimateGas({from: session.getAccount()})
  .then(gasEstimate => {
    return session.getCT().methods.reportPayouts(questionId, payouts)
    .send({from: session.getAccount(), gas: gasEstimate})
  })
  
}

function redeemPositions(collateralAddress = COLLATERALTOKENCONTRACT, parentCollectionId = BYTES32ZERO, conditionId, indexSets = [1,2]) {
  return session.getCT().methods.redeemPositions(collateralAddress, parentCollectionId, conditionId, indexSets)
  .estimateGas({from: session.getAccount()})
  .then(gasEstimate => {
    return session.getCT().methods.redeemPositions(collateralAddress, parentCollectionId, conditionId, indexSets)
    .send({from: session.getAccount(), gas: gasEstimate})
  })
}