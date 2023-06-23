import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../styles';
import { useGlobalContext } from '../context';
import { ActionButton, Alert, Card, PlayerInfo } from '../components';
import attackSound from '../assets/sounds/attack.wav';
import defenseSound from '../assets/sounds/defense.mp3';
import attack from '../assets/util/attack.png';
import defense from '../assets/util/defense.png';
import blueCard from '../assets/cards/blue.jpg';
import purpleCard from '../assets/cards/purple.jpg';
import pinkCard from '../assets/cards/pink.jpg';
import Jeff from '../assets/tokens/Jeff.png';
import Charlie from '../assets/tokens/Charlie.png';
import Henley from '../assets/tokens/Henley.png';
import Jack from '../assets/tokens/Jack.png';
import Bob from '../assets/tokens/Bob.png';
import Sophie from '../assets/tokens/Sophie.png';
import Steve from '../assets/tokens/Steve.png';
import question from '../assets/util/question.png';
import { playAudio } from '../utils/animation.js';

const Battle = () => {
  const { contract, battleGround, setBattleGround, walletAddress, setErrorMessage, showAlert, setShowAlert,
    player1Ref, player2Ref, updateMove, setUpdateMove, convertAddress, charactersObj, signer} = useGlobalContext();
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [health1, setHealth1] = useState(0);
  const [health2, setHealth2] = useState(0);
  const [energy1, setEnergy1] = useState(0);
  const [energy2, setEnergy2] = useState(0);
  const [attack1, setAttack1] = useState(0);
  const [attack2, setAttack2] = useState(0);
  const [defense1, setDefense1] = useState(0);
  const [defense2, setDefense2] = useState(0);
  const [charId1, setCharId1] = useState(0);
  const [charId2, setCharId2] = useState(0);
  const [madeMove1, setMadeMove1] = useState(false);
  const [madeMove2, setMadeMove2] = useState(false);
  const [isBattleEnded, setIsBattleEnded] = useState(false);
  const [winner, setWinner] = useState("");
  const [update, setUpdate] = useState(false);
  const { battleId } = useParams();
  
  const navigate = useNavigate();

  const noOne = "0x0000000000000000000000000000000000000000";

  useEffect(() => {
    const getBattleInfo = async () => {
      if(contract) {
        try {
          const {playerAddrs, winner, battleStatus, moves} = await contract.getBattle(battleId);
          setPlayer1(playerAddrs[0]);
          setPlayer2(playerAddrs[1]);
          setMadeMove1(Number(moves[0]>0));
          setMadeMove2(Number(moves[1]>0));
          setIsBattleEnded(Number(battleStatus)===2);
          setWinner(winner);
          getPlayer1Info(playerAddrs[0]);
          getPlayer2Info(playerAddrs[1]);
        } catch (error) {
          console.log(error);
          setErrorMessage(error.message);
        }
      }
    }
    getBattleInfo()
  })

  useEffect(()=>{
    if (isBattleEnded) {
      contract.removeAllListeners();
      window.localStorage.removeItem("battleId");
    }
  },[contract, isBattleEnded]);

  useEffect(() => {
    const bg = localStorage.getItem('battleground');
    if (bg) {
      setBattleGround(bg);
    } 
  });

  async function getPlayer1Info(addr) {
    if(addr) {
      try {
        const {health, energy, battleAttack, battleDefense, battleTokens} = await contract.getPlayer(addr);
        setHealth1(Number(health));
        setEnergy1(Number(energy));
        setAttack1(Number(battleAttack));
        setDefense1(Number(battleDefense));
        setCharId1(Number(battleTokens[0]));
      } catch (error) {
        console.log(error);
        setErrorMessage(error.message);
      }
    }
  }

  async function getPlayer2Info(addr) {
    if(addr) {
      try {
        const {health, energy, battleAttack, battleDefense, battleTokens} = await contract.getPlayer(addr);
        setHealth2(Number(health));
        setEnergy2(Number(energy));
        setAttack2(Number(battleAttack));
        setDefense2(Number(battleDefense));
        setCharId2(Number(battleTokens[0]));
      } catch (error) {
        console.log(error);
        setErrorMessage(error.message);
      }
    }
  }
  
  let bgClass = 'bg-siteblack';
  if (battleGround === "forest") {
    bgClass = 'bg-forest';
  } else if (battleGround === "castle") {
    bgClass = 'bg-castle';
  } else {
    bgClass = 'bg-throneroom';
  }

  const round = player1 && energy1? (12 - energy1)/2 : null;

  const showPlayer1Addr = player1 ? convertAddress(player1) : "";
  const showPlayer2Addr = player2 ? convertAddress(player2) : "";

  const getCard = (charId) => {
    if (charId === 3 || charId === 6) {
      return pinkCard;
    } else if (charId === 1 || charId === 2) {
      return purpleCard;
    } else {
      return blueCard;
    }
  }

  const card1 = player1 ? getCard(charId1) : "";
  const card2 = player2 ? getCard(charId2) : "";

  const getCharImg = (charId) => {
    let charImg;
    switch (charId) {
      case 1:
        charImg = Jeff;
        break;
      case 2:
        charImg = Charlie;
        break;
      case 3:
        charImg = Henley;
        break;
      case 4:
        charImg = Jack;
        break;
      case 5:
        charImg = Bob;
        break;
      case 6:
        charImg = Sophie;
        break;
      case 7:
        charImg = Steve;
        break;
      default:
        charImg = question;  
    }
    return charImg;
  }

  const charImg1 = player1 ? getCharImg(charId1) : "";
  const charImg2 = player2 ? getCharImg(charId2) : "";

  const handlePlayAgain = () => {
    navigate('/');
  }

  const makeAMove = async (choice) => {
    playAudio(choice === 1 ? attackSound : defenseSound);
    try {
      const answer = await contract.connect(signer).makeMove(battleId, choice, { gasLimit: 200000 });
      if (answer) {
        setShowAlert({
          status: true,
          type: 'info',
          message: `Initiating ${choice === 1 ? 'attack' : 'defense'}. Please wait a few seconds for the confirmation.`,
        });
      }

      contract.on("MadeMove", (battleId, player, choice) => {
        //console.log('player',player);
        if (walletAddress.toLowerCase() === player.toLowerCase()) {
          setShowAlert({
            status: true,
            type: "success",
            message: "A move has been successfully made.",
          });
          const timer = setTimeout(() => {
            setUpdateMove(!updateMove);
          }, [500]);
          return () => clearTimeout(timer);
        } else {
          //console.log('the other player is listening...');
          const timer = setTimeout(() => {
            setUpdate(!update);
          }, [500]);
          return () => clearTimeout(timer);
        }
      });
    } catch (error) {
      console.log(error);
      setErrorMessage(error);
    }
  };

  const madeMoveCheck1 = madeMove1? "Yes" : "No";
  const madeMoveCheck2 = madeMove2? "Yes" : "No";

  const charName1 = charId1 ? charactersObj[charId1].name : "";
  const charName2 = charId2 ? charactersObj[charId2].name : "";

  const isPlayer1Won = !isBattleEnded? "" : winner === player1? "Won" : winner === noOne ? "Tied" : "Lost";
  const isPlayer2Won = !isBattleEnded? "" : winner === player2? "Won" : winner === noOne ? "Tied" : "Lost";

  return (
    <div className={`${styles.flexCenter} ${styles.gameContainer} ${bgClass}`}>
       {showAlert?.status && <Alert type={showAlert.type} message={showAlert.message} />}
     <div className='flex flex-row w-screen justify-evenly'>
        <div className="flex flex-col">
          <PlayerInfo player={showPlayer1Addr} mt health={health1>=0?health1:0} energy={energy1} status={isPlayer1Won}/>
          <div className={`${styles.flexCenter} flex-col my-10`}>
            <div className="flex items-center flex-col">
              <Card
                card={card1}
                charImg={charImg1}
                charName={charName1}
                cardRef={player1Ref}
                attack={attack1}
                defense={defense1}
                restStyles="mt-3"
              />
              {player1.toLowerCase() !== walletAddress.toLowerCase() || isBattleEnded || player2 === noOne? null :
                <div className="flex flex-row mt-4">
                <ActionButton
                  imgUrl={attack}
                  handleClick={() => makeAMove(1)}
                  restStyles="mx-4 hover:border-red-500"
                  titleText="Attack!"
                />
                <ActionButton
                  imgUrl={defense}
                  handleClick={() => makeAMove(2)}
                  restStyles="mx-4 hover:border-green-700"
                  titleText="Defense!"
                />
              </div>
              }
              
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center items-center">
          <div className={`${styles.glassEffect} ${styles.flexCenter} flex flex-col rounded-full h-[120px] w-[120px] border-[3px]`}>
            {isBattleEnded ? 
            (<><p className={styles.gameRoundText}>Game</p>
            <p className={styles.gameRoundText}>Over</p></>
            ):
            (<><p className={styles.gameRoundText}>Round</p>
            <p className={styles.gameRoundNum}>{round}</p></>
            )
          }
          </div>
          <p className={styles.gameVsText}>VS</p>
          {isBattleEnded ? 
          <div className={`${styles.glassEffect} ${styles.flexCenter} flex flex-col rounded-full h-[120px] w-[120px] border-[3px] hover:border-siteBlue`}>
            <button className={`${styles.gameRoundText} rounded-full h-[120px] w-[120px]`}
            onClick={handlePlayAgain}>Play<br/>Again</button>
          </div> :
          <div className={`${styles.glassEffect} ${styles.flexCenter} flex flex-col rounded-full h-[120px] w-[120px] border-[3px]`}>
            <p className={styles.gameMadeMoveText}>Made Move?</p>
            <p className={styles.gameRoundNum}>{madeMoveCheck1}|{madeMoveCheck2}</p>
          </div>
          }
        </div>

        <div className="flex flex-col">
        <PlayerInfo player={showPlayer2Addr} mt health={health2>=0?health2:0} energy={energy2} status={isPlayer2Won}/>
          <div className={`${styles.flexCenter} flex-col my-10`}>
            <div className="flex items-center flex-col">
              <Card
                card={card2}
                charImg={charImg2}
                charName={charName2}
                cardRef={player2Ref}
                attack={attack2}
                defense={defense2}
                restStyles="mt-3"
              />
              {player2.toLowerCase() !== walletAddress.toLowerCase() || isBattleEnded || madeMove2 ? null :
               <div className="flex flex-row mt-4">
                <ActionButton
                  imgUrl={attack}
                  handleClick={() => makeAMove(1)}
                  restStyles="mx-4 hover:border-red-500"
                  titleText="Attack!"
                />
                <ActionButton
                  imgUrl={defense}
                  handleClick={() => makeAMove(2)}
                  restStyles="mx-4 hover:border-green-700"
                  titleText="Defense!"
                />
              </div>}
            </div>
          </div>
        </div>
      </div> 
    </div>
  );
};

export default Battle;