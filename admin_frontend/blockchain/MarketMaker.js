

class MarketMaker extends Contract {
    
    constructor(abi, address) {
        super(abi, address)
    }

    totalSupply() {
        return this.contract.methods.totalSupply().call({from: session.getAccount()})
    }
    
    /**
     * @param {*} outcomeIndex 0 or 1, the YESINDEX or NOINDEX constants
     * @returns {BigNumber} The price with great precision
    */
    calcSharePrice(outcomeIndex) {
        let tinyAmount = web3.utils.toWei('0.0000000001');
        return this.contract.methods.calcBuyAmount(tinyAmount, outcomeIndex).call({from: session.getAccount()})
                .then((res) => {
                    return (new BigNumber(tinyAmount)).div((new BigNumber(res)))
                })
    }

    /**
     * @param {string} account The address of the account of the Liquidity Provider
     * @returns {string} The blockchain address of the MarketMaker contract
    */
    getAccLiquidity(account) {
        return this.contract.methods.balanceOf(account).call({from: session.getAccount()})
    }

    /**
     * @param {string} input An amount of currency being used to buy
     * @param {0 or 1} outcomeIndex Which outcome is being bought
     * @returns {string} An estimation of how many shares that amount of currency can buy
    */
    calcBuyAmount(input, outcomeIndex) {
        return this.contract.methods.calcBuyAmount(web3.utils.toWei(input.value), outcomeIndex)
                .call({from: session.getAccount()})
    }

    /**
     * @param {0 or 1} outcomeIndex Which outcome is being bought
     * @param {string} amount Amount of currency being used to buy
     * @returns {string} An estimation of how many shares that amount of currency can buy
    */
    buy(outcomeIndex, amount) {
        return session.getTokenContract().methods.approve(this.contract._address, web3.utils.toWei(amount))
        .estimateGas({from: session.getAccount()})
        .then(gasEstimate => {
            return session.getTokenContract().methods.approve(this.contract._address, web3.utils.toWei(amount))
            .send({from: session.getAccount(), gas: gasEstimate})
            .then((result) => {
                console.log(result);
                console.log("Form input number: ", amount)
                return this.contract.methods.buy(web3.utils.toWei(amount), outcomeIndex, 1) //1 is minimum tokens to buy
                .estimateGas({from: session.getAccount()})
                .then(gasEstimate => {
                    return this.contract.methods.buy(web3.utils.toWei(amount), outcomeIndex, 1) //1 is minimum tokens to buy
                    .send({from: session.getAccount(), gas: gasEstimate})
                })
            })
        })
    }

    /**
     * 
     * @param input The amount of LOCK a user wants back
     * @param outcomeIndex Which type of shares the user is selling (Yes or No shares)
     * @return How many shares a user will need to sell if he wants a profit equal to [input] LOCK.
     */
    calcSellAmount(amount, outcomeIndex) {
        return this.contract.methods.calcSellAmount(web3.utils.toWei(amount, "ether"), outcomeIndex) //assumes 18 decimals
        .call({from: session.getAccount()})
    }

    /**
     * @dev Fees are not being taken into consideration in the formula yet.
     *     18 decimal values returned by the contract are shrinked fromWei. This
     *      results in less accuracy when determining the roots.
     * 
     * @param amount The amount of shares a user wants to sell
     * @param outcomeIndex
     */
    calcSellCollateral(amount, outcomeIndex) {
        let positionIds = [0,0];
        positionIds[YESINDEX] = market.positions.collateralYes;
        positionIds[NOINDEX] = market.positions.collateralNo;
        return session.getCT().methods.balanceOfBatch([this.contract._address,this.contract._address],positionIds)
        .call( {from: session.getAccount() })
        .then(result => {
            let balancesSMALL = result.map(x => web3.utils.fromWei(x));
            let sellReserves = balancesSMALL[outcomeIndex]
            let otherReserves = balancesSMALL[Math.abs(outcomeIndex - 1)]
            function f(x) { return (sellReserves*otherReserves + (otherReserves-x)*x + (-sellReserves-amount)*(otherReserves-x))}
            return Math.round(newtonRaphson(f, 0) * 10000) / 10000; //Rounding might cause errors. TODO: implement newtonRaphson with bignumbers.js
        })
    }

    /**
     * @param outcomeIndex Which type of shares the user is selling (Yes or No shares)
     * @param returnAmount How much currency the user expects to receive by selling the shares
     */
    sell(outcomeIndex, returnAmount) {
        return session.getCT().methods.setApprovalForAll(this.contract._address, true)
        .estimateGas({from: session.getAccount()})
        .then(gasEstimate => {
            return session.getCT().methods.setApprovalForAll(this.contract._address, true)
            .send({from: session.getAccount(), gas: gasEstimate})
            .then(result => {
                return this.contract.methods.sell(web3.utils.toWei(returnAmount), outcomeIndex, web3.utils.toWei(returnAmount)+web3.utils.toWei('1'))
                .estimateGas({from: session.getAccount()})
                .then(gasEstimate => {
                    return this.contract.methods.sell(web3.utils.toWei(returnAmount), outcomeIndex, web3.utils.toWei(returnAmount)+web3.utils.toWei('1'))
                    .send({from: session.getAccount(), gas: gasEstimate})
                })
            });
        })
        
    }


    /**
     * @param amount The amount of Liquidity (in tokens) being provided to the AMM
     */
    addFunding(amount) {
        return session.getTokenContract().methods.approve(this.contract._address, amount)
        .estimateGas({from: session.getAccount()})
        .then(gasEstimate => {
            return session.getTokenContract().methods.approve(this.contract._address, amount)
            .send({from: session.getAccount(), gas: gasEstimate})
            .then(() => {

                return this.contract.methods.addFunding(amount, [])
                .estimateGas({from: session.getAccount()})
                .then(gasEstimate => {
                    return this.contract.methods.addFunding(amount, [])
                    .send({from: session.getAccount(), gas: gasEstimate})
                })
            })
        })
    }

    /**
     * @notice If the user tries to withdraw an amount bigger than what the AMM
     * currently possesses, the transaction will revert with an error. 
     * @param amount The amount of Liquidity (in shares) being removed from the AMM
     */
    removeFunding(amount) {
        // Get the shares back from the market maker
        return  this.contract.methods.removeFunding(amount)
        .estimateGas({from: session.getAccount()})
        .then(gasEstimate => {
            return this.contract.methods.removeFunding(amount)
            .send({from: session.getAccount(), gas: gasEstimate})
            .then(receipt => {
                console.log(receipt);
                // Get the conditionId from the marketMaker itself avoids errors
                return this.contract.methods.conditionIds(0).call()
                .then(conditionId => {  
                    // Converts the senders' shares back to LOCK (collateral)
                    var basicPartition = [1,2] // See https://docs.gnosis.io/conditionaltokens/docs/ctftutorial07/
                    
                    return session.getCT().methods.mergePositions(COLLATERALTOKENCONTRACT, BYTES32ZERO, conditionId, basicPartition, amount)
                    .estimateGas({from: session.getAccount()})
                    .then(gasEstimate => {
                        return session.getCT().methods.mergePositions(COLLATERALTOKENCONTRACT, BYTES32ZERO, conditionId, basicPartition, amount)
                        .send({from: session.getAccount(), gas: gasEstimate})
                    })   
                })
            })
        })
    }
}
    