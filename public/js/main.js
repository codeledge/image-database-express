/* eslint-env jquery, browser */
$(document).ready(() => {
  // Place JavaScript code here...

  $('.wikidata-searchbox').autocomplete({
    minLength: 2,
    source: (request, response) => {
      console.log(request.term);
      $.ajax({
        /* https://www.wikidata.org/w/api.php?action=wbsearchentities&search=W&format=json&errorformat=plaintext&language=en&uselang=en&type=item */
        url: 'https://www.wikidata.org/w/api.php',
        dataType: 'jsonp',
        data: {
          action: 'wbsearchentities',
          format: 'json',
          errorformat: 'plaintext',
          language: 'en',
          uselang: 'en',
          type: 'item',
          search: request.term
        },
        success(data) {
          // console.log(data);
          $('#wikidataEntity_id').val('');//Reset ID field
          data = data.search;
          response(data);
        }
      });
    },
    select(event, ui) {
      $('.wikidata-searchbox').val(ui.item.label);
      $('#wikidataEntity_id').val(ui.item.id);
      return false;
    }
  }).autocomplete('instance')._renderItem = function (ul, item) {
    return $('<li>')
      .append(`<div><b>${item.label}</b><br>${item.description}</div>`)
      .appendTo(ul);
  };
});
