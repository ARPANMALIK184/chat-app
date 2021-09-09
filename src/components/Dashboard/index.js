// React Component to contain code for Dashboard Component
// the Dashboard Component is written inside the DashboardToggle Component's Drawer Component
import React from 'react';
import { Drawer, Button, Divider, Alert } from 'rsuite';
import { useProfile } from '../../context/profile.context';
import { database } from '../../misc/firebase';
import EditableInput from '../EditableInput';
import AvatarUploadBtn from './AvatarUploadBtn';
import ProviderBlock from './ProviderBlock';
import { getUserUpdates } from '../../misc/helpers';

const Dashboard = ({ onSignOut }) => {
    // getting access to Profile Context
    /* 
        Since ProfileContextProvider wraps the Homepage Component, it also
        encompasses its children Components.
    */
    const { profile } = useProfile();

    const onSave = async newData => {
        // newData is the new input received from the user that would replace its old value in the database
        // since this function requires working with the database, it would return a promise, so it's an async function

        // handling promises
        try {
            // using user-defined function to get updated values
            /* returns on object. Keys correspond to location in the databases, and their
                respective values correspond to new values that are to replace the older
                ones in the database.
            */
            const updates = await getUserUpdates(
                profile.uid,
                'name',
                newData,
                database
            );

            /* structure of *updates*:
                - 'updates' returned by the getUserUpdates() function is an object.
                - each key corresponds to the location where the update is to be made, and
                  each value corresponds to the updated value that is to replace the old value.
                - Eg: updates : {
                    '/messages/author/name' : 'newName'
                    'rooms/lastMessage/text' : 'newMessage'
                    }
            */
            // updating values in the databases
            await database.ref().update(updates);

            Alert.success('Nickname updated', 4000);
        } catch (err) {
            Alert.error(`Error: ${err.message}`, 4000);
        }
    };

    return (
        <>
            <Drawer.Header>
                <Drawer.Title>Dashboard</Drawer.Title>
            </Drawer.Header>

            <Drawer.Body>
                <h3>Hey, {profile.name} </h3>
                <ProviderBlock />
                <Divider />
                <EditableInput
                    name="nickname"
                    initialValue={profile.name}
                    onSave={onSave}
                    label={<h6 className="mb-2">Nickname</h6>}
                />
                <AvatarUploadBtn />
            </Drawer.Body>

            <Drawer.Footer>
                <Button block color="red" onClick={onSignOut}>
                    Sign out
                </Button>
            </Drawer.Footer>
        </>
    );
};

export default Dashboard;
