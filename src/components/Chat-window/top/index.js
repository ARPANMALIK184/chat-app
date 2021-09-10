// React Component to form the Top part of the Chat page
import React, { memo } from 'react';
import { ButtonToolbar, Icon } from 'rsuite';
import { Link } from 'react-router-dom';
import { useCurrentRoom } from '../../../context/current-room.context';
import { useMediaQuery } from '../../../misc/custom-hooks';
import RoomInfoBtnModal from './RoomInfoBtnModal';
import EditRoomBtnDrawer from './EditRoomBtnDrawer';

const Top = () => {
    // using CurrentRoom Context to get only Room name, instead of all of its data
    // CurrentRoom Context is implemented using use-context-selector
    const name = useCurrentRoom(v => v.name);

    const isAdmin = useCurrentRoom(v => v.isAdmin);

    const isMobile = useMediaQuery('(max-width: 992px)');

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center">
                <h4 className="text-disappear d-flex align-items-center">
                    <Icon
                        componentClass={Link}
                        to="/"
                        icon="arrow-circle-left"
                        size="2x"
                        className={
                            isMobile
                                ? 'd-inline-block p-0 mr-2 text-blue link-unstyled'
                                : 'd-none'
                        }
                    />
                    <span className="text-disappear">{name}</span>
                </h4>

                <ButtonToolbar className="ws-no-wrap">
                    {isAdmin && <EditRoomBtnDrawer />}
                </ButtonToolbar>
            </div>

            <div className="d-flex justify-content-between align-items-center">
                <RoomInfoBtnModal />
            </div>
        </div>
    );
};

export default memo(Top);
