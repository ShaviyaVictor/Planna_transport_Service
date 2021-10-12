const menuElements = document.getElementById("menu").querySelectorAll('li');
const decsriptionDiv = document.querySelectorAll(".description")[0];


menuElements.forEach((element, index) => {
    element.addEventListener("click", function () {
        const children = decsriptionDiv.children;

        for (let counter = 0; counter < children.length; counter++) {
            children[counter].style.display = "none"
        }
        
        children[index].style.display = "block"
    })
});
