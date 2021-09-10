// React Component for button to upload profile Avatar
import React, { useState, useRef } from 'react';
import AvatarEditor from 'react-avatar-editor';
import { Alert, Button, Modal } from 'rsuite';
import { useProfile } from '../../context/profile.context';
import { useModalState } from '../../misc/custom-hooks';
import { database, storage } from '../../misc/firebase';
import ProfileAvatar from './ProfileAvatar';
import { getUserUpdates } from '../../misc/helpers';

const fileInputTypes = '.png, .jpeg, .jpg';
const acceptedFileTypes = ['image/png', 'image/jpeg', 'image/pjpeg'];

// function to check if the file type is valid
const isValidFile = file => acceptedFileTypes.includes(file.type);

const getBlob = canvas => {
    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
            if (blob) {
                // if "canvas" successfully converted to BLOB
                resolve(blob);
            } else {
                reject(new Error('File process error'));
            }
        });
    });
};

const AvatarUploadBtn = () => {
    // using custom-hook useModalState for to handle Modal show and hide props
    const { isOpen, open, close } = useModalState();

    // getting user profile info
    const { profile } = useProfile();

    // state for uploaded image file
    const [img, setImg] = useState(null);

    // state for loading
    const [isLoading, setIsLoading] = useState(false);

    // creating reference for AvatarEditor
    const avatarEditorRef = useRef();

    // function to handle file upload
    const onFileInputChange = event => {
        // getting the reference of files uploaded
        const currFiles = event.target.files;

        if (currFiles.length === 1) {
            const file = currFiles[0];

            if (isValidFile(file)) {
                setImg(file);
                open();
            } else {
                Alert.warning('Invalid file type', 4000);
            }
        }
    };

    // function to upload user Avatar
    const onUploadClick = async () => {
        // getting scaled image from the AvatarEditor Component.
        // this is where reference comes into play.
        const canvas = avatarEditorRef.current.getImageScaledToCanvas();

        // image needs to be converted to BLOB to be stored in database
        // use custom-defined function getBlob()
        // getBlob() uses the toBlob() function used to convert image to BLOB, and returns a promise
        setIsLoading(true);
        try {
            const blob = await getBlob(canvas);

            // storing BLOB image in the firebase storage
            // the user database will have the link to the avatar image stored in the firebase storage
            // user database -> contains avatar link -> link directs to the firebase storage where the original BLOB image is stored
            const avatarFileRef = storage
                .ref(`/profile/${profile.uid}`)
                .child('avatar');

            // uploading the image in the firebase storage
            const uploadAvatarResult = await avatarFileRef.put(blob, {
                cacheControl: `public, max-age=${3600 * 24 * 3}`,
            });

            // get the download URL of the Avatar image, and save it in the database
            // REMINDER: the original BLOB image is stored in the firebase storage as done above.
            const downloadURL = await uploadAvatarResult.ref.getDownloadURL();
            const useAvatarRef = database
                .ref(`/profiles/${profile.uid}`)
                .child('avatar');
            useAvatarRef.set(downloadURL);

            setIsLoading(false);
            Alert.info('Avatar uploaded', 4000);
        } catch (err) {
            setIsLoading(false);
            Alert.error(err.message, 4000);
        }
    };

    return (
        <div className="mt-3 text-center">
            <ProfileAvatar
                src={profile.avatar}
                name={profile.name}
                className="width-200 height-200 img-fullsize font-huge"
            />
            <div>
                <label
                    htmlFor="avatar-upload"
                    className="d-block cursor-pointer padder "
                >
                    Select New Avatar
                    <input
                        id="avatar-upload"
                        type="file"
                        className="d-none"
                        accept={fileInputTypes}
                        onChange={onFileInputChange}
                    />
                </label>

                <Modal show={isOpen} onHide={close}>
                    <Modal.Header>
                        <Modal.Title>Adjust and upload Avatar</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {img && (
                            <div className="d-flex justify-content-center align-items-center h-100">
                                <AvatarEditor
                                    ref={avatarEditorRef}
                                    image={img}
                                    width={200}
                                    height={200}
                                    border={10}
                                    borderRadius={100}
                                    rotate={0}
                                />
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            block
                            appearance="ghost"
                            onClick={onUploadClick}
                            disabled={isLoading}
                        >
                            Upload new Avatar
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
};

export default AvatarUploadBtn;
