// Field array hook for dynamic form fields - separate import
import { useCallback } from 'react';

export const useFieldArray = (name, form) => {
  const fieldValue = form.values[name] || [];

  const append = useCallback((value) => {
    const newArray = [...fieldValue, value];
    form.setValue(name, newArray);
  }, [fieldValue, form, name]);

  const prepend = useCallback((value) => {
    const newArray = [value, ...fieldValue];
    form.setValue(name, newArray);
  }, [fieldValue, form, name]);

  const remove = useCallback((index) => {
    const newArray = fieldValue.filter((_, i) => i !== index);
    form.setValue(name, newArray);
  }, [fieldValue, form, name]);

  const insert = useCallback((index, value) => {
    const newArray = [...fieldValue];
    newArray.splice(index, 0, value);
    form.setValue(name, newArray);
  }, [fieldValue, form, name]);

  const move = useCallback((from, to) => {
    const newArray = [...fieldValue];
    const item = newArray.splice(from, 1)[0];
    newArray.splice(to, 0, item);
    form.setValue(name, newArray);
  }, [fieldValue, form, name]);

  const swap = useCallback((indexA, indexB) => {
    const newArray = [...fieldValue];
    [newArray[indexA], newArray[indexB]] = [newArray[indexB], newArray[indexA]];
    form.setValue(name, newArray);
  }, [fieldValue, form, name]);

  const replace = useCallback((index, value) => {
    const newArray = [...fieldValue];
    newArray[index] = value;
    form.setValue(name, newArray);
  }, [fieldValue, form, name]);

  const clear = useCallback(() => {
    form.setValue(name, []);
  }, [form, name]);

  return {
    fields: fieldValue,
    append,
    prepend,
    remove,
    insert,
    move,
    swap,
    replace,
    clear,
    length: fieldValue.length,
  };
};
