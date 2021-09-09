// React Component for Button that opens up a Modal, asking user to send an attachment as a message
import React, { useState } from 'react';
import { useParams } from 'react-router';
import { Alert, Button, Icon, InputGroup, Modal, Uploader } from 'rsuite';

import { useModalState } from '../../../misc/custom-hooks';
import { storage } from '../../../misc/firebase';

const AttachmentBtnModal = ({ afterUpload }) => {
    // get chat Id
    const { chatId } = useParams();

    // custom-hook for handling Modal state
    const { isOpen, open, close } = useModalState();

    // state for file list
    // fileList would initially be an empty array
    const [fileList, setFileList] = useState([]);

    // state for loading
    const [isLoading, setIsLoading] = useState(false);

    const MAX_FILE_SIZE = 5 * 1000 * 1024; // 5 MB max size of files

    // function/handler to handle change of input
    // this handler is passed to the onChange() event of the rsuite file Uploader used below
    /* the onChange() event of rsuite's Uploader Component provides an array of uploaded files to be used.
        So any files uploaded under the Uploader Component would be accessible through the onChange() event.
    */
    const onChange = fileArr => {
        // getting files less than 5 MB. Only first 5 valid files taken
        const validFiles = fileArr
            .filter(file => file.blobFile.size <= MAX_FILE_SIZE)
            .slice(0, 5);

        // updating fileList state
        setFileList(validFiles);
    };

    // function/handler to upload files to chat
    const onUpload = async () => {
        try {
            /* since we have a list of files, we'll create a list of promises,
                each meant to upload file to the database.
            */
            const uploadPromises = fileList.map(file => {
                /* 
                   Using the firebase storage (NOT realtime database!) to store files
                   only the links to the files in the storage would be stored in the databases.
                   This is similar to storing Avatar images done previously.
                */
                return storage
                    .ref(`chat/${chatId}`)
                    .child(Date.now() + file.name)
                    .put(file.blobFile, {
                        cacheControl: `public, max-age=${3600 * 24 * 3}`,
                    });
            });

            // each promise inside "uploadPromises" returns a snapshot
            const uploadSnapshots = await Promise.all(uploadPromises);

            const shapePromises = uploadSnapshots.map(async snap => {
                // for each snapshot of file, return an object containing file info
                // this in turn would be stored in the realtime database
                return {
                    contentType: snap.metadata.contentType,
                    name: snap.metadata.name,
                    url: await snap.ref.getDownloadURL(),
                };
            });

            // resolving "shapePromises"
            // "files" would contain Array of Object, where each Object contains info about the uploaded file
            const files = await Promise.all(shapePromises);

            // uploading file info using another user-defined function
            await afterUpload(files);

            setIsLoading(false);
            close(); // close Modal window
        } catch (err) {
            setIsLoading(false);
            Alert.error(err.message, 4000);
        }
    };

    return (
        <>
            <InputGroup.Button onClick={open}>
                {/* using InputGroup.Button cause this Component is placed inside InputGroup of index.js (bottom) */}
                <Icon icon="attachment" />
            </InputGroup.Button>

            <Modal show={isOpen} onHide={close}>
                <Modal.Header>
                    <Modal.Title>Upload attachment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Uploader
                        className="w-100"
                        autoUpload={false}
                        fileList={fileList}
                        action=""
                        onChange={onChange}
                        multiple
                        listType="picture-text"
                        disabled={isLoading}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button block disabled={isLoading} onClick={onUpload}>
                        Send to chat
                    </Button>

                    <div className="text-right mt-2">
                        <small>*only files less than 5 MB are allowed.</small>
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default AttachmentBtnModal;
