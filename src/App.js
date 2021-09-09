import React from 'react';
import { Switch } from 'react-router';
import 'rsuite/dist/styles/rsuite-default.css';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import { ProfileProvider } from './context/profile.context';
import Homepage from './pageComponents/Home';
import Signin from './pageComponents/Signin';
import './styles/main.scss';

function App() {
    return (
        <ProfileProvider>
            <Switch>
                <PublicRoute path="/signin">
                    <Signin />
                </PublicRoute>

                <PrivateRoute path="/">
                    <Homepage />
                </PrivateRoute>
            </Switch>
        </ProfileProvider>
    );
}

export default App;
