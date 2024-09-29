// src/app/components/ContactList.js
const ContactList = ({ contacts, setSelectedContact }) => {
    return (
        <ul>
            {contacts.map(contact => (
                <li
                    key={contact.id}
                    className="cursor-pointer hover:bg-gray-200 p-2 rounded"
                    onClick={() => setSelectedContact(contact)}
                >
                    {contact.name}
                </li>
            ))}
        </ul>
    );
};

export default ContactList;
