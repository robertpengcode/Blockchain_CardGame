import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { CustomButton, PageHOC } from '../components';
import { useGlobalContext } from '../context';
import styles from '../styles';
import Alert from '../components/Alert';

const Home = () => {
  const { contract, walletAddress, gameData, setShowAlert, setErrorMessage, connectWallet, isPlayer ,showAlert, updateEvent, setUpdateEvent} = useGlobalContext();

  if(!walletAddress) {console.log('no address!')};

  const convertAddress = (addr) => {
    return addr.slice(0, 5) + "..." + addr.slice(addr.length - 4);
  };
  const showWalletAddress = walletAddress ? convertAddress(walletAddress) : "";

  const navigate = useNavigate();
  const handleRegisterPlayer = async () => {
    try {
      const playerExists = await contract.isPlayer(walletAddress);
      if (!playerExists) {
        await contract.registerPlayer();
        setShowAlert({
          status: true,
          type: 'info',
          message: `Register ${showWalletAddress} request submitted!`,
        });
        const timer = setTimeout(()=>{setUpdateEvent(!updateEvent);},[3500]);
        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.log('err',error);
      setErrorMessage(error);
    }
  };

  const handleConnectWallet = async () => {
    await connectWallet();
  };
  const handlePlayGame = () => {navigate('/create-battle')};

  const connect = <div className="flex flex-col">
    <CustomButton
      title="Connect To Wallet"
      handleClick={handleConnectWallet}
      restStyles="mt-6"
    />  
  </div>

  const playgame = <div className="flex flex-col">
    <p className={styles.normalText}>{showWalletAddress} registered!</p>
    <CustomButton
      title="Play Game"
      handleClick={handlePlayGame}
      restStyles="mt-6"
    />  
  </div>

  const register = <div className="flex flex-col">
  <p className={styles.normalText}>{showWalletAddress} connected!</p>
  <CustomButton
    title="Register To Play"
    handleClick={handleRegisterPlayer}
    restStyles="mt-6"
  /> 
  </div>

  let button;
  if (isPlayer) {
    button = playgame;
  } else if (walletAddress) {
    button = register;
  } else {
    button = connect;
  }

  return (
    <>{showAlert?.status && <Alert type={showAlert.type} message={showAlert.message} />}
    {button}</>
  );
};

export default PageHOC(
  Home,
  <>
    Welcome to Yan 燕 Kingdom <br /> a Web3 NFT Card Game
  </>,
  <>
  Connect your wallet to start playing <br /> the ultimate Web3 Battle Card
  Game
  </>,
);