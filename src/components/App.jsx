import { useEffect, useState } from "react";
import HomePage from "./HomePage/HomePage";
import Header from "./Header";
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PlayerPage from "./PlayerPage/PlayerPage";
import NewsPage from "./NewsPage/NewsPage";

function App() {
  
  return (
    <>
    <Header/>
    <Routes>
      <Route path="/" element={<HomePage/>}/>
      <Route path="/news" element={<NewsPage/>}/>
      <Route path="players/:playerId" element={<PlayerPage playerId={2544} />} />
    </Routes>
    </>
  );
}

export default App;