const d = document;
const $table = d.getElementById("products");
const $fragment = d.createDocumentFragment();
const $template = d.getElementById("template-product").content;
const lista=[];

let options = {
    method: "GET",
    headers: {
        Authorization: ` Bearer ${rk}`,
    }
}
let prices,products;
let colors=new Set();

function getProducts(filter){
    colors.clear();
    let filterOption = "/search?query=active:'true'";
    console.log(filter);
    if(filter){
        filterOption += ` AND metadata['${filter}']:'true'`;
    }
    Promise.all([
        fetch("https://api.stripe.com/v1/products"+filterOption,options),
        fetch("https://api.stripe.com/v1/prices?limit=100",options)
    ]).then((responses) => Promise.all(responses.map((res) => res.json())))
    .then(json => {
        products = json[0].data;
        prices = json[1].data;
        console.log(prices);
        products.forEach(product =>{
            if(product.active){
                $template.querySelector(".card").setAttribute("id-product",product.id);
                $template.querySelector("h2").innerHTML = product.name; 
                let p = prices.filter((price) => price.product === product.id);
                console.log(product,p);
                if( p.length <= 1){
                    let priceData = p[0];
                    $template.querySelector(".price").innerHTML = moneyFormat(priceData.unit_amount_decimal,priceData.currency);  
                }else{
                    let [priceLow,priceData] = minmax(p);
                    $template.querySelector(".price").innerHTML = moneyFormat(priceLow.unit_amount_decimal,priceLow.currency)+" - "+moneyFormat(priceData.unit_amount_decimal,priceData.currency);
                }
                $template.querySelector("img").setAttribute("src",product.metadata.img || product.images[0]); 
    
                const $card = $template.cloneNode(true);
                $fragment.appendChild($card);
                //agregar los colores en un Set para que no se repitan
                if(!filter){
                    let color_list = product.metadata.colores.split("|");
                    color_list.forEach((c)=>{colors.add(c)});
                }else{
                    colors.add(filter);
                    document.querySelector(".clean-filter").classList.remove("no-visible");
                }
            }
        });
        if($table.hasChildNodes)$table.replaceChildren();
        $table.appendChild($fragment);
        createColors(colors);
    })
    .catch(err => console.log(err));
}
getProducts(null);
function createColors(col){
    let out = document.querySelector(".options");
    if(out.hasChildNodes)out.replaceChildren();
    let sortedColors = Array.from(colors).sort();
    for( let c of sortedColors){
        if(color[c]){
            let elem = document.createElement("button");
            elem.classList.add("input-color");
            elem.setAttribute("color",c);
            elem.style.backgroundColor =color[c];
            out.appendChild(elem);
        }
    }
}

d.addEventListener("click",e => {
    if(e.target.matches(".card *")){
        window.location.replace("https://github.com/vittfiles/stripe-api-store/product.html?product="+e.target.closest(".card").getAttribute("id-product"));
    }else if(e.target.matches(".card")){
        window.location.replace("https://github.com/vittfiles/stripe-api-store/product.html?product="+e.target.getAttribute("id-product"));
    }
    if(e.target.matches("#cart")){
        d.querySelector(".cart-side").classList.toggle("show-cart");
    }
    if(e.target.matches(".input-color")){
        let objs = e.target.parentElement.querySelectorAll(".input-color");
        if(objs){
            objs.forEach((elem)=>{elem.classList.remove("selected")});
            e.target.classList.add("selected");
        }
        getProducts(e.target.getAttribute("color"));
    }else if(e.target.matches(".clean-filter")){
        getProducts(null);
        e.target.classList.add("no-visible");
    }
    if(e.target.matches(".clean")){
        localStorage.clear("products");
        let tablearea = document.querySelector('.tablearea');
        if(tablearea.hasChildNodes)tablearea.replaceChildren();
    }
    if(e.target.matches(".eliminate")){
        eliminarDelCarrito(e.target.getAttribute("productid"));
    }
    if(e.target.matches(".buy")){
        comprarTodo();
    }
});