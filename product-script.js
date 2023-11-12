const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const product = urlParams.get('product');

const d = document;
const $table = d.getElementById("product");
const $fragment = d.createDocumentFragment();
const $template = d.getElementById("template-product").content;
const lista=[];

let options = {
    method: "GET",
    headers: {
        Authorization: ` Bearer ${rk}`
    }
}
let prices,product_data;


Promise.all([
    fetch("https://api.stripe.com/v1/products/"+product,options),
    fetch("https://api.stripe.com/v1/prices?product="+product,options)
]).then((responses) => Promise.all(responses.map((res) => res.json())))
.then(json => {
    product_data = json[0];
    prices = json[1].data;
    console.log(product_data);
    console.log(prices);
    let product = product_data;
    if(product.active){
        $template.querySelector("h2").innerHTML = product.name; 
        $template.querySelector(".descripcion").innerHTML = product.description;

        let imgContainer = document.createElement("div");
        imgContainer.classList.add("slider-img");
        totalImg = 0;
        totalImg = addImg(imgContainer,product.images,totalImg,product.metadata.color || "");
        let gallery = product.metadata[`images`];
        if(gallery){
            gallery = gallery.split("|");
            gallery.forEach((c)=>{
                totalImg = addImg(imgContainer,c,totalImg,totalImg,product.metadata.color || "");
            });
        }

        if( prices.length <= 1){
            $template.querySelector(".addToCart").classList.add("addToCartActive");
            let priceData = prices[0];
            $template.querySelector(".price-value").innerHTML = moneyFormat(priceData.unit_amount_decimal,priceData.currency);
            $template.querySelector(".price-value").setAttribute("price-id",priceData.id);
            $template.querySelector(".total").innerHTML="Total: "+moneyFormat(priceData.unit_amount_decimal,priceData.currency);   
        }else{
            let [priceLow,priceData] = minmax(prices);
            $template.querySelector(".price-value").innerHTML = moneyFormat(priceLow.unit_amount_decimal,priceLow.currency)+" - "+moneyFormat(priceData.unit_amount_decimal,priceData.currency);
            $template.querySelector(".description-price").innerHTML= "Elige un color para determinar el precio";
            for( let price of prices){
                if(color[price.nickname]){
                    let elem = document.createElement("button");
                    elem.classList.add("input-color");
                    elem.setAttribute("color",price.nickname);
                    elem.setAttribute("price",price.id);
                    elem.style.backgroundColor =color[price.nickname];
                    $template.querySelector(".options").appendChild(elem);

                    let colorImg = product.metadata[`${price.nickname}-img`];
                    if(colorImg){
                        colorImg = colorImg.split("|");
                        colorImg.forEach((c)=>{
                            totalImg = addImg(imgContainer,c,totalImg,price.nickname);
                        });
                    }
                }
            }
            $template.querySelector(".total").innerHTML=""; 
        }

        $template.querySelector(".product-img").appendChild(imgContainer);
        const $card = $template.cloneNode(true);
        $fragment.appendChild($card);
    }
    if($table.hasChildNodes)$table.replaceChildren();
    $table.appendChild($fragment);
})
.catch(err => console.log(err));
function addImg(container,src,i,c){
    let image = document.createElement("img");
    image.setAttribute("src",src);
    image.setAttribute("pos",i);
    image.setAttribute("color",c);
    image.setAttribute("style",`left: calc(100% * ${i})`);
    image.classList.add("w100");
    container.appendChild(image);
    let thumbnail = document.createElement("img");
    thumbnail.setAttribute("src",src);
    thumbnail.setAttribute("pos",i);
    thumbnail.setAttribute("color",c);
    thumbnail.setAttribute("style",`left: calc(20% * ${i})`);
    if(i===0)thumbnail.classList.add("show");
    thumbnail.classList.add("w100");
    $template.querySelector(".thumbnails").appendChild(thumbnail);
    return i + 1;
}
function update(cant){
    if(prices.length>1){
        if(document.querySelector(".price-value").getAttribute("price-id")){
            let priceData= prices.filter((p)=> p.id === document.querySelector(".price-value").getAttribute("price-id") )[0];
            document.querySelector(".total").innerHTML = "Total: "+moneyFormat(String(priceData.unit_amount*cant),priceData.currency);
        }
    }else{
        let priceData = prices[0];
        document.querySelector(".total").innerHTML = "Total: "+moneyFormat(String(priceData.unit_amount*cant),priceData.currency);
    }
}
function add(event){
    let total = event.target.parentElement.getElementsByTagName("input")[0].value;
    event.target.parentElement.getElementsByTagName("input")[0].value = parseInt(total) + 1;
    update(event.target.parentElement.getElementsByTagName("input")[0].value);
}
function quit(event){
    let total = event.target.parentElement.getElementsByTagName("input")[0].value;
    let num = parseInt(total);
    if( total > 1){
        event.target.parentElement.getElementsByTagName("input")[0].value = num - 1;
    }
    update(event.target.parentElement.getElementsByTagName("input")[0].value);
}
var swipeFunc = {
	touches : {
		"touchstart": {"x":-1, "y":-1}, 
		"touchmove" : {"x":-1, "y":-1}, 
		"touchend"  : false,
		"direction" : "undetermined"
	},
	touchHandler: function(event) {
        if(event.target.matches(".control")){
            var touch;
            touch = event.touches[0];
            switch (event.type) {
                case 'touchstart':
                case 'touchmove':
                    swipeFunc.touches[event.type].x = touch.pageX;
                    swipeFunc.touches[event.type].y = touch.pageY;
                    break;
                case 'touchend':
                    swipeFunc.touches[event.type] = true;
                    swipeFunc.touches.direction = swipeFunc.touches.touchstart.x > swipeFunc.touches.touchmove.x ? "right" : "left";
                    if(swipeFunc.touches.touchstart.x > swipeFunc.touches.touchmove.x){
                        moveRight();
                    }else{
                        moveLeft();
                    }
                default:
                    break;
            }
        }
	},
	init: function() {
		document.addEventListener('touchstart', swipeFunc.touchHandler, false);	
		document.addEventListener('touchmove', swipeFunc.touchHandler, false);	
		document.addEventListener('touchend', swipeFunc.touchHandler, false);
	}
};
swipeFunc.init();
d.addEventListener("click",e => {
    if(e.target.matches(".input-color")){
        let objs = e.target.parentElement.querySelectorAll(".input-color");
        if(objs){
            objs.forEach((elem)=>{elem.classList.remove("selected")});
            e.target.classList.add("selected");
        }
        d.querySelector(".description-price").innerHTML = "Color "+e.target.getAttribute("color");
        let priceData= prices.filter((p)=> p.id === e.target.getAttribute("price") )[0];
        document.querySelector(".price-value").innerHTML = moneyFormat(priceData.unit_amount_decimal,priceData.currency);
        document.querySelector(".price-value").setAttribute("price-id",e.target.getAttribute("price"));
        update(document.querySelector("#amount").value);
        document.querySelector(".addToCart").classList.add("addToCartActive");

        let colorImg = e.target.getAttribute("color");
        if(colorImg){
            let colorTarget= document.querySelector(`.slider-img img[color="${colorImg}"]`);
            if(colorTarget){
                positionImg = parseInt(colorTarget.getAttribute("pos"));
                changePosition(positionImg);
            }
        }
    }
    if(e.target.matches(".plus")){
        add(e);
    }else if(e.target.matches(".minus")){
        quit(e);
    }else if(e.target.matches(".addToCart")){
        if(document.querySelector(".price-value").getAttribute("price-id")){
            console.log(document.querySelector(".price-value").getAttribute("price-id"));
            agregarAlCarrito(document.querySelector(".price-value").getAttribute("price-id"),document.querySelector("#amount").value);
            
            document.querySelector("#cart").classList.remove("anim-cart");
            document.querySelector("#cart").classList.add("anim-cart");
            setTimeout(function(){
                document.querySelector("#cart").classList.remove("anim-cart");
            },1500);
        }
    }
    if(e.target.matches("#cart")){
        d.querySelector(".cart-side").classList.toggle("show-cart");
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
    if(e.target.matches(".lt")){
        moveLeft();
    }else if(e.target.matches(".gt")){
        moveRight();
    }
    if(e.target.matches(".thumbnails img")){
        positionImg = parseInt(e.target.getAttribute("pos"));
        changePosition(positionImg);
    }
});