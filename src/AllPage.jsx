import { useEffect, useState } from "react";
import App from './App.jsx';
import AuthPage from './components/Login/AuthPage.jsx';
import { useLogin } from './components/Login/LoginContext';
import ClipLoader from 'react-spinners/ClipLoader';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from "@capacitor/core";
import ProfileForm from "./components/ProfileForme/ProfileForm.jsx";
import NoteVendor from "./components/NoteVendor";
import { useLocation } from "react-router-dom";

export default function AllPage() {
    const { load, fetchInfoLogin, isVendor, deconnecter } = useLogin();
    const [isAutheficated, setIsAuthentificated] = useState(null); 
    const location = useLocation();

    const token = localStorage.getItem('token');

    const getInfoAuthenticate = async () => {
       const connexion =  await fetchInfoLogin();
       setIsAuthentificated(connexion);
    }

    useEffect(()=> {
        if (location.pathname.includes('/activer-mon-compte') || location.pathname.includes('/reset-password')) {
            setIsAuthentificated(false);
            deconnecter();
            return;
        }
        getInfoAuthenticate();
    }, [token, location.pathname]);

    useEffect(() => {
        const applyStatusBar = async () => {
            if (Capacitor.getPlatform() === 'web')return;
            try {
                await StatusBar.setStyle({ style: Style.Dark });
                await StatusBar.setBackgroundColor({ color: '#6C2483' });

                await StatusBar.show();
            } catch (error) {
                
            }
        };
        applyStatusBar();
    }, []);
    if ((load || isAutheficated === null) && !location.pathname.includes('/activer-mon-compte')) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <ClipLoader
                    color="#3b82f6"
                    loading={true}
                    size={40}
                    speedMultiplier={1.5}
                />
            </div>
        );
    }

    if (isAutheficated) {
        if (!isVendor && location.pathname === '/completer-profil') {
            return <ProfileForm/>;
        }
        if (!isVendor) {
            return <NoteVendor />;
        }
        return (
            <>
                <App />
            </>
        );
    } else {
        return (
            <>
                <AuthPage />
            </>
        );
    }
}