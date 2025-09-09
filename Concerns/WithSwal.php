<?php

namespace App\Http\Livewire\Concerns;

use Livewire\Attributes\On;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

trait WithSwal
{
    // Toast (small)
    protected function swalToastSuccess(string $title = 'Success', string $text = '', array $opts = []): void
    {
        $this->dispatch('swal:toast', icon: 'success', title: $title, text: $text, opts: $opts);
    }

    protected function swalToastWarning(string $title = 'Warning', string $text = '', array $opts = []): void
    {
        $this->dispatch('swal:toast', icon: 'warning', title: $title, text: $text, opts: $opts);
    }

    protected function swalToastError(string $title = 'Error', string $text = '', array $opts = []): void
    {
        $this->dispatch('swal:toast', icon: 'error', title: $title, text: $text, opts: $opts);
    }

    // Modal (larger)
    protected function swalFireSuccess(string $title = 'Success', string $text = '', array $opts = []): void
    {
        $this->dispatch('swal:modal', icon: 'success', title: $title, text: $text, opts: $opts);
    }

    protected function swalFireWarning(string $title = 'Warning', string $text = '', array $opts = []): void
    {
        $this->dispatch('swal:modal', icon: 'warning', title: $title, text: $text, opts: $opts);
    }

    protected function swalFireError(string $title = 'Error', string $text = '', array $opts = []): void
    {
        $this->dispatch('swal:modal', icon: 'error', title: $title, text: $text, opts: $opts);
    }

    // Confirm (modal-only)
    protected function swalConfirm(
        string $title = 'Are you sure?',
        string $text = '',
        array $opts = [],
        ?string $thenEvent = null,
        array $thenParams = [],
        ?string $thenEventTo = null
    ): void {
        $this->dispatch('swal:confirm',
            title: $title,
            text: $text,
            thenEvent: $thenEvent,
            thenParams: $thenParams,
            thenEventTo: $thenEventTo,
            opts: $opts
        );
    }

    // Generic input → returns to PHP via thenEvent with payload['value']
    protected function swalTakeInput(
        string $title = 'Enter a value',
        string $text = '',
        string $input = 'text',
        array $opts = [],
        ?string $thenEvent = null,
        array $thenParams = [],
        ?string $thenEventTo = null
    ): void {
        $this->dispatch('swal:input',
            title: $title,
            text: $text,
            input: $input,
            thenEvent: $thenEvent,
            thenParams: $thenParams,
            thenEventTo: $thenEventTo,
            opts: $opts
        );
    }

    // Password prompt preset
    protected function swalPromptPassword(
        string $title = 'Enter your password',
        string $text = '',
        array $opts = [],
        ?string $thenEvent = null,
        array $thenParams = [],
        ?string $thenEventTo = null
    ): void {
        $this->dispatch('swal:password',
            title: $title,
            text: $text,
            thenEvent: $thenEvent,
            thenParams: $thenParams,
            thenEventTo: $thenEventTo,
            opts: array_merge([
                'input' => 'password',
                'inputLabel' => $opts['inputLabel'] ?? 'Password',
                'inputPlaceholder' => $opts['inputPlaceholder'] ?? 'Enter your password',
                'inputAttributes' => array_merge(['autocapitalize' => 'off', 'autocorrect' => 'off'], $opts['inputAttributes'] ?? []),
                'confirmButtonText' => $opts['confirmButtonText'] ?? 'Verify',
                'showCancelButton' => $opts['showCancelButton'] ?? true,
            ], $opts)
        );
    }

    // One-call verify flow: prompt for password, verify against current user, and optionally dispatch events for true/false
    protected function swalVerifyCurrentUserPassword(
        string $title = 'Verify password',
        string $text = 'Please confirm your password to continue',
        array $opts = [],
        ?string $thenEventTrue = null,
        array $thenParamsTrue = [],
        ?string $thenEventFalse = null,
        array $thenParamsFalse = [],
        ?string $thenEventTo = null
    ): void {
        $this->dispatch('swal:verify-current-password',
            title: $title,
            text: $text,
            thenEventTrue: $thenEventTrue,
            thenParamsTrue: $thenParamsTrue,
            thenEventFalse: $thenEventFalse,
            thenParamsFalse: $thenParamsFalse,
            thenEventTo: $thenEventTo,
            opts: $opts
        );
    }

    // Auto-wired in v3 via attribute: receives the plain password from JS and verifies
    #[On('swal.__verify_current_user_password')]
    public function __swalVerifyCurrentUserPassword(array $payload): void
    {
        $plain = (string)($payload['value'] ?? '');
        $thenEventTo   = $payload['thenEventTo']   ?? null;
        $thenEventTrue = $payload['thenEventTrue'] ?? null;
        $thenParamsTrue = $payload['thenParamsTrue'] ?? [];
        $thenEventFalse = $payload['thenEventFalse'] ?? null;
        $thenParamsFalse = $payload['thenParamsFalse'] ?? [];

        $ok = false;
        if (Auth::check()) {
            $ok = Hash::check($plain, Auth::user()->getAuthPassword());
        }

        if ($ok) {
            $this->swalToastSuccess('Verified', 'Password confirmed');
            if ($thenEventTrue) {
                if ($thenEventTo) $this->dispatchTo($thenEventTo, $thenEventTrue, $thenParamsTrue);
                else $this->dispatch($thenEventTrue, $thenParamsTrue);
            }
        } else {
            $this->swalToastError('Invalid', 'Incorrect password');
            if ($thenEventFalse) {
                if ($thenEventTo) $this->dispatchTo($thenEventTo, $thenEventFalse, $thenParamsFalse);
                else $this->dispatch($thenEventFalse, $thenParamsFalse);
            }
        }
    }
}
