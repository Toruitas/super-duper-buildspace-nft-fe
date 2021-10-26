import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, {useEffect, useState} from "react";
import {ethers} from "ethers";
import myEpicNft from './utils/MyEpicNFT.json';

// Constants
const TWITTER_HANDLE = 'Stuart_Leitch';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/squarenft-tccenh4soi';
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = "0xeEFB9A7ac0D4f908f4c3690e48Af8441127095EE";

const App = () => {
  const [currentAccount, setCurrentAccount]=useState("");


  const checkIfWalletIsConnected = async () => { 
    const {ethereum} = window;

    if (!ethereum){
      console.log("Make sure you have metamask");
      return;
    }else{
      console.log("We have the ethereum object", ethereum);
    }

    let chainId = await ethereum.request({ method: 'eth_chainId'});
    console.log("Connected to chain " + chainId);

    // string, hex code of chainId of Rinkeby testnet
    const rinkebyChainId = "0x4";
    if (chainId !== rinkebyChainId){
      alert('You are not connected to the Rinkeby test network!');
      return
    }

    // check if we're auth'd to access users's wallet
    const accounts = await ethereum.request({method:'eth_accounts'});

    // if user has more than 1 authorized accounts, grab the first one
    if(accounts.length !== 0){
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
      // setup listener - this is for the case when they've come to our site and already connected + authorized
      setupEventListener();
    }else{
      console.log("No authorized account found");
    }

  }

  const connectWallet = async() =>{
    try {
      const { ethereum } = window;

      if(!ethereum){
        alert("Get metamask!");
        return;
      }

      // request access to account
      const accounts = await ethereum.request({method: "eth_requestAccounts"});
      // this'll print public address once MM is authrized
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      // setup listener for case where user comest o the site and connects for first time
      setupEventListener();
    }catch(error){
      console.log(error);
    }
  }

  const askContractToMintNft = async() =>{
    try{
      const { ethereum } = window;
      if (ethereum) {
        // MM provides us with Eth nodes in the background to talk to the contract
        // https://docs.ethers.io/v5/api/signer/#signers
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        // this is what creates the connection to our contract
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        console.log("Going to pop wallet now to pay gas")
        let nftTxn = await connectedContract.makeAnEpicNFT();

        console.log("Mining... please wait.");
        await nftTxn.wait();

        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`)
      }else{
        console.log("Ethereum obj doesn't exist!");
      }
    }catch(error){
      console.log(error)
    }
  }

  // setup listener
  const setupEventListener = async() =>{
    // mostly the same as our fn askContractToMintNft
    try{
      const { ethereum } = window;
      if (ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        // capture event when thrown by contrract
        // similar to webhooks
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) =>{
          console.log(from, tokenId.toNumber());
          alert(`Hey! The NFT is made and sent to your wallet. Might be blank, just wait, since it can take up to 10 mins to appear. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });

        console.log("Setup event listener!");

      }else{
        console.log("Ethereum obj doesn't exist!");
      }
    }catch(error){
      console.log(error)
    }
  }

  useEffect(()=>{
    checkIfWalletIsConnected();
  },[])


  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Metamask
    </button>
  );

  const renderConnectedContainer = () =>(
    <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
    Mint NFT
    </button>
  )

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Toru's NFT Collection</p>
          <p className="sub-text">
            Each identical. Each boring. Discover yet another NFT today.
          </p>
          {currentAccount === "" ? renderNotConnectedContainer(): renderConnectedContainer()}
          <a href="OPENSEA_LINK"><button className="cta-button connect-wallet-button">
          View collection
          </button>
          </a>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
