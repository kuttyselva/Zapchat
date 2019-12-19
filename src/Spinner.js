import React from 'react';
import spinner from './source.gif';

export default () => {
    return (
        <div>
            <img
                src={spinner}
                alt="loading..."
                style={{
                    width: '500px',
                    position: 'absolute',
                    margin: 'auto',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                }} />
        </div>
    )
}