document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('addToChrome').addEventListener('click', function (e) {
    if(chrome.webstore && chrome.app && !chrome.app.isInstalled) {
      e.preventDefault();
      chrome.webstore.install('https://chrome.google.com/webstore/detail/mnjjnlpfohojhebjajehppdpepmhidnc', function () {
        console.log('Installed, now go to Search Overflow tab');
      });
    }
  });
});
