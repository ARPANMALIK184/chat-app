// React Component
// This Component would allow the user to edit its text, and would update its value in the database as well
// To be used in many places in the app
import React, { useCallback, useState } from 'react';
import { Alert, Icon, Input, InputGroup } from 'rsuite';

const EditableInput = ({
    initialValue,
    onSave,
    label = null,
    placeholder = 'Write your value',
    emptyMSg = 'Empty message',
    wrapperClassName = '',
    ...inputProps
}) => {
    // state for input
    const [input, setInput] = useState(initialValue);

    const [isEditable, setIsEditable] = useState(false);

    // function on input change
    const onInputChange = useCallback(value => {
        setInput(value);
    }, []);

    // function called when "edit" icon is clicked
    const onEditClick = useCallback(() => {
        setIsEditable(p => !p);
        setInput(initialValue); // set to initial value if input is cleared
    }, [initialValue]);

    // function called when "save" icon is clicked
    const onSaveClick = async () => {
        // getting rid of spaces in the input
        const trimmedInput = input.trim();

        // if input is empty
        if (trimmedInput === '') {
            Alert.info('Empty message', 4000);
        }

        // if input is not equal to the initial value (changed), then use the onSave() prop to save it in the database
        if (trimmedInput !== initialValue) {
            // use the onSave() prop to save trimmedInput in the database
            await onSave(trimmedInput);
        }

        // disable "edit" function after initial value updated
        setIsEditable(false);
    };

    return (
        <div className={wrapperClassName}>
            {label}
            <InputGroup>
                <Input
                    {...inputProps}
                    disabled={!isEditable}
                    placeholder={placeholder}
                    value={input}
                    onChange={onInputChange}
                />

                <InputGroup.Button onClick={onEditClick}>
                    <Icon icon={isEditable ? 'close' : 'edit2'} />
                </InputGroup.Button>
                {isEditable && (
                    <InputGroup.Button onClick={onSaveClick}>
                        <Icon icon="check" />
                    </InputGroup.Button>
                )}
            </InputGroup>
        </div>
    );
};

export default EditableInput;
