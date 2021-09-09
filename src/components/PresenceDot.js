// React Component for Presence Dot, which shows if a user is online or not
import React from 'react';
import { Badge, Whisper, Tooltip } from 'rsuite';
import { usePresence } from '../misc/custom-hooks';

// function returning color name for Badge Component depending on value of presence.state (i.e., online or offline)
const getColor = presence => {
    if (!presence) {
        return 'gray'; // default color of Badge
    }

    switch (presence.state) {
        case 'online':
            return 'green';
        case 'offline':
            return 'orange';
        default:
            return 'gray';
    }
};

//
const getText = presence => {
    if (!presence) {
        return 'unknown state';
    }

    return presence.state === 'online'
        ? 'Online'
        : `Last seen at ${new Date(
              presence.last_changed
          ).toLocaleDateString()}`;
};

const PresenceDot = ({ uid }) => {
    // using custom-hook to get realtime presence of user
    const presence = usePresence(uid);

    return (
        <Whisper
            placement="top"
            trigger="hover"
            speaker={<Tooltip>getText(presence)</Tooltip>}
        >
            <Badge
                className="cursor-pointer"
                style={{ backgroundColor: getColor(presence) }}
            />
        </Whisper>
    );
};

export default PresenceDot;
