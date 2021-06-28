let navbar = composeNavbar();
document.getElementById("navbar").innerHTML = printNavbar(navbar);

function composeNavbar() {
   var path = window.location.pathname;
   var page = path.split("/").pop();
   console.log( page );

   let navbar = {
      index: {
         'href': '../index.html',
         'class': 'nav-item nav-link',
         'label':'Markets'
      },
      new: {
         'href': './market/new.html',
         'class': 'nav-item nav-link',
         'label':'New'
      },
      update: {
         'href': '/market/update.html',
         'class': 'nav-item nav-link',
         'label':'Update'
      }
   }
 
   switch (page) {
      case "index.html":
         navbar.index.class+=' active';
         break;
      case "new.html":
         navbar.new.class+=' active';
         break;
      case "update.html":
         navbar.update.class+=' active';
      default:
         break;
   }
   return navbar;
}

function printNavbar(navbar) {
   let links="";
   for (const ele in navbar) {
      console.log(navbar[ele])
      let item = navbar[ele];
      console.log(item.class)
      links+=`<a href=${item.href} class="${item.class}">${item.label}</a>`
   }
   console.log(links)
   return links
}