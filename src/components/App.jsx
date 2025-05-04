import { useEffect, useState } from "react";
import {UserProvider} from "../UserContext";
import HomePage from "./HomePage/HomePage";
import LoginPage from "./LoginPage/LoginPage";
import Header from "./Header";
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PlayerPage from "./PlayerPage/PlayerPage";
import NewsPage from "./NewsPage/NewsPage";
import ProfilePage from "./ProfilePage/ProfilePage";
import { SkeletonTheme } from "react-loading-skeleton";
import { auth } from "../firebaseConfig";

function App() {
  
  return (
    <>
    <UserProvider>
    <SkeletonTheme baseColor="#e3e3e3" highlightColor="#7d7d7d">
    <Header/>
    <Routes>
      <Route path="/login" element={<LoginPage/>}/>
      <Route path="/" element={<HomePage/>}/>
      <Route path="/news" element={<NewsPage/>}/>
      <Route path="players/:playerId" element={<PlayerPage playerId={2544} />} />
      <Route path="/profile" element={<ProfilePage/>}/>
    </Routes>
    </SkeletonTheme>
    </UserProvider>
    </>
  );
}

export default App;