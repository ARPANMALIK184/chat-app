// React Component that allows to edit Chat room name and description
import React, { memo } from 'react';
import { useParams } from 'react-router';
import { Alert, Button, Drawer } from 'rsuite';
import { useCurrentRoom } from '../../../context/current-room.context';

import { useMediaQuery, useModalState } from '../../../misc/custom-hooks';
import { database } from '../../../misc/firebase';
import EditableInput from '../../EditableInput';

const EditRoomBtnDrawer = () => {
    // grab the chat ID
    const { chatId } = useParams();

    // using custom-hook for Modal state
    const { isOpen, open, close } = useModalState();

    const isMobile = useMediaQuery('(max-width: 992px)');

    // retrieving current Chat room info from CurrentRoomContext
    const roomName = useCurrentRoom(v => v.name);
    const roomDescription = useCurrentRoom(v => v.description);

    // function to update Chat room data
    const updateData = (key, value) => {
        database
            .ref(`rooms/${chatId}`)
            .child(key)
            .set(value)
            .then(() => {
                Alert.success('Updated', 4000);
            })
            .catch(err => {
                Alert.error(err.message, 4000);
            });
    };

    // function to save Chat room name
    const onNameSave = newRoomName => {
        updateData('name', newRoomName);
    };

    // function to save Chat room description
    const onDescriptionSave = newDescription => {
        updateData('description', newDescription);
    };

    return (
        <div>
            <Button className="br-circle" size="sm" color="red" onClick={open}>
                A
            </Button>

            <Drawer
                full={isMobile}
                show={isOpen}
                onHide={close}
                placement="right"
            >
                <Drawer.Header>
                    <Drawer.Title>Edit Room</Drawer.Title>
                </Drawer.Header>

                <Drawer.Body>
                    <EditableInput
                        initialValue={roomName}
                        onSave={onNameSave}
                        label={<h6 className="mb-2">Room name</h6>}
                        emptyMSg="Room name can't be empty"
                    />

                    <EditableInput
                        componentClass="textarea"
                        rows={5}
                        initialValue={roomDescription}
                        onSave={onDescriptionSave}
                        label={<h6 className="mb-2">Description</h6>}
                        wrapperClassName="mt-3"
                        emptyMSg="Description can't be empty"
                    />
                </Drawer.Body>

                <Drawer.Footer>
                    <Button block onClick={close}>
                        Close
                    </Button>
                </Drawer.Footer>
            </Drawer>
        </div>
    );
};

export default memo(EditRoomBtnDrawer);
