import React, { FC, useState, Fragment, useEffect, } from 'react';
// import { InformationCircleIcon, XCircleIcon, CheckCircleIcon, ExclamationCircleIcon, QuestionMarkCircleIcon } from '@heroicons/react/solid';
// import { } from '@heroicons/react/outline';
// import { Dialog as TDialog, Transition } from '@headlessui/react'
import Backdrop from './Backdrop';
import { Modal } from 'react-bootstrap'
// import Button from './Button';
import { setDialogHandler } from '../../redux/slices/alerts';
import { useAppDispatch } from '../../redux/store';


const color = {
    error: "bg-red-500",
    success: "bg-green-500",
    warning: "bg-orange-500",
    confirmation: "bg-blue-500",
    info: "bg-blue-400",
}
const icon = {
    error: <span className="text-grey">[&amp;#xf00d;]</span>,
    success: <span className="text-grey">[&amp;#xf00c;]</span>,
    warning: <span className="text-grey">[&amp;#xf06a;]</span>,
    confirmation: <span className="text-grey">[&amp;#xf059;]</span>,
    info: <span className="text-grey">[&amp;#xf05a;]</span>,
}

type Severity = keyof typeof color;
type DialogResponse = "ok" | "yes" | "no" | "nothing";

interface DialogProps {
    open: boolean,
    severity: Severity,
    title: string,
    message: string,
    onResponse: (val: DialogResponse) => void
}
export const Dialog: FC<DialogProps> = ({ open, severity, title, message, onResponse }) => {

    function closeModal() {
        onResponse("nothing")
    }

    return (

        // <Backdrop open onClick={e => { (e.target === e.currentTarget) && onResponse('nothing') }}  >
        //     <div className='w-[500px] mx-3 bg-gray-100 rounded-md overflow-hidden p-4 font-sans' >
        //         <div className='text-3xl text-center' style={{ color: color[severity] }} >{title}</div>
        //         <div className='my-5 text-2xl text-center text-gray-600'>{message}</div>
        //         <div className="mt-4 flex justify-end p-4 space-x-2">
        //             {((["error", "warning", "success", "info"] as Severity[]).includes(severity)) && <button className="btn-main inline lead" onClick={() => { onResponse('ok') }} >OK</button>}
        //             {((["confirmation"] as Severity[]).includes(severity)) && <button className="btn-main inline lead" onClick={() => { onResponse('yes') }} >Yes</button>}
        //             {((["confirmation"] as Severity[]).includes(severity)) && <button className="btn-main inline white lead" onClick={() => { onResponse('no') }} >No</button>}
        //         </div>
        //     </div>
        // </Backdrop>
        <Modal show={open} onHide={closeModal} backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{message}</Modal.Body>
            <Modal.Footer>
                {((["error", "warning", "success", "info"] as Severity[]).includes(severity)) && <button className="btn-main inline lead" onClick={() => { onResponse('ok') }} >OK</button>}
                {((["confirmation"] as Severity[]).includes(severity)) && <button className="btn-main inline lead" onClick={() => { onResponse('yes') }} >Yes</button>}
                {((["confirmation"] as Severity[]).includes(severity)) && <button className="btn-main inline white lead" onClick={() => { onResponse('no') }} >No</button>}
            </Modal.Footer>
        </Modal>
    )
}


export type ShowDialogCallback = (severity: Severity, title: string, message: string, onResponse?: StateType['callback']) => Promise<DialogResponse>


interface StateType {
    open: boolean,
    severity: Severity,
    title: string,
    message: string,
    callback: (val: DialogResponse) => void
}

export const DialogRootWrapper: FC = ({ children }) => {
    const [state, setState] = useState<StateType>({ open: false, title: "Some thing went wrong", message: "", severity: 'error', callback: () => { } });
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(setDialogHandler(showDialog));
    }, [])

    const resetState = () => { setState(e => ({ ...e, open: false })) }

    const showDialog: ShowDialogCallback = async (severity, title, message, onResponse) => {
        return await new Promise<DialogResponse>((resolve) => {
            setState({
                open: true,
                severity,
                title,
                message,
                callback: (v) => { resetState(); onResponse && onResponse(v); resolve(v) }
            })
        })
    }

    return (
        <>
            <div>
                <Dialog open={state.open} severity={state.severity} title={state.title} message={state.message} onResponse={state.callback} />
            </div>
            {children}
        </>
    )
}
