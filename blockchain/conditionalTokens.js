var markets = [];

// Please read the documentation @ https://docs.gnosis.io/conditionaltokens/
function openMarket(questionId, oracleAccount) {
  
  let condition = {};
  condition.collections = {};
  condition.positions = {};
  condition.outcomeSlotCount = 2;

  //solidity function signature: prepareCondition(address oracle, bytes32 questionId, uint outcomeSlotCount) 
  // The ascii representation of the questionId must have a maximum size of 32 bytes
  return ctcontract.methods.prepareCondition(oracleAccount, questionId, 2)
  .send({from: rinkebyAccount, gas: 6500000})
  .then((receipt) => {
    let retValues = receipt.events.ConditionPreparation.returnValues;
    console.log(retValues);
    condition.conditionId = retValues.conditionId;
    condition.questionId = retValues.questionId;

    return ctcontract.methods.getCollectionId(BYTES32ZERO, retValues.conditionId, 2).call() // 2 is the index set for Yes wins outcome
    .then((collectionId) => {
      condition.collections.yes = collectionId;
      console.log("YES collection ID = "+collectionId);
      return ctcontract.methods.getPositionId(COLLATERALTOKENCONTRACT, collectionId).call()
      .then((position) => {
        condition.positions.yes = position;

        return ctcontract.methods.getCollectionId(BYTES32ZERO, retValues.conditionId, 1).call() // 1 is the index set for No wins outcome
        .then((collectionId) => {
          console.log("NO collection ID = "+collectionId);
          condition.collections.no = collectionId;
          return ctcontract.methods.getPositionId(COLLATERALTOKENCONTRACT, collectionId).call()
          .then((position) => {
            condition.positions.no = position;
            return condition;
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
  ctcontract.methods.getOutcomeSlotCount(document.getElementById("getOutcomeSlotCount_conditionId").value)
  .call({from: rinkebyAccount})
  .then((result) => {
    $("#output").prepend(">>> outcomeSlotCount: "+result+"<br>");
  })
}

function _balanceOfBatch() {
  console.log(document.getElementById("balanceOfBatch_addresses").value.split(','));
  ctcontract.methods.balanceOfBatch(document.getElementById("balanceOfBatch_addresses").value.split(','), document.getElementById("balanceOfBatch_positions").value.split(','))
  .call({from: rinkebyAccount})
  .then((result) => {
    console.log(result);
    $("#output").prepend(">>> balaceOfBatch (YES): "+web3.utils.fromWei(result[YESINDEX])+"<br>");
    $("#output").prepend(">>> balaceOfBatch (NO): "+web3.utils.fromWei(result[NOINDEX])+"<br>");
  })
}

function getPositionId() {
  collectionId = document.getElementById("getPositionId_collectionId").value;
  collateralAddress = document.getElementById("getPositionId_collateralAddress").value;
  ctcontract.methods.getPositionId(collateralAddress, collectionId)
  .call({from: rinkebyAccount})
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
  return ctcontract.methods.balanceOfBatch([account, account], positionIds).call({from: rinkebyAccount})
}

function getAccPosition(account, positionId) {
  return ctcontract.methods.balanceOf(account, positionId).call({from: rinkebyAccount})
}

function reportPayouts(questionId, payouts) {
  return ctcontract.methods.reportPayouts(questionId, payouts)
          .send({from: rinkebyAccount, gas: 3000000})
}

function redeemPositions(collateralAddress = COLLATERALTOKENCONTRACT, parentCollectionId = BYTES32ZERO, conditionId, indexSets = [1,2]) {
  return ctcontract.methods.redeemPositions(collateralAddress, parentCollectionId, conditionId, indexSets)
  .send({from: rinkebyAccount, gas: 6500000})
}