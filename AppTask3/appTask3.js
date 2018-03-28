let localKey = "AppTask3List"
let taskArray = [];

function init() {
	if (localStorage.getItem(localKey) != null) {
		let jsonString = localStorage.getItem(localKey);
		taskArray = JSON.parse(jsonString);
		let i = 0
		$(taskArray).each(function() {
			$("#list").append(newTaskString(this, i)).on("click", "button", removeFunction);
			i = i + 1
		});
	}
}

function saveArray() {
	localStorage.setItem(localKey, JSON.stringify(taskArray));
}

function newTaskString(s, i) {
	return "<fieldset class='inputfs' data-index='" + i + "'><label>" + s + "</label><button class='removeButton'>Remove</button></fieldset>";
}

function removeFunction(evt) {
	evt.stopImmediatePropagation();
	let i = getIndex($(this).parent());
	taskArray.splice(i, 1);
	$(this).parent().remove();
	fixIndices();
	saveArray();
}

function addItem(s, i) {
	$("#list").append(newTaskString(s, i)).on("click", "button", removeFunction);
	taskArray.push(s);
	saveArray();
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

$(function() {
	init();
	$("#taskAdd").on("click", function() {
		let taskName = $("#taskInput").val();
		addItem(taskName, taskArray.length);
	});
});