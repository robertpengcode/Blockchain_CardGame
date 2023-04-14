import React from 'react';
import styles from '../styles';
import CustomButton from './CustomButton';

const RegisterBTN = ({showWalletAddress, handleRegisterPlayer }) => (
  <div className="flex flex-col">
    <p className={styles.normalText}>{showWalletAddress} connected!</p>
    <CustomButton
      title="Register To Play"
      handleClick={handleRegisterPlayer}
      restStyles="mt-6"
    /> 
  </div>
);

export default RegisterBTN;