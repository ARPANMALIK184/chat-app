// React Component for Button that opens a Modal on clicking and shows Chat Room info
import React, { memo } from 'react';
import { Button, Modal } from 'rsuite';

import {
    useCurrentRoom,
    CurrentRoomProvider,
} from '../../../context/current-room.context';
import { useModalState } from '../../../misc/custom-hooks';

const RoomInfoBtnModal = () => {
    // getting CurrentRoom info using the CurrentRoom Context
    const name = useCurrentRoom(v => v.name);
    const description = useCurrentRoom(v => v.description);

    // custom-hook to use for Modal state
    const { isOpen, open, close } = useModalState();

    return (
        <CurrentRoomProvider>
            <Button appearance="link" className="px-0" onClick={open}>
                Room Info
            </Button>

            <Modal show={isOpen} onHide={close}>
                <Modal.Header>
                    <Modal.Title>About {name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h6 className="mb-1">Description</h6>
                    <p>{description}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button block onClick={close}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </CurrentRoomProvider>
    );
};

export default memo(RoomInfoBtnModal);
