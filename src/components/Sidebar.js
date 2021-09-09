// React Component for Sidebar
import React, { useEffect, useRef, useState } from 'react';
import { Divider } from 'rsuite';
import DashboardToggle from './Dashboard/DashboardToggle';
import '../styles/utility.scss';
import CreateRoomBtnModal from './Dashboard/CreateRoomBtnModal';
import ChatRoomList from './Rooms/ChatRoomList';

const Sidebar = () => {
    // creating ref for the Sidebar Component
    const topSidebarRef = useRef();

    // state for height for the nested-div inside the Component below
    const [height, setHeight] = useState(0);

    useEffect(() => {
        // topSidebarRef.current works just like document.getElementById()
        if (topSidebarRef.current) {
            // if the Component is defined
            setHeight(topSidebarRef.current.scrollHeight);
        }
    }, [topSidebarRef]);

    return (
        <div className="h-100 pt-2">
            <div ref={topSidebarRef}>
                <DashboardToggle />
                <CreateRoomBtnModal />
                <Divider>Join Conversation</Divider>
            </div>
            <ChatRoomList aboveElementHeight={height} />
        </div>
    );
};

export default Sidebar;
