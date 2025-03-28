
import Chats from '../components/Chats';
import { UserProvider } from '../context/UserContext';

const Syifa2 = () => { 
    return (
        <UserProvider>
            <Chats user={{ id: 'user2', name: 'User 2' }} />
        </UserProvider>
    );
};

export default Syifa2;
