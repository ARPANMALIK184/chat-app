// React Component
// It will imitate like the Route Component from 'react-router'

import React from 'react';
import { Redirect, Route } from 'react-router';
import { Container, Loader } from 'rsuite';
import { useProfile } from '../context/profile.context';

const PublicRoute = ({ children, ...routeProps }) => {
    // using useProfile() custom-hook to use get Context data from ProfileContext Context.
    const { profile, isLoading } = useProfile(); // returns the profile data from the ProfileContext Context

    if (!profile && isLoading) {
        // if the page is still loading
        return (
            <Container>
                <Loader
                    center
                    vertical
                    size="md"
                    content="loading"
                    speed="slow"
                />
            </Container>
        );
    }
    if (profile && !isLoading) {
        // if user not signed-in, redirect to sign-in page
        return <Redirect to="/" />;
    }

    // else, direct user to the component inside {children}
    return <Route {...routeProps}>{children}</Route>;
};

export default PublicRoute;
