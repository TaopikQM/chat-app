
import ChatZ from '../components/ChatZ';
import { UserProvider } from '../context/UserContext';

const User4Page = () => {
    return (
        <UserProvider>
            <ChatZ user={{ id: 'user1', name: 'User 1' }} />
        </UserProvider>
    );
};

export default User4Page;


// import Chat from '../components/Chat';
// import { UserProvider } from '../context/UserContext';

// const User1Page = () => {
//     return (
//         <UserProvider>
//             <Chat user={{ id: 'user1', name: 'User 1' }} />
//         </UserProvider>
//     );
// };

// export default User1Page;
