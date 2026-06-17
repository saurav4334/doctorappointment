@extends('layouts.admin')

@section('title', 'Notification Settings')
@section('heading', 'Notification Settings')

@section('content')
    <x-admin.page-header title="Notification Settings" subtitle="SMS and voice-call configuration, templates, logs and tests — all in one place." />

    <div x-data="{ tab: @js($tab) }">
        {{-- Tab nav --}}
        <div class="mb-6 flex flex-wrap items-center gap-1 rounded-lg border border-border bg-background p-1 text-sm">
            @foreach (['api' => 'API Configuration', 'templates' => 'SMS Templates', 'logs' => 'SMS Logs', 'test' => 'Test SMS'] as $key => $label)
                <button type="button" @click="tab = '{{ $key }}'"
                        :class="tab === '{{ $key }}' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'"
                        class="rounded-md px-3 py-2 font-medium transition-colors">{{ $label }}</button>
            @endforeach
            <span class="mx-1 h-5 w-px bg-border"></span>
            @foreach (['voice' => 'Voice Settings', 'voice_templates' => 'Voice Templates', 'voice_logs' => 'Voice Logs', 'voice_test' => 'Test Voice'] as $key => $label)
                <button type="button" @click="tab = '{{ $key }}'"
                        :class="tab === '{{ $key }}' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'"
                        class="rounded-md px-3 py-2 font-medium transition-colors">{{ $label }}</button>
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
        {{-- TAB 5: Voice Settings --}}
        <div x-show="tab === 'voice'" x-cloak class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <form method="POST" action="{{ route('admin.voice-settings.update') }}">
                @csrf @method('PUT')
                <x-admin.card>
                    <div class="space-y-4">
                        <x-admin.toggle name="enabled" label="Enable Voice Calls" :checked="(bool) $voiceSettings->enabled" hint="When off, calls are logged as skipped." />
                        <x-admin.input name="api_endpoint" label="API Endpoint" :value="$voiceSettings->api_endpoint" required />
                        <x-admin.field name="api_token" label="API Token"
                            :hint="$voiceSettings->api_token ? 'Saved: '.$voiceSettings->maskedApiToken().'. Leave blank to keep it.' : 'Enter your Protiddhoni API token.'">
                            <input type="password" name="api_token" autocomplete="off"
                                   placeholder="{{ $voiceSettings->api_token ? '•••••• (unchanged)' : 'Enter API token' }}"
                                   class="h-10 w-full rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary">
                        </x-admin.field>
                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <x-admin.input name="sender_number" label="Sender Number" :value="$voiceSettings->sender_number" placeholder="09612254680" />
                            <x-admin.field name="voice_type" label="Voice Type">
                                <select name="voice_type" class="h-10 w-full rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary">
                                    @foreach (['female' => 'Female', 'male' => 'Male'] as $val => $label)
                                        <option value="{{ $val }}" @selected($voiceSettings->voice_type === $val)>{{ $label }}</option>
                                    @endforeach
                                </select>
                            </x-admin.field>
                            <x-admin.field name="language_code" label="Language">
                                <select name="language_code" class="h-10 w-full rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary">
                                    @foreach (['bn' => 'Bangla (bn)', 'en' => 'English (en)'] as $val => $label)
                                        <option value="{{ $val }}" @selected($voiceSettings->language_code === $val)>{{ $label }}</option>
                                    @endforeach
                                </select>
                            </x-admin.field>
                            <div class="flex items-end">
                                <x-admin.toggle name="dtmf_enabled" label="Enable DTMF Response" :checked="(bool) $voiceSettings->dtmf_enabled" />
                            </div>
                        </div>
                        <input type="hidden" name="test_number" value="{{ $voiceSettings->test_number }}">
                        <button type="submit" class="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Save Voice Settings</button>
                    </div>
                </x-admin.card>
            </form>
            <x-admin.card>
                <h3 class="font-display text-sm font-semibold text-foreground">Protiddhoni Voice TTS</h3>
                <p class="mt-2 text-sm text-muted-foreground">Automated confirmation calls fire when an appointment is approved. Edit the spoken text under <button type="button" @click="tab = 'voice_templates'" class="font-medium text-primary hover:underline">Voice Templates</button>, then verify with <button type="button" @click="tab = 'voice_test'" class="font-medium text-primary hover:underline">Test Voice</button>.</p>
            </x-admin.card>
        </div>

        {{-- TAB 6: Voice Templates --}}
        <div x-show="tab === 'voice_templates'" x-cloak>
            <x-admin.card class="mb-4">
                <h3 class="font-display text-sm font-semibold text-foreground">Available Variables</h3>
                <p class="mt-1 text-xs text-muted-foreground">Click a variable to insert it into the field you're editing.</p>
                <div class="mt-3 flex flex-wrap gap-2">
                    @foreach ($voicePlaceholders as $ph)
                        <button type="button" onclick="smsInsert('{{ '{'.$ph.'}' }}')"
                                class="rounded-md border border-border bg-muted/50 px-2 py-1 font-mono text-xs text-primary hover:bg-primary/10">{{ '{'.$ph.'}' }}</button>
                    @endforeach
                </div>
            </x-admin.card>

            <x-admin.card padding="p-0">
                <div class="divide-y divide-border">
                    @foreach ($voiceTemplates as $template)
                        <div x-data="{ open: false }" class="px-5 py-4">
                            <div class="flex items-start justify-between gap-4">
                                <div class="min-w-0">
                                    <div class="flex items-center gap-2">
                                        <span class="font-medium text-foreground">{{ $template->title }}</span>
                                        <x-admin.status-badge :status="(bool) $template->is_active" />
                                    </div>
                                    <p class="mt-1 line-clamp-2 text-sm text-muted-foreground" x-show="!open">{{ $template->start_text }}</p>
                                </div>
                                <button type="button" @click="open = !open" class="shrink-0 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted" x-text="open ? 'Close' : 'Edit'"></button>
                            </div>

                            <form method="POST" action="{{ route('admin.voice-templates.update', $template) }}" x-show="open" x-cloak class="mt-4 space-y-3">
                                @csrf @method('PUT')
                                <x-admin.input name="title" label="Title" :value="$template->title" required />
                                @foreach (['start_text' => 'Start Text', 'question_text' => 'Question Text', 'end_text' => 'End Text', 'dtmf1_text' => 'DTMF Option 1 Text', 'dtmf2_text' => 'DTMF Option 2 Text'] as $field => $label)
                                    <x-admin.field name="{{ $field }}" label="{{ $label }}">
                                        <textarea name="{{ $field }}" rows="2" onfocus="window.__smsTarget = this"
                                                  class="w-full rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary">{{ $template->$field }}</textarea>
                                    </x-admin.field>
                                @endforeach
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

        {{-- TAB 7: Voice Logs --}}
        <div x-show="tab === 'voice_logs'" x-cloak>
            <x-admin.card padding="p-0">
                <div class="p-5 pb-0">
                    <form method="GET" action="{{ route('admin.sms-settings.edit') }}" class="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        <input type="hidden" name="tab" value="voice_logs">
                        <input type="text" name="vq" value="{{ $vsearch }}" placeholder="Search phone..." class="h-10 rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary">
                        <select name="vstatus" class="h-10 rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary">
                            @foreach ($voiceStatusOptions as $val => $label)
                                <option value="{{ $val }}" @selected((string) $vstatus === (string) $val)>{{ $label }}</option>
                            @endforeach
                        </select>
                        <input type="text" name="vappt" value="{{ $vappt }}" placeholder="Appointment ID" class="h-10 rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary">
                        <input type="date" name="vfrom" value="{{ $vfrom }}" class="h-10 rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary">
                        <div class="flex gap-2">
                            <input type="date" name="vto" value="{{ $vto }}" class="h-10 flex-1 rounded-lg border-border bg-background text-sm focus:border-primary focus:ring-primary">
                            <button type="submit" class="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Filter</button>
                        </div>
                    </form>
                </div>

                @if ($voiceLogs->isEmpty())
                    <p class="px-5 py-12 text-center text-sm text-muted-foreground">No voice call logs found.</p>
                @else
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead class="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                                <tr>
                                    <th class="px-5 py-3 font-medium">Recipient</th>
                                    <th class="px-5 py-3 font-medium">Event</th>
                                    <th class="px-5 py-3 font-medium">Appt</th>
                                    <th class="px-5 py-3 font-medium">DTMF</th>
                                    <th class="px-5 py-3 font-medium">Status</th>
                                    <th class="px-5 py-3 font-medium">When</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-border align-top">
                                @foreach ($voiceLogs as $log)
                                    <tr class="hover:bg-muted/30">
                                        <td class="px-5 py-3 font-medium text-foreground">{{ $log->recipient_number ?? '—' }}</td>
                                        <td class="px-5 py-3 text-muted-foreground">{{ \Illuminate\Support\Str::headline(str_replace('_', ' ', (string) $log->event_type)) ?: '—' }}</td>
                                        <td class="px-5 py-3 text-muted-foreground">{{ $log->appointment_id ? 'AP-'.$log->appointment_id : '—' }}</td>
                                        <td class="px-5 py-3 text-muted-foreground">{{ $log->dtmf_response ?? '—' }}</td>
                                        <td class="px-5 py-3"><x-admin.status-badge :status="$log->status" />
                                            @if ($log->error_message)<span class="mt-1 block text-xs text-destructive">{{ \Illuminate\Support\Str::limit($log->error_message, 40) }}</span>@endif
                                        </td>
                                        <td class="px-5 py-3 text-xs text-muted-foreground">{{ $log->created_at?->format('d M Y H:i') }}</td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                    <div class="border-t border-border p-4">{{ $voiceLogs->links() }}</div>
                @endif
            </x-admin.card>
        </div>

        {{-- TAB 8: Test Voice --}}
        <div x-show="tab === 'voice_test'" x-cloak class="max-w-lg">
            <form method="POST" action="{{ route('admin.voice-settings.test') }}">
                @csrf
                <x-admin.card>
                    <h3 class="mb-4 font-display text-base font-semibold text-foreground">Send Test Voice Call</h3>
                    <div class="space-y-3">
                        <x-admin.input name="test_number" label="Phone Number" :value="$voiceSettings->test_number" placeholder="01614023305" />
                        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <x-admin.input name="patient_name" label="Patient Name" value="Karim" />
                            <x-admin.input name="doctor_name" label="Doctor Name" value="Kamal Uddin" />
                            <x-admin.input name="appointment_date" label="Appointment Date" value="25 Jun 2026" />
                            <x-admin.input name="appointment_time" label="Appointment Time" value="10:00" />
                        </div>
                        <button type="submit" class="inline-flex h-10 w-full items-center justify-center rounded-lg border border-primary px-5 text-sm font-semibold text-primary hover:bg-primary/5">Send Test Voice Call</button>
                        <p class="text-xs text-muted-foreground">Uses the saved Protiddhoni credentials and the Approved template. Result appears above and in Voice Logs.</p>
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
