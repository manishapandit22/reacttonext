"use client";

import React from 'react';
import GameContextProvider from '../../../../../contexts/GameContext';
import Edit from '../../../../../components/create_async/Edit';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';

const EditGamePage = ({ params }) => {
  return (
    <>
    <Header />
    <GameContextProvider>
      <Edit game_id={params.gameId} />
    </GameContextProvider>
    <Footer />
    </>
  );
};

export default EditGamePage;
