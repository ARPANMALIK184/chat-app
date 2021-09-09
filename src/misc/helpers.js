// file containing reusable helper functions

// function to return user name initials
export function getNameInitials(name) {
    const splitName = name.toUpperCase().split(' ');

    // if name is two words or more, return initials of first two words
    if (splitName.length > 1) {
        return splitName[0][0] + splitName[1][0];
    }

    // else return initial of the firstname
    return splitName[0][0];
}

// function to transform an Object to Array
export function transformToArr(snapVal) {
    return snapVal ? Object.keys(snapVal) : [];
}

// function to convert database snapshot values from JSON to Array
export function transformToArrayWithId(snapVal) {
    /* snapVal refers to the contents of snap.val() used inside the callback function inside the on() function,
        while retrieving the contents of the database. It has the contents of the database in JSON format,
        which is to be converted into an array.
    */
    /* if snapVal is not null, return an array of objects where each object consists of a key and its values 
        from snapVal
        eg: suppose snapVal = {
                        room_1_id: {
                            name,
                            description
                        },
                        room_2_id: {
                            name,
                            description
                        }
                    } 
            then return in this form: [
                                        {
                                            name,
                                            description,
                                            room_1_id
                                        },
                                         {
                                            name,
                                            description,
                                            room_2_id
                                        }
                                    ]
           
    */
    return snapVal
        ? Object.keys(snapVal).map(roomId => {
              return { ...snapVal[roomId], id: roomId };
          })
        : [];
}

export async function getUserUpdates(userId, keyToUpdate, value, db) {
    const updates = {};

    updates[`profiles/${userId}/${keyToUpdate}`] = value;

    const getMessages = db
        .ref('/messages')
        .orderByChild('author/uid')
        .equalTo(userId)
        .once('value');

    const getRooms = db
        .ref('/rooms')
        .orderByChild('lastMessage/author/uid')
        .equalTo(userId)
        .once('value');

    // both the promises, snapMessages and getRooms will return snapshots
    const [mSnap, rSnap] = await Promise.all([getMessages, getRooms]);

    mSnap.forEach(messageSnap => {
        updates[`/messages/${messageSnap.key}/author/${keyToUpdate}`] = value;
    });

    rSnap.forEach(roomSnap => {
        updates[`/rooms/${roomSnap.key}/lastMessage/author/${keyToUpdate}`] =
            value;
    });

    return updates;
}

// function to group items in an array by keys
/* Takes 2 args:
    1. array whose elements need to be grouped
    2. callback function to generate grouping keys, by which the array elements are grouped.
    A GOOD EXAMPLE OF HOW IT'S USED:
      - An Array (of Objects) containing message Objects is sent.
      - the callback function would return the createdAt value from each message Object inside the Array.
      - the callback function would look like: (msgItem) => { return msgItem.createdAt; }
      - then the groupBy() function would return an object containing each createdAt as key, whose
        value would correspond to the message Object.
      - Something like: 
            {
                createdAt_1: [message_1, message_2],
                createdAT_2: [message_3, message_4],
                ...
            }
*/
export function groupBy(array, groupingKeyFn) {
    return array.reduce((result, ele) => {
        const groupingKey = groupingKeyFn(ele);

        if (!result[groupingKey]) {
            result[groupingKey] = [];
        }

        result[groupingKey].push(ele);

        return result;
    }, {});
}
