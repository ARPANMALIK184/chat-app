/* eslint-disable no-console */
// React Component to display the Chats on the Chat page
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { Alert, Button } from 'rsuite';
import { auth, database, storage } from '../../../misc/firebase';
import { groupBy, transformToArrayWithId } from '../../../misc/helpers';
import MessageItem from './MessageItem';

const PAGE_SIZE = 15;
const messagesRef = database.ref('/messages');

// function to decide whether to scroll to the bottom if the threshold is hit
function shouldScrollToBottom(node, threshold = 30) {
    // calculate % of scroll position
    const percentage =
        (100 * node.scrollTop) / (node.scrollHeight - node.clientHeight) || 0;

    return percentage > threshold;
}

const Messages = () => {
    // get chat ID
    const { chatId } = useParams();

    // state for messages
    const [messages, setMessages] = useState(null);

    // state for page-size
    const [limit, setLimit] = useState(PAGE_SIZE);

    // reference for Component/Tag
    const selfRef = useRef(); // used for the <ul> Tag where messages are displayed

    const isChatEmpty = messages && messages.length === 0;
    const canShowMessages = messages && messages.length > 0;

    // function to load previous messages
    const loadMessages = useCallback(
        limitToLast => {
            // get current <ul> Component reference
            const node = selfRef.current;

            // unsubscribe from the previous updates
            messagesRef.off();

            // listener for messages in current chat room
            messagesRef
                .orderByChild('room')
                .equalTo(chatId)
                .limitToLast(limitToLast || PAGE_SIZE) // limit child nodes to a certain amount. Each message-item is counted as 1 node.
                .on('value', snap => {
                    // using user-defined function to convert contents of snap.val() into suitable form
                    const data = transformToArrayWithId(snap.val());

                    // updating message state
                    setMessages(data);

                    if (shouldScrollToBottom(node)) {
                        node.scrollTop = node.scrollHeight;
                    }
                });

            // updating page limit
            setLimit(p => p + PAGE_SIZE);
        },
        [chatId]
    );

    // function to load older messages
    const onLoadMore = useCallback(() => {
        // referencing current <ul> Component
        const node = selfRef.current;
        const oldHeight = node.scrollHeight; // getting current height of the scroll bar before loading messages

        loadMessages(limit);

        setTimeout(() => {
            const newHeight = node.scrollHeight;
            node.scrollTop = newHeight - oldHeight;
        }, 200);
    }, [loadMessages, limit]);

    // useEffect() hook for changing message states. So that each message is added to database
    useEffect(() => {
        // referencing the current <ul> Component using ite reference
        const node = selfRef.current;

        // calling loadMessages() function
        loadMessages();

        // scrolling to bottom after reloading page
        // using setTimeout() so that the function inside it takes place after loadingMessages(), which is asynchronous.
        // we couldn't use await in this case since callback function inside the useEffect() hook have to be synchronous,
        setTimeout(() => {
            node.scrollTop = node.scrollHeight;
        }, 200);

        // cleanup function to unsubscribe resources after use
        return () => {
            messagesRef.off('value');
        };
    }, [loadMessages]);

    // function to handle Admin (to be sent as a prop to the MessageItem Component)
    const handleAdmin = useCallback(
        async uid => {
            const adminsref = database.ref(`rooms/${chatId}/admins`);
            let alertMessage;

            await adminsref.transaction(admins => {
                if (admins) {
                    if (admins[uid]) {
                        // if the user is already an Admin, remove them from Admin
                        admins[uid] = null;
                        alertMessage = 'Admin permission revoked';
                    } else {
                        // make the user Admin
                        admins[uid] = true;
                        alertMessage = 'Admin permission granted';
                    }
                }
                return admins;
            });

            Alert.info(alertMessage, 4000);
        },
        [chatId]
    );

    // function to handle number of likes for a message
    const handleLikes = useCallback(async msgId => {
        const messageRef = database.ref(`messages/${msgId}`);
        const { uid } = auth.currentUser;
        let alertMessage;

        await messageRef.transaction(msg => {
            if (msg) {
                if (msg.likes && msg.likes[uid]) {
                    // if the user has already liked a message, unlike it
                    msg.likeCount--;
                    msg.likes[uid] = null;
                    alertMessage = 'You unliked this message';
                } else {
                    // like the message
                    msg.likeCount++;

                    if (!msg.likes) {
                        msg.likes = {};
                    }

                    msg.likes[uid] = true;
                    alertMessage = 'You liked this message';
                }
            }
            return msg;
        });

        Alert.info(alertMessage, 4000);
    }, []);

    // function to delete a message
    const handleDelete = useCallback(
        async (msgId, file) => {
            // ask user to confirm delete
            // eslint-disable-next-line no-alert
            if (!window.confirm('Delete this message?')) {
                // if the user closes this, return
                return;
            }

            // else, delete the message
            // message to be deleted can also be the last message sent
            // use the "messages" to refer to the message state
            const isLastMessage = messages[messages.length - 1].id === msgId;

            const updates = {};
            updates[`/messages/${msgId}`] = null;

            if (isLastMessage && messages.length === 1) {
                updates[`/rooms/${chatId}/lastMessage`] = null;
            }

            if (isLastMessage && messages.length > 1) {
                updates[`/rooms/${chatId}/lastMessage`] = {
                    ...messages[messages.length - 2],
                    msgId: messages[messages.length - 2].id,
                };
            }

            // updating the database
            try {
                await database.ref().update(updates);

                Alert.success('Message deleted', 4000);
            } catch (err) {
                // eslint-disable-next-line consistent-return
                return Alert.error(err.message, 5000);
                /* explanation of having "return" in the above line:
                    - Suppose the message to be deleted is an uploaded file.
                    - If the deletion of the file from the realtime database 
                      (happening in this try-catch) fails, to make sure the code below
                      it doesn't execute, we have the "return" statement.
                    - In case of failed delete from the database, the code below would still erase
                      the files from the storage, if we didn't put "return" statement above.
                */
            }

            // if the deleted message is an uploaded file,
            // remove it from the storage (different from the realtime database) as well.
            if (file) {
                try {
                    // creating reference to storage, where uploaded files are stored
                    const fileRef = storage.refFromURL(file.url);
                    await fileRef.delete(); // delete file from storage
                } catch (err) {
                    Alert.error(err.message, 5000);
                }
            }
        },
        [chatId, messages]
    );

    const renderMessages = () => {
        // using user-defined function to group elements in an array
        // grouping messages by time
        const groups = groupBy(messages, msgItem =>
            new Date(msgItem.createdAt).toDateString()
        );
        // groups is now an Object with its keys as "date" of messages sent,
        // and values correspond to the messages sent on that date
        // console.log(groups);

        const items = [];

        // for each date, show date and messages on that date
        Object.keys(groups).forEach(date => {
            items.push(
                <li key={date} className="text-center mb-1 padded">
                    {date}
                </li>
            );

            // each date key inside the groups Object has messages as its value (date: [msg_1, msg_2])
            const msgs = groups[date].map(msg => (
                <MessageItem
                    key={msg.id}
                    message={msg}
                    handleAdmin={handleAdmin}
                    handleLikes={handleLikes}
                    handleDelete={handleDelete}
                />
            ));
            items.push(...msgs);
        });

        return items;
    };

    // console.log(messages);
    return (
        <ul ref={selfRef} className="msg-list custom-scroll">
            {messages && messages.length >= PAGE_SIZE && (
                <li className="text-center mt-2 mb-2">
                    <Button onClick={onLoadMore} color="green">
                        Load more
                    </Button>
                </li>
            )}
            {isChatEmpty && <li>No messages yet</li>}
            {canShowMessages && renderMessages()}
        </ul>
    );
};

export default Messages;
