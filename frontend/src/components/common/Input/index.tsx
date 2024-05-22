import { ErrorMessage, Field } from "formik";
import React, { FC } from "react";
import { InputProps } from "react-select";

interface FieldProps {
  as?: string
  rows?: number
  validate?: any
}

const Input: FC<React.InputHTMLAttributes<InputProps> & FieldProps> = ({ name, as = "input", ...fields }) => {
  return (
    <>
      <Field name={name} {...fields} as={as} />
      <ErrorMessage
        name={name || ""}
        component="p"
        //@ts-ignore
        style={{marginBottom:"0"}}
        className="text-sm mt-0.5 ml-0.5  text-error"
      />
    </>
  )
}

export default Input;