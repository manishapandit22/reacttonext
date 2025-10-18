"use client";

import React, { use } from 'react';
import GameContextProvider from '../../../../../contexts/GameContext';
import Edit from '../../../../../components/create_async/Edit';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import { EditPageParams } from '@/types';

const EditGamePage = ({ params }: EditPageParams) => {
  const { gameId } = use(params);
  
  return (
    <>
    <Header />
    <GameContextProvider>
      <Edit game_id={gameId} />
    </GameContextProvider>
    <Footer />
    </>
  );
};

export default EditGamePage;

