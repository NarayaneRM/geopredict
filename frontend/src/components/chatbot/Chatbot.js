import React, { useState, useEffect } from 'react';
import './Chatbot.css';

function Chatbot({ pageMessage }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [message, setMessage] = useState(pageMessage);

  useEffect(() => {
    setMessage(pageMessage);
  }, [pageMessage]);

  const toggleBubble = () => {
    setIsVisible(!isVisible);
  };

  const toggleReadAloud = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'pt-BR';
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);

        utterance.onend = function () {
          setIsSpeaking(false);
        };
      } else {
        alert("Seu navegador não suporta texto para fala.");
      }
    }
  };

  return (
    <div className="robot-container">
      <div className="speech-bubble-container">
        <div className="bubble-controls">
          <button className="close-button" onClick={toggleBubble}>
            {isVisible ? 'X' : '^'}
          </button>
          <button id="read-aloud-button" onClick={toggleReadAloud}>
            {isSpeaking ? '🛑 Parar Leitura' : '🔊 Ler em Voz Alta'}
          </button>
        </div>
        {isVisible && (
          <div className="speech-bubble" id="speech-bubble">
            <p id="robot-response">{message}</p>
          </div>
        )}
      </div>
      <div style={{width:'100%',height:0,paddingBottom:'100%',position:'relative'}}>
        <iframe src="https://giphy.com/embed/KN54u4IMyjHTIeSClq" width="100%" height="100%" style={{position:'absolute'}} frameBorder="0" className="giphy-embed" allowFullScreen></iframe>
      </div>
    </div>
  );
}

export default Chatbot;