var iPadFinder = iPadFinder ? iPadFinder : {
    // The index of highlight we've focused on
    highlightIndex: 0,
    highlightCount: 0,
    
    getScroll: function(el) {
      var height = 0;
      do {
	height += el.offsetTop;
      } while(el = el.offsetParent);
      return height;
    },
    searchDown: function() {
      highlightIndex = (highlightCount + highlightIndex - 1) % highlightCount;
      this.focusHighlight(true);
    },
    searchUp: function() {
      highlightIndex = (highlightIndex + 1) % highlightCount;
      this.focusHighlight(true);
    },
    focusHighlight: function(scroll) {
      var highlights = document.getElementsByClassName('ipadfinder_highlight');

      // If there's no matches say so and bail
      if(highlights.length == 0) {
	document.getElementById('ipadfinder_count').innerHTML = 'Not found';
	return;
      }
    
      // Remove any previous focused 
      var focused = document.getElementsByClassName('ipadfinder_focused');
      for(var i = 0; i < focused.length; i++) {
	focused[i].className = "ipadfinder_highlight";
      }

      // Highlight the selected term
      highlights[highlightIndex].className = "ipadfinder_highlight ipadfinder_focused";
      document.getElementById('ipadfinder_count').innerHTML = '' + (highlightIndex + 1) + " of " + highlightCount;

      // Make opaque if behind the finder
      if(this.getScroll(highlights[highlightIndex]) < 60) {
	document.getElementById('ipadfinder_finder').style.opacity = 0.7;
      } else {
	document.getElementById('ipadfinder_finder').style.opacity = 1.0;
      }

      // Scroll if requested
      if(scroll) {
	window.scrollTo(0, this.getScroll(highlights[highlightIndex]) - 70);
	document.getElementById('ipadfinder_finder').style.top = window.pageYOffset + "px";
      }
    },
    search: function(term) {
      // Remove all previous highlight nodes
      var highlights = document.getElementsByClassName('ipadfinder_highlight');
      for(var i = 0; i < highlights.length; i++) {
	var el = highlights[i];
	el.previousSibling.nodeValue += el.innerHTML + el.nextSibling.nodeValue;
	el.parentNode.removeChild(el.nextSibling);
	el.parentNode.removeChild(el);
	i -= 1;
      }

      if(term == '') return;

      var count = 0;
      var regex = new RegExp(term, "gi");

      // This function is defined within search to wrap the scope of the call

      var recurser = function(el){
	// If the node is text and not JS
        if ((el.nodeType == 3) && (el.nodeName != "script")) {

	  // Search for the object
	  var position = 0;
	  if(el.nodeValue)
	    position = el.nodeValue.search(regex);
	  else return;
	
	  // If found and this isn't a highlight
	  if(position >= 0 && el.parentNode.className != "ipadfinder_highlight") {
	    count += 1;

	    // Create the highlight
	    var highlight = document.createElement("span");
	    highlight.className = "ipadfinder_highlight";
	    highlight.innerHTML = el.nodeValue.substring(position, position + term.length);

	    // Create the text after the highlight
	    var postText = document.createTextNode(el.nodeValue.slice(position + term.length));

	    // Trim text before the highlight
	    el.nodeValue = el.nodeValue.slice(0, position);

	    // Add it all together
	    if(el.nextSibling) {
	      el.parentNode.insertBefore(postText, el.nextSibling);
	      el.parentNode.insertBefore(highlight, el.nextSibling);
	    } else {
	      el.parentNode.appendChild(highlight);
	      el.parentNode.appendChild(postText);
	      // Tell the caller we can skip two nodes
	      return 1;
	    }
	  }
        } else {
          for (var i=0; i < el.childNodes.length; ++i) {
            i += recurser(el.childNodes[i]);
	  }
	}
	return 0;
      };
      recurser(document.body);
      highlightIndex = 0;
      highlightCount = count;
      this.focusHighlight();
    },
    init: function() {
      var link = document.createElement('link');
      link.href="http://128.12.124.42/find.css";
      link.type="text/javascript";
      link.rel="stylesheet";
      document.body.appendChild(link);

      var container = document.createElement('div');
      container.id = "ipadfinder_finder";
      container.innerHTML = '<span onselectstart="return false;" id=ipadfinder_count></span> <input onkeyup="iPadFinder.search(document.getElementById(\'ipadfinder_term\').value);" id="ipadfinder_term" /><button id=ipadfinder_findleft onclick="iPadFinder.searchDown();"> &#9664;</button><button id=ipadfinder_findright onclick="iPadFinder.searchUp();">&#9654;</button> <button style="font-size: 14pt;" >Done</button>';
      document.body.appendChild(container);

      document.addEventListener('scroll', function() {
	document.getElementById('ipadfinder_finder').style.top = window.pageYOffset + "px";
      });
      document.getElementById('ipadfinder_finder').style.top = window.pageYOffset + "px";
      document.getElementById('ipadfinder_term').focus();
    }
};

iPadFinder.init();
