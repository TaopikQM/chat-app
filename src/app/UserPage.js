import Chat from './components/Chat';
import { UserProvider } from './context/UserContext';

const UserPage = ({ userId }) => {
    return (
        <UserProvider>
            <Chat user={{ id: userId, name: `User ${userId.slice(-1)}` }} />
        </UserProvider>
    );
};

// Get the user ID based on the route parameter
export async function getServerSideProps(context) {
    const { userId } = context.params; // Assuming you have a dynamic route like /user/[userId]
    return { props: { userId } };
}

export default UserPage;
