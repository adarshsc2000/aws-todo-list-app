import './App.css'
import { useAuth } from "react-oidc-context";
import TodoList from './components/TodoList';
import { COGNITO_DOMAIN, COGNITO_CLIENT_ID, COGNITO_REDIRECT_URI } from './constants/constants.ts';
import { Toaster } from 'react-hot-toast';

function App() {
  const auth = useAuth();

  const signOutRedirect = () => {
    const clientId = COGNITO_CLIENT_ID;
    const logoutUri = COGNITO_REDIRECT_URI;
    const cognitoDomain = COGNITO_DOMAIN;
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
    auth.removeUser();
  };

  if (auth.isLoading) return <div>Loading...</div>; 

  if (auth.error) return <div>Encountering error... {auth.error.message} </div>; 

  if (!auth.isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <button onClick={() => auth.signinRedirect()}>Sign in</button>
      </div>
    );
  }
  
  const rawUsername = auth.user?.profile['cognito:username'];
  const username = (typeof rawUsername === 'string') ? rawUsername : '';
  
  return (
    <div>
      <Toaster position='top-center' />
      <header className="text-center my-4">
        <p>Hello {username}</p>
        <button onClick={signOutRedirect} className="text-red-500 mt-2">Sign out</button>
      </header>
      <main className="flex justify-center items-center">
        <TodoList />
      </main>
    </div>
  );
}

export default App;
