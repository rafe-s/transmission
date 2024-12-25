/* @license This file Copyright © Mnemosyne LLC.
   It may be used under GPLv2 (SPDX: GPL-2.0-only), GPLv3 (SPDX: GPL-3.0-only),
   or any future license endorsed by Mnemosyne LLC.
   License text can be found in the licenses/ folder. */

import { createDialogContainer } from './utils.js';

export class RenameDialog extends EventTarget {
  constructor(controller, remote, action_input_value) {
    super();

    this.controller = controller;
    this.remote = remote;
    this.action_input_value = action_input_value;
    this.elements = {};
    this.torrents = [];

    this.show();
  }

  show() {
    const torrents = this.controller.getSelectedTorrents();
    if (torrents.length !== 1) {
      console.trace();
      return;
    }

    this.torrents = torrents;
    this.elements = RenameDialog._create(
      this.action_input_value === null ? 'Rename' : 'Confirm',
    );
    this.elements.dismiss.addEventListener('click', () => this._onDismiss());
    this.elements.confirm.addEventListener('click', () => this._onConfirm());
    this.elements.entry.value =
      this.action_input_value === null
        ? torrents[0].getName()
        : this.action_input_value;
    document.body.append(this.elements.root);

    this.elements.entry.focus();
  }

  close() {
    this.elements.root.remove();

    this.dispatchEvent(new Event('close'));

    delete this.controller;
    delete this.remote;
    delete this.elements;
    delete this.torrents;
  }

  _onDismiss() {
    if (this.action_input_value === null) {
      this.close();
    } else {
      this.controller.action_manager.click('show-inspector');
    }
  }

  _onConfirm() {
    const [tor] = this.torrents;
    const old_name = tor.getName();
    const new_name = this.elements.entry.value;
    this.remote.renameTorrent([tor.getId()], old_name, new_name, (response) => {
      if (response.result === 'success') {
        tor.refresh(response.arguments);
      }
    });

    this._onDismiss();
  }

  static _create(confirm_text) {
    const elements = createDialogContainer('rename-dialog');
    elements.root.setAttribute('aria-label', 'Rename Torrent');
    elements.heading.textContent = 'Enter new name:';
    elements.confirm.textContent = confirm_text;

    const label = document.createElement('label');
    label.setAttribute('for', 'torrent-rename-name');
    label.textContent = 'Enter new name:';
    elements.workarea.append(label);

    const entry = document.createElement('input');
    entry.setAttribute('type', 'text');
    entry.id = 'torrent-rename-name';
    elements.entry = entry;
    elements.workarea.append(entry);

    return elements;
  }
}
