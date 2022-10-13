const sharcProtocol = new SHARCProtocol();

function logEvent(eventName, eventArg) {
  const box = document.getElementById('events');
  const paragraph = document.createElement('p');
  let text = eventName + ' ';

  if (eventArg && eventArg instanceof Array) {
    for (var i = 0; i < eventArg.length; i++) {
      text = text + eventArg[i] + ' ';
    }
  }
  paragraph.innerText = text;
  box.appendChild(paragraph);
}

function disableEnableButton(id, status) {
  document.getElementById(id).disabled = status;
}

function createIframe() {
  const adIframe = document.createElement('iframe');
  logEvent('iFrame has been created');

  adIframe.style = 'width: 100%; border: none; height: 100%; display: none';
  adIframe.src = 'creatives/video-creative.html';
  adIframe.setAttribute('id', 'secure-iframe');
  adIframe.setAttribute('allowFullScreen', '');
  adIframe.setAttribute('allow', 'geolocation');

  document.getElementById('smartphone-content').append(adIframe);
  logEvent('iFrame added to DOM');
  sharcProtocol.setMessageTarget(adIframe.contentWindow);
}

function sendInitMessage() {
  let environmentData = {
    'fullscreen': false,
    'fullscreenAllowed': true,
    'useragent': '',
    'deviceId': '',
    'muted': true,
  }

  const creativeData = {
    'adId': '',
    'creativeId': '',
    'adServingId': '',
  }

  const envDataTextAreaValue = document.getElementById('env-data');

  if (envDataTextAreaValue.value) {
    try {
      environmentData = JSON.parse(envDataTextAreaValue.value, null, 2);
    } catch (error) {
      console.error('Error: ', error);
    }
  }

  const initMessage = {
    'environmentData': environmentData,
    'creativeData': creativeData
  }

  logEvent('SHARC:Container:INIT called', sharcProtocol.sessionId);
  sharcProtocol.sendMessage(ContainerMessages.INIT, initMessage).then((args) => initialize(args)).catch((args) => console.error('args', args));
}

function initialize(data) {
  document.getElementById('secure-iframe').style.display = 'block';
  logEvent('Displaying the iFrame');

  const closeButton = document.getElementById('close-button');
  closeButton.style.display = 'block';
  logEvent('Showing the close button');

  closeButton.addEventListener('click', () => closeAd());
}

function startCreative() {
  sharcProtocol.sendMessage(ContainerMessages.START_CREATIVE).then(() => logEvent('Creative has started'));
  disableEnableButton('btn-start-ad', true);
}

function closeAd() {
  sharcProtocol.sendMessage(ContainerMessages.CLOSE).then(() => {
    const adIframe = document.getElementById('secure-iframe').remove();
    const closeButton = document.getElementById('close-button');
    closeButton.removeEventListener('click', closeAd);
    closeButton.style.display = 'none';
    disableEnableButton('btn-init-ad', false);
    disableEnableButton('btn-start-ad', false);
    document.getElementById('events').innerHTML = '';
    sharcProtocol.reset();
  }).catch((e) => console.error('Error closing the Ad', e));
}

function addListeners() {
  sharcProtocol.addListener(
    ProtocolMessages.CREATE_SESSION,
    (args) => {
      logEvent('New SHARC session has been created with ID: ', [args.sessionId]);
      sendInitMessage();
    });
}

function initAd() {
  createIframe();
  disableEnableButton('btn-init-ad', true);
  addListeners();
}
