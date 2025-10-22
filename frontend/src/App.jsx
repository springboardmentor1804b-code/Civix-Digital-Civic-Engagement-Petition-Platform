import './App.css';
import Welcome from './components/welcome/Welcome';
import Header from './components/header';
import { Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

function App() {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            {user ? (
                <>
                    <Header />
                    <Outlet />
                </>
            ) : (
                <Welcome />
            )}
        </>
    );
}

export default App;