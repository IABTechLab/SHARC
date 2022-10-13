const sharcProtocol = new SHARCProtocol();

function addListeners() {
  sharcProtocol.addListener(ContainerMessages.INIT, (args) => {
    sharcProtocol.resolve(args, {});
    prepareCreative(args);
  });

  sharcProtocol.addListener(ContainerMessages.START_CREATIVE, (args) => {
    sharcProtocol.resolve(args, {});
    initCreative(args);
  });

  sharcProtocol.addListener(ContainerMessages.CLOSE, (args) => {
    sharcProtocol.resolve(args, {});
  });
}

function prepareCreative(data) {
  const videoEl = document.getElementById('video_player');
  const { muted } = data.args.environmentData;
  videoEl.muted = muted;
}

function initCreative(data) {
  const videoEl = document.getElementById('video_player');
  videoEl.play();
}

function init() {
  document.getElementById('video_player').addEventListener('canplaythrough', () => {
    sharcProtocol.createSession();
    addListeners();
  });
}