import './App.css'
import { useAuth } from "react-oidc-context";
import TodoList from './components/TodoList';
import { COGNITO_DOMAIN, COGNITO_CLIENT_ID, COGNITO_REDIRECT_URI } from './constants/constants.ts';
import { Toaster } from 'react-hot-toast';
import AuthButton from './components/AuthButton.tsx';

function App() {
  const auth = useAuth();

  const signOutRedirect = () => {
    const clientId = COGNITO_CLIENT_ID;
    const logoutUri = COGNITO_REDIRECT_URI;
    const cognitoDomain = COGNITO_DOMAIN;
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
    auth.removeUser();
  };

  if (auth.isLoading) return (
    <div className="text-center text-secondary py-6 flex justify-center items-center h-screen">
      <div className="animate-spin h-10 w-10 border-2 border-secondary border-t-transparent rounded-full"></div>
    </div>
  ); 

  if (auth.error) return <div className="text-center text-red-800 py-6">{auth.error.message}</div>

  if (!auth.isAuthenticated) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-y-10">
        <p className='text-xl text-gray-600'>Welcome to AWS <span className='text-primary font-bold'>TodoList</span> App</p>
        <AuthButton onClick={() => auth.signinRedirect()} title="Sign in" />
      </div>
    );
  }
  
  const rawUsername = auth.user?.profile['cognito:username'];
  const username = (typeof rawUsername === 'string') ? rawUsername : '';
  
  return (
    <div className='text-gray-700'>
      <Toaster position='top-center' />
      <header className="text-center my-4">
        <p className='mt-3 text-lg'>Hello {username} 👋</p>
        <p className='mt-3'>Welcome to AWS TodoList App</p>
      </header>
      <main className="flex justify-center items-center">
        <TodoList />
      </main>
      <footer className="text-center mt-8">
        <AuthButton onClick={signOutRedirect} title="Log out" />
      </footer>
    </div>
  );
}

export default App;
