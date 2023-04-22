import React from 'react';
import styles from '../styles';

const ActionButton = ({ imgUrl, handleClick, restStyles, titleText }) => (
  <div
    className={`${styles.gameMoveBox} ${styles.flexCenter} ${styles.glassEffect} ${restStyles} `}
    onClick={handleClick} title={titleText}
  >
    <img src={imgUrl} alt="action_img" className={styles.gameMoveIcon} title={titleText}/>
  </div>
);

export default ActionButton;