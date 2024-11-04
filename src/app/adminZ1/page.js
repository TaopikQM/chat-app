import ChatZ from '../components/ChatZ';
import { UserProvider } from '../context/UserContext';

const adminZ1 = () => {
    return (
        <UserProvider>
            <ChatZ user={{ id: 'user1', name: 'User 1' }} />
        </UserProvider>
    );
};

export default adminZ1;
