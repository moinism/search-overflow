var
  $q        = null,
  $text     = null,
  $search   = null,
  $result   = null,
  $bodyText = null,

  API = {
    search: 'https://api.stackexchange.com/2.2/search/advanced?order=desc&min=0&sort=votes&answers=1&filter=withbody&site=stackoverflow&q=',
    answer: {
      start: 'https://api.stackexchange.com/2.2/questions/',
      end: '/answers?order=desc&sort=votes&site=stackoverflow&filter=withbody'
    }
  },

  API_KEY = 'yk0xFuShXiohYse6apuyHA((',

  currentQs = [],
  ansCache  = {},

  arrowRespond = false;

var template = {
  meta: function (data) {
    var klass = (data.is_accepted) ? 'accepted' : '',
        owner = (data.owner.link && data.owner.display_name) ? '<a href="'+ data.owner.link +'" class="owner"><img src="'+ data.owner.profile_image +'" /> '+ data.owner.display_name +' <small>('+ data.owner.reputation +')</small></a>' : '';
    return '<div class="meta '+ klass + '">'+ owner +'<a href="http://stackoverflow.com/a/' + data.answer_id +'" class="permalink"><i class="icon-upvote"></i> '+ data.score +'</a></div>';
  },
  metaQ: function (data) {
    var owner = (data.owner.link && data.owner.display_name) ? '<a href="'+ data.owner.link +'" class="owner"><img src="'+ data.owner.profile_image +'" /> '+ data.owner.display_name +' <small>('+ data.owner.reputation +')</small></a>' : '';
    return '<div class="meta question">'+ owner +'<a href="http://stackoverflow.com/question/' + data.question_id +'" class="permalink"><i class="icon-upvote"></i> '+ data.score +'</a></div>';
  }
};

function getKey(token) {
  return '&key='+ API_KEY +'&access_token=' + token;
}


function showQuoteError() {
  $result.html('<h3>Quota Exceeded</h3><p>You\'ve requested a lot of resources, it appears. :( <a href="https://github.com/moinism/search-overflow/issues/1" target="blank" style="text-decoration:underline;">Details here</a></p>');
}

function handleRequestFail(error) {
  if(error.responseJSON.error_id == 502) {
    showQuoteError();
  }
}

function populateAnswers(data) {
  data.forEach(function (item) {
    $bodyText.append(template.meta(item) + item.body);
  });
  $bodyText.find('a').attr('target', '_blank').attr('tabindex','-1');
  $('pre code').each(function(i, block) {
    hljs.highlightBlock(block);
  });
  $('.info').text(data.length +' Answers Found');
}

function getAnswer(id, index) {

  $bodyText.html('<h2>'+ currentQs[index].title +'</h2>' + template.metaQ(currentQs[index]) + currentQs[index].body + '<h3 class="info">Loading answers ...</h3>');

  if(ansCache[id] !== undefined) {
    return populateAnswers(ansCache[id]);
  }

  $.getJSON( API.answer.start + id + API.answer.end, function (data) {
    ansCache[id] = data.items;
    populateAnswers(data.items);
  }).fail(handleRequestFail);
}

function searchSO(q) {
  if(q.length === 0) {
    return;
  }

  $content.show();
  $result.html('<h3>Searching .. .</h3>');

  $.getJSON( API.search + encodeURIComponent(q),
    function (data) {
      if(data.items.length === 0) {
        $result.html('<h3>Nothing found</h3>');
        return;
      }
      $result.html('');
      currentQs = data.items;
      data.items.forEach(function (item, index) {
        $result.append('<a href="#" tabindex="-1" class="question-link" data-index="'+ index +'" data-id="'+ item.question_id + '">'+ item.title +'</a>');
      });
    $result.find('a').on('click', qClick).first().click();
  }).fail(handleRequestFail);
}

function onSubmit(e) {
  e.preventDefault();
  return searchSO($q.val());
}

function qClick(e) {
  e.preventDefault();
  $result.find('a').removeClass('active');
  $(this).addClass('active').focus();
  $result.addClass('populated');
  enableArrow();
  return getAnswer($(this).data('id'), $(this).data('index'));
}

function reset() {
  $result.removeClass('populated').empty();
  $bodyText.empty();
  $content.hide();
}

function enableArrow() {
  arrowRespond = true;
}
function disableArrow() {
  arrowRespond = false;
}

function changeQuestionFocus(next, e) {
  if(!arrowRespond) {
    return;
  }

  e.preventDefault();

  if(next) {
    $('.question-link:focus').next().focus();
  } else {
    $('.question-link:focus').prev().focus();
  }
}

function toggleSectionFocus(e) {
  e.preventDefault();
  if($('.active').is(':focus')) {
    $bodyText.focus();
  } else {
    $('.active').focus();
    enableArrow();
  }
}

function handleKeyDown(e) {
  switch (e.which) {
    case 38:
      changeQuestionFocus(false, e);
    break;
    case 40:
      changeQuestionFocus(true, e);
    break;
    case 37:
      toggleSectionFocus(e);
    break;
    case 39:
      toggleSectionFocus(e);
    break;
  }
}

$(function () {

  $q        = $('#q');
  $search   = $('#search');
  $result   = $('#result');
  $bodyText = $('#bodyText');
  $content  = $('.content');

  // a hack to catch 'clear' event on search input
  $q.focus().on('search', function () {
    if( $(this).val().length === 0 ) {
      reset();
    }
  });

  $search.on('submit', onSubmit);
  $result.find('a').on('click', qClick);
  $bodyText.on('click, focus', disableArrow);
  $result.on('focus', function () {
    $('.active').focus();
    enableArrow();
  });

  // some usability
  $(document).keydown(handleKeyDown);

});
