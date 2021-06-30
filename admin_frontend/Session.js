class Session {
  constructor() {
    try {
      if (typeof window.ethereum !== "undefined") {
        window.web3 = new Web3(window.ethereum);
        this.loadToken(); 
        this.loadCT();
      } else {
        alert("Please install Metamask and refresh")
      } 
    } catch (err){
      alert(err+" Correct the issue and refresh the page.");
      throw(Error(err));
   }

  }

  async init(callback) {
    // Ask the user to connect an Account
    window.ethereum.request({ method: 'eth_requestAccounts' })
    .then((accounts) => { 
      this.setAccount(accounts)
      // Fetch the connected account Network ID
      window.ethereum.request({ method: 'eth_chainId' })
      .then((chainId) => { 
        this.setChain(chainId)
        callback.bind(this)();
      })  
      .catch((error => {
        console.error(error)
        throw(error)
      }))
    })
    .catch((error) => {
      if (error.code === 4001) {
        // EIP-1193 userRejectedRequest error
        alert("Connection rejected by user. Please refresh and try again.")
      } else {
        console.error(error);
      }
    });
  }

  /**
    * Load methods instantiate a javascript object that wraps around a
    * blockchain contract. Interactions with this object are translated
    * into real blockchain transactions via the "web3" library.
    *  */ 
  /** 
   * @notice: Collateral token contract used as currency to trade in the markets
   **/
  loadToken() {
    this.tokenContract = new web3.eth.Contract(collateralTokenABI, COLLATERALTOKENCONTRACT);
  }

    /** 
   * @notice: Conditional Tokens(CT) stores market balances. Each market is a Condition that can have many Tokens (outcomes)
   **/
  loadCT() {
    this.CTContract = new web3.eth.Contract(conditionalTokensABI, CTCONTRACTRINKEBY);
  }

    /** 
   * @notice: Market Makers (MM) facilitate trades by owning both collateral and conditional tokens. 
   *          Each Market has its own. 
   **/
  loadMM(mmAddress) {
      this.mmContract = new web3.eth.Contract(fpmmABI, mmAddress);
  }

  /** 
   * @notice: The Market Maker Factory (MMF) contract has a method to create Market Makers
   **/
  loadMMF() {
    this.mmFactoryContract = new MarketMakerFactory(FPMMFactoryABI, FPMMFACTORYCONTRACT)
  }
   

  ///////////// ----------- Setters ------------ \\\\\\\\\\\\\\\

  setAccount(accounts) {
    this.currentAccount = accounts[0];
  }

  setChain(chainId) {
    console.log("ChainId: "+chainId)
    switch (chainId) {
      case "0x1":
        this.chain = "Mainnet";
        break;
      case "0x3":
        this.chain = "Ropsten";
        break;
      case "0x4":
        this.chain = "Rinkeby";
        break;
      case "0x5":
        this.chain = "Goerli";
        break;
      default:
        this.chain = "Unknown Chain. Id: "+chainId;
    }
  }

  ///// ------------------------------------------------------------- \\\\
  ////////////// ----------- Getters ------------ \\\\\\\\\\\\\\\

  getAccount() {
      return this.currentAccount;
  } 

  getChain() {
    return this.chain;
  }

  getTokenContract() {
    return this.tokenContract;
  }

  getCT() {
    return this.CTContract;
  }

  getMMF() {
    return this.mmFactoryContract;
  }

  getMM() {
    return this.mmContract;
  }
  ///// ------------------------------------------------------------- \\\\
}