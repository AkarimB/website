lazyLoad ();

function lazyLoad () {
  document.addEventListener("DOMContentLoaded", function() {
    var lazyloadImages, lazyloadIframes;    
  
    if ("IntersectionObserver" in window) {
      lazyloadImages = document.querySelectorAll("img");
      lazyloadIframes = document.querySelectorAll("iframe");
  
      var imageObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            var element = entry.target;
            element.src = element.dataset.src;
            imageObserver.unobserve(element);
          }
        });
      });
  
      lazyloadImages.forEach(function(image) {
        imageObserver.observe(image);
      });
  
      lazyloadIframes.forEach(function(iframe) {
        imageObserver.observe(iframe);
      });
  
    } else {
      // Fallback for browsers that don't support IntersectionObserver
      var lazyloadThrottleTimeout;
      lazyloadImages = document.querySelectorAll("img");
      lazyloadIframes = document.querySelectorAll("iframe");
  
      function lazyload() {
        if (lazyloadThrottleTimeout) {
          clearTimeout(lazyloadThrottleTimeout);
        }    
  
        lazyloadThrottleTimeout = setTimeout(function() {
          var scrollTop = window.scrollY;
          lazyloadImages.forEach(function(img) {
            if (img.offsetTop < (window.innerHeight + scrollTop)) {
              img.src = img.dataset.src;
            }
          });
  
          lazyloadIframes.forEach(function(iframe) {
            if (iframe.offsetTop < (window.innerHeight + scrollTop)) {
              iframe.src = iframe.dataset.src;
            }
          });
  
          if (lazyloadImages.length === 0 && lazyloadIframes.length === 0) { 
            document.removeEventListener("scroll", lazyload);
            window.removeEventListener("resize", lazyload);
            window.removeEventListener("orientationChange", lazyload);
          }
        }, 20);
      }
  
      document.addEventListener("scroll", lazyload);
      window.addEventListener("resize", lazyload);
      window.addEventListener("orientationChange", lazyload);
    }
  });
}