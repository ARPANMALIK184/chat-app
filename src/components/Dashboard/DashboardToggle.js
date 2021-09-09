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
        database
            .ref(`/status/${auth.currentUser.uid}`)
            .set(isOfflineForDatabase)
            .then(() => {
                // sign user out
                auth.signOut();
                /* Once the user is signed-out, the auth.onAuthStateChanged() inside the useEffect() which is
                   inside the ProfileProvider function of ProfileContext is fired.
                    This leads to the const "profile" becoming null. 
                    Inside the PrivateRoute Component, since the "profile" received from useProfile() is now null,
                    it redirects the user ti the Sign-in page (based on conditions) 
                    (refer to profile.context.js, and the PublicRoute and PrivateRoute Components)
                */

                Alert.info('Signed out successfully', 4000);

                close(); // update the state of the Drawer
            })
            .catch(err => {
                Alert.error(err.message, 4000);
            });
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
