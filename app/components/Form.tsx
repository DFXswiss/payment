import React, { ReactElement } from "react";
import { Control } from "react-hook-form";

interface Props {
  children: ReactElement[];
  control: Control<any>;
  rules: any;
  errors: any;
}

const Form = ({ children, control, rules, errors }: Props) => {
  return (
    <>
      {(Array.isArray(children) ? [...children] : [children]).map((child, i) =>
        child.props.name
          ? React.createElement(child.type, {
              ...{
                ...child.props,
                key: child.props.name,
                control: control,
                rules: rules[child.props.name],
                error: errors[child.props.name],
              },
            })
          : child
      )}
    </>
  );
};

export default Form;
