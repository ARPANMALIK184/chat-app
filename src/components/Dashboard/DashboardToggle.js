// React Component for Dashboard Toggle
import React, { useCallback } from 'react';
import { Alert, Button, Drawer, Icon } from 'rsuite';
import { useMediaQuery, useModalState } from '../../misc/custom-hooks';
import Dashboard from '.';
import { auth, database } from '../../misc/firebase';
import { isOfflineForDatabase } from '../../context/profile.context';

const DashboardToggle = () => {
    const { isOpen, open, close } = useModalState();

    const isMobile = useMediaQuery('(max-width: 992px)'); // returns true or false

    // function to Sign-out user (to be sent as a prop to the Dashboard Component)
    const onSignOut = useCallback(() => {
        // sign user out
        auth.signOut();

        Alert.info('Signed out successfully', 4000);

        close();
    }, [close]);

    return (
        <>
            <Button block color="blue" onClick={open}>
                <Icon icon="dashboard" /> Dashboard
            </Button>
            <Drawer
                full={isMobile}
                show={isOpen}
                onHide={close}
                placement="left"
            >
                <Dashboard onSignOut={onSignOut} />
            </Drawer>
        </>
    );
};

export default DashboardToggle;
