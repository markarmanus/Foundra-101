const editedElementsCSS = `
@keyframes textHighlight {
    0% {
      text-shadow: 0 0 5px rgba(255, 255, 255, 0.5), 0 0 10px rgba(255, 255, 255, 0.3);
    }
    80% {
      text-shadow: 0 0 15px rgba(151,120,206,0.5), 0 0 30px rgba(151,120,206,0.5);
    }
    100% {
        text-shadow: 0 0 15px rgba(151,120,206,0.5), 0 0 30px rgba(151,120,206,0.5);
    }
  }

  .highlight-text {
    animation: textHighlight 2s ease-in-out 1 forwards;
 }


`;
export { editedElementsCSS };
