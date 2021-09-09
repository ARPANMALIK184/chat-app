// React Component to sign-in user
import React from 'react';
import firebase from 'firebase/app';
import { Alert, Button, Col, Container, Grid, Icon, Panel, Row } from 'rsuite';

import '../styles/utility.scss';
import { auth, database } from '../misc/firebase';

const Signin = () => {
    // provider is either Facebook or Google
    const signInWithProvider = async provider => {
        try {
            /* auth.signInWithPopup opens up a pop-up window for the clicked sign-in option, 
                    and asks to enter credentials to sign the user in. */
            // using auth function to extract signed in user info
            // after authorizing user, it gets stored under "Authorization" on firebase website
            // a user UID gets created when a user is authorized
            const { additionalUserInfo, user } = await auth.signInWithPopup(
                provider
            );

            // if the signed-in user is newUser (newUser == true)
            if (additionalUserInfo.isNewUser) {
                // add user to firebase database
                // the ref() function takes as an argument the path under which the data would be stored
                // REMINDER: the database is JSON-based
                // set() function is used to store the data in database in JSON format. It returns a promise
                database.ref(`/profiles/${user.uid}`).set({
                    name: user.displayName,
                    createdAt: firebase.database.ServerValue.TIMESTAMP,
                });
            }

            Alert.success('Signed in', 4000); // using Alert from rsuite
        } catch (err) {
            Alert.info(err.message, 4000); // using Alert from rsuite
        }
    };

    // sign-in with FaceBook
    const onFacebookSignIn = () => {
        signInWithProvider(new firebase.auth.FacebookAuthProvider()); // new firebase.auth.FacebookAuthProvider() returns a provider object
    };

    // sign-in with Google
    const onGoogleSignIn = () => {
        signInWithProvider(new firebase.auth.GoogleAuthProvider()); // new firebase.auth.GoogleAuthProvider() returns a provider object
    };

    return (
        <Container>
            <Grid className="mt-page">
                <Row>
                    <Col xs={24} md={12} mdOffset={6}>
                        <Panel>
                            <div className="text-center">
                                <h2>Welcome to chat</h2>
                                <p>ARPAN MALIK</p>
                            </div>

                            <div className="mt-3">
                                <Button
                                    block
                                    color="blue"
                                    onClick={onFacebookSignIn}
                                >
                                    <Icon icon="facebook" /> Continue with
                                    Facebook
                                </Button>

                                <Button
                                    block
                                    color="green"
                                    onClick={onGoogleSignIn}
                                >
                                    <Icon icon="google" /> Continue with Google
                                </Button>
                            </div>
                        </Panel>
                    </Col>
                </Row>
            </Grid>
        </Container>
    );
};

export default Signin;
