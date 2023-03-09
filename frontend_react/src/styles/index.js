const styles = {
  // general
  headText: "font-play font-bold text-white sm:text-3xl text-2xl",
  normalText: "font-play font-normal text-[24px] text-siteWhite",
  footerText: "font-play font-medium text-base text-white",
  infoText: "font-play font-medium text-lg text-siteBlue cursor-pointer",

  // glassmorphism
  glassEffect: "bg-white backdrop-filter backdrop-blur-lg bg-opacity-10",

  // hoc page
  hocContainer: "min-h-screen flex xl:flex-row flex-col relative",
  hocContentBox:
    "flex flex-1 justify-between bg-siteblack py-8 sm:px-12 px-8 flex-col",
  hocLogoContainer: "flex flex-col",
  hocLogo: "w-[70px] h-[70px] object-contain cursor-pointer",
  hocLogoText: "text-white text-lg ml-2",
  hocBodyWrapper: "flex-1 flex justify-around flex-col xl:mt-0 my-2",

  // Game page
  gameContainer:
    "w-screen min-h-screen bg-cover bg-no-repeat bg-center flex-col",
  gameRoundText: "font-play font-extrabold text-[24px] text-white",
  gameRoundNum: "font-play font-bold text-[28px] text-white",
  gameVsText: "font-play font-bold text-[48px] text-white italic my-2",
  gameMoveBox:
    "sm:w-20 w-14 sm:h-20 h-14 rounded-full cursor-pointer border-[3px]",
  gameMoveIcon: "w-1/2 h-1/w-1/2 object-contain",
  gameMadeMoveText: "font-play font-extrabold text-[16px] text-white",

  // player info component
  playerText: "font-play font-bold text-white text-[23px]",
  playerHealth:
    "flex flex-row bg-white rounded-md p-2 sm:min-w-[215px] min-w-[130px] sm:min-h-[48px] min-h-[40px] bg-opacity-10 backdrop-filter backdrop-blur-lg mx-3",
  playerHealthBar: "sm:w-4 w-2 sm:h-8 h-6 rounded-sm",
  playerEnergy:
    "w-14 h-14 rounded-full text-white font-play font-extrabold text-2xl cursor-pointer",
  playerInfo: "font-play font-medium",
  playerInfoSpan: "font-extrabold text-white",

  // card component
  cardContainer:
    "relative sm:w-[260px] w-[220px] sm:h-[335px] h-[280px] z-0 transition-all",
  cardImg: "w-full h-full object-contain",
  charImgContainer:
    "absolute w-[117px] h-[175px] rounded-[50%] sm:w-[140px] sm:h-[210px]",
  charImg: "w-[117px] h-[175px] rounded-[50%] sm:w-[140px] sm:h-[210px]",
  cardPointContainer:
    "absolute sm:w-[40px] w-[32px] sm:h-[40px] h-[32px] rounded-[25px]",
  cardPoint: "font-play text-[24px] font-bold sm:text-[30px]",
  cardTextContainer: "absolute w-full bottom-[7%]",
  cardText: "font-play text-[28px] font-bold text-white",

  // custom button component
  btn: "px-3 py-1 rounded-lg bg-siteBlue w-fit text-white font-play font-bold hover:bg-sky-400 active:bg-sky-500 mr-2 my-2",
  btnDisabled:
    "px-3 py-1 rounded-lg bg-siteBlue w-fit text-white font-play font-bold opacity-50 cursor-not-allowed my-2",

  // custom input component
  label: "font-play font-medium text-lg text-siteBlue mr-2",
  select:
    "font-play border border-gray-400 hover:border-gray-500 rounded shadow focus:outline-none focus:shadow-outline w-56",
  input:
    "bg-siteDimBlack text-white outline-none focus:outline-siteBlue p-4 rounded-md sm:max-w-[50%] max-w-full",

  // common
  flexCenter: "flex items-center justify-center",
  flexEnd: "flex justify-end items-end",
  flexBetween: "flex justify-between items-center",

  // alert
  info: "text-blue-700 bg-blue-100 dark:bg-blue-200 dark:text-blue-800",
  success: "text-green-700 bg-green-100 dark:bg-green-200 dark:text-green-800",
  failure:
    "text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800",
  alertContainer: "absolute z-10 top-5 left-0 right-0",
  alertWrapper: "p-4 rounded-lg font-play font-semibold text-lg ",
  alertIcon: "flex-shrink-0 inline w-6 h-6 mr-2",

  // modal
  modalText: "font-play font-bold text-3xl text-white mb-6 text-center",
};

export default styles;
