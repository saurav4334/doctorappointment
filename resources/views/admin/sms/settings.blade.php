@extends('layouts.admin')

@section('title', 'SMS Settings')
@section('heading', 'SMS Settings')

@section('content')
    <x-admin.page-header title="SMS Settings" subtitle="API configuration, templates, logs and test — all in one place." />

    <div x-data="{ tab: @js($tab) }">
        {{-- Tab nav --}}
        <div class="mb-6 flex flex-wrap gap-1 rounded-lg border border-border bg-background p-1 text-sm">
            @foreach (['api' => 'API Configuration', 'templates' => 'SMS Templates', 'logs' => 'SMS Logs', 'test' => 'Test SMS'] as $key => $label)
                <button type="button" @click="tab = '{{ $key }}'"
                        :class="tab === '{{ $key }}' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'"
                        class="rounded-md px-4 py-2 font-medium transition-colors">{{ $label }}</button>
            @endforeach
        </div>

        {{-- TAB 1: API Configuration --}}
        <div x-show="tab === 'api'" class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <form method="POST" action="{{ route('admin.sms-settings.update') }}">
                @csrf @method('PUT')
                <x-admin.card>
                    <div class="space-y-4">
                        <x-admin.toggle name="enabled" label="Enable SMS Notifications" :checked="(bool) $settings->enabled" hint="When off, all sends are logged as skipped." />
                        <x-admin.input name="api_base_url" label="API Base URL" :value="$settings->api_base_url" required />
                        <x-admin.field name="api_key" label="API Key"
                            :hint="$settings->api_key ? 'Saved: '.$settings->maskedApiKey().'. Leave blank to keep it.' : 'Enter your NotifyBD API key.'">
                            <input type="password" name="api_key" autocomplete="off"
                                   placeholder="{{ $settings->api_key ? '•••••• (unchanged)' : 'Enter API key' }}"
                                   class="h-10 w-full rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary">
                        </x-admin.field>
                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <x-admin.input name="sender_id" label="Sender ID" :value="$settings->sender_id" />
                            <x-admin.field name="sms_type" label="SMS Type">
                                <select name="sms_type" class="h-10 w-full rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary">
                                    @foreach (['text' => 'Text', 'unicode' => 'Unicode'] as $val => $label)
                                        <option value="{{ $val }}" @selected($settings->sms_type === $val)>{{ $label }}</option>
                                    @endforeach
                                </select>
                            </x-admin.field>
                            <x-admin.input name="default_country_code" label="Default Country Code" :value="$settings->default_country_code ?: '880'" />
                            <x-admin.input name="admin_phone" label="Admin Alert Number" :value="$settings->admin_phone" />
                        </div>
                        <input type="hidden" name="test_number" value="{{ $settings->test_number }}">
                        <button type="submit" class="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Save Settings</button>
                    </div>
                </x-admin.card>
            </form>
            <x-admin.card>
                <h3 class="font-display text-sm font-semibold text-foreground">NotifyBD</h3>
                <p class="mt-2 text-sm text-muted-foreground">Configure your NotifyBD gateway credentials here. Use the <button type="button" @click="tab = 'test'" class="font-medium text-primary hover:underline">Test SMS</button> tab to verify delivery, and the <button type="button" @click="tab = 'logs'" class="font-medium text-primary hover:underline">SMS Logs</button> tab to review attempts.</p>
            </x-admin.card>
        </div>

        {{-- TAB 2: SMS Templates --}}
        <div x-show="tab === 'templates'" x-cloak>
            <x-admin.card class="mb-4">
                <h3 class="font-display text-sm font-semibold text-foreground">Available Variables</h3>
                <p class="mt-1 text-xs text-muted-foreground">Click a variable to insert it into the template you're editing.</p>
                <div class="mt-3 flex flex-wrap gap-2">
                    @foreach ($placeholders as $ph)
                        <button type="button" onclick="smsInsert('{{ '{'.$ph.'}' }}')"
                                class="rounded-md border border-border bg-muted/50 px-2 py-1 font-mono text-xs text-primary hover:bg-primary/10">{{ '{'.$ph.'}' }}</button>
                    @endforeach
                </div>
            </x-admin.card>

            <x-admin.card padding="p-0">
                <div class="divide-y divide-border">
                    @foreach ($templates as $template)
                        <div x-data="{ open: false }" class="px-5 py-4">
                            <div class="flex items-start justify-between gap-4">
                                <div class="min-w-0">
                                    <div class="flex items-center gap-2">
                                        <span class="font-medium text-foreground">{{ $template->title }}</span>
                                        <x-admin.status-badge :status="(bool) $template->is_active" />
                                    </div>
                                    <p class="mt-1 line-clamp-2 text-sm text-muted-foreground" x-show="!open">{{ $template->body }}</p>
                                </div>
                                <button type="button" @click="open = !open" class="shrink-0 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted" x-text="open ? 'Close' : 'Edit'"></button>
                            </div>

                            <form method="POST" action="{{ route('admin.sms-templates.update', $template) }}" x-show="open" x-cloak class="mt-4 space-y-3">
                                @csrf @method('PUT')
                                <input type="text" name="title" value="{{ $template->title }}" required
                                       class="h-10 w-full rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary">
                                <textarea name="body" rows="3" onfocus="window.__smsTarget = this"
                                          class="w-full rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary">{{ $template->body }}</textarea>
                                <div class="flex items-center justify-between">
                                    <label class="flex items-center gap-2 text-sm text-muted-foreground">
                                        <input type="hidden" name="is_active" value="0">
                                        <input type="checkbox" name="is_active" value="1" @checked($template->is_active) class="rounded border-border text-primary focus:ring-primary">
                                        Active
                                    </label>
                                    <button type="submit" class="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Save</button>
                                </div>
                            </form>
                        </div>
                    @endforeach
                </div>
            </x-admin.card>
        </div>

        {{-- TAB 3: SMS Logs --}}
        <div x-show="tab === 'logs'" x-cloak>
            <x-admin.card padding="p-0">
                <div class="p-5 pb-0">
                    <form method="GET" action="{{ route('admin.sms-settings.edit') }}" class="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        <input type="hidden" name="tab" value="logs">
                        <input type="text" name="q" value="{{ $search }}" placeholder="Search phone..." class="h-10 rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary">
                        <select name="status" class="h-10 rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary">
                            @foreach ($statusOptions as $val => $label)
                                <option value="{{ $val }}" @selected((string) $status === (string) $val)>{{ $label }}</option>
                            @endforeach
                        </select>
                        <select name="event" class="h-10 rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary">
                            @foreach ($eventOptions as $val => $label)
                                <option value="{{ $val }}" @selected((string) $event === (string) $val)>{{ $label }}</option>
                            @endforeach
                        </select>
                        <input type="date" name="from" value="{{ $from }}" class="h-10 rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary">
                        <div class="flex gap-2">
                            <input type="date" name="to" value="{{ $to }}" class="h-10 flex-1 rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary">
                            <button type="submit" class="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Filter</button>
                        </div>
                    </form>
                </div>

                @if ($logs->isEmpty())
                    <p class="px-5 py-12 text-center text-sm text-muted-foreground">No SMS logs found.</p>
                @else
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead class="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                                <tr>
                                    <th class="px-5 py-3 font-medium">Recipient</th>
                                    <th class="px-5 py-3 font-medium">Event</th>
                                    <th class="px-5 py-3 font-medium">Message</th>
                                    <th class="px-5 py-3 font-medium">Status</th>
                                    <th class="px-5 py-3 font-medium">When</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-border align-top">
                                @foreach ($logs as $log)
                                    <tr class="hover:bg-muted/30">
                                        <td class="px-5 py-3 font-medium text-foreground">{{ $log->recipient_number ?? '—' }}</td>
                                        <td class="px-5 py-3 text-muted-foreground">{{ \Illuminate\Support\Str::headline(str_replace('_', ' ', (string) $log->event_type)) ?: '—' }}</td>
                                        <td class="px-5 py-3 text-muted-foreground"><span class="line-clamp-2 max-w-xs">{{ $log->message }}</span>
                                            @if ($log->error_message)<span class="mt-1 block text-xs text-destructive">{{ $log->error_message }}</span>@endif
                                        </td>
                                        <td class="px-5 py-3"><x-admin.status-badge :status="$log->status" /></td>
                                        <td class="px-5 py-3 text-xs text-muted-foreground">{{ $log->created_at?->format('d M Y H:i') }}</td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                    <div class="border-t border-border p-4">{{ $logs->links() }}</div>
                @endif
            </x-admin.card>
        </div>

        {{-- TAB 4: Test SMS --}}
        <div x-show="tab === 'test'" x-cloak class="max-w-lg">
            <form method="POST" action="{{ route('admin.sms-settings.test') }}">
                @csrf
                <x-admin.card>
                    <h3 class="mb-4 font-display text-base font-semibold text-foreground">Send Test SMS</h3>
                    <div class="space-y-3">
                        <x-admin.input name="test_number" label="Phone Number" :value="$settings->test_number" placeholder="017xxxxxxxx" />
                        <x-admin.textarea name="message" label="Message" :value="'Test SMS from '.config('app.name')" rows="3" />
                        <button type="submit" class="inline-flex h-10 w-full items-center justify-center rounded-lg border border-primary px-5 text-sm font-semibold text-primary hover:bg-primary/5">Send Test SMS</button>
                        <p class="text-xs text-muted-foreground">Uses the saved credentials. Result appears above and in SMS Logs.</p>
                    </div>
                </x-admin.card>
            </form>
        </div>
    </div>

    @push('scripts')
    <script>
        function smsInsert(token) {
            const ta = window.__smsTarget;
            if (!ta) { return; }
            const start = ta.selectionStart ?? ta.value.length;
            const end = ta.selectionEnd ?? ta.value.length;
            ta.value = ta.value.slice(0, start) + token + ta.value.slice(end);
            ta.focus();
            ta.selectionStart = ta.selectionEnd = start + token.length;
        }
    </script>
    @endpush
@endsection
