
# How to use Generic Swal Fire

## FOR livewire-v3.md

# Livewire 3 + SweetAlert2 Helpers

Reusable, global SweetAlert2 helpers for Livewire 3 with one-line PHP wrappers:

- Small top-corner toasts: swalToastSuccess/Warning/Error
- Larger modal dialogs: swalFireSuccess/Warning/Error
- Confirm modal: swalConfirm (aka swalFireAsk)
- Generic input prompt: swalTakeInput
- Password prompt: swalPromptPassword
- One-call verify current user password: swalVerifyCurrentUserPassword


## Requirements

- Laravel + Livewire 3
- Node + NPM (or PNPM/Yarn)
- SweetAlert2


## Install

1) Install SweetAlert2

- npm install sweetalert2

2) Add the global JS module

- resources/js/app.js
    - import './swal'

3) Include your Vite entry and Livewire assets once in the base layout

- @vite(['resources/css/app.css','resources/js/app.js'])
- @livewireStyles and @livewireScripts

4) Files provided

- resources/js/swal.js
- app/Livewire/Concerns/WithSwal.php


## Helpers overview

### Toasts (small, top-end)

- \$this->swalToastSuccess(string \$title = 'Success', string \$text = '', array \$opts = []): void
- \$this->swalToastWarning(string \$title = 'Warning', string \$text = '', array \$opts = []): void
- \$this->swalToastError(string \$title = 'Error', string \$text = '', array \$opts = []): void

Example:

```php
$this->swalToastSuccess('Saved', 'Record updated');
```

Options example:

```php
$this->swalToastSuccess('Saved', 'Record updated', ['timer' => 5000, 'position' => 'bottom-end']);
```


### Modals (larger)

- \$this->swalFireSuccess(string \$title = 'Success', string \$text = '', array \$opts = []): void
- \$this->swalFireWarning(string \$title = 'Warning', string \$text = '', array \$opts = []): void
- \$this->swalFireError(string \$title = 'Error', string \$text = '', array \$opts = []): void

Example:

```php
$this->swalFireWarning('Please review', 'Check your inputs', ['confirmButtonText' => 'OK']);
```


### Confirm (modal-only)

- \$this->swalConfirm(string \$title = 'Are you sure?', string \$text = '', array \$opts = [], ?string \$thenEvent = null, array \$thenParams = [], ?string \$thenEventTo = null): void
- Alias: \$this->swalFireAsk(...) calls swalConfirm under the hood

Confirm and continue if accepted:

```php
// Ask, then dispatch "users.delete" if confirmed
$this->swalConfirm(
  title: 'Delete user?',
  text: 'This cannot be undone',
  opts: ['confirmButtonText' => 'Delete', 'cancelButtonText' => 'Cancel'],
  thenEvent: 'users.delete',
  thenParams: ['id' => $id]
);

// Listener receives the event
#[\Livewire\Attributes\On('users.delete')]
public function delete(array $payload) {
  $id = (int)($payload['id'] ?? 0);
  // ... delete ...
  $this->swalToastSuccess('Deleted', "User {$id} removed");
}
```


### Generic input prompt

- \$this->swalTakeInput(string \$title = 'Enter a value', string \$text = '', string \$input = 'text', array \$opts = [], ?string \$thenEvent = null, array \$thenParams = [], ?string \$thenEventTo = null): void

Prompt for a value, receive it in \$payload['value']:

```php
$this->swalTakeInput(
  title: 'Add note',
  text: 'Type a note',
  input: 'text',
  opts: ['inputPlaceholder' => 'Note...'],
  thenEvent: 'users.note-entered'
);

#[\Livewire\Attributes\On('users.note-entered')]
public function onNoteEntered(array $payload) {
  $note = (string)($payload['value'] ?? '');
  // ... save note ...
  $this->swalToastSuccess('Saved', 'Note captured');
}
```

Supported input types include 'text', 'email', 'password', 'number', 'textarea', etc. Use opts to pass inputLabel, inputPlaceholder, inputAttributes, confirm/cancel texts.

### Password prompt

- \$this->swalPromptPassword(string \$title = 'Enter your password', string \$text = '', array \$opts = [], ?string \$thenEvent = null, array \$thenParams = [], ?string \$thenEventTo = null): void

Prompt for password and handle the value:

```php
$this->swalPromptPassword(
  title: 'Re-enter password',
  text: 'Confirm to proceed',
  thenEvent: 'users.password-entered'
);

#[\Livewire\Attributes\On('users.password-entered')]
public function onPasswordEntered(array $payload) {
  $plain = (string)($payload['value'] ?? '');
  // ... handle pw (e.g., verify or forward) ...
}
```


### Verify current user password

