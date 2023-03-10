export const playAudio = (clip) => {
  const audio = new Audio();
  audio.src = clip;

  return audio.play();
};
