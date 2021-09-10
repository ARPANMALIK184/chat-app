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
    const { profile } = useProfile();

    const onSave = async newData => {
        const userNicknameRef = database
            .ref(`/profiles/${profile.uid}`)
            .child('name');
        try {
            await userNicknameRef.set(newData);
            Alert.success('Nickname updated', 4000);
        } catch (err) {
            Alert.error(err.message, 4000);
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
