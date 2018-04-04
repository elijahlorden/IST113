let localKey = "AppTask3List"
let taskArray = [];

function init() {
	if (localStorage.getItem(localKey) != null) {
		let jsonString = localStorage.getItem(localKey);
		taskArray = JSON.parse(jsonString);
		let i = 0
		$(taskArray).each(function() {
			addItem(this, i)
			i = i + 1
		});
	}
}

function saveArray() {
	localStorage.setItem(localKey, JSON.stringify(taskArray));
}

function newTaskString(s, i) {
	return "<fieldset class='inputfs' data-index='" + i + "'><label>" + s + "</label><button class='upButton'>Up</button><button class='downButton'>Down</button><button class='removeButton'>Remove</button></fieldset>";
}

function removeFunction(e) {
	e.stopImmediatePropagation();
	e.preventDefault();
	let i = getIndex($(this).parent());
	taskArray.splice(i, 1);
	$(this).parent().remove();
	fixIndices();
	saveArray();
}

function moveUpFunction(e) {
	e.stopImmediatePropagation();
	e.preventDefault();
	let i = getIndex($(this).parent());
	let s = taskArray[i];
	let newI = Math.min(Math.max(i - 1, 0), taskArray.length-1);
	taskArray.splice(i,1);
	taskArray.splice(newI, 0, s);
	redraw();
	fixIndices();
	saveArray();
}

function moveDownFunction(e) {
	e.stopImmediatePropagation();
	e.preventDefault();
	let i = getIndex($(this).parent());
	let s = taskArray[i];
	let newI = Math.min(Math.max(i + 1, 0), taskArray.length-1);
	taskArray.splice(i,1);
	taskArray.splice(newI, 0, s);
	redraw();
	fixIndices();
	saveArray();
}

function clear() {
	$("#list").children().each(function() {
		$(this).remove();
	});
}

function clearAll() {
	$("#list").children().each(function() {
		$(this).remove();
	});
	taskArray = [];
	saveArray();
}

function redraw() {
	clear();
	let i = 0
	$(taskArray).each(function() {
		addItem(this, i)
		i = i + 1
	});
}

function addItem(s, i) {
	$("#list").append(newTaskString(s, i));
	let o = $("#list").find('fieldset[data-index="'+ i +'"]');
	o.find(".removeButton").on("click", removeFunction);
	o.find(".upButton").on("click", moveUpFunction);
	o.find(".downButton").on("click", moveDownFunction);
}

function getIndex(o) {
	let i = o.data("index")
	return parseInt(i);
}

function fixIndices() {
	let i = 0;
	$("#list").children().each(function() {
		$(this).attr("data-index", i);
		i = i + 1;
	});
}

function getFormString() {
	return "<form action='' method='post' class='contactForm' id = 'JSForm'><fieldset class='contactFormFieldset'><label class='contactFormElement'>Email Address</label><input class='contactFormElement' type='email' placeholder='joe@example.com' name='email'></input></fieldset><fieldset class='contactFormFieldset'><label class='contactFormElement'> Name </label><input name='name' class='contactFormElement'></input></fieldset><fieldset class='contactFormFieldset'><textarea name='message' class='contactFormMessage'></textarea></fieldset><fieldset class='contactFormFieldset'><button>Submit</button></fieldset></form>";
}

function showHideForm() {
	if($("#JSForm").length < 1) {
		$("#page").append(getFormString());
	} else {
		$("#JSForm").remove();
	}
}

$(function() {
	init();
	$("#taskAdd").on("click", function() {
		let taskName = $("#taskInput").val();
		addItem(taskName, taskArray.length);
		taskArray.push(taskName);
		saveArray();
	});
	$("#clearAll").on("click", clearAll);
	$("#contactLink").on("click", showHideForm);
});










