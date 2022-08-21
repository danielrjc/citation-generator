var lst = document.getElementById("data")
var my_key;
var tab;
document.getElementById('get-url').addEventListener('click', getCurrentTabUrl)
document.getElementById('clear-data').addEventListener('click', clear)
document.getElementById('copy').addEventListener('click', copy)
var cite_style = document.getElementById("citation_styles");
var cite_input = cite_style.value

cite_style.addEventListener('change', function handleChange(event) {
  cite_input = event.target.value
});

populate()
function populate(){
    lst.innerHTML = '';
    chrome.storage.local.get({'urlList':[]}, function(item){
        var items = item.urlList
        items.sort()
        for(let i =0; i<items.length;i++){
          create_li(items[i])

        }
    });  
}
function create_li(el){
  var entry = document.createElement('li');
  entry.appendChild(document.createTextNode(el));
  lst.appendChild(entry); 
  let deleteButton = document.createElement("button");
  deleteButton.setAttribute('id','del')
  deleteButton.innerHTML = "Delete" 
  entry.appendChild(deleteButton)
  deleteButton.addEventListener('click', function() {
      deleteButton.parentElement.remove() 
      remove(deleteButton.previousSibling)
  
    })
}

function copy(){
  chrome.storage.local.get({'urlList':[]}, function(item){
    var items = item.urlList
    var my_str = items.join('\r\n')
    var dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = my_str;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
  })
}


function remove(removed_key){
    chrome.storage.local.get({'urlList':[]}, function(item){
        var items = item.urlList
        items.splice(items.indexOf(removed_key,1))
        chrome.storage.local.set(item, function() {

        });
    })
}

function fetch_data(url){
    fetch("https://api.citeas.org/product/"+url).then(
    r =>r.text()
).then(result => {
    parsed = JSON.parse(result)
    var newArray = parsed.citations.filter(function (el) {
        return el.style_shortname === cite_input
      });
    my_key = newArray[0].citation
    my_key=my_key.replace("<i>", "")
    my_key=my_key.replace("</i>", "")
    // document.getElementById("data").innerHTML = newArray[0].citation;
    chrome.storage.local.get({'urlList':[]}, function(item){
        var newUrlList = item.urlList;
        if (newUrlList.indexOf(my_key) === -1) {
          newUrlList.push(my_key);
        }
        chrome.storage.local.set({urlList: newUrlList});
      });
      create_li(my_key)
})
}

function clear(){
    chrome.storage.local.clear(function(obj){
       document.getElementById("data").innerHTML = "";
       });
}

function getCurrentTabUrl() {
    var queryInfo = {
      active: true,
      currentWindow: true,
    }
  
    chrome.tabs.query(queryInfo, function(tabs) {
      tab = tabs[0]
      uri = tab.url
      fetch_data(uri)
    })
}
  



