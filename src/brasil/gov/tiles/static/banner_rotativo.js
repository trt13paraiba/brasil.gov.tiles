/* globals window */
var brasil_gov_tiles_banner_rotativo_interval;
var portalBrasil = {
  init: function () {
    this.tileBannerRotativo();
    this.alturaBannerRotativo();
  },
  // Tile Banner Rotativo
  corrigeAlturaFaixa: function (banner) {
    if ($(".template-compose .tile_banner_rotativo").length === 0) {
      var imgBannerRotativo    = banner.find('.activeSlide .banner img'),
        credito              = banner.find('.activeSlide .credito'),
        botoesBannerRotativo = banner.find('.button-nav');

      var sobrescrito = banner.hasClass('chamada_sobrescrito');
      if (sobrescrito) {
        botoesBannerRotativo.css('top',
                                 imgBannerRotativo.height()         -
                                 botoesBannerRotativo.height()      +
                                 (credito ? credito.height() : 0)   -
                                 18);
      } else {
        botoesBannerRotativo.css('top',
                                 imgBannerRotativo.height()         -
                                 botoesBannerRotativo.height()      +
                                 (credito ? credito.height() : 0));
      }
    }
  },
  tileBannerRotativo: function () {
    if ($('.tile_banner_rotativo').length > 0) {
      $('.tile_banner_rotativo .button-nav, .orderTiles .button-nav').on('click focus mouseover', function (e) {
        e.preventDefault();
        $(this).closest('.tile_banner_rotativo').find('li').removeClass('activeSlide');
        $(this).closest('li').addClass('activeSlide');
      });

      var updateCarrossel = function (banners) {
        $.each(banners, function(index, banner) {
          banner = $(banner);
          if ((banner.find('a:hover').length === 0)   &&
              (banner.find('a:focus').length === 0)   &&
              ($('.template-compose .tile_banner_rotativo').length === 0)) {

            var totalSlides = banner.find('li').length;

            if (totalSlides > 1) {
              var activeSlide     = banner.find('li.activeSlide'),
                activeSlideNumber = parseInt(activeSlide.attr('data-slidenumber'), 10),
                nextSlideNumber   = (activeSlideNumber % totalSlides) + 1,
                nextSlide         = banner.find('.banner' + nextSlideNumber);

              activeSlide.removeClass('activeSlide');
              nextSlide.addClass('activeSlide');
              portalBrasil.corrigeAlturaFaixa($(banner));
            }
          }
        });
      };
      banners = $('.tile_banner_rotativo');
      clearInterval(brasil_gov_tiles_banner_rotativo_interval);
      brasil_gov_tiles_banner_rotativo_interval = window.setInterval(function() {updateCarrossel(banners);}, 4000);
    };
  },
  resizeAlturaBannerRotativo: function () {
    if ($(".template-compose .tile_banner_rotativo").length === 0) {
      var banners = $('.tile_banner_rotativo');
      $.each(banners, function(index, banner){
        var containerBannerRotativo = $(banner),
          itemBannerRotativo = containerBannerRotativo.find('li');

        var sobrescrito = containerBannerRotativo.hasClass('chamada_sobrescrito');

        // ajusta altura de cada item do banner
        var bannerMaior = 0;

        itemBannerRotativo.each(function () {
          var altura = (containerBannerRotativo.find('img')      ? containerBannerRotativo.find('img').height()      : 0)  +
                      (containerBannerRotativo.find('.credito') ? containerBannerRotativo.find('.credito').height() : 0)  +
                      (containerBannerRotativo.find('.title')   ? containerBannerRotativo.find('.title').height()   : 0)  +
                      (containerBannerRotativo.find('.descr')   ? containerBannerRotativo.find('.descr').height()   : 0);
          if (sobrescrito) {
            altura = altura - (containerBannerRotativo.find('.title')   ? containerBannerRotativo.find('.title').height()   : 0);
          }
          if (bannerMaior < altura) {
            bannerMaior = altura;
          }
        });
        itemBannerRotativo.add('img', itemBannerRotativo).css('height', bannerMaior);
        // ajusta altura do container do banner rotativo (22px = margin bottom default dos tiles)
        containerBannerRotativo.animate({'height': bannerMaior + 22}, 100, function(){
          portalBrasil.corrigeAlturaFaixa(containerBannerRotativo);
        });
      });
    }
  },
  alturaBannerRotativo: function () {
    $(window).resize(portalBrasil.resizeAlturaBannerRotativo);
  }
};

var portalBrasilCompor = {
  init: function () {
    if ($('.template-compose .tile_banner_rotativo').length > 0) {
      this.removeObjFromTile();
      this.sortableTileItens();
    }
  },

  removeObjFromTile: function () {

    var objPortal = this;

    $(".tile_banner_rotativo a").click(function (e) {
      e.preventDefault();
    });

    $(".tile_banner_rotativo .tile-remove-item").remove();
    $(".tile_banner_rotativo").each(function () {
      var child = $(this).children('*[data-uid]');
      child.append("<i class='tile-remove-item'><span class='text'>remove</span></i>");
    });

    $(".tile_banner_rotativo .tile-remove-item").unbind("click");
    $(".tile_banner_rotativo .tile-remove-item").click(function (e) {
      e.preventDefault();
      var obj = $(this).parent();
      var uid = obj.attr("data-uid");
      var tile = obj.parents('.tile');

      tile.find('.loading-mask').addClass('show remove-tile');
      var tile_type = tile.attr("data-tile-type");
      var tile_id = tile.attr("id");
      $.ajax({
        url: "@@removeitemfromlisttile",
        data: {'tile-type': tile_type, 'tile-id': tile_id, 'uid': uid},
        success: function (info) {
          tile.html(info);
          objPortal.titleMarkupSetup();
          tile.find('.loading-mask').removeClass('show remove-tile');
          return false;
        }
      });
    });
  },

  titleMarkupSetup: function () {
    $('#content .tile').each(function () {
      if ($(this).find('.loading-mask')[0] === undefined) {
        $(this).append('<div class="loading-mask"/>');
      }
    });
    this.removeObjFromTile();
  },

  sortableTileItens: function () {

    var objPortal = this;

    $(".tile_banner_rotativo").liveSortable({
      stop: function (event, ui) {
        var uids = [];

        $(this).children().each(function (index) {
          if ($(this).attr("data-uid") !== undefined) {
            uids.push($(this).attr("data-uid"));
          }
        });

        var tile = $(this).closest('.tile'),
          tile_type = tile.attr("data-tile-type"),
          tile_id = tile.attr("id");

        $.ajax({
          url: "@@updatelisttilecontent",
          data: {'tile-type': tile_type, 'tile-id': tile_id, 'uids': uids},
          success: function (info) {
            tile.html(info);
            objPortal.removeObjFromTile();
            return false;
          }
        });
      }
    });
  }
};

$(window).load(function () {
  if ($('.tile_banner_rotativo').length > 0) {
    portalBrasil.init();
    portalBrasilCompor.init();
    portalBrasil.resizeAlturaBannerRotativo();
  }
});
