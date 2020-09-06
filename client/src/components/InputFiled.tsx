import React from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Textarea,
} from '@chakra-ui/core';
import { useField } from 'formik';

type InputFiledProps = React.InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  textarea?: boolean;
};

export const InputFiled: React.FC<InputFiledProps> = (props) => {
  const [field, { error }] = useField(props);
  let Component = Input;
  if (props.textarea) {
    Component = Textarea;
  }
  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{props.label}</FormLabel>
      <Component
        {...field}
        type={props.type}
        id={field.name}
        placeholder={props.placeholder}
      />
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};
