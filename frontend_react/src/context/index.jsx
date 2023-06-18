import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { ABI, ADDRESS } from '../contract';
import { useNavigate } from 'react-router-dom';

const {REACT_APP_ALCHEMY_MUMBAI_RPC_URL} = process.env;
const GlobalContext = createContext();


export const GlobalContextProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState('');
  const [battleGround, setBattleGround] = useState('');
  const [contract, setContract] = useState(null);
  //const [provider, setProvider] = useState(null);
  const [isPlayer, setIsPlayer] = useState(null);
  const [showAlert, setShowAlert] = useState({ status: false, type: 'info', message: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [updateEvent, setUpdateEvent] = useState(false);
  const [updateTokens, setUpdateTokens] = useState(false);
  const [disableStartBTN, setDisableStartBTN] = useState(true);
  const [updateMove, setUpdateMove] = useState(false);
  const [signer, setSigner] = useState(null);
  const navigate = useNavigate();

  //ethers.js v6
  // const connectWallet = async () => {
  //   if (window.ethereum) {
  //     const newProvider = new ethers.BrowserProvider(window.ethereum);
  //     const accounts = await newProvider.send("eth_requestAccounts", []);
  //     setWalletAddress(accounts[0]);
  //     const signer = await newProvider.getSigner();
  //     window.localStorage.setItem("connected", accounts[0]);
  //     const newContract = new ethers.Contract(ADDRESS, ABI, signer);
  //     setProvider(newProvider);
  //     setContract(newContract);
  //     const isPlayer = await newContract.isPlayer(accounts[0]);
  //     setIsPlayer(isPlayer);
  //   } else {
  //       setErrorMessage("Please Install MetaMask!!!");
  //   }
  // }

  //ethers.js v5  
  const connectWallet = async () => {
    if (window.ethereum) {
      const alchemyProvider = new ethers.providers.JsonRpcProvider(REACT_APP_ALCHEMY_MUMBAI_RPC_URL);
      //const newProvider = new ethers.providers.AlchemyProvider('maticmum',ALCHEMY_MUMBAI_API_KEY);
      //console.log('Alchemy', alchemyProvider);
      const walletProvider = new ethers.providers.Web3Provider(window.ethereum)
      //console.log('wallet', walletProvider);
      const accounts = await walletProvider.send("eth_requestAccounts", []);
      const signer = walletProvider.getSigner()
      //console.log('signer', signer);
      //const signer = new ethers.Wallet(PRIVATE_KEY, newProvider);
      setWalletAddress(accounts[0]);
      window.localStorage.setItem("connected", accounts[0]);
      //const newContract = new ethers.Contract(ADDRESS, ABI, signer);
      const newContract = new ethers.Contract(ADDRESS, ABI, alchemyProvider);
      //console.log('contract', newContract);
      setContract(newContract);
      setSigner(signer);
      const isPlayer = await newContract.isPlayer(accounts[0]);
      setIsPlayer(isPlayer);
    } else {
      setErrorMessage("Please Install MetaMask!!!");
    }
  }

  // ethers.js v6
  // const restore = async () => {
  //   const newProvider = new ethers.BrowserProvider(window.ethereum);
  //     const account = window.localStorage.getItem("connected");
  //     setWalletAddress(account);
  //     const signer = await newProvider.getSigner();
  //     const newContract = new ethers.Contract(ADDRESS, ABI, signer);
  //     setContract(newContract);
  //     setProvider(newProvider);
  //     const isPlayer = await newContract.isPlayer(account);
  //     setIsPlayer(isPlayer);
  // }

  //ethers.js v5  
  const restore = async () => {
    const alchemyProvider = new ethers.providers.JsonRpcProvider(REACT_APP_ALCHEMY_MUMBAI_RPC_URL);
    //console.log('AlchemyR', alchemyProvider);
    const walletProvider = new ethers.providers.Web3Provider(window.ethereum)
    //console.log('walletR', walletProvider);
    const account = window.localStorage.getItem("connected");
    setWalletAddress(account);
    const signer = walletProvider.getSigner()
    //console.log('signerR', signer);
    //const newContract = new ethers.Contract(ADDRESS, ABI, signer);
    const newContract = new ethers.Contract(ADDRESS, ABI, alchemyProvider);
    //console.log('contractR', newContract);
    setContract(newContract);
    setSigner(signer);
    const isPlayer = await newContract.isPlayer(account);
    setIsPlayer(isPlayer);
  }

  //* Set the wallet address to the state
  //ethers.js v6
  // const updateAddress = async (accounts) => {
  //   if (accounts.length === 0) {
  //     window.localStorage.removeItem("connected");
  //     setWalletAddress(null);
  //     setContract(null);
  //     setIsPlayer(false);
  //   } else if (accounts[0] === walletAddress) {
  //     return;
  //   } else {
  //     setWalletAddress(accounts[0]);
  //     window.localStorage.setItem("connected", accounts[0]);
  //     const newProvider = new ethers.BrowserProvider(window.ethereum);
  //     const signer = await newProvider.getSigner();
  //     const newContract = new ethers.Contract(ADDRESS, ABI, signer);
  //     setContract(newContract);
  //     setProvider(newProvider);
  //     const isPlayer = await newContract.isPlayer(accounts[0]);
  //     setIsPlayer(isPlayer);
  //   }
  // };
  //ethers.js v5  
  const updateAddress = async (accounts) => {
    if (accounts.length === 0) {
      window.localStorage.removeItem("connected");
      setWalletAddress(null);
      setContract(null);
      setIsPlayer(false);
    } else if (accounts[0] === walletAddress) {
      return;
    } else {
      setWalletAddress(accounts[0]);
      window.localStorage.setItem("connected", accounts[0]);
      const alchemyProvider = new ethers.providers.JsonRpcProvider(REACT_APP_ALCHEMY_MUMBAI_RPC_URL);
      //console.log('AlchemyU', alchemyProvider);
      const walletProvider = new ethers.providers.Web3Provider(window.ethereum)
      //console.log('walletU', walletProvider);
      const signer = walletProvider.getSigner()
      //console.log('signerU', signer);
      //const newContract = new ethers.Contract(ADDRESS, ABI, signer);
      const newContract = new ethers.Contract(ADDRESS, ABI, alchemyProvider);
      //console.log('contractU', newContract);
      setContract(newContract);
      setSigner(signer);
      const isPlayer = await newContract.isPlayer(accounts[0]);
      setIsPlayer(isPlayer);
    }
  };

  const convertAddress = (addr) => {
    return addr.slice(0, 5) + "..." + addr.slice(addr.length - 4);
  };

  const charactersObj = {
    1: {name: "Jeff", attack: 8, defense: 2, tokenId: 1},
    2: {name: "Charlie", attack: 7, defense: 3, tokenId: 2},
    3: {name: "Henley", attack: 7, defense: 3, tokenId: 3},
    4: {name: "Jack", attack: 6, defense: 4, tokenId: 4},
    5: {name: "Bob", attack: 6, defense: 4, tokenId: 5},
    6: {name: "Sophie", attack: 5, defense: 5, tokenId: 6},
    7: {name: "Steve", attack: 5, defense: 5, tokenId: 7}
  }

  useEffect(() => {
    window?.ethereum?.on('accountsChanged', (accounts) => updateAddress(accounts));
  });

  //* Handle alerts
  useEffect(() => {
    if (showAlert?.status) {
      const timer = setTimeout(() => {
        setShowAlert({ status: false, type: 'info', message: '' });
      }, [2500]);
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  //* Handle error messages
  useEffect(() => {
    if (errorMessage) {
      const parsedErrorMessage = errorMessage?.reason?.slice('execution reverted: '.length).slice(0, -1);

      if (parsedErrorMessage) {
        setShowAlert({
          status: true,
          type: 'failure',
          message: parsedErrorMessage,
        });
      }
    }
  }, [errorMessage]);

  useEffect(()=>{
    if(window.ethereum && window.localStorage.getItem("connected")) {
      restore();
    } else {
      //console.log('no need to do anything');
      return;
    }
  },[]);

  useEffect(()=>{
    if(window.ethereum && window.localStorage.getItem("connected") && window.localStorage.getItem("battleId")) {
      //const playerAddress = window.localStorage.getItem("connected");
      const battleId = window.localStorage.getItem("battleId");
      console.log('bd',battleId);
      navigate(`/battle/${battleId}`);
    } else {
      //console.log('no need to do anything');
      return;
    }
  },[navigate]);

  return (
    <GlobalContext.Provider
      value={{
        battleGround,
        setBattleGround,
        contract,
        walletAddress,
        showAlert,
        setShowAlert,
        errorMessage,
        setErrorMessage,
        connectWallet,
        isPlayer,
        setIsPlayer,
        updateEvent,
        setUpdateEvent,
        updateTokens,
        setUpdateTokens,
        disableStartBTN,
        setDisableStartBTN,
        updateMove,
        setUpdateMove,
        convertAddress,
        charactersObj,
        signer
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);