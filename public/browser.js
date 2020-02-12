function itemTemplate(item) {
    return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
    <span class="item-text">${item.text}</span>
    <div>
     <!-- data-id , the name should be data-something , it will emmbed data to button. This is feature of HTML5 --->
      <button data-id="${item._id}" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
      <button data-id="${item._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
    </div>
  </li>`
}

//Initial Page Load Render
let ourHTML = items.map(function(item){
    return itemTemplate(item)
}).join('') //Join is help to convert array into string of text
document.getElementById("item-list").insertAdjacentHTML("beforeend", ourHTML)


//Create Feature
let createField = document.getElementById("create-field")
document.getElementById("create-form").addEventListener("submit", function(e) {
    e.preventDefault()
    //then(function(response), the response is the res.json(info.ops[0]) from server
    axios.post('/create-item', {text: createField.value}).then(function(response){
        //Create the HTML for a new item
        document.getElementById("item-list").insertAdjacentHTML("beforeend", itemTemplate(response.data))
        createField.value = ""
        createField.focus()
    }).catch(function(){
        console.log("Please try again later.")
    })
})

document.addEventListener("click", function(e){
    //Delete Feature
    if(e.target.classList.contains("delete-me")) {
        if (confirm("Do you really want to delete this item permanently?")) {
            axios.post('/delete-item', {id: e.target.getAttribute("data-id")}).then(function(){
                //this will select the entire row of the item
                //.item-text is class of the span
                e.target.parentElement.parentElement.remove()
            }).catch(function(){
                console.log("Please try again later.")
            })
        }
    }

    //Update Feature
    //meant, if e contain class edit-me
    if(e.target.classList.contains("edit-me")) {
        //store user input from prompt
        let userInput = prompt("Enter your desired new text", e.target.parentElement.parentElement.querySelector(".item-text").innerHTML)
        //Write if here to prevent when user click cancel in prompt and the data blank
        if(userInput) {
            //{text: userInput} is data we're gonna send to server with url /update-item
            //this axios.post is gonna return a promise
            //this mean, catch will start after post action completed
            axios.post('/update-item', {text: userInput, id: e.target.getAttribute("data-id")}).then(function(){
                //this will select the entire row of the item
                //.item-text is class of the span
                e.target.parentElement.parentElement.querySelector(".item-text").innerHTML = userInput
            }).catch(function(){
                console.log("Please try again later.")
            })
        }
    }
})