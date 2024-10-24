
import Chat from '../components/Chat';
import { UserProvider } from '../context/UserContext';

const User4Page = () => {
    return (
        <UserProvider>
            <Chat user={{ id: 'user4', name: 'User gab' }} />
        </UserProvider>
    );
};

export default User4Page;
