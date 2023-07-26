var metaconnected = false;
let choice; 
let selectedCoin = false;
let winner = false;
let allowance = 0; 
let gameResults = {};
let betID;
let selectedToken = 'wojak';
let decimals;
let balance;

 // Unpkg imports
 const Web3Modal = window.Web3Modal.default;
 const WalletConnectProvider = window.WalletConnectProvider.default;
 const evmChains = window.evmChains;

  // Web3modal instance
  let web3Modal
 
  // Chosen wallet provider given by the dialog window
  let provider;
  
  
  // selectedAccount of the selected account
  let selectedAccount;

 // Create an instance of Notyf
var notyf = new Notyf({
  duration: 3000,
  position: { x: 'right', y: 'bottom' }
});

const gameResultModal = document.getElementById('game-result-modal');
const gameResultText = document.getElementById('game-result');
const gameAmountText = document.getElementById('game-amount');
const closeModalButton = document.getElementById('close-modal');


// Event listener for the close modal button
closeModalButton.addEventListener('click', closeModal);

const darkTheme = {
    background: 'rgb(40, 40, 40)',
    main: 'rgb(230, 230, 230)',
    secondary: 'rgb(180, 180, 180)',
    border: 'rgb(100, 100, 100)',
    hover: 'rgb(70, 70, 70)',
};

function init() {  
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
            rpc: {
                25: 'https://evm-cronos.crypto.org/'
            },
            chainId: 25
        }
      }
    };
  
    web3Modal = new Web3Modal({
      cacheProvider: false, 
      providerOptions, 
      disableInjectedProvider: false,
      theme: darkTheme, 
    });
  
    console.log("Web3Modal instance is", web3Modal);
}


async function checkChain() {
	const chainId = await ethereum.request({ method: 'eth_chainId' });
  
	if (chainId !== '0x19'){ notyf.error('Please switch to the Cronos MainNet');disconnectWallet();}
	else{ connectWallet();}
}

async function disconnectWallet(){
  const connectButton = document.getElementById("connect-button");
  if (metaconnected) {
    await web3Modal.clearCachedProvider();
    metaconnected = false;
    connectButton.textContent = "Connect Wallet";
    return;
  }
}

async function connectWallet() {
  console.log("Opening a dialog", web3Modal);
  const connectButton = document.getElementById("connect-button");
  
  if (metaconnected) {
      await web3Modal.clearCachedProvider();
      metaconnected = false;
      connectButton.textContent = "Connect Wallet";
      return;
    }
  else{
  try {
    provider = await web3Modal.connect();
  } catch(e) {
    console.log("Could not get a wallet connection", e);
  notyf.error(e);
    return;
  }
      }
  provider.on("accountsChanged", (accounts) => {
    fetchAccountData();
  });

  provider.on("chainChanged", (chainId) => {
    checkChain();
  });

 

  await refreshAccountData();
}


function sideChoice() {
  const headsButton = document.getElementById('heads-button');
  const tailsButton = document.getElementById('tails-button');

  headsButton.addEventListener('click', () => { headsButton.classList.add('selected'); tailsButton.classList.remove('selected'); choice = 0; selectedCoin = true; });
  tailsButton.addEventListener('click', () => { tailsButton.classList.add('selected'); headsButton.classList.remove('selected'); choice = 1; selectedCoin = true; });
}


async function fetchAccountData() {

  web3 = new Web3(provider);
  coinflipSmartContract = getTokenContract('coinflip');

 console.log("Web3 instance is", web3);
 console.log(selectedToken);

 const selectedContract = getTokenContract(selectedToken);


 const accounts = await web3.eth.getAccounts();

 console.log("Got accounts", accounts);
 selectedAccount = accounts[0];

 getBalance();

 notyf.success(`Connected with address\n ${selectedAccount}`);

const connectButton = document.getElementById('connect-button');
connectButton.innerHTML = selectedAccount.slice(0, 2) + '...' + selectedAccount.slice(-4)+" / Disconnect";
metaconnected = true;
}

async function refreshAccountData() {
  document.querySelector("#connect-button").setAttribute("disabled", "disabled")
  await fetchAccountData(provider);
  document.querySelector("#connect-button").removeAttribute("disabled")
}

async function setMaxBet() {
  try {
    const gameToken = tokenContracts[selectedToken].address;
    const selectedContract = getTokenContract(selectedToken);
    const maxBetAmount = await coinflipSmartContract.methods._maxBetForToken(gameToken).call();
    const decimals = await selectedContract.methods.decimals().call();
    const balanceInToken = maxBetAmount / 10 ** decimals;

    const formatter = new Intl.NumberFormat('en-US');
    const formattedValue = formatter.format(balanceInToken);

    const betAmountField = document.getElementById('bet-amount-field');
    betAmountField.value = formattedValue;
  } catch (e) {
    console.log(e);
    notyf.error(e);
  }
}

