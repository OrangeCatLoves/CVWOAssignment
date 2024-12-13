import React from 'react';
import Home from './pages/Home';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AuthenticationPage from './pages/AuthenticationPage';

const App: React.FC = () => {
    return (
        <div>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<AuthenticationPage />} />
                    <Route path="/forum" element={<Home />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
};

export default App;
