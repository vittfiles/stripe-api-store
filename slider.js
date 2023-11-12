let totalImg = 0;
let positionImg = 0;
function changePosition(pos){
    document.querySelector(".slider-img").style.left= `${-pos*100}%`;
    document.querySelector(".show").classList.remove("show");
    document.querySelector(`.thumbnails img:nth-child(${pos+1})`).classList.add("show");
}
function moveRight(){
    if(positionImg < totalImg-1){
        positionImg++;
        changePosition(positionImg);
    }
}
function moveLeft(){
    if(positionImg > 0){
        positionImg--;
        changePosition(positionImg);
    }
}