(function() {

  const videoPlayer = () => {
		const vid = document.querySelector('.vid-player');
		let dragTarg = null;

		const secondsToMinutes = (sec) => {
	    let timeString,
	        minutes,
	        seconds,
	        sanitized;

	    sanitized = Math.floor(sec);
	    minutes = Math.floor(sec/60);
	    seconds = sanitized % 60;

	    if (seconds < 10) seconds = '0' + seconds;
	    timeString = minutes + ':' + seconds;

	    return timeString;
	  }

	  const minutesToSeconds = (time) => {
			let parts = time.split(':'),
			    minutes = +parts[0],
			    seconds = +parts[1];

			return (minutes * 60 + seconds).toFixed(3);
	  }

		const togglePlay = (ev) => {
			ev.preventDefault();

			let vidItem = vid.querySelector('.vid-player__video'),
					playBtn = vid.querySelector('.vid-player__controls-button--play'),
					pauseBtn = vid.querySelector('.vid-player__controls-button--pause');

			vid.style.display = 'block';

			if (vid.classList.contains('_videoPlaying')) {
				vid.classList.remove('_videoPlaying');
				vid.classList.add('_videoPaused');
				pauseBtn.style.display = 'none';
				playBtn.style.display = 'block';
				playBtn.focus();
				vidItem.pause();
			} else {
				vid.classList.add('_videoPlaying');
				vid.classList.remove('_videoPaused');
				pauseBtn.style.display = 'block';
				playBtn.style.display = 'none';
				pauseBtn.focus();
				vidItem.play();
			}
		}

		const toggleMute = (ev) => {
			let targ = ev.target,
					vidParent = targ.closest('.vid-player'),
					vidItem = vidParent.querySelector('.vid-player__video');

			if (vidParent.classList.contains('_videoMuted')) {
				vidParent.classList.remove('_videoMuted');
				vidItem.muted = false;
			} else {
				vidParent.classList.add('_videoMuted');
				vidItem.muted = true;
			}
		}

		const enableFullscreen = (ev) => {
			let targ = ev.target,
					vidParent = targ.closest('.vid-player'),
					vidItem = vidParent.querySelector('.vid-player__video');

			if (vidParent.classList.contains('_videoFullscreen')) {
				vidParent.classList.remove('_videoFullscreen');
				if (vidItem.exitFullscreen) vidItem.exitFullscreen();
			} else {
				vidParent.classList.add('_videoFullscreen');
				if (vidItem.requestFullscreen) vidItem.requestFullscreen();
			}
		}

		const enableSeek = (ev) => {
			let targ = ev.target,
					vidParent = targ.closest('.vid-player'),
					vidItem = vidParent.querySelector('.vid-player__video'),
					time = vidItem.duration * (targ.value / 100);

		  	vidItem.currentTime = time;
		}

		const updateSeekTime = (ev) => {
			let targ = ev.target,
					vidParent = targ.closest('.vid-player'),
					seekBar = vidParent.querySelector('.vid-player__controls-range--seek'),
					value = (100 / targ.duration) * targ.currentTime;

			seekBar.setAttribute('value', value);
			updateRangeControl__fakeControl(seekBar, value);
		}

		const detectVidEnd = (ev) => {
			let targ = ev.target,
					vidParent = targ.closest('.vid-player'),
					playBtn = vid.querySelector('.vid-player__controls-button--play'),
					pauseBtn = vid.querySelector('.vid-player__controls-button--pause'),
					loopAttr = targ.setAttribute('loop', 'loop');

			if (typeof loopAttr !== typeof undefined && loopAttr !== false) {
				return;
			} else {
				pauseBtn.style.display = 'none';
				playBtn.style.display = 'block';
				playBtn.focus();
				vidParent.querySelector('.vid-player__controls-button--play').style.display = 'block';
				vidParent.classList.remove('_videoPlaying');
				vidParent.classList.add('_videoPaused');
			}
		}

		const updateVolume = (ev) => {
			let targ = ev.target,
					vidParent = targ.closest('.vid-player'),
					vidItem = vidParent.querySelector('.vid-player__video'),
					val = targ.value;

			vidItem.volume = val;
			updateRangeControl__fakeControl(targ, val, true);
		}

		const quickPause = (ev) => {
			let targ = ev.target,
					vidParent = targ.closest('.vid-player'),
					vidItem = vidParent.querySelector('.vid-player__video');

			vidParent.classList.remove('_videoPlaying');
			vidParent.classList.add('_videoPaused');
			vidParent.querySelector('.vid-player__controls-button--play').style.display = 'block';
			vidParent.querySelector('.vid-player__controls-button--pause').style.display = 'none';
			vidItem.pause();
		}

		const quickPlay = (ev) => {
			let targ = ev.target,
					vidParent = targ.closest('.vid-player'),
					vidItem = vidParent.querySelector('.vid-player__video');

			vidParent.classList.remove('_videoPaused');
			vidParent.classList.add('_videoPlaying');
			vidParent.querySelector('.vid-player__controls-button--play').style.display = 'none';
			vidParent.querySelector('.vid-player__controls-button--pause').style.display = 'block';
			vidItem.play();
		}

		const updateCurrentTime = (ev) => {
			let targ = ev.target,
					vidParent = targ.closest('.vid-player'),
					timeEl = vidParent.querySelector('.vid-player__controls--currentTime'),
					inputTime = vid.querySelector('.vid-player__controls--inputTime'),
					time = targ.currentTime;

			if (timeEl) timeEl.innerHTML = secondsToMinutes(time);
			inputTime.setAttribute('placeholder', secondsToMinutes(time));
		}

		const setFinalDuration = () => {
			let vidItem = vid.querySelector('.vid-player__video'),
					timeEl = vid.querySelector('.vid-player__controls-finalDuration'),
					time = vidItem.duration;

			if (timeEl) timeEl.innerHTML = secondsToMinutes(time);
		}

		const pauseKeyTogglePlay = (ev) => {
			const keycode = (ev.keyCode ? ev.keyCode : ev.which);

			if (keycode == 32) togglePlay(ev);
		}

		const updateRangeControl__fakeControl = (targ, val, forVolume) => {
			let controlCol = targ.closest('.vid-player__controls-item'),
					thermFill = controlCol.querySelector('.vid-player-fakeControl__fill'),
					handle = controlCol.querySelector('.vid-player-fakeControl__handle');

			if (forVolume) val = val * 100;

      thermFill.style.width = val + '%';
      handle.style.left = val + '%';
		}

		const setDragOffset__fakeControl = (ev) => {
			if (dragTarg && vid.classList.contains('_draggingControls')) {
	        let therm = dragTarg.closest('.vid-player-fakeControl__thermometer'),
	          	pageX = ev.pageX,
							thermWidth = therm.offsetWidth,
							therm_startPos = therm.getBoundingClientRect().left,
							therm_endPos = (therm_startPos + thermWidth),
							trueLeft = (pageX - therm_startPos);

				if (trueLeft <= 0) trueLeft = 0;
				if (trueLeft >= thermWidth) trueLeft = thermWidth;

				let	handle_startPos = therm.querySelector('.vid-player-fakeControl__handle').getBoundingClientRect().left,
						overallWidth = (therm_endPos - therm_startPos),
						handlePos = (handle_startPos - therm_startPos),
						handlePosPercent = (handlePos / overallWidth) * 100,
						trueHandlePos = ((trueLeft / thermWidth) * 100).toFixed(2),
						trueHandlePosPercent = trueHandlePos + '%';

				dragTarg.style.left = trueHandlePosPercent;
	      seekBar = dragTarg.closest('.vid-player-fakeControl__thermometer').querySelector('.vid-player-fakeControl__fill').style.width = trueHandlePosPercent;
				resetSeekFrom__fakeControl(ev, trueHandlePosPercent);
				if (trueHandlePos >= 100) trueHandlePos = 100;
	  		if (trueHandlePos <= 0) trueHandlePos = 0;
	  		if (0 >= trueHandlePos || trueHandlePos >= 100) resetDragHandle__fakeControl();
	    }
		}

		const resetSeekFrom__fakeControl = (ev, value) => {
			let targ = ev.target,
					vidParent = targ.closest('.vid-player'),
					vidItem = vidParent.querySelector('.vid-player__video'),
					rangeBar = targ.closest('.vid-player__controls-item').querySelector('.vid-player__controls-range');

			value = value.slice(0, -1);

			if (rangeBar.classList.contains(('vid-player__controls-range--volume'))) {
				value = value / 100;
				value = value.toFixed(2);
				value.toString();
				if (value >= 1) value = 1;
				if (value <= 0) value = 0;
				if (value < 1 || value > 0) {
					vidItem.volume = value;
					rangeBar.setAttribute('value', value);
				}
			} else {
				rangeBar.setAttribute('value', value);
				value = value / 100;
				vidItem.currentTime = (value * vidItem.duration);
			}
		}

		const resetTimeFromInput = (ev) => {
			let targ = ev.target,
					handle = targ.closest('.vid-player-fakeControl__handle'),
					keycode = (ev.keyCode ? ev.keyCode : ev.which)
					targVal = targ.value,
					vidParent = targ.closest('.vid-player'),
					vidItem = vidParent.querySelector('.vid-player__video');

			if (keycode == 13 || keycode == 13) {
				if (targVal.indexOf(':') > -1) {
					targVal = minutesToSeconds(targVal);
	        vidItem.currentTime = Number(targVal);
	        targ.value = '';
	        handle.classList.remove('_error');
				} else {
					handle.classList.add('_error');
					setTimeout(() => {
						handle.classList.remove('_error');
						handle.querySelector('.vid-player__controls--inputTime').value = '';
					}, 3000);
				}
			}
		}

		const dragHandle__fakeControl = (ev) => {
			let targ = ev.target,
					vidParent = targ.closest('.vid-player');

			vidParent.classList.add('_draggingControls');
			dragTarg = ev.target;
		}

		const resetDragHandle__fakeControl = () => {
			vid.classList.remove('_draggingControls');
			dragTarg = null;
		}

		const init = () => {
			const vidPlayer = vid.querySelector('.vid-player__video');
			const vidVolume = vid.querySelector('.vid-player__controls-range--volume');
			const fakeHandles = vid.querySelectorAll('.vid-player-fakeControl__handle');

			vidPlayer.addEventListener('timeupdate', (ev) => updateSeekTime(ev));
			vidPlayer.addEventListener('timeupdate', (ev) => updateCurrentTime(ev));
			vidPlayer.addEventListener('ended', (ev) => detectVidEnd(ev));
			vid.addEventListener('mousemove', (ev) => setDragOffset__fakeControl(ev));
			vid.addEventListener('mouseup', (ev) => resetDragHandle__fakeControl(ev));

			fakeHandles.forEach(handle => {
				handle.addEventListener('mousedown', (ev) => dragHandle__fakeControl(ev));
			});

			vid.querySelector('.vid-player__controls-range--seek').addEventListener('mousedown', (ev) => quickPause(ev));
			vid.querySelector('.vid-player__controls-range--seek').addEventListener('mouseup', (ev) => quickPlay(ev));
			vid.querySelector('.vid-player__controls-range--seek').addEventListener('change', (ev) => enableSeek(ev));
			vid.querySelector('.vid-player__controls-range--seek').addEventListener('keydown', (ev) => enableSeek(ev));
			vid.querySelector('.vid-player__controls-range--volume').addEventListener('change', (ev) => updateVolume(ev));
			vid.querySelector('.vid-player__controls-range--volume').addEventListener('keydown', (ev) => updateVolume(ev));
			vid.querySelector('.vid-player__controls-button--mute').addEventListener('click', (ev) => toggleMute(ev));
			vid.querySelector('.vid-player__controls-button--fullscreen').addEventListener('click', (ev) => enableFullscreen(ev));
			vid.querySelector('.vid-player__controls input').addEventListener('keypress', (ev) => pauseKeyTogglePlay(ev));
			vid.querySelector('.vid-player__controls--inputTime').addEventListener('keypress', (ev) => resetTimeFromInput(ev));
			vid.querySelector('.vid-player__controls--inputTime').addEventListener('mousedown', (ev) => resetDragHandle__fakeControl(ev));
			vid.querySelector('.vid-player__controls--inputTime').addEventListener('mouseup', (ev) => resetDragHandle__fakeControl(ev));
			vid.querySelector('.vid-player__controls--inputTime').addEventListener('mousemove', (ev) => resetDragHandle__fakeControl(ev));
			vid.querySelector('.vid-player__controls--inputTime').addEventListener('click', (ev) => resetDragHandle__fakeControl(ev));
			vid.querySelector('.vid-player__controls--togglePlay').addEventListener('click', (ev) => togglePlay(ev));

			setTimeout(() => setFinalDuration(),1000);
			updateRangeControl__fakeControl(vidVolume, 1, true);
			document.querySelector('.btn--launchVid').addEventListener('click', (ev) => togglePlay(ev));
		}

		init();
  };

  window.addEventListener('load', videoPlayer());

}());
