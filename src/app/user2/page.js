import Chat from '../components/Chat';
import { UserProvider } from '../context/UserContext';

const User2Page = () => {
    return (
        <UserProvider>
            <Chat user={{ id: 'user2', name: 'User 2' }} />
        </UserProvider>
    );
};

export default User2Page;
