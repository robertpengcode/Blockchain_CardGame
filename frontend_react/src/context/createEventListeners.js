const AddNewEvent = async (eventFilter, contract, callback) => {
  let eventsArr = await contract.queryFilter(eventFilter, -5);
  console.log("eventsArr", eventsArr);
  if (eventsArr.length > 0) {
    callback(eventsArr[eventsArr.length - 1]);
  }
};

export const createEventListeners = ({
  navigate,
  contract,
  walletAddress,
  setShowAlert,
  setIsPlayer,
  updateTokens,
  setUpdateTokens,
  setDisableStartBTN,
  updateMove,
  setUpdateMove,
}) => {
  const RegisteredPlayerEventFilter =
    contract.filters.RegisteredPlayer(walletAddress);
  AddNewEvent(RegisteredPlayerEventFilter, contract, () => {
    setIsPlayer(true);
    setShowAlert({
      status: true,
      type: "success",
      message: "Player has been successfully registered",
    });
  });

  const MintedCharacterEventFilter =
    contract.filters.MintedCharacter(walletAddress);
  AddNewEvent(MintedCharacterEventFilter, contract, () => {
    setShowAlert({
      status: true,
      type: "success",
      message: "Character has been successfully minted",
    });
    const timer = setTimeout(() => {
      setUpdateTokens(!updateTokens);
    }, [20000]);
    return () => clearTimeout(timer);
  });

  const MintedTreasureEventFilter =
    contract.filters.MintedTreasure(walletAddress);
  AddNewEvent(MintedTreasureEventFilter, contract, () => {
    //toDo in the future: the callback should check if treasureId matches
    //or event in smart contract should index treasureId for the filter
    setShowAlert({
      status: true,
      type: "success",
      message: "Treasure has been successfully minted",
    });
    const timer = setTimeout(() => {
      setUpdateTokens(!updateTokens);
    }, [20000]);
    return () => clearTimeout(timer);
  });

  const PickedCharacterEventFilter =
    contract.filters.PickedCharacter(walletAddress);
  AddNewEvent(PickedCharacterEventFilter, contract, () => {
    setShowAlert({
      status: true,
      type: "success",
      message: "Character has been successfully selected",
    });
    const timer = setTimeout(() => {
      setUpdateTokens(!updateTokens);
      setDisableStartBTN(false);
    }, [20000]);
    return () => clearTimeout(timer);
  });

  const StartedBattleEventFilter = contract.filters.StartedBattle();
  AddNewEvent(StartedBattleEventFilter, contract, ({ args }) => {
    const battleId = args.battleId.toString();
    setShowAlert({
      status: true,
      type: "success",
      message: "A new battle has been successfully started",
    });
    const timer = setTimeout(() => {
      navigate(`/Battle/${battleId}`);
    }, [20000]);
    return () => clearTimeout(timer);
  });

  const MadeMoveEventFilter = contract.filters.MadeMove(null, walletAddress);
  AddNewEvent(MadeMoveEventFilter, contract, () => {
    setShowAlert({
      status: true,
      type: "success",
      message: "A move has been successfully made",
    });
    const timer = setTimeout(() => {
      setUpdateMove(!updateMove);
    }, [20000]);
    return () => clearTimeout(timer);
  });
};
