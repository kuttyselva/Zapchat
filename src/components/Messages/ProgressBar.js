import React from 'react'
import { Progress } from 'semantic-ui-react'

const ProgressBar=({uploadState,percent})=>(
uploadState ==="uploading"&& (
    <Progress
    className="progress__bar"
    percent={percent}
    progress
    indicating
    size="medium"
    inverted
    />
)
);

export default ProgressBar;