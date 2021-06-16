import React, { ReactElement } from "react";
import { Control } from "react-hook-form";

interface Props {
  children: ReactElement[];
  control: Control<any>;
  rules: any;
  errors: any;
  editable?: boolean;
}

const Form = ({ children, control, rules, errors, editable = true }: Props) => {
  const enrichElements = (elements: ReactElement[] | ReactElement): ReactElement[] | undefined => {
    if (!elements) return undefined;

    return (Array.isArray(elements) ? [...elements] : [elements])
      .map((element, i) => enrichElement(element, i));
  };

  const enrichElement = (element: ReactElement, index: number): ReactElement => {
    let props = {
      ...element.props,
      children: enrichElements(element.props.children),
      key: index,
    };

    if (element.props.name) {
      props = {
        ...props,
        control: control,
        rules: rules[element.props.name],
        error: errors[element.props.name],
        editable: editable
      };
    }

    return React.createElement(element.type, props);
  };

  return <>{enrichElements(children)}</>;
};

export default Form;
