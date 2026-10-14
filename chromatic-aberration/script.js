// Options
const input = document.getElementById('img-input');
const moreCatsButton = document.getElementById('more-cats');
const intensity = document.getElementById('intensity');
const colours = document.getElementById('colours');

const abberateContainer = document.querySelector('.abberate');

const cats = [
	'https://images.unsplash.com/photo-1472491235688-bdc81a63246e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3540&q=80',
	'https://images.unsplash.com/photo-1607242792481-37f27e1d74e1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1587&q=80',
	'https://images.unsplash.com/photo-1560114928-40f1f1eb26a0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3540&q=80',
	'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1964&q=80',
	'https://images.unsplash.com/photo-1494256997604-768d1f608cac?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3629&q=80',
	'https://images.unsplash.com/photo-1573865526739-10659fec78a5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1615&q=80',
	'https://images.unsplash.com/photo-1581300134629-4c3a06a31948?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MjN8fGFuaW1hbHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=900&q=60'
]

input.addEventListener('change', setImg);
moreCatsButton.addEventListener('click', setImg);
intensity.addEventListener('input', setIntensity);
colours.addEventListener('change', setColours);

function setVar(name, val) {
	abberateContainer.style.setProperty(`--${name}`, val);
}

function setImg(e) {
	e.preventDefault();
	const moreCats =  e.target.id === 'more-cats';
	const val = moreCats ? cats[Math.floor(Math.random() * cats.length)] : e.target.value;
	let url;
	
	if (moreCats) input.value = null;
  
	try {
		url = new URL(val);
	} catch (_) {
		return;  
	}
	
	setVar('image', `url(${url})`);
	abberateContainer.childNodes[0].setAttribute('src', url);
}

function setIntensity(e) {
	let val = e.target.value;
	
	setVar('intensity', 1 + ((val - 50) / 1000));
	setVar('deg-intensity', 1 + ((val - 50) / 50));
}

function setColours(e) {
	let val = e.target.value;
	val = val.toLowerCase().split(',');
	
	setVar('color-1', val[0]);
	setVar('color-2', val[1]);
}


// ---------------------------------------------------------------------
// Upload an image from your computer (alternative to the image URL)
// ---------------------------------------------------------------------
const fileInput = document.getElementById('file-input');
const uploadButton = document.getElementById('upload');
const downloadButton = document.getElementById('download');
const note = document.getElementById('note');
let objectUrl = null;

function showImage(src) {
	setVar('image', `url("${src}")`);
	abberateContainer.querySelector('img').setAttribute('src', src);
}

uploadButton.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', () => {
	const file = fileInput.files[0];
	if (!file) return;

	if (!file.type.startsWith('image/')) {
		note.textContent = 'Please choose an image file.';
		return;
	}

	note.textContent = '';
	if (objectUrl) URL.revokeObjectURL(objectUrl);
	objectUrl = URL.createObjectURL(file); // stays on your computer, nothing is hosted
	input.value = '';
	showImage(objectUrl);
	fileInput.value = ''; // lets you pick the same file again
});

// ---------------------------------------------------------------------
// Download the result
// The effect is pure CSS, so the download re-draws it on a canvas with
// the same steps: zoomed photo, then two tinted / blurred / masked
// copies blended with "hard-light", rotated +/-3deg.
// ---------------------------------------------------------------------
function loadImage(src) {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.crossOrigin = 'anonymous'; // needed to read pixels back from a URL
		image.onload = () => resolve(image);
		image.onerror = reject;
		image.src = src;
	});
}

function cssVar(name, fallback) {
	const value = getComputedStyle(abberateContainer).getPropertyValue(`--${name}`).trim();
	return value === '' ? fallback : value;
}

function blurCanvas(source, px) {
	const out = document.createElement('canvas');
	out.width = source.width;
	out.height = source.height;
	const c = out.getContext('2d');

	if (px <= 0) {
		c.drawImage(source, 0, 0);
	} else if ('filter' in c) {
		c.filter = `blur(${px}px)`;
		c.drawImage(source, 0, 0);
	} else {
		// Browsers without canvas filters (older Safari): rough blur by shrinking then enlarging
		const f = Math.max(1, px);
		const small = document.createElement('canvas');
		small.width = Math.max(1, Math.round(source.width / f));
		small.height = Math.max(1, Math.round(source.height / f));
		small.getContext('2d').drawImage(source, 0, 0, small.width, small.height);
		c.imageSmoothingQuality = 'high';
		c.drawImage(small, 0, 0, source.width, source.height);
	}
	return out;
}

