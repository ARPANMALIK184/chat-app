/* eslint-disable no-unreachable */
// React Component
import React, { useState } from 'react';
import { Tag, Icon, Button, Alert } from 'rsuite';
import firebase from 'firebase/app';
import { auth } from '../../misc/firebase';
import '../../styles/override.scss';

const ProviderBlock = () => {
    // state to keep track of method used for signing-in user
    const [isConnected, setIsConnected] = useState({
        'google.com': auth.currentUser.providerData.some(
            data => data.providerId === 'google.com'
        ),
        'facebook.com': auth.currentUser.providerData.some(
            data => data.providerId === 'facebook.com'
        ),
    });

    // function to update state of isConnected
    const updateIsConnected = (providerId, value) => {
        setIsConnected(p => {
            return {
                ...p,
                [providerId]: value,
            };
        });
    };

    // handlers to link to a Provider
    const link = async provider => {
        try {
            await auth.currentUser.linkWithPopup(provider);
            Alert.info(`Linked to provider ${provider.providerId}`, 4000);
            // update state
            updateIsConnected(provider.providerId, true);
        } catch (err) {
            Alert.error(err.message, 4000);
        }
    };

    const linkFacebook = () => {
        link(new firebase.auth.FacebookAuthProvider());
    };

    const linkGoogle = () => {
        link(new firebase.auth.GoogleAuthProvider());
    };

    // handlers to unlink from a provider
    const unlink = async providerId => {
        /* a user would unlink from a provider, if they're signed-in with two both providers,
           i.e., Google and Facebook. 
           The user won't be able to unlink from a provider if that provider is the only method
           of their sign-in. Otherwise, they would lose their account.
        */
        try {
            // if the user is signed-in with just one provider
            /* currentUser.providerData is an array consisting of objects. Each object
           consists of provider info through which the user is signed-in.
        */
            if (auth.currentUser.providerData.length === 1) {
                throw new Error(`You cannot disconnect from ${providerId}`);
            }

            // unlink the user from that provider
            await auth.currentUser.unlink(providerId);

            // update state
            updateIsConnected(providerId, false);
            Alert.info(`Disconnected from ${providerId}`, 4000);
        } catch (err) {
            Alert.error(err.message, 4000);
        }
    };

    const unlinkFacebook = () => {
        unlink('facebook.com');
    };

    const unlinkGoogle = () => {
        unlink('google.com');
    };

    return (
        <div>
            {isConnected['google.com'] && (
                <Tag color="green" closable onClose={unlinkGoogle}>
                    <Icon icon="google" /> Connected
                </Tag>
            )}

            {isConnected['facebook.com'] && (
                <Tag color="blue" closable onClose={unlinkFacebook}>
                    <Icon icon="facebook" /> Connected
                </Tag>
            )}

            <div className="mt-2">
                {!isConnected['google.com'] && (
                    <Button block color="green" onClick={linkGoogle}>
                        <Icon icon="google" /> Link to Google
                    </Button>
                )}

                {!isConnected['facebook.com'] && (
                    <Button block color="blue" onClick={linkFacebook}>
                        <Icon icon="facebook" /> Link to Facebook
                    </Button>
                )}
            </div>
        </div>
    );
};

export default ProviderBlock;
