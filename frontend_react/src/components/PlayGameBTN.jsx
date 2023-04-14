import React from 'react';
import styles from '../styles';
import CustomButton from './CustomButton';

const PlayGameBTN = ({showWalletAddress, handlePlayGame }) => (
    <div className="flex flex-col">
    <p className={styles.normalText}>{showWalletAddress} registered!</p>
    <CustomButton
      title="Play Game"
      handleClick={handlePlayGame}
      restStyles="mt-6"
    />  
  </div>
);

export default PlayGameBTN;