export const isValidDomainName = (str) => {
  const regex = /^(?!:\/\/)([a-zA-Z0-9-]{1,}[.]){1,}[a-zA-Z]{2,}$/;
  return regex.test(str);
};
