const axios = require('axios');
const wdk = require('wikidata-sdk');

module.exports = async function getItem(id, languageCode) {
  const url = await new Promise(((resolve, reject) => {
    try {
      resolve(wdk.getEntities({
        ids: id,
        languages: [languageCode],
        props: ['labels', 'descriptions', 'claims', 'sitelinks/urls'],
      }));
    } catch (error) {
      reject(error);
    }
  }));

  const {
    data: { entities },
  } = await axios.get(url);
  return entities;
  // const formattedEntity = await formatEntity(entities[id], languageCode);
  // return formattedEntity;
}
