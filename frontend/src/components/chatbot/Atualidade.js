/* Aqui é exemplo pra usar o chatbot só */
import React from 'react';
import Chatbot from '../components/chatbot/Chatbot';

function Atualidade() {
  return (
    <div>
      {/* Conteúdo da página Atualidade */}
      <h1>Vital Signs</h1>
      {/* ... outros elementos da página ... */}

      <Chatbot pageMessage="Bem-vindo à página Vital Signs! Aqui você pode ver os dados atuais sobre mudanças climáticas." />
    </div>
  );
}

export default Atualidade;