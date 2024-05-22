import React, { FC, HTMLAttributes, useEffect } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
    open: boolean;
    zIndex?: number
}

const Backdrop: FC<Props> = ({ children, open, zIndex = 1000, className, style, ...others }) => {

    useEffect(() => {
        const bodyElem = document.querySelector('body');
        if (!bodyElem) { return }

        if (open) {
            bodyElem.style.overflow = "hidden"
        } else {
            bodyElem.style.overflow = 'visible'
        }

        return () => { bodyElem.style.overflow = 'visible' }

    }, [open])


    if (!open) {
        return null
    }

    return (
        <div
            {...others}
            style={{
                zIndex,
                width: "100%", height: "100vh", overflowY: "auto",
                display: open ? "flex" : "none", justifyContent: "center", alignItems: "center",
                position: "fixed", top: 0, left: 0,
                backgroundColor: "rgba(0,0,0,.4)",
                ...style
            }}
        >
            {children}
        </div>
    )
};

export default Backdrop;
