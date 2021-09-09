// React Context for current Chat Room
/* We're creating a separate Context for the current Chat Room so that 
   any state change in a different Chat room doesn't re-render the current Chat page.
   Also, it's done using 'use-context-selector'.
   This also allows us to get a specific value instead of a whole set of values.

   Eg.: Suppose this Context provides this data:
         CurrentRoom = {
             name,
             description
         }
        if we only need "name" from the CurrentRoom Context, we could get retrieve it without
        having to retrieve the whole Object in the first place. 
        
        Also, if the state of "description" changes, the Component using only 
        "name" from this Context won't be re-rendered, which would have been the case
        if 'use-context-selector' was not used.

        The Component accessing Contexts implemented using 'use-context-selector'
        have to be "memo'd". 
*/
import React from 'react';
import { createContext, useContextSelector } from 'use-context-selector';

const CurrentRoomContext = createContext();

// Provider for this Context
export const CurrentRoomProvider = ({ children, data }) => {
    return (
        <CurrentRoomContext.Provider value={data}>
            {children}
        </CurrentRoomContext.Provider>
    );
};

// custom-hook
export const useCurrentRoom = selector =>
    useContextSelector(CurrentRoomContext, selector);
