import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import { ABI, ADDRESS } from '../contract';
import { createEventListeners } from './createEventListeners';

const GlobalContext = createContext();

export const GlobalContextProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState('');
  const [battleGround, setBattleGround] = useState('');
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [isPlayer, setIsPlayer] = useState(false);
  const [showAlert, setShowAlert] = useState({ status: false, type: 'info', message: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [updateEvent, setUpdateEvent] = useState(false);
  const [updateTokens, setUpdateTokens] = useState(false);
  const [disableStartBTN, setDisableStartBTN] = useState(true);
  const [updateMove, setUpdateMove] = useState(false);

  const navigate = useNavigate();

  //* Set the wallet address to the state
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
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await newProvider.getSigner();
      const newContract = new ethers.Contract(ADDRESS, ABI, signer);
      setContract(newContract);
      setProvider(newProvider);
      const isPlayer = await newContract.isPlayer(accounts[0]);
      setIsPlayer(isPlayer);
    }
  };

  useEffect(() => {
    window?.ethereum?.on('accountsChanged', (accounts) => updateAddress(accounts));
  }, []);

  //* Activate event listeners for the smart contract
  useEffect(() => {
    console.log('updateEvent', updateEvent);
    if (contract) {
      createEventListeners({
        navigate,
        contract,
        provider,
        walletAddress,
        setShowAlert,
        setIsPlayer,
        updateTokens,
        setUpdateTokens,
        setDisableStartBTN,
        setUpdateMove,
      });
    }
  }, [updateEvent]);

  //* Handle alerts
  useEffect(() => {
    console.log("alert", showAlert)
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

  const restore = async () => {
    const newProvider = new ethers.BrowserProvider(window.ethereum);
      const account = window.localStorage.getItem("connected");
      setWalletAddress(account);
      const signer = await newProvider.getSigner();
      const newContract = new ethers.Contract(ADDRESS, ABI, signer);
      setContract(newContract);
      setProvider(newProvider);
      const isPlayer = await newContract.isPlayer(account);
      setIsPlayer(isPlayer);
  }
  
  const connectWallet = async () => {
    if (window.ethereum) {
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await newProvider.send("eth_requestAccounts", []);
      setWalletAddress(accounts[0]);
      const signer = await newProvider.getSigner();
      window.localStorage.setItem("connected", accounts[0]);

      const newContract = new ethers.Contract(ADDRESS, ABI, signer);

      setProvider(newProvider);
      setContract(newContract);
      
      const isPlayer = await newContract.isPlayer(accounts[0]);
      setIsPlayer(isPlayer);
      
    } else {
        setErrorMessage("Please Install MetaMask!!!");
    }
}

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
        updateEvent,
        setUpdateEvent,
        updateTokens,
        setUpdateTokens,
        disableStartBTN,
        setDisableStartBTN,
        updateMove,
        setUpdateMove,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);