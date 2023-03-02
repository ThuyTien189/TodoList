const openBtn = document.querySelector('.open-form')
const closeBtn = document.querySelector('.close-form')
const modal = document.querySelector('.modal')
const modalContainer = document.querySelector('.modal-container')
const radio_btn = document.querySelector('.radio-btn')
const heading = document.querySelector('.text-heading')
const inputs = document.querySelectorAll('[name]')
const category = document.querySelector('#category')
const title = document.querySelector('#title')
const text = document.querySelector('#text')
const formElement = document.querySelector('.form')
const btn = document.querySelector('#submit')
const radioList = document.querySelectorAll('input[name="radio"]')
const URL = "https://63f1f956f28929a9df512124.mockapi.io/todoitem"
const listTodoItems = document.querySelector('.lists-todo')
const listDoingItems = document.querySelector('.lists-doing')
const listFinishedItems = document.querySelector('.lists-finished')
const todoCount = document.querySelector('.todo-counting')
const doingCount = document.querySelector('.doing-counting')
const finishedCount = document.querySelector('.finished-counting')
const lists = document.querySelectorAll('.list')
let listTodo = []
let isFormValid = true
let checkEdit = false
let idEdit = 0

function openForm() {
    radio_btn.classList.add('hidden')
    modal.classList.remove('invisible')
    heading.innerHTML = 'Add new todo'
}
function closeForm() {
    modal.classList.add('invisible')
    console.log("close");
    [category, title, text].forEach(item => {
        item.value = ""
    })
}
function showRadioButton() {
    heading.innerHTML = 'Edit todo'
    radio_btn.classList.add('flex')
    radio_btn.classList.remove('hidden')
}
openBtn.addEventListener('click', openForm)
closeBtn.addEventListener('click', closeForm)
modal.addEventListener('click', closeForm)
modalContainer.addEventListener('click', function (envent) {
    envent.stopPropagation()
})

function validate(input) {
    if (input.value) {
        input.style.border = '2px solid green'
        isFormValid = true
    }
    else {
        input.style.border = '2px solid red'
        isFormValid = false
    }
}
[category, title, text].forEach(input => {
    if (input) {
        input.onblur = function () {
            validate(input)
        }
    }
})
if (formElement) {
    formElement.onsubmit = function (e) {
        e.preventDefault();
        const item = {
            "category": category.value,
            "title": title.value,
            "text": text.value,
            "status": '',
        }
        if (checkEdit) {
            radioList.forEach(radio => {
                if (radio.checked) {
                    item.status = radio.value
                }
            })
            handleEdit(item)
            console.log(item);
            [category, title, text].forEach(item => {
                item.value = ""
            })
        }
        else {
            inputs.forEach(input => {
                validate(input)
            })
            if (isFormValid) {
                item.status = 'todo'
                postData(item)
            }
        }
        modal.classList.add('invisible')
        inputs.forEach(input => {
            input.style.border = '1px solid black'
        })
        checkEdit = false;
    }
}