- \$this->swalVerifyCurrentUserPassword(string \$title = 'Verify password', string \$text = 'Please confirm your password to continue', array \$opts = [], ?string \$thenEventTrue = null, array \$thenParamsTrue = [], ?string \$thenEventFalse = null, array \$thenParamsFalse = [], ?string \$thenEventTo = null): void

Flow: prompts for password -> verifies against the authenticated user (using Hash::check) -> shows a toast -> optionally dispatches success/failure events:

```php
$this->swalVerifyCurrentUserPassword(
  title: 'Verify password',
  text: 'Confirm to delete user',
  thenEventTrue: 'users.delete',
  thenParamsTrue: ['id' => $id],
  thenEventFalse: 'users.verify-failed'
);

#[\Livewire\Attributes\On('users.delete')]
public function delete(array $payload) {
  $id = (int)($payload['id'] ?? 0);
  // ... delete ...
  $this->swalToastSuccess('Deleted', "User {$id} removed");
}

#[\Livewire\Attributes\On('users.verify-failed')]
public function onVerifyFailed() {
  // Optional: extra handling on failure
}
```


## Using JS helpers directly

Available on window:

- swalToastSuccess/Warning/Error
- swalFireSuccess/Warning/Error
- swalFireAsk
- swalTakeInput
- swalPromptPassword

Example:

```js
const ok = await window.swalFireAsk({ title: 'Proceed?', confirmButtonText: 'Yes' });
if (ok) window.swalToastSuccess('OK', 'Continuing...');
```


## Targeting a specific component

Use thenEventTo to route the follow-up event to a specific component (by name) instead of broadcasting:

```php
$this->swalConfirm(
  title: 'Confirm',
  thenEvent: 'do-something',
  thenParams: ['foo' => 'bar'],
  thenEventTo: 'admin.users' // component name
);
```


## Security notes

- Password prompt sends the plaintext password to the server via Livewire event payload for verification; ensure HTTPS and avoid logging sensitive payloads.
- Prefer minimal exposure of secrets in any debugging or telemetry.

***

## FOR livewire-v2.md

# Livewire 2 + SweetAlert2 Helpers

Reusable, global SweetAlert2 helpers for Livewire 2 with one-line PHP wrappers:

- Small top-corner toasts: swalToastSuccess/Warning/Error
- Larger modal dialogs: swalFireSuccess/Warning/Error
- Confirm modal: swalConfirm (aka swalFireAsk)
- Generic input prompt: swalTakeInput
- Password prompt: swalPromptPassword
- One-call verify current user password: swalVerifyCurrentUserPassword


## Requirements

- Laravel + Livewire 2
- Node + NPM (or PNPM/Yarn)
- SweetAlert2


## Install

1) Install SweetAlert2

- npm install sweetalert2

2) Add the global JS module for v2

- resources/js/app.js
    - import './swal.v2'

3) Include your Vite entry and Livewire assets once in the base layout

- @vite(['resources/css/app.css','resources/js/app.js'])
- @livewireStyles and @livewireScripts

4) Files provided

- resources/js/swal.v2.js
- app/Livewire/Concerns/WithSwalV2.php


## v2 event model

- PHP → JS: \$this->dispatchBrowserEvent('event-name', [...])
- JS → PHP: Livewire.emit('event', payload) or Livewire.emitTo('component-name', 'event', payload)
- Bind your component’s \$listeners to capture emitted events


## Helpers overview

### Toasts (small, top-end)

- \$this->swalToastSuccess(string \$title = 'Success', string \$text = '', array \$opts = []): void
- \$this->swalToastWarning(string \$title = 'Warning', string \$text = '', array \$opts = []): void
- \$this->swalToastError(string \$title = 'Error', string \$text = '', array \$opts = []): void

Example:

```php
$this->swalToastSuccess('Saved', 'Record updated');
```


### Modals (larger)

- \$this->swalFireSuccess(string \$title = 'Success', string \$text = '', array \$opts = []): void
- \$this->swalFireWarning(string \$title = 'Warning', string \$text = '', array \$opts = []): void
- \$this->swalFireError(string \$title = 'Error', string \$text = '', array \$opts = []): void

Example:

```php
$this->swalFireWarning('Please review', 'Check your inputs', ['confirmButtonText' => 'OK']);
```


### Confirm (modal-only)

- \$this->swalConfirm(string \$title = 'Are you sure?', string \$text = '', array \$opts = [], ?string \$thenEvent = null, array \$thenParams = [], ?string \$thenEventTo = null): void

Confirm and continue if accepted:

```php
$this->swalConfirm(
  title: 'Delete user?',
  text: 'This cannot be undone',
  opts: ['confirmButtonText' => 'Delete', 'cancelButtonText' => 'Cancel'],
  thenEvent: 'users.delete',
  thenParams: ['id' => $id]
);

// Component listens for the emitted event
protected $listeners = ['users.delete' => 'delete'];

public function delete(array $payload) {
  $id = (int)($payload['id'] ?? 0);
  // ... delete ...
  $this->swalToastSuccess('Deleted', "User {$id} removed");
}
```


