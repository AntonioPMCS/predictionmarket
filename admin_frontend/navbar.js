let navbar = composeNavbar();
document.getElementById("navbar").innerHTML = printNavbar(navbar);

function composeNavbar() {
   var path = window.location.pathname;
   var page = path.split("/").pop();
   console.log( page );

   let navbar = {
      index: {
         'href': '/index.html',
         'class': 'nav-item nav-link',
         'label':'Markets'
      },
      new: {
         'href': '../market/new.html',
         'class': 'nav-item nav-link',
         'label':'New'
      },
   }
 
   switch (page) {
      case "index.html":
         navbar.index.class+=' active';
         break;
      case "new.html":
         navbar.new.class+=' active';
         break;
      default:
         break;
   }
   return navbar;
}

function printNavbar(navbar) {
   let links="";
   for (const ele in navbar) {
      let item = navbar[ele];
      links+=`<a href=${item.href} class="${item.class}">${item.label}</a>`
   }
   return links
}