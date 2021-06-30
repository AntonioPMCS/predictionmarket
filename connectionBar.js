document.getElementById("connectionBar").innerHTML = printConnectBar();

function handleAccountsChanged(accounts) {
   if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      console.log('Please connect to MetaMask.');
   } else if (accounts[0] !== this.currentAccount) {
      session.setAccount(accounts);
      document.getElementById("connectedAddress").innerHTML = session.getAccount();
   }
}

function handleChainChanged(accounts) {
   session.setChain(accounts[0]);
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

      ethereum.on('chainChanged', handleChainChanged);
      ethereum.on('accountsChanged',handleAccountsChanged); 

      document.getElementById("connectedNetwork").innerHTML = session.getChain();

      session.getTokenContract().methods.balanceOf(session.getAccount()).call()
      .then(res => { 
            console.log(`Logged account ${TOKENNAME} balance: `, web3.utils.fromWei(res))
      });
      pageInit();
   })
});

function printConnectBar() {
   return `<a id ="connectBtn" href='#' onclick="_loadTestCondition()" class="btn btn-primary">connect</a>
   <span id="connectedNetwork">Network</span>
   <span id="connectedAddress">Address</span>`
}