function start() {
    getData(showData)
}
function getData(callback) {
    fetch(URL)
        .then(function (response) {
            return response.json();
        })
        .then(function (response) {
            listTodo = response;
            return response
        })
        .then(callback);
}
function renderData(items) {
    let htmls = items.map(function (item) {
        return `
        <div class="h-[154px] tablet:h-auto bg-white rounded-lg px-[30px] pt-[10px] pb-[30px] shadow-lg border-[2px]" draggable="true" ondragstart="dragStart(event)" ondragend="dragEnd(${item.id}, event)">
            <div class="flex justify-between items-center">
                <div class="font-bold text-[12px] leading-[15px] underline text-[#4D8EFF]">${item.category}</div>
                <div class="w-[20%] flex justify-around">
                    <button class="bg-white opacity-60" onclick="openEditForm(${item.id})"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="bg-white opacity-60" onclick="handleDel(${item.id})"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
            <div class="relative font-bold leading-5 text-[#393939] after:absolute after:mt-[30px] after:left-[0] after:w-[80%] after:h-0 after:border after:border-solid after:border-[#DBDBDB]">${item.title}</div>
            <div class="mt-[20px] text-[10px] leading-[13px] text-[#5A5C63]">
                <div>${item.text}</div>
                <div class="mt-[10px]">
                    <i class="fa-regular fa-clock"></i>
                    ${item.time}
                </div>
            </div>
        </div>
                            `
    });
    return htmls;
}
function dragStart(e) {
    // console.log("dragstart");
    e.target.classList.add("dragging");
}
function dragEnd(id, e) {
    // console.log(id);
    // console.log("dragend");
    e.target.classList.remove("dragging");
    let itemDrag = listTodo.find(item => item.id == id)
    itemDrag.status = upStatus
    listTodo = listTodo.map(item => item.id == id ? itemDrag : item)
    idEdit = id
    handleEdit(itemDrag)
}
let upStatus
lists.forEach(list => {
    list.addEventListener('dragover',  (e) => {
            e.preventDefault();
            let statusValue = list.getAttribute('value')
            let draggingCard = document.querySelector('.dragging')
            list.appendChild(draggingCard)  
            upStatus = statusValue
    })
})
function filterData(items) {
    const todoItems = items.filter(item => item.status === 'todo')
    const doingItems = items.filter(item => item.status === 'doing')
    const finishedItems = items.filter(item => item.status === 'finished')
    return [todoItems, doingItems, finishedItems]
}
function showData(items) {
    const [todo, doing, finished] = filterData(items)
    const htmlsTodo = renderData(todo)
    const htmlsDoing = renderData(doing)
    const htmlsFinished = renderData(finished)

    todoCount.innerHTML = todo.length
    doingCount.innerHTML = doing.length
    finishedCount.innerHTML = finished.length

    listTodoItems.innerHTML = htmlsTodo.join('')
    listDoingItems.innerHTML = htmlsDoing.join('')
    listFinishedItems.innerHTML = htmlsFinished.join('')

}
function openEditForm(id) {
    checkEdit = true;
    idEdit = id
    openForm()
    showRadioButton()
    loadData(id)
}
function handleEdit(item) {
    fetch(URL + '/' + idEdit, {
        method: 'PUT',
        body:
            JSON.stringify({
                id: '',
                category: item.category,
                title: item.title,
                text: item.text,
                time: `${monthEnglish[timeNow.getMonth()]} ${timeNow.getDate()}, ${timeNow.getFullYear()}`,
                status: item.status
            }),
        headers: {
            'Content-Type': 'application/json'
        },
    }).then((response) => {
        return response.json();
    }).then(function (response) {
        listTodo = listTodo.map(item => item.id == idEdit ? response : item)
        // console.log(listTodo);
        showData(listTodo);
    })
}
function handleDel(id) {
    fetch(URL + '/' + id, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
    }).then((response) => {
        return response.json();
    }).then(function () {
        listTodo = listTodo.filter(item => item.id != id)
        showData(listTodo);
    })
}
const monthEnglish = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
let timeNow = new Date()
function postData(item) {
    fetch(URL, {
        method: 'POST',
        body:
            JSON.stringify({
                id: '',
                category: item.category,
                title: item.title,
                text: item.text,
                time: `${monthEnglish[timeNow.getMonth()]} ${timeNow.getDate()}, ${timeNow.getFullYear()}`,
                status: 'todo'
            }),
        headers: {
            'Content-Type': 'application/json'
        },
    }).then((response) => {
        return response.json();
    }).then(function (response) {
        listTodo.push(response)
        showData(listTodo);
    })
}
function loadData(id) {
    let item = listTodo.find(item => item.id == id)
    inputs[1].value = item.category
    inputs[2].value = item.title
    inputs[3].value = item.text

    if (item.status === 'todo') {
        radioList[0].checked = true
    }
    else if (item.status === 'doing') {
        radioList[1].checked = true
    }
    else {
        radioList[2].checked = true
    }
}

const statusBars = document.querySelectorAll('.status-bar')
const content = document.querySelector('.content')
statusBars.forEach(item => {
    item.addEventListener('click', () => {
        // console.log(item.nextElementSibling);
        item.nextElementSibling.classList.toggle("tablet:h-0")
        content.classList.remove("h-full")
    })
})

start()