### Generic input prompt

- \$this->swalTakeInput(string \$title = 'Enter a value', string \$text = '', string \$input = 'text', array \$opts = [], ?string \$thenEvent = null, array \$thenParams = [], ?string \$thenEventTo = null): void

Prompt for a value, receive it in \$payload['value']:

```php
$this->swalTakeInput(
  title: 'Add note',
  text: 'Type a note',
  input: 'text',
  opts: ['inputPlaceholder' => 'Note...'],
  thenEvent: 'users.note-entered'
);

protected $listeners = ['users.note-entered' => 'onNoteEntered'];

public function onNoteEntered(array $payload) {
  $note = (string)($payload['value'] ?? '');
  // ... save note ...
  $this->swalToastSuccess('Saved', 'Note captured');
}
```


### Password prompt

- \$this->swalPromptPassword(string \$title = 'Enter your password', string \$text = '', array \$opts = [], ?string \$thenEvent = null, array \$thenParams = [], ?string \$thenEventTo = null): void

Prompt for password and handle the value:

```php
$this->swalPromptPassword(
  title: 'Re-enter password',
  text: 'Confirm to proceed',
  thenEvent: 'users.password-entered'
);

protected $listeners = ['users.password-entered' => 'onPasswordEntered'];

public function onPasswordEntered(array $payload) {
  $plain = (string)($payload['value'] ?? '');
  // ... handle pw (e.g., verify or forward) ...
}
```


### Verify current user password

- \$this->swalVerifyCurrentUserPassword(string \$title = 'Verify password', string \$text = 'Please confirm your password to continue', array \$opts = [], ?string \$thenEventTrue = null, array \$thenParamsTrue = [], ?string \$thenEventFalse = null, array \$thenParamsFalse = [], ?string \$thenEventTo = null): void

This prompts for the password, then JS emits a special event that the component must listen for and verify via Hash::check; on success/failure, it shows a toast and optionally emits your events:

```php
// Trigger the flow
$this->swalVerifyCurrentUserPassword(
  title: 'Verify password',
  text: 'Confirm to delete user',
  thenEventTrue: 'users.delete',
  thenParamsTrue: ['id' => $id]
);

// Component listeners
protected $listeners = [
  '__swal.verify_current_user_password' => '__swalVerifyCurrentUserPassword',
  'users.delete' => 'delete',
];

// Trait provides __swalVerifyCurrentUserPassword($payload), which does:
// - Hash::check against Auth::user()->password
// - swalToastSuccess on success or swalToastError on failure
// - emit thenEventTrue/thenEventFalse accordingly

public function delete(array $payload) {
  $id = (int)($payload['id'] ?? 0);
  // ... delete ...
  $this->swalToastSuccess('Deleted', "User {$id} removed");
}
```


## Using JS helpers directly

On window:

- swalToastSuccess/Warning/Error
- swalFireSuccess/Warning/Error
- swalFireAsk
- swalTakeInput
- swalPromptPassword

Example:

```js
const value = await window.swalTakeInput({ title: 'Label', input: 'text' });
if (value) window.swalToastSuccess('Captured', value);
```


## Targeting a specific component

Use thenEventTo to send follow-up events to a specific component via Livewire.emitTo:

```php
$this->swalConfirm(
  title: 'Confirm',
  thenEvent: 'do-something',
  thenParams: ['foo' => 'bar'],
  thenEventTo: 'admin.users' // component name
);
```


## Security notes

- Password prompts transmit plaintext to the server for verification; use HTTPS and avoid logging sensitive event payloads.
- Keep helpers centralized and avoid duplicating inline JS to reduce attack surface.

***

If a single repository needs both versions, keep two separate JS entries (swal.js for v3, swal.v2.js for v2) and two traits (WithSwal and WithSwalV2).
<span style="display:none">[^1][^2][^3][^4][^5][^6][^7][^8][^9]</span>

<div style="text-align: center">⁂</div>

[^1]: https://github.com/jantinnerezo/livewire-alert

[^2]: https://laracasts.com/discuss/channels/livewire/livewire-with-sweetalert2

[^3]: https://dev.to/mahmudulhsn/use-sweetalert2-with-laravel-livewire-49ij

[^4]: https://itsolutionstuff.com/post/laravel-livewire-sweetalert-exampleexample.html

[^5]: https://techsolutionstuff.com/post/how-to-create-livewire-sweetalert-in-laravel-10

[^6]: https://www.youtube.com/watch?v=mf_2hAAJbx8

[^7]: https://github.com/matiere-noire/laravel-livewire-swal

[^8]: https://stackoverflow.com/questions/68972073/how-to-use-sweetalert2-in-livewire

[^9]: https://dev.to/realrashid/how-to-use-sweetalert2-with-livewire-56i6

