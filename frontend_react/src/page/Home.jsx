import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalContext } from '../context';
import { PageHOC, RegisterBTN, PlayGameBTN, ConnectBTN } from '../components';
import Alert from '../components/Alert';

const Home = () => {
  const { contract, walletAddress, setShowAlert, setErrorMessage, connectWallet, isPlayer,
     showAlert, setIsPlayer, convertAddress} = useGlobalContext();
  const navigate = useNavigate();

  const showWalletAddress = walletAddress ? convertAddress(walletAddress) : "";

  const handleRegisterPlayer = async () => {
    try {
      const playerExists = await contract.isPlayer(walletAddress);
      if (!playerExists) {
        const answer = await contract.registerPlayer();
        if (answer) {
          setShowAlert({
            status: true,
            type: 'info',
            message: `Register ${showWalletAddress} request submitted! Please wait a few seconds for the confirmation.`,
          });
        }
        contract.on("RegisteredPlayer", (player) => {
          setShowAlert({
            status: true,
            type: "success",
            message: `Collection (${convertAddress(
              player
            )}) is registered.`,
          });
          setIsPlayer(true);
        });
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

  return (
    <>
    {showAlert?.status && <Alert type={showAlert.type} message={showAlert.message} />}
    
    {isPlayer? <PlayGameBTN handlePlayGame={handlePlayGame} showWalletAddress={showWalletAddress}/>
     : 
      walletAddress? <RegisterBTN handleRegisterPlayer={handleRegisterPlayer} showWalletAddress={showWalletAddress}/>
      : <ConnectBTN handleConnectWallet={handleConnectWallet}/>
     }
    </>
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