async function setMinBet() {
  try {
    const gameToken = tokenContracts[selectedToken].address;
    const selectedContract = getTokenContract(selectedToken);
    const minBetAmount = await coinflipSmartContract.methods._minBetForToken(gameToken).call();
    const decimals = await selectedContract.methods.decimals().call();
    const balanceInToken = minBetAmount / 10 ** decimals;

    const formatter = new Intl.NumberFormat('en-US');
    const formattedValue = formatter.format(balanceInToken);

    const betAmountField = document.getElementById('bet-amount-field');
    betAmountField.value = formattedValue;
  } catch (e) {
    console.log(e);
    notyf.error(e);
  }
}

function displayGameResult(betID) {
  const gameResult = gameResults[betID];
  notyf.success('Bet Placed!');
  if (gameResult) {
    console.log(`Game ${betID} finished with winner: ${gameResult.winner} for token ${gameResult.token} with wager ${gameResult.wager}`);
    displayResult(gameResult.winner, gameResult.wager);
  } else {
    console.log(`Result for game ${betID} is not available.`);
  }
}

function displayResult(winner, wager) {
  const modal = document.getElementById('game-result-modal');
  const resultText = document.getElementById('game-result');
  const amountText = document.getElementById('game-amount');
  const gifImage = document.getElementById('myGif');
  
  const confettiContainer = document.getElementById('confetti-container');

  const wagerInToken = wager / 10 ** decimals;
  const winWager = wagerInToken*1.95;
  const formatter = new Intl.NumberFormat('en-US');
  const formattedValue = formatter.format(wagerInToken);
  const formattedWins = formatter.format(winWager);

  choice === 0
    ? winner
      ? gifImage.setAttribute('src', 'lib/src/media/wojakFlip.gif')
      : gifImage.setAttribute('src', 'lib/src/media/croFlip.gif')
    : winner
    ? gifImage.setAttribute('src', 'lib/src/media/croFlip.gif')
    : gifImage.setAttribute('src', 'lib/src/media/wojakFlip.gif');


    gifImage.onload = () => {
      const gifDuration = 5000;
      setTimeout(() => {
        if (winner) {
          resultText.textContent = 'Congratulations! You Won!';
          amountText.textContent = `You won ${formattedWins.toLocaleString()} ${selectedToken.toUpperCase()}.`;
          confettiAnimation();
        } else {
          resultText.textContent = 'Sorry! You Lost.';
          amountText.textContent = `You lost ${formattedValue.toLocaleString()} ${selectedToken.toUpperCase()}.`;
          shakeAnimation();
        }
        modal.style.display = 'flex';
        getBalance();
      }, gifDuration);
    };


}

function shakeAnimation() {
  const modal = document.getElementById('game-result-modal');
  modal.classList.add('animate__animated', 'animate__headShake');

  // Remove the shake animation class after the animation ends
  modal.addEventListener('animationend', () => {
    modal.classList.remove('animate__animated', 'animate__headShake');
  });
}

function confettiAnimation() {
  const duration = 3 * 1000; // 3 seconds
  const animationEnd = Date.now() + duration;
  const interval = 75;

  (function confettiLoop() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return;
    }

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });

    setTimeout(confettiLoop, interval);
  })();
}

