import ChatZ from '../components/ChatZ';
import { UserProvider } from '../context/UserContext';

const adminZ2Page = () => {
    return (
        <UserProvider>
            <ChatZ user={{ id: 'user2', name: 'User 2' }} />
        </UserProvider>
    );
};

export default adminZ2Page;
