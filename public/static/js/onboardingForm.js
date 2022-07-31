async function submitOnboardingForm() {
	const inputs = [];
	document.querySelectorAll(".credentials-form-container form input").forEach((e) => {
		if (["text", "password"].includes(e.getAttribute("type"))) inputs.push(e);
	});
	const data = inputs.map((e) => `${e.name}:${e.value}`).join(", ");

	console.log(window.location.href);
	console.log(document.querySelector(".credentials-form-container form"))
	req = await fetch(window.location.href, {
		// body: data,
		body: new FormData(document.querySelector(".credentials-form-container form")),
		method: "POST",
	});
	console.log(req);
}
