const wdk = require('wikidata-sdk');
const axios = require('axios');

async function getSparql(query) {
  const url = wdk.sparqlQuery(query);

  return await axios.get(url);
    // .then(function (response) {
    //   return wdk.simplify.sparqlResults(response, { minimize: false })
    // });
}
module.exports = async function getRelatives(id) {
  // console.log(createRelativeQuery(id));
  return await getSparql(createRelativeQuery(id));
};

function createRelativeQuery(id) {
  return `
PREFIX gas: <http://www.bigdata.com/rdf/gas#>
  SELECT ?item ?itemLabel ?linkTo {
    { SERVICE gas:service {
  gas:program gas:gasClass "com.bigdata.rdf.graph.analytics.SSSP" ;
  gas:in wd:${id};
  gas:traversalDirection "Forward" ;
  gas:out ?item ;
  gas:out1 ?depth ;
  gas:maxVisited 2 ;
  gas:linkType wdt:P40 .
} } UNION { SERVICE gas:service {
  gas:program gas:gasClass "com.bigdata.rdf.graph.analytics.SSSP" ;
  gas:in wd:${id} ;
  gas:traversalDirection "Reverse" ;
  gas:out ?item ;
  gas:out1 ?depth ;
  gas:maxVisited 4 ;
  gas:linkType wdt:P40 .
} } UNION { SERVICE gas:service {
  gas:program gas:gasClass "com.bigdata.rdf.graph.analytics.SSSP" ;
  gas:in wd:${id} ;
  gas:traversalDirection "Forward" ;
  gas:out ?item ;
  gas:out1 ?depth ;
  gas:maxVisited 2 ;
  gas:linkType wdt:P3373 .
} } UNION { SERVICE gas:service {
  gas:program gas:gasClass "com.bigdata.rdf.graph.analytics.SSSP" ;
  gas:in wd:${id} ;
  gas:traversalDirection "Forward" ;
  gas:out ?item ;
  gas:out1 ?depth ;
  gas:maxVisited 2 ;
  gas:linkType wdt:P26 .
} }
#   OPTIONAL { ?item wdt:P279 ?linkTo }
SERVICE wikibase:label {bd:serviceParam wikibase:language "en" }
}`;
}