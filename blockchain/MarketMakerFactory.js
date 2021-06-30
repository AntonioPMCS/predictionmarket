class MarketMakerFactory extends Contract {

    constructor(abi, address) {
        super(abi,address);
    }

    /**
     * 
     * @param {*} conditionId The id of the market where this MM will trade
     * @param {*} saltNonce 
     */
    createMM (saltNonce, CTContract, tokenAddress, conditionIdArray, fee, initialLiquidity, distHint) {
      // Approve mmfactoryContract to withdraw LOCK on behalf of msg.sender
      return session.getTokenContract().methods.approve(this.getAddress(), web3.utils.toWei(initialLiquidity.toString()))
      .estimateGas({from: session.getAccount()})
      .then(gasEstimate => {
        return session.getTokenContract().methods.approve(this.getAddress(), web3.utils.toWei(initialLiquidity.toString()))
        .send({from: session.getAccount(), gas: gasEstimate})
        .then(() => {

          return this.contract.methods.create2FixedProductMarketMaker(saltNonce, CTContract, tokenAddress, conditionIdArray, fee, initialLiquidity, distHint)
          .estimateGas({from: session.getAccount()})
          .then(gasEstimate => {
            return this.contract.methods.create2FixedProductMarketMaker(saltNonce, CTContract, tokenAddress, conditionIdArray, fee, initialLiquidity, distHint)
            .send({from: session.getAccount(), gas: gasEstimate})
          })
        });
      })
      
    }
}