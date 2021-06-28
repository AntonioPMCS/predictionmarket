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
      return tokenContract.methods.approve(this.getAddress(), web3.utils.toWei(initialLiquidity.toString()))
      .send({from: rinkebyAccount})
      .then(() => {
        return this.contract.methods.create2FixedProductMarketMaker(saltNonce, CTContract, tokenAddress, conditionIdArray, fee, initialLiquidity, distHint)
        .send({from: rinkebyAccount, gas: 6500000})
      });
    }
}