import React, { ReactElement } from "react";
import { Control } from "react-hook-form";
import { NativeSyntheticEvent, TextInputKeyPressEventData } from "react-native";

interface Props {
  children: ReactElement | ReactElement[];
  control: Control<any>;
  rules: any;
  errors: any;
  editable?: boolean;
  onSubmit?: () => void;
}

const Form = ({ children, control, rules, errors, editable = true, onSubmit }: Props) => {
  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key === "Enter" && onSubmit) onSubmit();
  };

  const enrichElements = (elements: ReactElement[] | ReactElement): ReactElement[] | undefined => {
    if (!elements) return undefined;

    return (Array.isArray(elements) ? [...elements] : [elements]).map((element, i) => enrichElement(element, i));
  };

  const enrichElement = (element: ReactElement, index: number): ReactElement => {
    if (!element.props) return element;

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
        editable: editable,
        onKeyPress: (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => handleKeyPress(e),
      };
    }

    return React.createElement(element.type, props);
  };

  return <>{enrichElements(children)}</>;
};

export default Form;
