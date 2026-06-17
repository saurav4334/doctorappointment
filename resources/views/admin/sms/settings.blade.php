@extends('layouts.admin')

@section('title', 'SMS Settings')
@section('heading', 'SMS Settings')

@section('content')
    <x-admin.page-header title="SMS Settings" subtitle="NotifyBD SMS gateway configuration." />

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {{-- Settings form --}}
        <form method="POST" action="{{ route('admin.sms-settings.update') }}" class="lg:col-span-2">
            @csrf @method('PUT')
            <x-admin.card>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <x-admin.input name="api_base_url" label="API Base URL" :value="$settings->api_base_url" required class="sm:col-span-2" />

                    <x-admin.field name="api_key" label="API Key" class="sm:col-span-2"
                        :hint="$settings->api_key ? 'Saved: '.$settings->maskedApiKey().'. Leave blank to keep it.' : 'Enter your NotifyBD API key.'">
                        <input type="password" name="api_key" autocomplete="off"
                               placeholder="{{ $settings->api_key ? '•••••• (unchanged)' : 'Enter API key' }}"
                               class="h-10 w-full rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary">
                    </x-admin.field>

                    <x-admin.input name="sender_id" label="Sender ID" :value="$settings->sender_id" />
                    <x-admin.field name="sms_type" label="SMS Type">
                        <select name="sms_type" class="h-10 w-full rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary">
                            @foreach (['text' => 'Text', 'unicode' => 'Unicode'] as $val => $label)
                                <option value="{{ $val }}" @selected($settings->sms_type === $val)>{{ $label }}</option>
                            @endforeach
                        </select>
                    </x-admin.field>
                    <x-admin.input name="default_country_code" label="Default Country Code" :value="$settings->default_country_code ?: '880'" />
                    <x-admin.input name="admin_phone" label="Admin Alert Number" :value="$settings->admin_phone" hint="Receives new-request alerts." />
                </div>

                <div class="mt-4 border-t border-border pt-4">
                    <x-admin.toggle name="enabled" label="Enable SMS Notifications" :checked="(bool) $settings->enabled" hint="When off, all sends are logged as skipped." />
                </div>

                <div class="mt-5">
                    <button type="submit" class="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Save Settings</button>
                </div>
            </x-admin.card>
        </form>

        {{-- Test SMS --}}
        <form method="POST" action="{{ route('admin.sms-settings.test') }}">
            @csrf
            <x-admin.card>
                <h3 class="mb-4 font-display text-base font-semibold text-foreground">Send Test SMS</h3>
                <div class="space-y-3">
                    <x-admin.input name="test_number" label="Phone Number" :value="$settings->test_number" placeholder="017xxxxxxxx" />
                    <x-admin.textarea name="message" label="Message" :value="'Test SMS from '.config('app.name')" rows="3" />
                    <button type="submit" class="inline-flex h-10 w-full items-center justify-center rounded-lg border border-primary px-5 text-sm font-semibold text-primary hover:bg-primary/5">Send Test SMS</button>
                    <p class="text-xs text-muted-foreground">Uses the saved credentials. Result is recorded in SMS Logs.</p>
                </div>
            </x-admin.card>
        </form>
    </div>
@endsection
