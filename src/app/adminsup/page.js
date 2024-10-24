
import ChatA from '../components/ChatA';
import { UserProvider } from '../context/UserContext';

const User4Page = () => {
    return (
        <UserProvider>
            <ChatA user={{ id: 'admin', name: 'User gab' }} />
        </UserProvider>
    );
};

export default User4Page;
