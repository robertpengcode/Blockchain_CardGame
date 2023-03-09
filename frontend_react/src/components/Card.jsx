import React from 'react';
import Tilt from 'react-parallax-tilt';
import styles from '../styles';

const Card = ({ card, charImg, charName, restStyles, cardRef, playerTwo, attack, defense }) => (
  <Tilt>
    <div ref={cardRef} className={`${styles.cardContainer} ${restStyles}`}>
      <img src={card} alt="game card" className={styles.cardImg} />

      <div className={`${styles.charImgContainer} bottom-[18%] sm:left-[22.8%] left-[22.8%] ${styles.flexCenter}`} title="character">
        <img src={charImg} alt="character" className={`${styles.charImg}`} />
      </div>

      <div className={`${styles.cardPointContainer} bottom-[88%] sm:left-[5.8%] left-[5.8%] ${styles.flexCenter}`} title="attack value">
        <p className={`${styles.cardPoint} text-red-500`}>{attack}</p>
      </div>
      <div className={`${styles.cardPointContainer} bottom-[88%] sm:right-[5.8%] right-[5.8%] ${styles.flexCenter}`} title="defense value">
        <p className={`${styles.cardPoint} text-green-700`}>{defense}</p>
      </div>

      <div className={`${styles.cardPointContainer} bottom-[1%] sm:left-[5.8%] left-[5.8%] ${styles.flexCenter}`} title="defense value">
        <p className={`${styles.cardPoint} text-green-700`}>{defense}</p>
      </div>
      <div className={`${styles.cardPointContainer} bottom-[1%] sm:right-[5.8%] right-[5.8%] ${styles.flexCenter}`} title="attack value">
        <p className={`${styles.cardPoint} text-red-500`}>{attack}</p>
      </div>

      <div className={`${styles.cardTextContainer} ${styles.flexCenter}`}>
        <p className={styles.cardText}>{charName}</p>
      </div>
    </div>
  </Tilt>
);

export default Card;