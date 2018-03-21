

function newTaskString(s) {
	return "<fieldset class='inputfs'><label>" + s + "</label><button class='removeButton'>Remove</button></fieldset>";
}

function removeFunction() {
	$(this).parent().remove();
}

$(function() {
	$("#taskAdd").on("click", function() {
		let taskName = $("#taskInput").val();
		$("#list").append(newTaskString(taskName)).on("click", "button", removeFunction);
	});
});