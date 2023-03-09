import React from 'react';

import styles from '../styles';

const CustomButton = ({ title, handleClick, isDisabled }) => (
  <button
    type="button"
    className={isDisabled ? `${styles.btnDisabled}`: `${styles.btn}`}
    onClick={handleClick}
    disabled={isDisabled}
  >
    {title}
  </button>
);

export default CustomButton;