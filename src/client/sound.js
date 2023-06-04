const audios = {};

export function playAudio(name, loop = false, volume = 1) {
	if(!audios[name]) {
		const a = new Audio(name);
		audios[name] = a;
		audios[name].loop = loop ? "loop" : null;
		audios[name].volume = volume;
		a.oncanplay = () => a.play();
	} else {
		audios[name].loop = loop ? "loop" : null;
		audios[name].volume = volume;
		audios[name].play();
	}
}

window.playAudio = playAudio;

export function stopAudio(name) {
	if(audios[name])
		audios[name].pause();
}
