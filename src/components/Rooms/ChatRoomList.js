//
import React from 'react';
import { Loader, Nav } from 'rsuite';
import { Link, useLocation } from 'react-router-dom';
import { useRooms } from '../../context/rooms.context';
import RoomItem from './RoomItem';

const ChatRoomList = ({ aboveElementHeight }) => {
    // using custom-hook to get access to Rooms Context
    const roomsData = useRooms();

    const location = useLocation();

    return (
        <Nav
            appearance="subtle"
            vertical
            reversed
            className="overflow-y-scroll custom-scroll"
            style={{ height: `calc(100% - ${aboveElementHeight}px)` }} // calculating height of the Component
            /* NOTE: the above calculation solves the problem of having different size of the 
              ChatRoomList Component for different screens.
              It is calculated by subtracting the height of elements/Components above it
              (div containing DashboardToggle and CreateRoomBtnModal) from 100%

            */
            activeKey={location.pathname}
        >
            {!roomsData && (
                <Loader
                    center
                    vertical
                    content="Loading..."
                    speed="slow"
                    size="md"
                />
            )}
            {roomsData &&
                roomsData.length > 0 &&
                roomsData.map(room => (
                    <Nav.Item
                        componentClass={Link}
                        to={`/chat/${room.id}`}
                        key={room.id}
                        eventKey={`/chat/${room.id}`}
                    >
                        <RoomItem room={room} />
                    </Nav.Item>
                ))}
        </Nav>
    );
};

export default ChatRoomList;
