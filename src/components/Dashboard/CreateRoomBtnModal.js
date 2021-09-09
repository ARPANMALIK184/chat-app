// React Component for a button on the Sidebar, which would, on clicking, create a chat-room
import React, { useCallback, useRef, useState } from 'react';
import {
    Button,
    Modal,
    Icon,
    Form,
    FormControl,
    FormGroup,
    ControlLabel,
    Schema,
    Alert,
} from 'rsuite';
import firebase from 'firebase/app';
import { useModalState } from '../../misc/custom-hooks';
import { auth, database } from '../../misc/firebase';

// default state of form
const INITIAL_FORM = {
    name: '',
    description: '',
};

const { StringType } = Schema.Types;

// creating model schema for object containing form fields
// this would be passed to the "model" prop of the Form
const model = Schema.Model({
    name: StringType().isRequired('Chat room name is required'),
    description: StringType().isRequired('Room description is required'),
});

const CreateRoomBtnModal = () => {
    // using custom-hook to manage Modal states
    const { isOpen, open, close } = useModalState();

    // state for form
    const [formValue, setFormValue] = useState(INITIAL_FORM);

    // loading state
    const [isLoading, setIsLoading] = useState(false);

    // creating Form reference to use its methods
    const formRef = useRef();

    // handler for form
    // the onChange event for rsuite forms provides the values entered for all the fields of the form
    // so it's easy to access them
    const onFormChange = useCallback(value => {
        // value constains the values of all form fields sent through the onChange() event
        setFormValue(value);
    }, []);

    const onSubmit = async () => {
        // validate form fields
        // formRef.current.check() checks the formValue against the schema model, and returns a boolean value accordingly
        if (!formRef.current.check()) {
            return;
        }

        // if fields are valid, save them to the database
        setIsLoading(true);

        const newRoom = {
            ...formValue,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            admins: {
                [auth.currentUser.uid]: true,
            },
        };

        try {
            // inserting room data in the database
            await database.ref('rooms').push(newRoom);

            Alert.info(`${formValue.name} has been created`, 4000);
            setIsLoading(false);
            setFormValue(INITIAL_FORM); // setting form state to default
            close(); // closing the Modal
        } catch (err) {
            Alert.error(err.message, 4000);
        }
    };

    return (
        <div className="mt-2">
            <Button block color="green" onClick={open}>
                <Icon icon="creative" />
                Create chat-room
            </Button>

            <Modal show={isOpen} onHide={close}>
                <Modal.Header>
                    <Modal.Title>New chat-room</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form
                        fluid
                        onChange={onFormChange}
                        formValue={formValue}
                        model={model}
                        ref={formRef}
                    >
                        <FormGroup>
                            <ControlLabel>Room name</ControlLabel>
                            <FormControl
                                name="name"
                                placeholder="Enter room name"
                            />
                        </FormGroup>

                        <FormGroup>
                            <ControlLabel>Room Description</ControlLabel>
                            <FormControl
                                componentClass="textarea"
                                name="description"
                                placeholder="Enter description"
                            />
                        </FormGroup>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        block
                        appearance="primary"
                        onClick={onSubmit}
                        disabled={isLoading}
                    >
                        Create
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default CreateRoomBtnModal;