async function renderAberration() {
	const shown = abberateContainer.querySelector('img');
	const image = await loadImage(shown.getAttribute('src'));

	// Output at the image's own resolution (capped at 4096px on the long side)
	const cap = Math.min(1, 4096 / Math.max(image.naturalWidth, image.naturalHeight));
	const W = Math.round(image.naturalWidth * cap);
	const H = Math.round(image.naturalHeight * cap);

	const canvas = document.createElement('canvas');
	canvas.width = W;
	canvas.height = H;
	const ctx = canvas.getContext('2d');

	// Effect switched off: download the plain image
	if (!document.getElementById('abberation-toggle').checked) {
		ctx.drawImage(image, 0, 0, W, H);
		return canvas;
	}

	const k = W / abberateContainer.getBoundingClientRect().width; // on-screen px -> output px
	const scale = parseFloat(cssVar('scale', '1.15'));
	const intensity = parseFloat(cssVar('intensity', '1'));
	const degRaw = cssVar('deg-intensity', '');
	const deg = degRaw === '' ? 1 : parseFloat(degRaw);
	// Same as the CSS: no blur until the intensity slider has been moved once
	const blurPx = degRaw === '' ? 0 : 2 * deg * k;
	const opacity = Math.max(0.25, 0.5 * deg);
	const layerScale = Math.max(1, scale * intensity);

	// 1. The photo, zoomed from the centre
	ctx.save();
	ctx.translate(W / 2, H / 2);
	ctx.scale(scale * intensity, scale * intensity);
	ctx.drawImage(image, -W / 2, -H / 2, W, H);
	ctx.restore();

	// 2. The two coloured copies
	[['color-1', 3, 'red'], ['color-2', -3, 'blue']].forEach(([name, baseDeg, fallback]) => {
		const layer = document.createElement('canvas');
		layer.width = W;
		layer.height = H;
		const l = layer.getContext('2d');
		l.fillStyle = cssVar(name, fallback);
		l.fillRect(0, 0, W, H);
		l.globalCompositeOperation = 'screen';
		l.drawImage(image, 0, 0, W, H);

		const soft = blurCanvas(layer, blurPx);

		// radial mask: 70% x 70% ellipse, 33% opaque at the centre -> fully opaque at 90%
		const s = soft.getContext('2d');
		s.globalCompositeOperation = 'destination-in';
		s.translate(W / 2, H / 2);
		s.scale(W * 0.7, H * 0.7);
		const mask = s.createRadialGradient(0, 0, 0, 0, 0, 1);
		mask.addColorStop(0, 'rgba(0,0,0,0.333)');
		mask.addColorStop(0.333, 'rgba(0,0,0,0.333)');
		mask.addColorStop(0.9, 'rgba(0,0,0,1)');
		s.fillStyle = mask;
		s.fillRect(-2, -2, 4, 4);

		ctx.save();
		ctx.globalAlpha = opacity;
		ctx.globalCompositeOperation = 'hard-light';
		ctx.translate(W / 2, H / 2);
		ctx.rotate((baseDeg * deg * Math.PI) / 180);
		ctx.scale(layerScale, layerScale);
		ctx.drawImage(soft, -W / 2, -H / 2);
		ctx.restore();
	});

	return canvas;
}

downloadButton.addEventListener('click', async () => {
	note.textContent = '';
	try {
		const canvas = await renderAberration();
		canvas.toBlob((blob) => {
			if (!blob) {
				note.textContent = 'Could not create the image.';
				return;
			}
			const link = document.createElement('a');
			link.href = URL.createObjectURL(blob);
			link.download = 'chromatic-aberration.png';
			document.body.appendChild(link);
			link.click();
			link.remove();
			setTimeout(() => URL.revokeObjectURL(link.href), 1000);
		}, 'image/png');
	} catch (err) {
		note.textContent = "Couldn't read this image for download (its server doesn't allow it). Try uploading the file from your computer instead.";
	}
});
