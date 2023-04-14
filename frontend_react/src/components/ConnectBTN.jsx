import React from 'react';
//import styles from '../styles';
import CustomButton from './CustomButton';

const ConnectBTN = ({handleConnectWallet}) => (
    <div className="flex flex-col">
    <CustomButton
      title="Connect To Wallet"
      handleClick={handleConnectWallet}
      restStyles="mt-6"
    />  
  </div>
);

export default ConnectBTN;