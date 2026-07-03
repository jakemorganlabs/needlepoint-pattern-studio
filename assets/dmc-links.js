export function getDmcUrl(number) {
  const code = encodeURIComponent(String(number));
  return `https://www.dmc.com/us/search?q=${code}`;
}

export function getAmazonUrl(number, name) {
  const query = encodeURIComponent(`DMC ${number} ${name} embroidery floss`);
  return `https://www.amazon.com/s?k=${query}`;
}

export function buildThreadLinks(entry) {
  return {
    dmc: getDmcUrl(entry.number),
    amazon: getAmazonUrl(entry.number, entry.name),
  };
}
