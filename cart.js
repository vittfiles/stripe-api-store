const comprarTodo =() => {
    let products_cart = [];
    if(localStorage.getItem('products')){
        products_cart = JSON.parse(localStorage.getItem('products'));
        let result = products_cart.map((p)=>{
            return {price: p.productId,quantity: parseInt(p.cant)};
        });
        console.log(result);
        Stripe(pk).redirectToCheckout({
           lineItems: result,
           mode: "payment",
           successUrl: "https://vittfiles.github.io/stripe-api-store",
           cancelUrl: "https://vittfiles.github.io/stripe-api-store",
           billingAddressCollection: 'required',
           shippingAddressCollection: {
               allowedCountries: ['US', 'CA','AR'],
             }
        })
        .then(res => {
            console.log(res);
            if(res.error){
                console.log(res.error.message);
            }
        });
    }
}
function agregarAlCarrito(productId,cant){
    let products_cart = [];
    if(localStorage.getItem('products')){
        products_cart = JSON.parse(localStorage.getItem('products'));
    }
    let product_exist = products_cart.filter((p)=> p.productId === productId);
    if(product_exist.length > 0){
        for(let p of products_cart){
            console.log("repetido ",p);
            if(p.productId === productId){
                p.cant = parseInt(p.cant) + parseInt(cant);
            }
        }
    }else{
        let color= "";
        if(prices.length>1){
            let priceData= prices.filter((p)=> p.id === productId )[0];
            color = " ("+priceData.nickname+")";
        }
        products_cart.push({'productId' : productId,
            "cant" : cant,
            "name": product_data.name,
            "img": product_data.images,
            "color": color});
    }
    
    localStorage.setItem('products', JSON.stringify(products_cart));
    createTable();
}

function eliminarDelCarrito(productId){
    let products_cart = [];
    if(localStorage.getItem('products')){
        products_cart = JSON.parse(localStorage.getItem('products'));
        let result = products_cart.filter((p)=>{
            if(p.productId !== productId){
                return p;
            }
        });
        localStorage.setItem('products', JSON.stringify(result));
        createTable();
    }
}
function createTable(){
    let products = JSON.parse(localStorage.getItem('products'));
    let tablearea = document.querySelector('.tablearea');
    if(tablearea.hasChildNodes)tablearea.replaceChildren();
    if(products){
        let table = document.createElement('table');
    
        for (let p of products) {
            let tr = document.createElement('tr');
    
            tr.appendChild( document.createElement('td') );
            tr.appendChild( document.createElement('td') );
            let td = document.createElement('td');
            let bot = document.createElement("button");
            bot.classList.add("eliminate");
            bot.setAttribute("productid",p.productId);
            bot.innerHTML = "X";
            td.appendChild(bot);
            tr.appendChild( td );
    
            tr.cells[0].appendChild( document.createTextNode(p.name+p.color) );
            tr.cells[1].appendChild( document.createTextNode(p.cant) );
            //tr.cells[2].appendChild(  );
    
            table.appendChild(tr);
        }
    
        tablearea.appendChild(table);
    }
}
document.addEventListener("DOMContentLoaded",createTable);