import React, { FC } from 'react';


const COLOR = {
    default: ['border-gray-200'],
    primary: ['border-[#403f83]'],
    secondary: ['border-white'],
};


interface Props {
    color?: keyof typeof COLOR;
    height?: number
    width?: number
}

const Spinner: FC<Props> = ({ color = 'default', height = 40, width = 40 }) => {
    return (
        <div
            style={{ borderTopColor: 'transparent', display: 'inline-block', width, height }}
            className={`
                border-4 border-solid rounded-full animate-spin 
                ${COLOR[color]}
            `}
        />
    )
};

export default Spinner;
