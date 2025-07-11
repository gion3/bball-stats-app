import { useEffect, useState } from "react";
import {GlobalProvider} from "../UserContext";
import HomePage from "./HomePage/HomePage";
import LoginPage from "./LoginPage/LoginPage";
import Header from "./Header";
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PlayerPage from "./PlayerPage/PlayerPage";
import NewsPage from "./NewsPage/NewsPage";
import ProfilePage from "./ProfilePage/ProfilePage";
import { SkeletonTheme } from "react-loading-skeleton";
import AdminPanel from "./AdminPanel/AdminPanel";
import MyTeam from "./MyTeam/MyTeam";
import LeaguePage from "./LeaguePage/LeaguePage";
import UserCreatedLeague from "./LeaguePage/UserCreatedLeague";
import { auth } from "../firebaseConfig";
import ScrollToTop from "./ScrollToTop";
import LandingPage from "./LandingPage/LandingPage";

function App() {
  
  return (
    <>
    <GlobalProvider>
    <SkeletonTheme baseColor="#e3e3e3" highlightColor="#7d7d7d">
    <Header/>
    <Routes>
      <Route path="/login" element={<LoginPage/>}/>
      <Route path="/" element={<HomePage/>}/>
      <Route path="/news" element={<NewsPage/>}/>
      <Route path="players/:playerId" element={<PlayerPage />} />
      <Route path="/profile" element={<ProfilePage/>}/>
      <Route path="/admin" element={<AdminPanel/>}/>
      <Route path="/my-team" element={<MyTeam/>}/>
      <Route path="/leagues" element={<LeaguePage/>}/>
      <Route path="/leagues/:leagueId" element={<UserCreatedLeague/>}/>
      <Route path="/landing" element={<LandingPage/>}/>
    </Routes>
    </SkeletonTheme>
    </GlobalProvider>
    </>
  );
}

export default App;