function createSceneActions(gallery, configs, animationList, reducedMotion) {
  const controls = gallery.querySelector('#preview-actions');
  const buttons = controls.querySelector('.preview-action-buttons');
  const result = controls.querySelector('.preview-action-result');
  const reset = controls.querySelector('.preview-action-reset');
  const hotspots = gallery.querySelector('.preview-hotspots');
  const hotGroup = hotspots.querySelector('g');
  const ns = hotspots.namespaceURI;
  const sourceFacts = new Map([
    ['call', 'The customer called for a delivery update.'],
    ['chat', 'Chat confirms the order missed its delivery window.'],
    ['email', 'Dispatch emailed a revised delivery estimate.'],
  ]);
  const buttonById = new Map();
  const markerById = new Map();
  const sources = new Set();
  let scene;
  let config;
  let stage = 'collecting';
  let selected;
  let frame;
  let endFrame;

  function stopSlice() {
    if (frame !== undefined) cancelAnimationFrame(frame);
    frame = undefined;
  }

  function pose(time) {
    for (const animation of animationList(scene)) {
      animation.pause();
      animation.currentTime = time;
    }
  }

  function playSlice(action) {
    stopSlice();
    endFrame = action.end;
    if (reducedMotion.matches) {
      pose(action.end);
      result.textContent = action.result;
      return;
    }
    const animations = animationList(scene);
    for (const animation of animations) {
      animation.pause();
      animation.currentTime = action.start;
    }
    let started;
    const duration = Math.min(action.end - action.start, 1200);
    const tick = time => {
      started ??= time;
      const fraction = Math.min(1, (time - started) / duration);
      const elapsed = action.start + fraction * (action.end - action.start);
      for (const animation of animations) animation.currentTime = elapsed;
      if (fraction < 1) frame = requestAnimationFrame(tick);
      else {
        frame = undefined;
        result.textContent = action.result;
      }
    };
    frame = requestAnimationFrame(tick);
  }

  function showPart(part, visible) {
    const layer = scene.svg.querySelector(`[data-si-part="${part}"]`);
    layer.toggleAttribute('data-si-visible', visible);
    layer.setAttribute('aria-hidden', String(!visible));
  }

  function refreshCase() {
    for (const id of sourceFacts.keys()) {
      for (const part of scene.svg.querySelectorAll(`[data-si-part="${id}"], [data-si-route="${id}"]`)) {
        part.toggleAttribute('data-si-selected', sources.has(id));
      }
    }
    showPart('brief', stage !== 'collecting');
    showPart('transcript', stage === 'in-call' || stage === 'saved');
    showPart('saved', stage === 'saved');
    updateStates();
  }

  function actionDisabled(id) {
    if (config.kind !== 'case' || sourceFacts.has(id)) return false;
    if (id === 'brief') return sources.size === 0 || stage !== 'collecting';
    if (id === 'answer') return stage !== 'brief';
    return stage !== 'in-call';
  }

  function updateStates() {
    for (const action of config.actions) {
      const disabled = actionDisabled(action.id);
      const isSelected = config.kind === 'case' ? sources.has(action.id) || selected === action.id : selected === action.id;
      const button = buttonById.get(action.id);
      const marker = markerById.get(action.id);
      button.disabled = disabled;
      button.dataset.selected = String(isSelected);
      if (config.kind === 'case' && sourceFacts.has(action.id)) button.setAttribute('aria-pressed', String(isSelected));
      marker.toggleAttribute('data-selected', isSelected);
      marker.toggleAttribute('data-disabled', disabled);
    }
  }

  function accept(id) {
    const action = config.actions.find(entry => entry.id === id);
    if (!action || actionDisabled(id)) return;
    selected = id;
    if (config.kind === 'timeline') {
      updateStates();
      result.textContent = action.label + '…';
      playSlice(action);
      return;
    }
    if (sourceFacts.has(id)) {
      if (sources.has(id)) {
        sources.delete(id);
        selected = undefined;
        result.textContent = sources.size ? 'Source removed. Build a brief from the selected history.' : 'Select a history card to start the example case.';
      } else {
        sources.add(id);
        result.textContent = sourceFacts.get(id);
      }
      stage = 'collecting';
    } else if (id === 'brief') {
      stage = 'brief';
      const next = sources.has('email') ? 'Confirm the revised delivery estimate.' : 'Check the shipment status.';
      const issue = sources.has('chat') ? 'The delivery window was missed.' : 'The delivery status is open.';
      result.textContent = `The caller is likely following up on a delivery. ${issue} ${next}`;
    } else if (id === 'answer') {
      stage = 'in-call';
      result.textContent = 'The caller asks «أين وصل طلبي؟» (Where is my order?).';
    } else {
      stage = 'saved';
      result.textContent = 'Example interaction saved with the selected history and transcript.';
    }
    const focused = document.activeElement === buttonById.get(id);
    refreshCase();
    if (focused && actionDisabled(id)) {
      const next = { brief: 'answer', answer: 'save' }[id];
      if (next) buttonById.get(next).focus();
      else reset.focus();
    }
  }

  function populate() {
    for (const action of config.actions) {
      const button = document.createElement('button');
      button.className = 'preview-action';
      button.type = 'button';
      button.dataset.action = action.id;
      button.textContent = action.label;
      buttons.append(button);
      buttonById.set(action.id, button);
      const marker = document.createElementNS(ns, 'g');
      marker.dataset.action = action.id;
      marker.setAttribute('transform', `translate(${action.x} ${action.y})`);
      const title = document.createElementNS(ns, 'title');
      title.textContent = action.label;
      marker.append(title);
      for (const [radius, className] of [[35, 'preview-hit-area'], [13, 'preview-hit-ring'], [3.7, 'preview-hit-dot']]) {
        const circle = document.createElementNS(ns, 'circle');
        circle.setAttribute('r', radius);
        circle.setAttribute('class', className);
        marker.append(circle);
      }
      hotGroup.append(marker);
      markerById.set(action.id, marker);
    }
  }

  buttons.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (button) accept(button.dataset.action);
  });
  hotspots.addEventListener('click', event => {
    const marker = event.target.closest('[data-action]');
    if (marker) accept(marker.dataset.action);
  });
  reset.addEventListener('click', () => {
    sources.clear();
    stage = 'collecting';
    selected = undefined;
    refreshCase();
    result.textContent = 'Select a history card to start the example case.';
  });

  return {
    get active() { return Boolean(scene); },
    get usesTimeline() { return config?.kind === 'timeline'; },
    open(next) {
      scene = next;
      config = configs[scene.key];
      controls.hidden = false;
      hotspots.toggleAttribute('hidden', false);
      reset.hidden = config.kind !== 'case';
      populate();
      if (config.kind === 'case') {
        scene.svg.toggleAttribute('data-si-demo', true);
        refreshCase();
        result.textContent = 'Select a history card to start the example case.';
      } else {
        updateStates();
        result.textContent = 'Click a highlighted object or choose an action.';
      }
    },
    settle() {
      if (config?.kind !== 'timeline') return;
      stopSlice();
      pose(endFrame ?? config.actions[0].start);
      if (selected) result.textContent = config.actions.find(action => action.id === selected).result;
    },
    close() {
      if (!scene) return;
      stopSlice();
      scene.svg.removeAttribute('data-si-demo');
      for (const part of scene.svg.querySelectorAll('[data-si-selected], [data-si-visible]')) {
        part.removeAttribute('data-si-selected');
        part.removeAttribute('data-si-visible');
      }
      for (const part of scene.svg.querySelectorAll('[data-si-part=brief], [data-si-part=transcript], [data-si-part=saved]')) part.removeAttribute('aria-hidden');
      scene = config = selected = endFrame = undefined;
      stage = 'collecting';
      sources.clear();
      buttonById.clear();
      markerById.clear();
      buttons.replaceChildren();
      hotGroup.replaceChildren();
      controls.hidden = true;
      hotspots.toggleAttribute('hidden', true);
    },
  };
}
