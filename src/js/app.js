App = {
     web3Provider: null,
     contracts: {},
     account: 0x0,

     init: function() {
            // load articlesRow
            // var articleRow = $('#articlesRow');
            // var articleTemplate = $('#articleTemplate');

            // articleTemplate.find('.panel-title').text('article 1');
            // articleTemplate.find('.article-description').text('Description for atricle');
            // articleTemplate.find('.article-price').text("10.23");
            // articleTemplate.find('.article-seller').text("0x12345678901234567890");

            // articleRow.append(articleTemplate.html());

            return App.initWeb3();
     },

     initWeb3: function() {
            // initialize web3
            if (typeof web3 !== 'undefined') {
                  // reuse the provider of the web3 object injected by Metamask
                  App.web3Provider = web3.currentProvider;
            } else {
                  // create a new provider and plug it directory into our local node
                  App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            }
            web3 = new Web3(App.web3Provider);

            App.displayAccountInfo();

            return App.initContract();
     },

     displayAccountInfo: function() {
            web3.eth.getCoinbase(function(err, account){
                  if(err === null) {
                        App.account = account;
                        $('#account').text(account);
                        web3.eth.getBalance(account, function(err, balance) {
                              if (err === null) {
                                    $('#accountBalance').text(web3.fromWei(balance, "ether") + " ETH");
                              }
                        });
                  }
            });
     },

     initContract: function() {
            $.getJSON('ChainList.json', function(chainListArtifact) {
                  // get the contract file and use it to instantiate a truffle cotract abstract
                  App.contracts.ChainList = TruffleContract(chainListArtifact);
                  // set the provider for our contracts
                  App.contracts.ChainList.setProvider(App.web3Provider);
                  // retrieve the artivle from tah contract
                  return App.reloadArticles();
            });
     },

     reloadArticles: function() {
            // refresh account information because the balance might have changed
            App.displayAccountInfo();

            //retrieve the article placeholder and clear it
            $('#articleRow').empty();

            App.contracts.ChainList.deployed().then(function(instance) {
                  return instance.getArticle();
            }).then(function(article){
                  if (article[0] == 0x0) {
                        // no article
                        return
                  }

                  // retriev the article template and fill it
                  var articleTemplate = $('#articleTemplate');
                  articleTemplate.find('.panel-title').text(article[1]);
                  articleTemplate.find('.article-description').text(article[2]);
                  articleTemplate.find('.article-price').text(web3.fromWei(article[3], "ether"));
                  console.log(articleTemplate);
                  var seller = article[0];
                  if (seller == App.account) {
                        seller = "you";
                  }
                  articleTemplate.find('.article-seller').text(seller);

                  // add this article
                  $('#articlesRow').append(articleTemplate.html());
            }).catch(function(err){
                  console.error(err.message);
            });
     }
};

$(function() {
     $(window).load(function() {
          App.init();
     });
});
