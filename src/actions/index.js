import * as actionType from './types';
// user actions
export const setUser = user => {
    return {
        type: actionType.SET_USER,
        payload: {
            currentUser: user
        }
    }
}
export const clearUser = () => {
    return {
        type: actionType.CLEAR_USER,
    }
}
// channel Actions 
export const setCurrentChannel = (channel) => {
    return {
        type: actionType.SET_CURRENT_CHANNEL,
        payload: {
            currentChannel: channel
        }
    }
}

export const setPrivateChannel = isPrivateChannel => {
    return {
        type: actionType.SET_PRIVATE_CHANNEL,
        payload: {
            isPrivateChannel
        }
    }
}

export const setUserPosts = userPosts => {
    return {
        type: actionType.SET_USER_POST,
        payload: {
            userPosts
        }
    }
}

export const setColors = (primaryColor, secondaryColor) => {
    return {
        type: actionType.SET_COLORS,
        payload: {
            primaryColor, secondaryColor
        }
    }
}