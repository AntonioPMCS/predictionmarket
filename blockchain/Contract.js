class Contract {

    constructor(abi, address) {
        this.address = address;
        this.contract = new web3.eth.Contract(abi, address);
    }

    /**
     * @returns {Address} The blockchain address of the MarketMaker contract
    */
    getAddress() {
        return this.address;
    }

}