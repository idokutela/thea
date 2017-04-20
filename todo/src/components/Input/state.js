export const stateToProps = (attrs, stateInt) => {
  const { currentValue } = stateInt;
  const valueChanged = currentValue !== undefined && currentValue !== attrs.value;
  const state = Object.assign(stateInt, { valueChanged });
  return Object.assign({},
    attrs,
    {
      state,
      value: ( // Either the current value if it makes sense
        currentValue !== undefined &&
        currentValue
      ) || attrs.value,
    },
  );
};

export const initialState = { isFocussed: false };
