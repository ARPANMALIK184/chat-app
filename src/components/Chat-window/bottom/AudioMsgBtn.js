// React Component for recording audio and sending to Chat
import React, { useCallback, useState } from 'react';
import { ReactMic } from 'react-mic';
import { useParams } from 'react-router';
import { Alert, Icon, InputGroup } from 'rsuite';
import { storage } from '../../../misc/firebase';

const AudioMsgBtn = ({ afterUpload }) => {
    // get chatId
    const { chatId } = useParams();

    // state for recording audio
    const [isRecording, setIsRecording] = useState(false);

    // state for uploading
    const [isUploading, setIsUploading] = useState(false);

    const onClick = useCallback(() => {
        // set state of isRecording
        setIsRecording(p => !p);
    }, []);

    // function/handler to upload recorded audio
    // when the onStop() event of ReactMic is triggered, the onUpload() function is executed
    // ReactMic's onStop() event provides the recorded audio to work with.
    const onUpload = useCallback(
        async recordedAudio => {
            setIsUploading(true);
            try {
                /* 
                   Using the firebase storage (NOT realtime database!) to store files
                   only the links to the files in the storage would be stored in the databases.
                   This is similar to storing Avatar images done previously.
                */
                const snap = await storage
                    .ref(`chat/${chatId}`)
                    .child(`audio_${Date.now()}.mp3`)
                    .put(recordedAudio.blob, {
                        cacheControl: `public, max-age=${3600 * 24 * 3}`,
                    });

                // structure of recorded file info to be stored in the database
                // REMINDER: actual audio in storage, audio file info in realtime database
                const audioFile = {
                    contentType: snap.metadata.contentType,
                    name: snap.metadata.name,
                    url: await snap.ref.getDownloadURL(),
                };

                setIsUploading(false);
                // using user-defined afterUpload() function to upload recorded file info to the database
                afterUpload([audioFile]); // passing as an array since afterUpload() takes an array of files as an argument
            } catch (err) {
                setIsUploading(false);
                Alert.error(err.message, 4000);
            }
        },
        [afterUpload, chatId]
    );

    return (
        <>
            <InputGroup.Button
                onClick={onClick}
                disabled={isUploading}
                className={isRecording ? 'animate-blink' : ''}
            >
                {/* using InputGroup.Button cause this Component is placed inside InputGroup of index.js (bottom) */}
                <Icon icon="microphone" />
                <ReactMic
                    record={isRecording}
                    className="d-none"
                    onStop={onUpload}
                    mimeType="audio/mp3"
                />
            </InputGroup.Button>
        </>
    );
};

export default AudioMsgBtn;
