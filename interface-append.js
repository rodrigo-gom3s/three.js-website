function toggleButton(event) {
    if (!event.target.classList.contains('selected')) {
        var parentElement = event.target.parentElement;
        var childElements = parentElement.getElementsByClassName('selected');
        if(childElements.length < 0){
            childElements[0].classList.remove('selected');
        }
    }
}