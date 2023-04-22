import React from 'react';
import styles from '../styles';
import logo from '../assets/util/logo.svg';

const PageHOC = (Component, title, description) => () => {
  return (
    <div className={styles.hocContainer} >
      <div className={styles.hocContentBox}>
        <div className={styles.hocLogoContainer}>
          <img src={logo} alt="logo"   className={styles.hocLogo} /><span className={styles.hocLogoText}>Yan 燕</span>
        </div>
        
        <div className={styles.hocBodyWrapper}>
          <div className="flex flex-col">
          <div className="flex flex-row w-full">
            <h1 className={`flex ${styles.headText} head-text`}>{title}</h1>
          </div>
            <p className={`${styles.normalText} my-2`}>{description}</p>
          </div>
          <Component />
        </div>

        <p className={styles.footerText}>😆 robertpengcode 2023</p>
      </div>
    </div>
  );
};

export default PageHOC;