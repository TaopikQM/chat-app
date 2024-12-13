
import Chats from '../components/Chats';
import { UserProvider } from '../context/UserContext';

const Syifa = () => {
    return (
        <UserProvider>
            <Chats user={{ id: 'user1', name: 'User 1' }} />
        </UserProvider>
    );
};

export default Syifa;
