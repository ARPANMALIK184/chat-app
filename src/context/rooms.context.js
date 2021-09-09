// React Context for Chat Rooms
// Chat rooms would be accessed from the Sidebar and Homepage Component
import React, { createContext, useContext, useEffect, useState } from 'react';
import { database } from '../misc/firebase';
import { transformToArrayWithId } from '../misc/helpers';

const RoomsContext = createContext();

// creating Provider to provide all its consuming Components/children with Context data
export const RoomsProvider = ({ children }) => {
    // state for Rooms
    const [rooms, setRooms] = useState(null);

    // having useEffect() so that a new room added appears immediately in the Rooms list
    // REMINDER: useEffect() executes everytime when the state of any element inside the mentioned array changes
    useEffect(() => {
        // creating reference to location of "rooms" data in the database
        const roomListRef = database.ref('rooms');

        roomListRef.on('value', snap => {
            // using helper function to convert snap.val() into suitable form (check out helpers.js)
            const roomData = transformToArrayWithId(snap.val());
            setRooms(roomData); // update "rooms" state
        });

        // cleanup function to unsubscribe resources
        return () => {
            roomListRef.off();
        };
    }, [rooms]);

    return (
        <RoomsContext.Provider value={rooms}>{children}</RoomsContext.Provider>
    );
};

// custom-hook to return Rooms Context data
export const useRooms = () => useContext(RoomsContext);
