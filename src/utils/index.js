const shortAddress = (value) => {
  if (!value || typeof value !== 'string') {
    return '';
  }

  if (value.length < 42) {
    return value;
  }

  return `${value.slice(0, 4)}...${value.slice(-4)}`;
};

const capitalizeFirstLetter = (value) =>
  value[0].toUpperCase() + value.slice(1);

export { shortAddress, capitalizeFirstLetter };
