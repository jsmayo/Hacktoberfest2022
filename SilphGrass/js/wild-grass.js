
$(function() {


  jQuery('.grassPatch').each(function(){
    plantGrass(jQuery(this).attr('data-patch-id'));
  });

  function plantGrass(patchID){
    el = jQuery('.grassPatch[data-patch-id="'+patchID+'"]');
    width = el.outerWidth();
    height = el.outerHeight();
    tilesAcross = Math.floor(width/48);
    tilesDown = Math.ceil(height/40);
    tilesToAppend = tilesAcross * tilesDown;
    var newTile = $('<div class="grassTile"></div>');
    for(var i = 0; i < tilesToAppend; i++){
      newTile.clone().attr('data-tile-id', i).appendTo(el);
    }
  }

  jQuery('body').on('click', '.grassPatch .grassTile', function() {
    if(jQuery('.checking').length > 0) { return; }
    $tile = jQuery(this)
    $('#encounter-background').remove();
    $tile.addClass('checking');
    console.log('checked location: '+jQuery(this).attr('data-tile-id')+' in patch: '+jQuery(this).closest('.grassPatch').attr('data-patch-id'));
    var payload = {
      location: $tile.closest('.grassPatch').attr('data-patch-id'),
      tile: $tile.closest('.grassPatch').attr('data-patch-id')
    };
    $.ajax({
      url: '/wild/encounter.json',
      method: 'POST',
      data: payload,
      success: function(data) {
        setTimeout(function() {
          showGrassPopover($tile, data);
        }, 1000);
      },
      error: function(data) {
        alert("Uh oh! Error checking wild grass!");
        $tile.removeClass('checking');
      }
    });
  });

  function showGrassPopover($el, data){
    if(data.type == null) {
      $el.removeClass('checking');
      return;
    }

    var popOverSettings = {
      placement: function(context, src) {
        jQuery(context).addClass(data.type);
        jQuery(context).addClass(data.drop);
        return 'auto top';
      },
      container: $el,
      animation: true,
      html: true,
      selector: $el, //Sepcify the selector here
      trigger: 'manual',
      viewport: {
        selector: 'body',
        padding: 0
      },
      content: function () {
        if(data.type=="item") {
          var $clone = $('.popover-template.'+data.type+'.'+data.drop).clone();
        } else if(data.type=="encounter") {
          var $clone = $('.popover-template.encounter').clone();
          // $clone.find('img').attr('src', data.meta.img);
          // $clone.find('p').text(data.meta.name);
          $('#encounter-background').remove();
          $("<style id='encounter-background'>.popover {opacity:0;transition:opacity .2s ease !important;}.grassTile.checking:after { background: url('"+data.meta.img+"') no-repeat 50% 50%/140% 140%; }</style>")
            .prependTo('#spawn-popover-templates');
        }
        return $clone.html();
      }
    }

    $el.popover(popOverSettings);
    $el.popover('show');
    processInventory(data.inventory);
    $('.popover').css('opacity', '1 !important');
    if(data.type=='null') {
      setTimeout(function() {
        $('.popover').fadeOut(350, function(){
          $el.popover('destroy');
          $el.removeClass('checking');
        });
      },750);
    } else if(data.type=='item'){
      $el.removeClass('checking');
      setTimeout(function() {
        $('.popover').fadeOut(650, function(){
          $el.popover('destroy');
        });
      },500);
    } else {
      // Catch it, you fool!
    }
  }


var processInventory = function(inventory) {
var slugs = Object.keys(inventory);
for(var slug of slugs) {
total = inventory[slug];
$('.grassTile.checking .popover-content .item-'+slug).text(total);
if (!$('#userInventory-'+slug).length) {
  $('#userInventory').append('<li id="userInventory-'+slug+'" style="flex:1; text-align: center; display:none; min-width: 40px; height:40px;">'+
  '<label style="height:25px;display:block;">'+
    '<img src="/img/'+(slug=="candy"?'the-grinder/sweet-candy':'pogo-assets/'+slug)+'.png" style="width:25px;display:block;margin:0 auto;"/>'+
  '</label>'+
  '<p class="total">'+total+'</p>'+
'</li>');
  $('#userInventory-'+slug+'').animate({width:'toggle'}, 350);
} else {
  $('#userInventory-'+slug+' .total').text(total);
}
}
};

var processDex = function(dex) {
var totalPkmn = 0;
var slugs = Object.keys(dex)
for(var slug of slugs) {
pkmn = dex[slug];
totalPkmn += parseInt(pkmn.total);
if (!$('#userDex-'+slug).length) {
  $('#userDex').append('<div id="userDex-'+slug+'" style="order:'+pkmn.meta.id+'; display:none; width: 120px; text-align:center; position:relative; background-color: #4a4a4a; margin:4px;">'+
  '<img style="width:65px;" src="'+pkmn.meta.img+'">'+
  '<p style="margin-bottom:0">'+pkmn.meta.name+'</p>'+
  '<p class="total" style="font-size:11px; line-height:20px; width:20px; height:20px;position:absolute;background-color:#fff;color:#333;border-radius:100%;top:15px;left:15px">'+pkmn.total+'</p>'+
  '<p># '+pkmn.meta.id+'</p>'+
'</div>');
  $('#userDex-'+slug+'').animate({width:'toggle'}, 350);
} else {
  $('#userDex-'+slug+' .total').text(pkmn.total);
}
}
$('#totalPkmn').text(totalPkmn);
};

var catchIt = function(ball) {
var payload = {
action: 'catch',
ball: ball,
};

doIt(payload, function(data) {
// Got a result, it'll be either `caught`, `fled`, `broke`.
// Caught means you got it, feld means it runs, broke means broke out of ball
var result = data.result;

switch(result) {
  case 'caught':
    closeEncounter("The beast is YOURS!");
    break;
  case 'fled':
    closeEncounter("Awww... it fled.");
    break;
  case 'broke':
    showDialog("It broke out of the ball!");
    break;
  default:
    // wtf did you break?
}
// Update the UI with pokedex and inventory
processInventory(data.inventory);
processDex(data.dex);
}, function() {
// If there's an animation for catching, you can stop it here.
});
};

var doIt = function(payload, cb, done) {
$.post('/wild/encounter/action.json', payload, cb).always(done);
};

$('body').on('click', '.throw.pokeball', function() {
catchIt('pokeball');
});

$('body').on('click', '.throw.greatball', function() {
catchIt('great-ball');
});

$('body').on('click', '.throw.ultraball', function() {
catchIt('ultra-ball');
});

$('body').on('click', '.throw.masterball', function() {
catchIt('master-ball');
});

$('body').on('click', '.feed.candy', function() {
doIt({action: 'feed'}, function(data) {
if(data.result=='fed'){
  showDialog("Yummy!")
  // Update the UI with pokedex and inventory
  processInventory(data.inventory);
}
}, function() {
// Stop the animation for feeding, or start the animation
});
});

$('body').on('click', '.gtfo', function() {
doIt({action: 'run'}, function(data) {
var result = data.result;
switch(result) {
  case 'got-away':
    // Ran like a coward
    closeEncounter("You ran! I can't believe you just ran away. What is wrong with you.");
    break;
  default:
    // wtf did you break?
}
// Update the UI with inventory
processInventory(data.inventory);
});
});

var closeEncounter = function(message) {
$('.grassTile.checking').removeClass('checking');
$('.popover.encounter').fadeOut(650, function(){
$(this).closest('.grassTile').popover('destroy');
});
$('#encounter-background').remove();
showDialog(message);
}

var showDialog = function(message){
alert(message);
}

});