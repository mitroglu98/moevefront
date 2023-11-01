import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from './components/Header';
import Footer from './components/Footer';
import TourSearchPage from './pages/TourSearchPage';
import TourDetailsPage from './pages/TourDetailsPage';
import CreateTourPage from './pages/CreateTourPage';
import DriverInfo from './components/DriverInfo';
import ContractInfo from './components/ContractInfo';

function App() {
    return (
        <Router>
        <div className="App">
            <Header />
            <div className="content">
                <Routes>
                    <Route path="/" element={<TourSearchPage />} />
                    <Route path="/tour-details/:tourId" element={<TourDetailsPage />} />
                    <Route path="/create-tour" element={<CreateTourPage />} />
                    <Route path="/drivers" element={<DriverInfo />} />
                    <Route path="/contracts" element={<ContractInfo />} />

                </Routes>
            </div>
            <Footer />
        </div>
    </Router>
    );
}

export default App;