async function placeBet() {

  if(!checkConnection()){
    return;
  }
  else{
  if (!selectedCoin) {
    notyf.error('Please select a coin before placing a bet.');
    return;
  }
  const betAmountField = document.getElementById('bet-amount-field');
  if (!betAmountField.value) {
    notyf.error('Please enter a bet amount');
    return;
  }

  const placeBetButton = document.getElementById('glass-button-bet');
  placeBetButton.disabled = true;
  placeBetButton.innerHTML = 'Placing Bet...';

  let wager = ethers.utils.parseUnits(getNumericValue(), decimals).toString();
  const side = choice;

	const gameToken = tokenAddresses[selectedToken];
  const selectedContract = getTokenContract(selectedToken);
  coinflipSmartContract = getTokenContract('coinflip');

  const tokenBalance = await selectedContract.methods.balanceOf(tokenContracts.coinflip.address).call();
  const requiredBalance = wager*2;
  if (Number(tokenBalance) < Number(requiredBalance)) {
    notyf.error('Insufficient balance in the contract for the selected token!<br>Try to lower your bet');
    placeBetButton.innerHTML = 'Place Bet';
    placeBetButton.disabled = false;
    return;
  }

  const accounts = await web3.eth.getAccounts();
  const owner = accounts[0];
  const spender = tokenContracts.coinflip.address;

  let gasEstimation;
  const minBetAmount = await coinflipSmartContract.methods._minBetForToken(gameToken).call();
 
  if(Number(wager) < Number(minBetAmount)){
    notyf.error('This wager is lower than the minimum bet for this token');
    placeBetButton.innerHTML = 'Place Bet';
    placeBetButton.disabled = false;
    return;
  }

  const allowance = await selectedContract.methods.allowance(owner, spender).call();
  const allow = allowance.toString();
  if (Number(allow) <= Number(wager)) {
    try {
      await selectedContract.methods.approve(tokenContracts.coinflip.address, wager).send({ from: selectedAccount })
        .on('error', function (error) {
          if (error.code === 4001) {
            notyf.error('User rejected the transaction');
            placeBetButton.innerHTML = 'Place Bet';
            placeBetButton.disabled = false;
            return;
          } else {
            notyf.error(formatEthErrorMsg(error));
            placeBetButton.innerHTML = 'Place Bet';
            placeBetButton.disabled = false;
            return;
          }
        });
    } catch (e) {
      notyf.error(e);
    }
  }
  const percentage = 1.05; // 5% increase
  gasEstimation = await coinflipSmartContract.methods.enterGame(wager, side, gameToken).estimateGas({
    from: selectedAccount
  });

  const adjustedGasEstimation = Math.ceil(gasEstimation * percentage);

  const gameTransaction = await coinflipSmartContract.methods.enterGame(wager, side, gameToken).send({ from: selectedAccount})
    .on('error', function (error) {
    if (error.code === 4001) {
      notyf.error('User rejected the transaction');
      placeBetButton.innerHTML = 'Place Bet';
      placeBetButton.disabled = false;
      return;
    } else {
      notyf.error('Error:', error);
      placeBetButton.innerHTML = 'Place Bet';
      placeBetButton.disabled = false;
      return;
    }
  });
  

  placeBetButton.innerHTML = 'Awaiting Confirmations...';
  
  console.log('Entered the game with wager of: ', wager, 'choice: ', side, 'for token: ', selectedToken);

  const contractABI = coinflipSmartContract.options.jsonInterface;
  const eventName = 'GameFinished'; 

  const receipt = await web3.eth.getTransactionReceipt(gameTransaction.transactionHash);

  const eventAbi = contractABI.find((abi) => abi.type === 'event' && abi.name === eventName);
  if (eventAbi) {
    const logsWithEvent = receipt.logs.filter((log) => log.address === coinflipSmartContract.options.address);
    logsWithEvent.forEach((log) => {
      if (log.topics.length > 0 && log.data) {
        try {
          const decodedLog = web3.eth.abi.decodeLog(eventAbi.inputs, log.data, log.topics.slice(1));
          betID = decodedLog.id;
        } catch (error) {
        }
      }
    });
  }

  const gameValue = await coinflipSmartContract.methods._games(betID).call();
  winner = gameValue.winner;
  const token = gameValue.token;
  wager = gameValue.wager;
  const finished = gameValue.finished;
  gameResults[betID] = { winner, token, wager, finished };
  
  setTimeout(() => { displayGameResult(betID); placeBetButton.innerHTML = 'Place Bet'; placeBetButton.disabled = false; }, 4000);
}}
	
function resultMessage() {
  setTimeout(() => {
    var notyff = new Notyf({
      duration: 4000,
    });
    notyff.open({
      type: winner ? 'success' : 'error',
      message: winner ? 'Congrats you won!' : 'Sorry you lost the flip! :(',
    });
    getBalance();
  }, 5000);
}

async function getBalance(){

  const selectedContract = getTokenContract(selectedToken);

  balance = await selectedContract.methods.balanceOf(selectedAccount).call();
	decimals = await selectedContract.methods.decimals().call();

  const balanceInToken = balance / 10 ** decimals;

  const balanceSpan = document.getElementById("balance");
  balanceSpan.textContent = balanceInToken.toLocaleString('en-US');
}

function checkConnection() {
  if (!metaconnected) {
    notyf.error('Please connect your Wallet to use this dApp');
    return false; 
  }
  return true; 
}
const betAmountField = document.getElementById('bet-amount-field');

betAmountField.addEventListener('input', function(event) {
  const inputValue = event.target.value.replace(/,/g, '');

  const formatter = new Intl.NumberFormat('en-US');

  if (inputValue === '' || isNaN(inputValue)) {
    event.target.value = ''; 
  } else {
    const formattedValue = formatter.format(inputValue);

    event.target.value = formattedValue;
  }
});

function getNumericValue() {
  return betAmountField.value.replace(/,/g, '');
}

function selectToken() {
	const tokenSelect = document.getElementById("token");
  
	tokenSelect.addEventListener("change", function() {
	  selectedToken = tokenSelect.value;
    if(metaconnected){
	  getBalance();
    }
	});
}

function closeModal() {
  gameResultModal.style.display = 'none';
}

function formatEthErrorMsg(error) {
  try {
      var eFrom = error.message.indexOf("{");
      var eTo = error.message.lastIndexOf("}");
      var eM1 = error.message.indexOf("TokenStaking: ");
      var eM2 = error.message.indexOf("ERC20 : ");
      var eM4 = error.message.indexOf("Internal JSON-RPC error");

      if (eFrom != -1 && eTo != -1 && (eM1 != -1 || eM2 != -1)) {
          var eMsgTemp = JSON.parse(error.message.substr(eFrom, eTo));
          var eMsg = (eM4 != -1) ? eMsgTemp.message : eMsgTemp.originalError.message;

          if(eM1 != -1) {
              return eMsg.split('TokenStaking: ')[1];
          } else {
              return eMsg.split('ERC20 : ')[1];
          }
      } else {
          return error.message;
      }
  } catch (e) {
      console.log(e)
      return "Something Went Wrong!";
  }
}