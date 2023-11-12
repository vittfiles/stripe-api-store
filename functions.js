//returns the money with "." and "$" and "(usd)"
function moneyFormat(value,currency){
    return `$${value.slice(0,-2)}.${value.slice(-2)} (${currency})`;
}
//returns a list with the minimun and maximun price
const minmax = (p) => {
    let priceData = p[0];
    for( let price of p){
        if(priceData.unit_amount < price.unit_amount) priceData = price;
    }
    let priceLow = p[0];
    for( let price of p){
        if(priceLow.unit_amount > price.unit_amount) priceLow = price;
    }
    return [priceLow,priceData];
}
//returns the hexadecimal color related to a name
const color= {
    "white" : "#FFFFFF",
    "red" : "#FF0000",
    "blue" : "#0000FF",
}