const audios = {};

export default function playAudio(name, loop = false) {
	if(!audios[name]) {
		const a = new Audio(name);
		audios[name] = a;
		audios[name].loop = loop;
		a.canplay = () => a.play();
	} else {
		audios[name].loop = loop;
		audios[name].play();
	}
}

export default function stopAudio(name) {
	if(audios[name])
		audios[name].stop();
}
